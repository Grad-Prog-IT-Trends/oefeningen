// De webserver van de Bliep-demo-app. Enkel ingebouwde Node-modules,
// dus je hoeft niets te installeren.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { alleProducten, zoekProduct } = require('./catalogus');
const { berekenTotaal } = require('./prijzen');

const POORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, '..', 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function stuurJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function leesBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (stuk) => { body += stuk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (fout) { reject(new Error('Geen geldige JSON')); }
    });
  });
}

function log(niveau, bericht, extra = {}) {
  console.log(JSON.stringify({ tijd: new Date().toISOString(), niveau, bericht, ...extra }));
}

async function routeer(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return stuurJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/api/producten') {
    return stuurJson(res, 200, alleProducten());
  }

  if (req.method === 'POST' && url.pathname === '/api/mandje/totaal') {
    const body = await leesBody(req);
    const regels = Array.isArray(body.regels) ? body.regels : [];
    const overzicht = berekenTotaal(regels, zoekProduct);

    // TODO les 2: kortingscode toepassen.
    // De front-end stuurt al een veld "code" mee (of niets als het vakje leeg is).
    // De geldige codes staan in data/kortingscodes.json.

    return stuurJson(res, 200, overzicht);
  }

  if (req.method === 'GET') {
    const bestand = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const volledig = path.join(PUBLIC, path.normalize(bestand));
    if (volledig.startsWith(PUBLIC) && fs.existsSync(volledig) && fs.statSync(volledig).isFile()) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(volledig)] || 'application/octet-stream' });
      return fs.createReadStream(volledig).pipe(res);
    }
  }

  stuurJson(res, 404, { fout: 'Niet gevonden' });
}

const server = http.createServer((req, res) => {
  routeer(req, res).catch((fout) => {
    log('fout', fout.message, { pad: req.url });
    stuurJson(res, 400, { fout: fout.message });
  });
});

if (require.main === module) {
  server.listen(POORT, () => log('info', `Bliep draait op http://localhost:${POORT}`));
}

module.exports = { server };
