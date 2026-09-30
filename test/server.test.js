// Tests voor src/server.js: we starten de echte server en sturen er verzoeken naar,
// net zoals de browser dat doet. Zo testen we de API van begin tot einde.
//
// Starten doe je met: npm test (zie ook de uitleg bovenaan prijzen.test.js).
//
// Deze tests gebruiken echte producten uit data/producten.json.

// before() loopt één keer voor alle tests in dit bestand, after() één keer erna.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
// We laden de Express-app, maar die start nog niet vanzelf (zie onderaan src/server.js).
const { app } = require('../src/server');

// De draaiende server en zijn adres, bv. 'http://localhost:53412'. We vullen ze in before().
let server;
let basis;

// Start de server voor de tests beginnen.
// Poort 0 betekent: kies zelf een vrije poort. Zo botst de test niet met een
// server die je al met npm start hebt draaien op poort 3000.
// app.listen() werkt met een callback: een functie die Node aanroept als de
// server klaar is. We verpakken dat in een Promise, zodat node:test weet dat het
// moet wachten tot ok() aangeroepen wordt.
before(() => new Promise((ok) => {
  server = app.listen(0, () => {
    basis = `http://localhost:${server.address().port}`;
    ok();
  });
}));

// Stop de server na de laatste test. Anders blijft het testproces hangen.
after(() => new Promise((ok) => server.close(ok)));

// Deze tests zijn async: fetch() stuurt een verzoek over het netwerk en dat duurt
// even. Met await wachten we op het antwoord. fetch zit ingebouwd in Node vanaf versie 18.
test('health geeft ok', async () => {
  const r = await fetch(`${basis}/health`);
  assert.equal(r.status, 200);
  // r.json() leest de body en zet de JSON om naar een object. Ook daarop wachten we.
  assert.deepEqual(await r.json(), { status: 'ok' });
});

test('mandje met een toestel en een hoesje', async () => {
  // Een POST-verzoek met een body in JSON, zoals public/app.js dat doet.
  const r = await fetch(`${basis}/api/mandje/totaal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regels: [{ id: 'fairphone-6', aantal: 1 }, { id: 'hoesje-silicone', aantal: 1 }] }),
  });
  const data = await r.json();
  // 599.00 + 24.99 = 623.99. Eén hoesje geeft geen bundelkorting,
  // en boven 50 euro is de verzending gratis, dus het totaal is gelijk.
  assert.equal(data.subtotaal, 623.99);
  assert.equal(data.totaal, 623.99);
});
