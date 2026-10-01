#!/usr/bin/env node
// De MCP-server van Bliep: voorraad per winkel en geplande leveringen.
//
// Wat is MCP?
// MCP (Model Context Protocol) is een afspraak over hoe een AI-app (VS Code met
// Copilot, Claude Desktop, ...) praat met een programma dat tools aanbiedt. Zo'n
// programma heet een MCP-server. De AI-app start de server zelf op en stuurt
// berichten naar zijn stdin. De server antwoordt op stdout, één JSON-bericht per regel.
//
// Het gesprek gaat altijd zo:
// 1. initialize:  de app stelt zich voor, de server zegt wat hij kan.
// 2. tools/list:  de app vraagt welke tools er zijn. De beschrijving en het schema
//                 van elke tool gaan naar het taalmodel. Daarmee beslist het model
//                 zelf of en wanneer het een tool gebruikt.
// 3. tools/call:  het model wil een tool gebruiken. De app stuurt de naam en de
//                 argumenten, de server voert de tool uit en stuurt tekst terug.
// Wil je die berichten zelf zien, zonder AI-app? Start dan: npm run kijk
//
// Het protocol schrijven we niet zelf. Dat doet de officiële SDK
// (@modelcontextprotocol/sdk). Wij zeggen alleen welke tools er zijn en wat ze doen.

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
// zod beschrijft welke argumenten een tool verwacht. De SDK maakt daar het schema van
// dat de AI-app te zien krijgt, en controleert de argumenten voor jouw code loopt.
const { z } = require('zod');
const { WINKELS, voorraadOpvragen, leveringenOpvragen } = require('./src/voorraad');

/**
 * Schrijft een logregel naar stderr.
 *
 * Belangrijk: stdout is voor de MCP-berichten. Schrijf je daar iets anders naar,
 * bv. met console.log(), dan raakt de AI-app in de war. Alles op stderr komt in de
 * MCP-log van je AI-app terecht. Zo zie je in de demo welke tool het model oproept.
 *
 * @param {string} tekst
 */
function log(tekst) {
  console.error(`[bliep-voorraad] ${tekst}`);
}

/**
 * Maakt van een gewone functie de handler van een tool.
 *
 * Een tool geeft een object terug met content: een lijst van stukken tekst.
 * Gooit de functie een fout, dan sturen we die terug met isError: true. Het model
 * leest die melding en kan het opnieuw proberen, bv. met een andere schrijfwijze.
 *
 * @param {string} naam                  de naam van de tool, voor de log
 * @param {(args: object) => string} fn  de functie die het echte werk doet
 */
function alsTool(naam, fn) {
  return async (args) => {
    log(`tools/call ${naam}(${JSON.stringify(args)})`);
    try {
      const tekst = fn(args);
      log(`  antwoord: ${tekst.replace(/\n/g, ' | ')}`);
      return { content: [{ type: 'text', text: tekst }] };
    } catch (fout) {
      log(`  fout: ${fout.message}`);
      return { content: [{ type: 'text', text: fout.message }], isError: true };
    }
  };
}

const server = new McpServer({ name: 'bliep-voorraad', version: '1.0.0' });

// Een tool registreren: een naam, een beschrijving voor het model, het schema van de
// argumenten, en de functie die loopt. Schrijf de beschrijving voor het model: dat
// leest ze om te beslissen of deze tool past bij de vraag van de gebruiker.
// readOnlyHint zegt de AI-app dat de tool niets verandert. Sommige apps vragen dan
// minder snel om toestemming.
server.registerTool('voorraad_opvragen', {
  title: 'Voorraad opvragen',
  description: 'Geeft het aantal stuks van een smartphone dat nu in een Bliep-winkel of in de webshop ligt. Leest alleen, verandert niets.',
  inputSchema: {
    product: z.string().describe('Naam of deel van de naam, bv. "Pixel" of "Galaxy"'),
    winkel: z.enum(WINKELS).describe('De winkel: Antwerpen, Gent of Webshop'),
  },
  annotations: { readOnlyHint: true },
}, alsTool('voorraad_opvragen', voorraadOpvragen));

server.registerTool('leveringen_opvragen', {
  title: 'Leveringen opvragen',
  description: 'Geeft de leveringen die deze week gepland zijn voor een Bliep-winkel of de webshop. Leest alleen, verandert niets.',
  inputSchema: {
    winkel: z.enum(WINKELS).describe('De winkel: Antwerpen, Gent of Webshop'),
  },
  annotations: { readOnlyHint: true },
}, alsTool('leveringen_opvragen', leveringenOpvragen));

// De server praat via stdin en stdout (stdio). Dat is de gewone manier voor een
// MCP-server die op je eigen computer draait.
// connect() geeft een Promise terug. Met .then() loggen we pas als de verbinding klaar is.
server.connect(new StdioServerTransport()).then(() => {
  log('gestart, wacht op berichten op stdin');
});
