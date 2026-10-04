// Controleert config/bliep.env voor een wijziging op main mag landen.
// De GitHub Action voert dit uit bij elke pull request. Je kan het ook zelf draaien:
//   node gitops/controleer-config.js
// Alles in orde? Dan stopt het script met code 0 en kleurt de Action groen.
// Iets fout? Dan toont het wat, stopt met code 1, en kleurt de Action rood.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const BESTAND = path.join(import.meta.dirname, '..', 'config', 'bliep.env');

// Welke sleutels mogen er in de file staan, en wat is een geldige waarde?
const REGELS = {
  BANNER_TEKST: (w) => (w.length > 0 && w.length <= 100) || 'moet tussen 1 en 100 tekens lang zijn',
  DROP_MODUS: (w) => ['aan', 'uit'].includes(w) || 'moet "aan" of "uit" zijn',
  OMGEVING: (w) => ['lokaal', 'test', 'productie'].includes(w) || 'moet "lokaal", "test" of "productie" zijn',
};

const fouten = [];
const gezien = new Set();

const regels = readFileSync(BESTAND, 'utf8').split(/\r?\n/);
regels.forEach((regel, i) => {
  const tekst = regel.trim();
  if (tekst === '' || tekst.startsWith('#')) return; // lege regel of commentaar
  const plek = tekst.indexOf('=');
  if (plek === -1) {
    fouten.push(`regel ${i + 1}: geen = gevonden, verwacht SLEUTEL=waarde`);
    return;
  }
  const sleutel = tekst.slice(0, plek).trim();
  const waarde = tekst.slice(plek + 1).trim();

  if (/PASSWORD|WACHTWOORD|SECRET|TOKEN|KEY|SLEUTEL/i.test(sleutel)) {
    fouten.push(`regel ${i + 1}: ${sleutel} lijkt een geheim. Geheimen horen niet in git (zie les 5).`);
    return;
  }
  if (!(sleutel in REGELS)) {
    fouten.push(`regel ${i + 1}: onbekende sleutel ${sleutel}. Toegelaten: ${Object.keys(REGELS).join(', ')}`);
    return;
  }
  if (gezien.has(sleutel)) fouten.push(`regel ${i + 1}: ${sleutel} staat er twee keer in`);
  gezien.add(sleutel);

  const oordeel = REGELS[sleutel](waarde);
  if (oordeel !== true) fouten.push(`regel ${i + 1}: ${sleutel} ${oordeel} (nu: "${waarde}")`);
});

for (const sleutel of Object.keys(REGELS)) {
  if (!gezien.has(sleutel)) fouten.push(`${sleutel} ontbreekt`);
}

if (fouten.length > 0) {
  console.error('config/bliep.env is NIET in orde:');
  for (const f of fouten) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('config/bliep.env is in orde.');
