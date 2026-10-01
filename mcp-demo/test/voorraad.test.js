// Tests voor src/voorraad.js: de logica achter de tools, zonder MCP.
//
// Starten doe je in de map mcp-demo met: npm test
// Zie webshop/test/prijzen.test.js voor de uitleg over test() en assert.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WINKELS, vindWinkel, voorraadOpvragen, leveringenOpvragen } from '../src/voorraad.js';

test('er zijn drie winkels', () => {
  assert.deepEqual(WINKELS, ['Antwerpen', 'Gent', 'Webshop']);
});

test('een winkel vinden zonder te letten op hoofdletters en spaties', () => {
  assert.equal(vindWinkel(' gent '), 'Gent');
  assert.throws(() => vindWinkel('Brugge'), /Onbekende winkel "Brugge"/);
});

test('voorraad met een deel van de naam, met de naam uit de catalogus van de webshop', () => {
  assert.equal(voorraadOpvragen({ product: 'pixel', winkel: 'Gent' }), 'Pixel 11 Pro 256 GB in Gent: 4 stuks');
});

test('ook 0 stuks is een antwoord, geen fout', () => {
  assert.equal(voorraadOpvragen({ product: 'Galaxy', winkel: 'Gent' }), 'Galaxy S26 Ultra 512 GB in Gent: 0 stuks');
});

test('passen er meerdere producten, dan krijg je ze allemaal', () => {
  // Een '1' zit in de naam van alle vier de toestellen (Pixel 11, 512 GB, 128 GB, iPhone 15).
  assert.equal(voorraadOpvragen({ product: '1', winkel: 'Webshop' }).split('\n').length, 4);
});

test('een onbekend of leeg product geeft een fout', () => {
  assert.throws(() => voorraadOpvragen({ product: 'Nokia', winkel: 'Gent' }), /Geen product gevonden voor "Nokia"/);
  assert.throws(() => voorraadOpvragen({ product: '', winkel: 'Gent' }), /Geen product gevonden/);
});

test('leveringen per winkel', () => {
  assert.equal(
    leveringenOpvragen({ winkel: 'Gent' }),
    '12 × Pixel 11 Pro 256 GB, vrijdag\n6 × Galaxy S26 Ultra 512 GB, vrijdag',
  );
  assert.equal(leveringenOpvragen({ winkel: 'Webshop' }), 'Geen leveringen gepland voor Webshop deze week.');
});
