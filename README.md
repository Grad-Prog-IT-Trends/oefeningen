# IT Trends: oefeningen

Dit is de werkrepo voor het vak IT Trends aan UCLL. Elke les heeft hier een eigen **branch** met de code om mee te werken. Je clonet de repo één keer, en bij het begin van elke les wissel je naar de branch van die les.

Alles draait rond **Bliep**, een verzonnen webshop die smartphones verkoopt. De data, de klanten en de bestellingen zijn allemaal verzonnen.

## De lessen

| Les | Onderwerp | Branch | Wat je nodig hebt |
| --- | --- | --- | --- |
| 1 | Een AI-agent van dichtbij: wat een agent doet, en waarom de controle in de code hoort | [`les-01-agent`](../../tree/les-01-agent) | Node.js, gratis Gemini-sleutel |
| 2 | Werken met een AI-assistent in je editor, op de code van de Bliep-webshop | [`les-02-ai-assistent`](../../tree/les-02-ai-assistent) | Node.js, Git, VS Code, GitHub Copilot |

Elke branch heeft een eigen README met de stappen voor die les. Lees die voor je begint.

## Waarom een branch per les?

Op elke branch staat alleen de code van die les, rechtstreeks in de hoofdmap. Pas je in les 1 iets aan, en past de lector daarna les 2 aan, dan raken die twee elkaar niet. Je krijgt dus geen conflicten tussen je eigen werk en de nieuwe oefeningen.

Op `main` staat alleen deze README.

## Voor je naar de eerste les komt

Doe dit thuis. Alles is gratis, en je hebt het de rest van het semester nodig. Reken op een half uur. Vraag Copilot Student zo vroeg mogelijk aan, want de goedkeuring duurt een paar dagen.

### Software

