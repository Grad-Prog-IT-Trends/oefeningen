const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { server } = require('../src/server');

let basis;
before(() => new Promise((ok) => server.listen(0, () => { basis = `http://localhost:${server.address().port}`; ok(); })));
after(() => new Promise((ok) => server.close(ok)));

test('health geeft ok', async () => {
  const r = await fetch(`${basis}/health`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: 'ok' });
});

test('mandje met een toestel en een hoesje', async () => {
  const r = await fetch(`${basis}/api/mandje/totaal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regels: [{ id: 'fairphone-6', aantal: 1 }, { id: 'hoesje-silicone', aantal: 1 }] }),
  });
  const data = await r.json();
  assert.equal(data.subtotaal, 623.99);
  assert.equal(data.totaal, 623.99);
});
