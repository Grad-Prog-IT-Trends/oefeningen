# bliep-voorraad-mcp: een MCP-server van dichtbij

Een kleine MCP-server voor de demo in les 2. De webshop weet niet hoeveel toestellen er in de winkels van Bliep liggen. Deze server wel: hij geeft een AI-assistent twee tools, allebei **read-only**.

| Tool | Wat |
| --- | --- |
| `voorraad_opvragen(product, winkel)` | hoeveel stuks van een toestel er nu in Antwerpen, Gent of de webshop liggen |
| `leveringen_opvragen(winkel)` | welke leveringen er deze week gepland zijn |

De data is verzonnen en staat in `data/voorraad.json`. De namen van de producten komen uit de catalogus van de webshop (`../data/producten.json`).

## Wat is MCP?

MCP (Model Context Protocol) is een afspraak over hoe een AI-app praat met een programma dat tools aanbiedt. Zo'n programma heet een **MCP-server**. De AI-app (VS Code met Copilot, Claude Desktop, ...) start de server zelf op en stuurt hem berichten. Het gesprek gaat altijd in dezelfde volgorde:

1. **`initialize`**: de app stelt zich voor, de server zegt wat hij kan.
2. **`tools/list`**: de app vraagt welke tools er zijn. De naam, de beschrijving en het schema van elke tool gaan naar het taalmodel.
3. **`tools/call`**: het model beslist zelf dat het een tool nodig heeft. De app stuurt de naam en de argumenten, de server voert de tool uit en stuurt tekst terug.

Het model voert dus nooit zelf code uit. Het vraagt het aan de app, en de server beslist wat er gebeurt. Wat een tool niet kan, kan het model ook niet. Dat is hetzelfde idee als in les 1: de controle hoort in de code.

## Installeren

De demo heeft eigen packages: de officiële MCP SDK en zod. Installeer ze één keer, **in deze map**:

```text
cd bliep-voorraad-mcp
npm install
```

## Demo 1: meekijken zonder AI-app

```text
npm run kijk
```

Het script `kijk-mee.js` speelt zelf de AI-app. Het start de server en toont elk bericht dat heen en weer gaat:

- `→` is een bericht van de app naar de server,
- `←` is het antwoord van de server,
- `[bliep-voorraad] ...` is wat de server logt.

In de les gebruik je best `npm run kijk -- --stap`. Dan wacht het script op Enter tussen de stappen, en kan je elke stap uitleggen. Let vooral op stap 3: dat is alles wat het taalmodel over de tools te weten krijgt.

## Demo 2: koppelen aan GitHub Copilot in VS Code

1. Kopieer `voorbeeld-config/vscode-mcp.json` naar `.vscode/mcp.json` in de hoofdmap van de repo. Maak de map `.vscode` aan als ze nog niet bestaat.
2. Open `.vscode/mcp.json` in VS Code. Boven `"bliep-voorraad"` staat een knopje **Start**. Klik erop.
3. Open de Copilot-chat en zet hem in **Agent**-modus. Bij het icoontje van de tools zie je nu `bliep-voorraad` met de twee tools.
4. Stel een vraag, bijvoorbeeld:
   - *Hoeveel Galaxy S26 Ultra liggen er in Gent, en komen er deze week bij?*
   - *In welke winkel kan ik vandaag een Pixel 11 Pro ophalen?*

   Copilot vraagt toestemming voor het de tool gebruikt. Klap de oproep open: je ziet de argumenten en het antwoord.
5. Wat de server logt, zie je via *Command Palette → MCP: List Servers → bliep-voorraad → Show Output*.

Kijk bij de tweede vraag hoe vaak het model `voorraad_opvragen` oproept. Het kiest zelf de winkels en de volgorde.

## Demo 3: koppelen aan Claude Desktop

1. Open in Claude Desktop *Settings → Developer → Edit Config*. Dat opent `claude_desktop_config.json`.
2. Voeg het blok uit `voorbeeld-config/claude_desktop_config.json` toe en vervang het pad door het volledige pad naar `server.js` op jouw computer.
3. Herstart Claude Desktop en stel dezelfde vragen als hierboven.

De log staat in de map `logs` van Claude Desktop, in het bestand `mcp-server-bliep-voorraad.log`.

## Wat zit waar

```text
server.js           de MCP-server: welke tools er zijn en wat ze doen
src/voorraad.js     de logica achter de tools, zonder MCP
data/voorraad.json  de voorraad per winkel en de leveringen
kijk-mee.js         een client die het gesprek met de server toont
tests/              de tests
voorbeeld-config/   configuratie voor VS Code en Claude Desktop
```

## Tests

```text
npm test
```

Ook deze tests starten de echte server en praten ermee, met de client uit de SDK.

## Let op

- Een MCP-server is een gewoon programma dat op je computer draait, met dezelfde rechten als jij. Installeer alleen servers die je vertrouwt, en lees wat ze doen.
- Deze server leest alleen. Een tool die iets verandert (een bestelling plaatsen, voorraad aanpassen) vraagt meer controle: wie mag dat, en vraagt de app eerst toestemming? Daar komen we later in het vak op terug.
