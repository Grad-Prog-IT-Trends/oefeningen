# Bliep: een AI-agent van dichtbij

> Les 1 van IT Trends. Voorbereiding en uitleg over de branches: zie de [README op `main`](../../tree/main).

Bliep is een verzonnen webshop die smartphones verkoopt. In dit project krijgt de supportagent van Bliep een vraag van een klant, en jij ziet in je terminal stap voor stap wat die agent doet.

Het project heeft geen frameworks en geen pakketten. Je hebt alleen Node.js en een gratis API-sleutel nodig.

## Wat een agent eigenlijk doet

Een taalmodel kan zelf niets opzoeken. Het weet niet waar jouw pakket is en kan geen geld terugstorten. Wat het wel kan: zeggen welke tool het wil gebruiken en met welke gegevens. Het script voert die tool uit en stuurt het resultaat terug naar het model. Daarna beslist het model opnieuw: nog een tool, of antwoorden.

```
  vraag van de klant
          │
          ▼
     ┌─────────┐   "gebruik tool X met Y"   ┌──────────────────┐
     │  model  │ ─────────────────────────> │  onze code voert │
     │         │ <───────────────────────── │  de tool uit     │
     └─────────┘        het resultaat       └──────────────────┘
          │
          │  geen tool meer nodig
          ▼
  antwoord aan de klant
```

Dat heen en weer heet de **agent-lus**. Meer is een agent niet: een model, een lijst tools en een lus.

De Bliep-agent heeft vier tools:

| Tool | Wat hij doet |
|---|---|
| `bestelling_opzoeken` | status, datum en bedrag van een bestelling |
| `trackingstatus_opvragen` | waar het pakket nu is volgens de koerier |
| `klantgegevens_opzoeken` | naam, adres en bestelhistoriek van een klant |
| `terugbetaling_uitvoeren` | stort geld terug naar de klant |

Alle data is verzonnen en staat in [src/bliep/systems.js](src/bliep/systems.js).

## Installeren

Dit doe je één keer. Reken op een tiental minuten.

### 1. Node.js installeren

