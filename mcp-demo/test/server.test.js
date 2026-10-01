// Tests voor server.js: we starten de echte MCP-server en praten ermee zoals een
// AI-app dat doet. Daarvoor gebruiken we de client uit dezelfde SDK.
//
// StdioClientTransport start server.js als apart proces en praat via stdin en stdout,
// net zoals VS Code of Claude Desktop. Zie webshop/test/server.test.js voor de
// uitleg over before() en after().

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'bliep-test', version: '1.0.0' });

// connect() start de server en doet de handshake (initialize). stderr: 'ignore'
// verbergt de logregels van de server, zodat de testuitvoer leesbaar blijft.
before(() => client.connect(new StdioClientTransport({
  command: process.execPath,
  // import.meta.dirname is de map van dit testbestand (test/).
  args: [path.join(import.meta.dirname, '..', 'server.js')],
  stderr: 'ignore',
})));
after(() => client.close());

/**
 * Roept een tool op en geeft de tekst van het antwoord en isError terug.
 *
 * @param {string} name       de naam van de tool
 * @param {object} arguments_ de argumenten
 * @returns {Promise<{ tekst: string, isError: boolean }>}
 */
async function roepOp(name, arguments_) {
  const r = await client.callTool({ name, arguments: arguments_ });
  return { tekst: r.content[0].text, isError: r.isError === true };
}

test('de server biedt twee tools aan, allebei read-only', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name), ['voorraad_opvragen', 'leveringen_opvragen']);
  assert.ok(tools.every((t) => t.annotations.readOnlyHint === true));
});

test('het schema van voorraad_opvragen noemt de winkels', async () => {
  // Dit schema krijgt het taalmodel te zien. Zo weet het welke winkels er zijn.
  const { tools } = await client.listTools();
  const schema = tools.find((t) => t.name === 'voorraad_opvragen').inputSchema;
  assert.deepEqual(schema.properties.winkel.enum, ['Antwerpen', 'Gent', 'Webshop']);
  assert.deepEqual(schema.required, ['product', 'winkel']);
});

test('voorraad_opvragen geeft de voorraad', async () => {
  const r = await roepOp('voorraad_opvragen', { product: 'Fairphone', winkel: 'Antwerpen' });
  assert.deepEqual(r, { tekst: 'Fairphone 6 128 GB in Antwerpen: 11 stuks', isError: false });
});

test('leveringen_opvragen geeft de leveringen', async () => {
  const r = await roepOp('leveringen_opvragen', { winkel: 'Antwerpen' });
  assert.deepEqual(r, { tekst: '10 × Galaxy S26 Ultra 512 GB, donderdag', isError: false });
});

test('een onbekend product geeft een fout die het model kan lezen', async () => {
  const r = await roepOp('voorraad_opvragen', { product: 'Nokia', winkel: 'Gent' });
  assert.equal(r.isError, true);
  assert.match(r.tekst, /Geen product gevonden/);
});

test('een winkel die niet in het schema staat, houdt de SDK tegen', async () => {
  const r = await roepOp('leveringen_opvragen', { winkel: 'Brugge' });
  assert.equal(r.isError, true);
  assert.match(r.tekst, /Input validation error/);
});
