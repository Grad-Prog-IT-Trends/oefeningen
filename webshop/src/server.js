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

// import laadt een module in. Het voorvoegsel node: betekent dat het een
// module is die in Node zelf zit. 'express' komt uit de map node_modules/
// (geïnstalleerd met npm install). Een pad met ./ verwijst naar een eigen bestand.
// Bij een eigen bestand schrijf je de extensie .js er altijd bij.
import path from 'node:path'; // paden naar bestanden samenstellen
import express from 'express';
// uuid maakt unieke id's, bv. '3b241101-e2bb-4255-8caf-4136c566a962'.
import { v4 as uuidv4 } from 'uuid';
// { alleProducten, zoekProduct } haalt twee functies uit wat catalogus.js
// exporteert. Je kiest zelf welke je nodig hebt.
import { alleProducten, zoekProduct } from './catalogus.js';
import { berekenTotaal } from './prijzen.js';
import { raffleActief, telInschrijvingen, schrijfIn, zoekInschrijving } from './raffle.js';
import { stuurDropMelding } from './notificaties.js';

// process.env bevat de omgevingsvariabelen. Is PORT niet ingesteld, dan nemen we 3000.
const POORT = process.env.PORT || 3000;
// import.meta.dirname is de map waarin dit bestand staat (src/).
// PUBLIC wordt dus <webshop>/public.
const PUBLIC = path.join(import.meta.dirname, '..', 'public');

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

// Middleware (les 5): elk verzoek krijgt een uniek id en een logregel met de status
// en de duur. Loopt er iets mis, dan zoek je met dat id alle regels van één verzoek op.
// Zo ziet een log eruit waar je (of een AI) iets mee kan tijdens een incident.
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Verzoek-Id', req.id);
  const start = performance.now();
  // 'finish' gebeurt als het antwoord volledig verstuurd is.
  res.on('finish', () => {
    if (req.path === '/health') return; // de healthcheck elke 5 seconden is ruis
    log(res.statusCode >= 500 ? 'fout' : 'info', 'verzoek', {
      verzoekId: req.id,
      methode: req.method,
      pad: req.originalUrl,
      status: res.statusCode,
      ms: Math.round(performance.now() - start),
    });
  });
  next();
});

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

// GET /api/config: wat de omgeving instelt. Deze waarden komen uit omgevingsvariabelen,
// niet uit de code. In les 4 stel je ze in via config/bliep.env, en die file
// pas je alleen aan via een pull request.
// Geen variabele ingesteld? Dan nemen we een standaardwaarde (na de ||).
app.get('/api/config', (req, res) => {
  res.json({
    banner: process.env.BANNER_TEKST || '',
    dropModus: process.env.DROP_MODUS || 'uit',
    omgeving: process.env.OMGEVING || 'lokaal',
    versie: process.env.GIT_COMMIT || 'lokaal',
  });
});

// GET /api/raffle: hoeveel mensen zich al inschreven voor de volgende raffle.
// async: we wachten op de database. Zonder database antwoorden we met 503
// (Service Unavailable): de webshop werkt, alleen de raffle niet.
app.get('/api/raffle', async (req, res) => {
  if (!raffleActief()) return res.status(503).json({ fout: 'De raffle heeft geen database' });
  res.json(await telInschrijvingen());
});

// POST /api/raffle: inschrijven met { "email": "..." }.
// Een fout (bv. een ongeldig e-mailadres) gaat naar de foutafhandeling onderaan.
app.post('/api/raffle', async (req, res) => {
  if (!raffleActief()) return res.status(503).json({ fout: 'De raffle heeft geen database' });
  res.json(await schrijfIn(req.body?.email));
});

// GET /api/raffle/status?email=...: sta ik al ingeschreven, en sinds wanneer?
// Nieuw in les 5.
app.get('/api/raffle/status', async (req, res) => {
  if (!raffleActief()) return res.status(503).json({ fout: 'De raffle heeft geen database' });
  const gevonden = await zoekInschrijving(req.query.email ?? '');
  res.json({ ingeschreven: gevonden.length > 0, inschrijvingen: gevonden });
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

  // De kortingscode bouwde je in les 2, op je eigen branch. Hier zit ze niet in:
  // in les 4 draait alles rond de omgeving, niet rond de code.

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
  log('fout', bericht, { verzoekId: req.id, pad: req.url });
  res.status(400).json({ fout: bericht });
});

// import.meta.main is alleen true als je dit bestand rechtstreeks start
// (npm start voert "node src/server.js" uit). Dan starten we de server.
// Laden de tests dit bestand met import, dan is het false. De tests starten
// de server dan zelf, op een vrije poort (zie test/server.test.js).
if (import.meta.main) {
  app.listen(POORT, () => {
    log('info', `Bliep draait op http://localhost:${POORT}`);
    // Staat de dropmodus aan, dan krijgen alle klanten een pushmelding (les 5).
    if (process.env.DROP_MODUS === 'aan') stuurDropMelding('Galaxy S26 Ultra', log);
  });
}

export { app };
