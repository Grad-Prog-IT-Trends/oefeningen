// De webserver van de Bliep-demo-app, gebouwd met Express.
//
// Hoe werkt Express?
// 1. Je maakt een app met express().
// 2. Je koppelt een functie aan een methode en een pad, bv. app.get('/health', ...).
//    Dat heet een route. Bij elk verzoek dat past, roept Express die functie aan
//    met twee objecten: req (wat de browser vraagt) en res (je antwoord).
// 3. Met app.use(...) voeg je middleware toe: functies die bij (bijna) elk verzoek
//    lopen, bv. om de body van een POST in te lezen of bestanden te sturen.
// Express overloopt alles van boven naar beneden, in de volgorde van dit bestand.
// De eerste route die past, stuurt het antwoord.

// require() laadt een module in. Het voorvoegsel node: betekent dat het een
// module is die in Node zelf zit. 'express' komt uit de map node_modules/
// (geïnstalleerd met npm install). Een pad met ./ verwijst naar een eigen bestand.
const path = require('node:path'); // paden naar bestanden samenstellen
const express = require('express');
// { alleProducten, zoekProduct } haalt twee functies uit het object dat
// catalogus.js exporteert. Dat heet destructuring.
const { alleProducten, zoekProduct } = require('./catalogus');
const { berekenTotaal } = require('./prijzen');

// process.env bevat de omgevingsvariabelen. Is PORT niet ingesteld, dan nemen we 3000.
const POORT = process.env.PORT || 3000;
// __dirname is de map waarin dit bestand staat (src/). PUBLIC wordt dus <project>/public.
const PUBLIC = path.join(__dirname, '..', 'public');

/**
 * Schrijft een logregel naar de terminal, als JSON. Zo kan een programma de logs
 * later makkelijk doorzoeken.
 *
 * ...extra (spread) kopieert alle velden van het object extra in het nieuwe object.
 * extra = {} is een standaardwaarde: geef je niets mee, dan is extra een leeg object.
 *
 * @param {string} niveau   bv. 'info' of 'fout'
 * @param {string} bericht  wat er gebeurd is
 * @param {object} [extra]  extra velden, bv. { pad: '/api/producten' }
 */
function log(niveau, bericht, extra = {}) {
  console.log(JSON.stringify({ tijd: new Date().toISOString(), niveau, bericht, ...extra }));
}

const app = express();

// Middleware: leest de body van een verzoek met Content-Type application/json
// en zet die om naar een object in req.body.
app.use(express.json());

// Middleware: stuurt bestanden uit de map public/ (index.html, app.js, stijl.css).
// Vraagt de browser /, dan krijgt hij index.html. Zo toont de browser de webpagina.
app.use(express.static(PUBLIC));

// GET /health: een eenvoudige controle of de app draait.
// res.json() zet het object om naar JSON en stuurt het met status 200.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/producten: de volledige catalogus.
app.get('/api/producten', (req, res) => {
  res.json(alleProducten());
});

// POST /api/mandje/totaal: berekent het bedrag van een mandje.
// De browser stuurt bv. { "regels": [{ "id": "fairphone-6", "aantal": 1 }], "code": "WELKOM5" }.
// Gooit berekenTotaal() een fout (throw), dan geeft Express die door aan de
// foutafhandeling onderaan dit bestand.
app.post('/api/mandje/totaal', (req, res) => {
  // Zonder body is req.body undefined. Met ?? {} rekenen we dan met een leeg object.
  const body = req.body ?? {};
  // Zit er geen geldige lijst in body.regels, dan rekenen we met een leeg mandje.
  const regels = Array.isArray(body.regels) ? body.regels : [];
  const overzicht = berekenTotaal(regels, zoekProduct);

  // TODO les 2: kortingscode toepassen.
  // De front-end stuurt al een veld "code" mee (of niets als het vakje leeg is).
  // De geldige codes staan in data/kortingscodes.json.

  res.json(overzicht);
});

// Geen enkele route hierboven paste: 404 Niet gevonden.
// res.status() zet de HTTP-statuscode: 200 (ok), 400 (fout verzoek), 404 (niet gevonden).
app.use((req, res) => {
  res.status(404).json({ fout: 'Niet gevonden' });
});

// Foutafhandeling. Express herkent deze middleware aan de vier parameters:
// de eerste is de fout. Elke fout in een route komt hier terecht, zodat de server
// niet crasht. De browser krijgt dan { "fout": "..." } met status 400.
// Let op: ook als je next niet gebruikt, moet hij in de lijst staan.
app.use((fout, req, res, next) => {
  // Een body die geen geldige JSON is, geeft een fout van express.json().
  const bericht = fout.type === 'entity.parse.failed' ? 'Geen geldige JSON' : fout.message;
  log('fout', bericht, { pad: req.url });
  res.status(400).json({ fout: bericht });
});

// require.main === module is alleen waar als je dit bestand rechtstreeks start
// (npm start voert "node src/server.js" uit). Dan starten we de server.
// Laden de tests dit bestand met require(), dan is het niet waar. De tests
// starten de server dan zelf, op een vrije poort (zie test/server.test.js).
if (require.main === module) {
  app.listen(POORT, () => log('info', `Bliep draait op http://localhost:${POORT}`));
}

module.exports = { app };
