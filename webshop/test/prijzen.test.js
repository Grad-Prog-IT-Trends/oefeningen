// Tests voor src/prijzen.js.
//
// Starten doe je met: npm test
// Dat voert "node --test" uit (zie package.json). Node zoekt dan zelf alle bestanden
// in de map test/ en voert ze uit. Je hoeft niets te installeren: de testrunner
// (node:test) en de controles (node:assert) zitten in Node zelf.
//
// Een test ziet er zo uit:
//   test('wat je controleert, in gewone taal', () => {
//     ... code uitvoeren ...
//     assert.equal(watJeKrijgt, watJeVerwacht);
//   });
// Klopt een assert niet, dan faalt de test en toont Node het verschil tussen
// wat je kreeg (actual) en wat je verwachtte (expected).
//
// De asserts die we hier gebruiken:
// - assert.equal(a, b)      a en b zijn gelijk (voor getallen en tekst)
// - assert.deepEqual(a, b)  twee objecten hebben exact dezelfde velden en waarden
// - assert.throws(fn, /x/)  fn gooit een fout, en de foutmelding bevat x
// We laden 'node:assert/strict'. Die vergelijkt streng, zoals === in plaats van ==.
// Dus 1 en '1' zijn niet gelijk.

import { test } from 'node:test';
// Zonder { } krijg je de standaard-export van een module: hier het object assert
// met alle controles erin (assert.equal, assert.deepEqual, ...).
import assert from 'node:assert/strict';
import { berekenTotaal, bundelKorting, verzendkosten } from '../src/prijzen.js';

// Kleine testcatalogus, los van de echte producten.
// Zo blijven de tests kloppen als de prijzen in data/producten.json veranderen,
// en zijn de bedragen makkelijk na te rekenen.
const catalogus = {
  toestel: { id: 'toestel', categorie: 'toestel', prijs: 599.0 },
  hoesje: { id: 'hoesje', categorie: 'accessoire', prijs: 20.0 },
  kabel: { id: 'kabel', categorie: 'accessoire', prijs: 9.5 },
};

// Een nepversie van zoekProduct uit catalogus.js. berekenTotaal() krijgt deze
// functie mee en gebruikt ze om producten op te zoeken.
// catalogus[id] haalt het veld met die naam op, bv. catalogus['kabel'].
// Bestaat het niet, dan geven we null terug, net als de echte zoekProduct.
const zoek = (id) => catalogus[id] || null;

test('subtotaal telt alle regels op', () => {
  // 599 + 9.5 = 608.5
  const r = berekenTotaal([{ id: 'toestel', aantal: 1 }, { id: 'kabel', aantal: 1 }], zoek);
  assert.equal(r.subtotaal, 608.5);
});

test('verzending is gratis vanaf 50 euro', () => {
  // We testen net op en net onder de grens. Daar zitten de fouten meestal.
  assert.equal(verzendkosten(50), 0);
  assert.equal(verzendkosten(49.99), 4.95);
});

test('een leeg mandje kost niets', () => {
  const r = berekenTotaal([], zoek);
  // deepEqual controleert het hele object in één keer.
  assert.deepEqual(r, { subtotaal: 0, bundelkorting: 0, verzendkosten: 0, totaal: 0 });
});

test('tweede accessoire aan halve prijs', () => {
  // Twee hoesjes van 20 euro: het tweede aan halve prijs, dus 10 euro korting.
  assert.equal(bundelKorting(catalogus.hoesje, 2), 10);
  // Eén hoesje: geen korting.
  assert.equal(bundelKorting(catalogus.hoesje, 1), 0);
});

test('geen bundelkorting op toestellen', () => {
  assert.equal(bundelKorting(catalogus.toestel, 2), 0);
});

test('totaal met bundel en verzendkosten', () => {
  const r = berekenTotaal([{ id: 'kabel', aantal: 2 }], zoek);
  assert.equal(r.subtotaal, 19); // 2 x 9.5
  assert.equal(r.bundelkorting, 4.75); // de helft van 9.5
  assert.equal(r.verzendkosten, 4.95); // 19 - 4.75 = 14.25, minder dan 50
  assert.equal(r.totaal, 19.2); // 14.25 + 4.95
});

test('onbekend product geeft een fout', () => {
  // assert.throws verwacht een functie, niet het resultaat ervan. Daarom staat
  // berekenTotaal in een arrow function () => ... : assert.throws roept ze zelf
  // aan en vangt de fout op. /Onbekend product/ is een reguliere expressie:
  // de foutmelding moet die tekst bevatten.
  assert.throws(() => berekenTotaal([{ id: 'bestaat-niet', aantal: 1 }], zoek), /Onbekend product/);
});
