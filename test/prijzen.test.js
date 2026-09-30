const { test } = require('node:test');
const assert = require('node:assert/strict');
const { berekenTotaal, bundelKorting, verzendkosten } = require('../src/prijzen');

// Kleine testcatalogus, los van de echte producten.
const catalogus = {
  toestel: { id: 'toestel', categorie: 'toestel', prijs: 599.0 },
  hoesje: { id: 'hoesje', categorie: 'accessoire', prijs: 20.0 },
  kabel: { id: 'kabel', categorie: 'accessoire', prijs: 9.5 },
};
const zoek = (id) => catalogus[id] || null;

test('subtotaal telt alle regels op', () => {
  const r = berekenTotaal([{ id: 'toestel', aantal: 1 }, { id: 'kabel', aantal: 1 }], zoek);
  assert.equal(r.subtotaal, 608.5);
});

test('verzending is gratis vanaf 50 euro', () => {
  assert.equal(verzendkosten(50), 0);
  assert.equal(verzendkosten(49.99), 4.95);
});

test('een leeg mandje kost niets', () => {
  const r = berekenTotaal([], zoek);
  assert.deepEqual(r, { subtotaal: 0, bundelkorting: 0, verzendkosten: 0, totaal: 0 });
});

test('tweede accessoire aan halve prijs', () => {
  assert.equal(bundelKorting(catalogus.hoesje, 2), 10);
  assert.equal(bundelKorting(catalogus.hoesje, 1), 0);
});

test('geen bundelkorting op toestellen', () => {
  assert.equal(bundelKorting(catalogus.toestel, 2), 0);
});

test('totaal met bundel en verzendkosten', () => {
  const r = berekenTotaal([{ id: 'kabel', aantal: 2 }], zoek);
  assert.equal(r.subtotaal, 19);
  assert.equal(r.bundelkorting, 4.75);
  assert.equal(r.verzendkosten, 4.95);
  assert.equal(r.totaal, 19.2);
});

test('onbekend product geeft een fout', () => {
  assert.throws(() => berekenTotaal([{ id: 'bestaat-niet', aantal: 1 }], zoek), /Onbekend product/);
});