- [ ] **Node.js**, versie 20 of hoger. Download de **LTS**-versie op [nodejs.org](https://nodejs.org). Controleer daarna met `node -v`.
- [ ] **Git**: [git-scm.com/downloads](https://git-scm.com/downloads). Controleer met `git --version`.
- [ ] **VS Code**: [code.visualstudio.com](https://code.visualstudio.com)

Gebruikt een les extra packages (zoals Express in les 2), dan doe je bij het begin van die les één keer `npm install` in de hoofdmap van de repo. De README van de les zegt het als het nodig is.

### Accounts

- [ ] **Een GitHub-account**: [github.com/signup](https://github.com/signup)
- [ ] **GitHub Copilot Free** geactiveerd. Je vindt de stappen in de [README van les 2](../../blob/les-02-ai-assistent/README.md#een-gratis-ai-assistent).
- [ ] **GitHub Copilot Student** aangevraagd met je UCLL-e-mailadres, ook als het nog niet goedgekeurd is.
- [ ] **Een Google-account**, voor een gratis API-sleutel van Gemini in [AI Studio](https://aistudio.google.com). Hoe je die instelt, staat in de [README van les 1](../../blob/les-01-agent/README.md#3-een-gratis-api-sleutel-halen).

Een kredietkaart heb je nergens voor nodig. Vraagt een dienst om te betalen, betaal dan niets en vraag het aan je lector.

## De repo ophalen

Dit doe je één keer. Open een terminal in de map waar je je schoolwerk bewaart.

Vertel git eerst wie je bent. Dat is nodig om je werk te kunnen bewaren:

```text
git config --global user.name "Voornaam Achternaam"
git config --global user.email "het-mailadres-van-je-github-account"
git config --global pull.rebase false
```

Heb je git al eerder gebruikt, dan heb je de eerste twee regels misschien al gedaan. De derde regel doe je sowieso.

Clone daarna de repo en open hem in VS Code:

```text
git clone https://github.com/Grad-Prog-IT-Trends/oefeningen.git it-trends
cd it-trends
code .
```

Een terminal open je in VS Code met *Terminal → New Terminal*. Die staat meteen in de juiste map.

## Bij het begin van elke les

**1. Bewaar je werk van de vorige les.** Zo neem je niets mee naar de nieuwe branch en ben je niets kwijt:

```text
git add -A
git commit -m "mijn werk"
```

Zegt git `nothing to commit`, dan had je niets aangepast. Dat is goed.

**2. Haal de nieuwe branches op en wissel naar de les:**

```text
git fetch
git switch les-02-ai-assistent
```

Vervang `les-02-ai-assistent` door de branch uit de tabel hierboven. Je kan ook wisselen via de naam van de branch links onderaan in VS Code.

**3. Open de README van de les** en volg de stappen. De commando's voer je uit in de hoofdmap van de repo.

### Terug naar een vorige les

Bewaar je werk (stap 1) en wissel terug, bijvoorbeeld met `git switch les-01-agent`. Je aanpassingen van toen staan er nog.

### De lector heeft een les aangepast

Zit je op de branch van die les, haal dan de nieuwe versie op:

```text
git pull
```

Je eigen bewaarde werk blijft staan. Heb je hetzelfde stuk code aangepast als de lector, dan vraagt git je om te kiezen. Lukt dat niet, vraag het in de les.

## Je sleutels en je gegevens

- Een API-sleutel is een wachtwoord. Deel hem niet en zet hem niet online. Sleutels staan in een bestand `.env`, en dat bestand staat in `.gitignore` zodat het nooit in git terechtkomt, ook niet bij `git add -A`.
- Gratis versies van AI-diensten mogen je invoer soms gebruiken om hun modellen te verbeteren. Werk daarom alleen met de verzonnen data van Bliep, nooit met echte gegevens van klanten, studenten of jezelf.

## Problemen oplossen

**`node`, `npm` of `git` wordt niet herkend**
Sluit de terminal en open hem opnieuw. Helpt dat niet, herstart je computer. Een programma wordt pas gevonden in terminals die na de installatie geopend zijn.

**Windows: "running scripts is disabled on this system"**
PowerShell blokkeert het npm-script. Typ `npm.cmd` in plaats van `npm`, of los het één keer op met:

```text
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**`git switch` zegt "invalid reference"**
De branch is nog niet binnengehaald. Doe eerst `git fetch`. Controleer ook of je de naam juist typt.

**`git switch` zegt "Your local changes would be overwritten"**
Je hebt nog werk dat niet bewaard is. Doe eerst stap 1 van [Bij het begin van elke les](#bij-het-begin-van-elke-les).

**`git commit` zegt "Please tell me who you are"**
Je hebt de `git config`-commando's uit [De repo ophalen](#de-repo-ophalen) nog niet gedaan.

**`git pull` zegt "Need to specify how to reconcile divergent branches"**
Doe één keer `git config --global pull.rebase false` en probeer opnieuw.

Problemen die bij één les horen, staan in de README van die les.

<!--
Voor de lector

Een nieuwe les toevoegen:
1. Maak een branch `les-NN-onderwerp`. Bouwt de les verder op een vorige, vertrek dan van die branch
   (bv. `git switch -c les-03-privacy les-02-ai-assistent`), anders van `main`.
2. Zet de code in de hoofdmap en vervang README.md door die van de les. Laat bovenaan de verwijzing naar main staan.
3. Voeg op main een rij toe aan de tabel "De lessen".
4. Nieuwe software of een nieuw account nodig? Zet het bij "Voor je naar de eerste les komt".

Een les aanpassen:
- Werk met gewone commits op de branch van de les. Nooit force-pushen of de geschiedenis herschrijven,
  anders krijgen studenten wel conflicten bij `git pull`.

Lectormateriaal en oplossingen horen niet in deze repo, ook niet op een aparte branch: een AI-assistent
in agent-mode leest alles wat in de map staat, en studenten kunnen elke branch ophalen.
Het lectormateriaal staat in de private repo Grad-Prog-IT-Trends/oefeningen-lectoren, met een map per les
(bv. les-02-ai-assistent/). Clone die naast deze repo, niet erin.
-->