Ga naar [nodejs.org](https://nodejs.org), download de **LTS**-versie en installeer die met de standaardinstellingen.

### 2. Een terminal openen in de projectmap

Je zit op de branch `les-01-agent` van de repo (zie de README op `main`). Open een terminal in de map van de repo:

- **VS Code** (het makkelijkst): *File → Open Folder*, kies de projectmap, en daarna *Terminal → New Terminal*.
- **Windows**: open de map in Verkenner, klik rechts op een lege plek en kies *Openen in Terminal*.
- **Mac**: open de app Terminal, typ `cd ` (met een spatie erachter), sleep de map in het venster en druk op Enter.

Controleer of Node werkt:

```
node -v
```

Je ziet iets als `v22.12.0`. Alles vanaf 20 is goed.

### 3. Een gratis API-sleutel halen

1. Ga naar [aistudio.google.com](https://aistudio.google.com) en log in met een Google-account.
2. Klik op **Get API key** en maak een sleutel aan.
3. Kopieer de sleutel. Hij begint meestal met `AIza`.

Een kredietkaart heb je niet nodig.

### 4. De sleutel instellen

```
npm run setup
```

Plak je sleutel als erom gevraagd wordt en druk op Enter. Het script zet de sleutel in een bestand `.env` en test meteen of hij werkt. Zie je **De sleutel werkt**, dan ben je klaar.

`npm install` hoef je niet te doen, want er zijn geen pakketten om te installeren.

> Je sleutel is een wachtwoord. Deel hem niet en zet hem niet online. Het bestand `.env` staat in `.gitignore`, zodat hij niet per ongeluk in git terechtkomt.

### 5. De eerste run

```
npm run a
```

Na een paar seconden zie je de agent aan het werk.

## De drie scenario's

| Commando | Wat er gebeurt |
|---|---|
| `npm run a` | Een klant vraagt waar zijn pakket blijft. |
| `npm run c` | Een klant eist 1349 euro terug. De agent mag alles. |
| `npm run c-rem` | Dezelfde klant, maar nu met een rem ingebouwd. |

### Scenario A: waar blijft mijn bestelling?

De agent zoekt de bestelling op, vindt een trackingnummer, vraagt de trackingstatus op en antwoordt. Dat zijn twee tool-calls.

**Denkvraag:** op welk moment wist het model dat het pakket in Willebroek lag? Pas na de tweede tool-call. Daarvoor stond die informatie nergens in het gesprek. Het model gokt niet, het zoekt op.

### Scenario C: de klant wil zijn geld terug

De klant zegt dat hij niets ontvangen heeft. Volgens het systeem is het pakket geleverd en getekend door de buur. De agent heeft geen regel over wanneer hij moet doorverwijzen, en de terugbetaal-tool voert alles uit wat hij krijgt.

Wat er dan gebeurt, verschilt van run tot run. Soms verzint het model een beleidsregel die nergens staat. Soms stort het gewoon 1349 euro terug. Gebeurt dat laatste, dan zet het script er een rode regel onder: er is geld vertrokken zonder dat een mens ernaar gekeken heeft.

Draai het gerust een paar keer. Dat je telkens iets anders krijgt, is net wat je moet zien.

### Scenario C met rem

Twee dingen zijn anders:

1. De instructies voor de agent (de *systeemprompt*) zeggen nu: wat je niet kan aantonen, geef je door aan een medewerker.
2. De terugbetaal-tool weigert elke aanvraag zonder goedkeuring van een medewerker.

Meestal probeert het model het toch, krijgt het een weigering terug, en verwijst het de klant door. De prompt heeft geholpen, maar het geld werd tegengehouden door de code.

## Wat je op het scherm ziet

```
KLANT                       de vraag van de klant
ronde 1  →  tool_use        het model vraagt een tool, met deze gegevens
  ←  tool_result            wat de tool teruggeeft
(het model denkt hardop)    tekst die het model tussendoor schrijft
ANTWOORD AAN DE KLANT       het uiteindelijke antwoord
```

Na zes rondes stopt de lus altijd, ook als er nog geen antwoord is. Zonder zo'n limiet kan een agent eindeloos tools blijven aanroepen.

## Hoe de code in elkaar zit

De code staat in `src/`, verdeeld over drie mappen. Zo zie je meteen wat de agent zelf is en wat we er voor de les omheen gebouwd hebben.

```text
src/
  agent/      de agent zelf. Dit is alles wat een echte agent nodig heeft.
  bliep/      de systemen van Bliep achter de tools (in het echt: echte databanken en API's)
  demo/       alleen voor de les: scenario's, uitvoer op het scherm, opnames, setup
```

**`src/agent/`: de agent**

| Bestand | Wat erin staat |
|---|---|
| [loop.js](src/agent/loop.js) | De agent-lus. Begin hier, het zijn maar een veertigtal regels. |
| [tools.js](src/agent/tools.js) | De vier tools: wat het model over elke tool te zien krijgt, en welke code er dan draait. |
| [models.js](src/agent/models.js) | Stuurt het gesprek naar Gemini of Anthropic en vertaalt het antwoord terug. |

**`src/bliep/`: de systemen achter de tools**

| Bestand | Wat erin staat |
|---|---|
| [systems.js](src/bliep/systems.js) | De nepdatabank met bestellingen, tracking en klanten, en de terugbetaal-API met zijn controle. |

**`src/demo/`: alleen voor de les**

| Bestand | Wat erin staat |
|---|---|
| [run.js](src/demo/run.js) | Start een scenario en koppelt alles aan elkaar. |
| [scenarios.js](src/demo/scenarios.js) | De drie scenario's: de vraag van de klant en de systeemprompt. |
| [print.js](src/demo/print.js) | Alles wat in de terminal verschijnt. Een echte agent print niets. |
| [replay.js](src/demo/replay.js), [setup.js](src/demo/setup.js), [files.js](src/demo/files.js) | Opnames afspelen, de setup en `.env` lezen. |

### Wie doet wat?

Het **model** doet maar één ding: het leest het gesprek en beslist wat er nu moet gebeuren, een tool gebruiken of antwoorden. Meer niet.

Al de rest is gewone code die wij geschreven hebben. De lus in `loop.js` houdt het gesprek bij, voert de tools uit, stuurt de resultaten terug en beslist wanneer het stopt. Het model kan zelf geen databank openen en geen geld terugstorten. Het kan dat alleen vragen.

De lus weet niets van de terminal. Ze meldt elke stap via `onStep`, en de demo gebruikt dat om alles op het scherm te zetten en op te nemen. Als je `onStep` weglaat, blijft er een werkende agent over.

### Wat de moeite is om te bekijken

- In [tools.js](src/agent/tools.js) zie je `toolDefinitions`. Dat is letterlijk alles wat het model over de Bliep-systemen te weten krijgt: een naam, een beschrijving in gewone taal en welke gegevens erin moeten. De code die de tool uitvoert, ziet het model nooit.
- In [models.js](src/agent/models.js) zie je dat Gemini spreekt over `functionDeclarations` en `functionCall`, en Anthropic over `tools` en `tool_use`. Andere namen, hetzelfde mechanisme. De lus merkt er niets van. In les 2 zie je hoe MCP die vertaling overbodig probeert te maken.
- In [systems.js](src/bliep/systems.js) zie je de functie `refund`. Daar zit de rem van scenario `c-rem`: in het systeem achter de tool, niet in het model.

De code en de commentaren zijn in het Engels. De teksten die het model leest (de prompts, de toolnamen en de data) zijn in het Nederlands, omdat de agent met Nederlandstalige klanten praat.

## Zelf proberen

- **Rem zonder prompt.** Haal in [scenarios.js](src/demo/scenarios.js) bij `c-rem` de `+ ESCALATION_RULE` weg, maar laat `refundNeedsApproval: true` staan. Het geld blijft tegengehouden, want de controle zit in het systeem. Doe je het omgekeerd (wel de regel in de prompt, maar `refundNeedsApproval: false`), dan hangt alles af van of het model zich eraan houdt.
- **Een beschrijving veranderen.** Zet in [tools.js](src/agent/tools.js) bij `klantgegevens_opzoeken` dat de tool alleen gebruikt mag worden na toestemming van de klant. Het model gaat zich anders gedragen, maar niets houdt het echt tegen. Een beschrijving is een verzoek, geen controle.
- **Een andere klant.** Verander de `question` in [scenarios.js](src/demo/scenarios.js) en kijk welke tools het model dan kiest.

## Opnemen en afspelen

Zet `:log` achter een commando om de run te bewaren in de map `logs/`:

```
npm run c:log
```

Afspelen gaat zonder internet en zonder API-sleutel:

```
npm run herspeel            de laatste opname
npm run herspeel c          de laatste opname van scenario c
npm run herspeel:snel c     zonder pauzes
```

## Een ander model of een andere provider

In `.env` kan je `MODEL=` invullen. Laat je het leeg, dan wordt `gemini-3.5-flash` gebruikt.

Zit je aan de dagelijkse limiet, zet dan `MODEL=gemini-3.5-flash-lite`. Dat model heeft een ruimere gratis limiet, maar denkt minder diep na en stopt in een agent-lus soms te vroeg met tools gebruiken. Daarom zet het project het denkniveau op medium, zoals Google aanraadt voor tool calls.

Heb je een Anthropic-sleutel, zet dan in `.env`:

```
PROVIDER=anthropic
ANTHROPIC_API_KEY=je-sleutel
```

Goede modellen zijn dan `claude-sonnet-5` (standaard) of het goedkopere `claude-haiku-4-5-20251001`.

## Over privacy

Op het gratis niveau van Gemini mag Google je prompts gebruiken om zijn modellen te verbeteren. Hier maakt dat niets uit, want Bliep en alle klanten zijn verzonnen. Zet in dit soort projecten nooit echte gegevens van klanten of studenten.

## Problemen oplossen

**`node` of `npm` wordt niet herkend**
Sluit de terminal en open hem opnieuw. Helpt dat niet, herstart je computer. Node wordt pas gevonden in terminals die na de installatie geopend zijn.

**Windows: "running scripts is disabled on this system"**
PowerShell blokkeert het npm-script. Typ `npm.cmd` in plaats van `npm`, bijvoorbeeld `npm.cmd run a`. Of los het één keer op met:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**"Geen GEMINI_API_KEY gevonden"**
Draai `npm run setup`.

**Fout 400 of 403**
De sleutel klopt niet. Kopieer hem opnieuw uit AI Studio en draai `npm run setup`.

**Fout 429**
Je hebt te veel aanvragen gedaan. Wacht een minuut, of gebruik `gemini-3.5-flash-lite` (zie hierboven).

**"Geen verbinding"**
Controleer je internet. In de les kan je een opname afspelen met `npm run herspeel`.

**Het model doet elke keer iets anders**
Dat is normaal. Taalmodellen zijn niet voorspelbaar, en dat is een van de belangrijkste dingen die deze demo laat zien.

## Voor de docent

- De tools en de data zijn dezelfde als op de kaarten van het rollenspel, dus studenten herkennen hun briefjes. De limiet van zes rondes komt overeen met de zes briefjes in het labo. De opmaak van de uitvoer volgt het schema van slide 8.
- Volgorde: `a`, dan `c`, dan `c-rem`. Doe `c` en `c-rem` direct na elkaar, zonder tussendoor uit te leggen. Het contrast spreekt voor zich.
- Bij `c-rem` is dit de zin om te zeggen: de prompt heeft geholpen, maar de weigering kwam uit de code.
- Neem de drie scenario's thuis op met `npm run a:log`, `npm run c:log` en `npm run c-rem:log`. Valt het netwerk in het lokaal weg, dan speel je ze af met `npm run herspeel <scenario>`. De opname zegt onderaan dat het een opname is.
- Scenario A duurt ongeveer tien seconden, `c-rem` ongeveer dertig.
