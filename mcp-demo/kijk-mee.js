#!/usr/bin/env node
// Kijk mee met een MCP-gesprek, zonder AI-app.
//
// Dit script speelt de rol van de AI-app (de "client"). Het start server.js, stuurt
// dezelfde berichten die VS Code of Claude Desktop zou sturen, en toont alles wat
// heen en weer gaat:
//   →  een bericht van de client naar de server (op stdin van de server)
//   ←  het antwoord van de server (op zijn stdout)
//   [bliep-voorraad] ...  wat de server logt (op zijn stderr)
//
// Starten:          npm run kijk
// Stap voor stap:   npm run kijk -- --stap   (wacht op Enter tussen de stappen, handig in de les)
//
// In een echte AI-app beslist het taalmodel welke tools/call er komt. Hier staan de
// oproepen vast in de lijst STAPPEN hieronder, zodat je elke keer hetzelfde ziet.

import { spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

const STAP_VOOR_STAP = process.argv.includes('--stap');

// De berichten die we sturen, in volgorde, met een korte uitleg per stap.
// Een bericht met een id is een vraag: de server stuurt een antwoord met hetzelfde id.
// Een bericht zonder id is een melding (notification): daar komt geen antwoord op.
const STAPPEN = [
  {
    uitleg: '1. De client stelt zich voor en vraagt wat de server kan.',
    bericht: { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'kijk-mee', version: '1.0.0' } } },
  },
  {
    uitleg: '2. De client meldt dat hij klaar is. Dit is een melding: er komt geen antwoord.',
    bericht: { jsonrpc: '2.0', method: 'notifications/initialized' },
  },
  {
    uitleg: '3. De client vraagt welke tools er zijn. Dit is wat het taalmodel te zien krijgt.',
    bericht: { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  },
  {
    uitleg: '4. Het model wil weten hoeveel Galaxy-toestellen er in Gent liggen.',
    bericht: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'voorraad_opvragen', arguments: { product: 'Galaxy', winkel: 'Gent' } } },
  },
  {
    uitleg: '5. Dan vraagt het model of er leveringen komen in Gent.',
    bericht: { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'leveringen_opvragen', arguments: { winkel: 'Gent' } } },
  },
  {
    uitleg: '6. Een product dat Bliep niet verkoopt: de tool antwoordt met isError: true.',
    bericht: { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'voorraad_opvragen', arguments: { product: 'Nokia', winkel: 'Antwerpen' } } },
  },
  {
    uitleg: '7. Een winkel die niet bestaat: de SDK houdt dat tegen nog voor onze code loopt.',
    bericht: { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'leveringen_opvragen', arguments: { winkel: 'Brugge' } } },
  },
];

/**
 * Toont een JSON-bericht leesbaar, met een pijl ervoor.
 *
 * @param {string} pijl     '→' of '←'
 * @param {object} bericht
 */
function toon(pijl, bericht) {
  const tekst = JSON.stringify(bericht, null, 2).split('\n').map((r) => `   ${r}`).join('\n');
  console.log(`${pijl}\n${tekst}`);
}

/**
 * Wacht tot de gebruiker op Enter drukt, maar alleen met --stap.
 *
 * toetsenbord is een async iterator over de regels die je typt: next() geeft een
 * Promise die inlost bij de volgende Enter.
 *
 * @param {AsyncIterator<string>} toetsenbord
 * @returns {Promise<void>}
 */
async function wachtOpEnter(toetsenbord) {
  if (!STAP_VOOR_STAP) return;
  process.stdout.write('   (Enter voor de volgende stap) ');
  await toetsenbord.next();
}

async function main() {
  // Start de server zoals een AI-app dat doet: als apart proces, met pipes naar
  // stdin, stdout en stderr.
  const server = spawn(process.execPath, [path.join(import.meta.dirname, 'server.js')], { stdio: ['pipe', 'pipe', 'pipe'] });
  // Wat de server op stderr logt, tonen we gewoon door.
  server.stderr.on('data', (stuk) => process.stderr.write(stuk));

  // Antwoorden komen binnen als regels op stdout. We bewaren per id een functie
  // die de belofte inlost zodra het antwoord met dat id binnen is.
  const wachtend = new Map();
  readline.createInterface({ input: server.stdout }).on('line', (regel) => {
    const antwoord = JSON.parse(regel);
    toon('←', antwoord);
    if (wachtend.has(antwoord.id)) wachtend.get(antwoord.id)();
  });

  const invoer = readline.createInterface({ input: process.stdin });
  const toetsenbord = invoer[Symbol.asyncIterator]();
  // Even wachten tot de server opgestart is, zodat zijn eerste logregel bovenaan staat.
  await new Promise((ok) => setTimeout(ok, 300));

  for (const { uitleg, bericht } of STAPPEN) {
    console.log(`\n${uitleg}`);
    const antwoordBinnen = bericht.id === undefined
      ? Promise.resolve()
      : new Promise((ok) => wachtend.set(bericht.id, ok));
    toon('→', bericht);
    // Een MCP-bericht over stdio is één regel JSON, afgesloten met een newline.
    server.stdin.write(JSON.stringify(bericht) + '\n');
    await antwoordBinnen;
    // Kleine pauze, zodat de logregels van de server bij de juiste stap staan.
    await new Promise((ok) => setTimeout(ok, 100));
    await wachtOpEnter(toetsenbord);
  }

  console.log('\nKlaar. Zo praat elke AI-app met een MCP-server.');
  invoer.close();
  server.kill();
}

main();
