// De GitOps-agent van Bliep. Speelt de rol van wat Argo CD of Flux in het echt doen.
//
// Je laptop speelt vandaag twee rollen:
//   1. je eigen werkplek: hier pas je code aan, maak je branches en open je pull requests.
//   2. "de server" van Bliep: de map server/ in deze repo. Daar draait de omgeving.
//
// Deze agent draait naast de server en doet elke 15 seconden hetzelfde rondje:
//   - Is er een nieuwe commit op main in jouw repo bliep-gitops? Dan haalt hij die op en rolt hij uit.
//   - Heeft iemand op de server zelf iets aangepast (drift)? Dan zet hij het terug zoals in git.
//   - Draait er een service niet meer? Dan start hij ze opnieuw.
// Dat rondje heet de reconcile loop: de server wordt telkens gelijkgezet aan de repo.
// Niemand hoeft in te loggen op de server. De repo is de waarheid, de server volgt.
//
// Starten, vanuit de hoofdmap van de repo oefeningen (branch les-04-iac-gitops):
//   node gitops/sync.js --repo https://github.com/<jij>/bliep-gitops
// Stoppen: Ctrl+C. De omgeving blijft dan draaien, alleen de agent stopt.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const HOOFDMAP = path.join(import.meta.dirname, '..');
const SERVER = path.join(HOOFDMAP, 'server');
const INTERVAL_SECONDEN = 15;

/**
 * Voert een commando uit en geeft de uitvoer terug als tekst, zonder witruimte rond.
 * Mislukt het commando, dan gooit execFileSync een fout.
 *
 * @param {string} programma  bv. 'git' of 'docker'
 * @param {string[]} args     de argumenten, bv. ['status', '--porcelain']
 * @param {object} [opties]   extra opties, bv. { cwd: SERVER }
 * @returns {string}
 */
function voerUit(programma, args, opties = {}) {
  return execFileSync(programma, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opties }).trim();
}

/** Een logregel met het uur ervoor, bv. "[10:42:07] In sync met main (3f2a1c9)". */
function log(bericht) {
  const uur = new Date().toLocaleTimeString('nl-BE', { hour12: false });
  console.log(`[${uur}] ${bericht}`);
}

/** Leest de url van je repo bliep-gitops uit --repo. */
function zoekRepoUrl() {
  const plek = process.argv.indexOf('--repo');
  if (plek !== -1 && process.argv[plek + 1]) return process.argv[plek + 1];
  console.error('Welke repo moet ik volgen? Start me zo, met jouw GitHub-gebruikersnaam:');
  console.error('  node gitops/sync.js --repo https://github.com/<jij>/bliep-gitops');
  process.exit(1);
}

/** Git in de map van de server. */
const git = (...args) => voerUit('git', args, { cwd: SERVER });

/** Docker Compose in de map van de server. */
const compose = (args, extraEnv = {}) =>
  voerUit('docker', ['compose', ...args], { cwd: SERVER, env: { ...process.env, ...extraEnv } });

/** Rolt uit wat er nu in de map server/ staat. */
function rolUit() {
  const commit = git('rev-parse', '--short', 'HEAD');
  log(`Uitrollen van ${commit}: docker compose up -d --build ...`);
  try {
    // GIT_COMMIT komt in compose.yaml terecht, zodat de webshop onderaan toont welke versie draait.
    compose(['up', '-d', '--build', '--remove-orphans'], { GIT_COMMIT: commit });
    log(`Klaar. Kijk op http://localhost:8080, onderaan staat versie ${commit}.`);
  } catch (fout) {
    log('Uitrollen MISLUKT. Docker zegt:');
    console.log(String(fout.stderr || fout.message).trim());
    log('Ik probeer het bij het volgende rondje opnieuw. Draait Docker Desktop?');
  }
}

/** Welke services horen er te draaien, en welke draaien er echt? */
function ontbrekendeServices() {
  const gewenst = compose(['config', '--services']).split(/\r?\n/).filter(Boolean);
  const draaiend = compose(['ps', '--services', '--status', 'running']).split(/\r?\n/).filter(Boolean);
  return gewenst.filter((s) => !draaiend.includes(s));
}

/** Eén rondje van de reconcile loop. */
function rondje() {
  // 1. Wat zegt de repo? Haal de laatste stand van main op.
  git('fetch', '--quiet', 'origin', 'main');
  const repo = git('rev-parse', 'origin/main');
  const server = git('rev-parse', 'HEAD');

  if (repo !== server) {
    const bericht = git('log', '-1', '--format=%s', 'origin/main');
    log(`Nieuwe commit op main: "${bericht}". De server volgt.`);
    git('reset', '--quiet', '--hard', 'origin/main');
    rolUit();
    return;
  }

  // 2. Heeft iemand op de server zelf iets aangepast?
  const drift = git('status', '--porcelain');
  if (drift) {
    log('DRIFT! Iemand paste dit aan op de server, buiten git om:');
    for (const regel of drift.split(/\r?\n/)) console.log(`           ${regel.trim()}`);
    log('Dat staat niet in de repo, dus het bestaat niet. Ik zet het terug.');
    git('reset', '--quiet', '--hard', 'origin/main');
    git('clean', '--quiet', '-fd');
    rolUit();
    return;
  }

  // 3. Draait alles wat er hoort te draaien?
  const weg = ontbrekendeServices();
  if (weg.length > 0) {
    log(`Deze services draaien niet: ${weg.join(', ')}. Ik start ze opnieuw.`);
    rolUit();
    return;
  }

  log(`In sync met main (${server.slice(0, 7)}). Niets te doen.`);
}

// ---- Start ----
const url = zoekRepoUrl();
if (!existsSync(SERVER)) {
  log(`De server bestaat nog niet. Ik haal ${url} op in de map server/ ...`);
  voerUit('git', ['clone', '--quiet', '--branch', 'main', url, SERVER]);
  rolUit();
}
log(`GitOps-agent gestart. Ik volg main van ${url}, elke ${INTERVAL_SECONDEN} seconden.`);

// Een fout in één rondje (bv. even geen internet) mag de agent niet stoppen.
const veiligRondje = () => {
  try {
    rondje();
  } catch (fout) {
    log(`Dit rondje lukte niet: ${String(fout.stderr || fout.message).trim().split('\n')[0]}`);
  }
};
veiligRondje();
setInterval(veiligRondje, INTERVAL_SECONDEN * 1000);
