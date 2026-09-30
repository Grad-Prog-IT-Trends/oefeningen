# Bliep-demo-app

> Les 2 van IT Trends. Voorbereiding en uitleg over de branches: zie de [README op `main`](../../tree/main).

De webshop van Bliep, in een kleine demo-versie. Je gebruikt hem in verschillende lessen van IT Trends.

## Voor je naar de les komt

Loop deze lijst thuis af. Alles is gratis.

- [ ] **Node.js**, versie 20 of hoger: https://nodejs.org/ (kies de LTS-versie). Controleer met `node --version`.
- [ ] **Git**, om de repo te clonen: https://git-scm.com/downloads
- [ ] **VS Code**: https://code.visualstudio.com/
- [ ] **Een GitHub-account**: https://github.com/signup
- [ ] **GitHub Copilot Free** geactiveerd (zie hieronder)
- [ ] **Copilot Student aangevraagd**, ook al is het nog niet goedgekeurd (zie hieronder)

## Opstarten

De webserver gebruikt [Express](https://expressjs.com/). Installeer dat één keer, in de hoofdmap van de repo:

```
npm install
```

Daarna start je de app met:

```
npm start
```

Surf naar http://localhost:3000. Stopt de server niet vanzelf na een wijziging? Stop hem met Ctrl+C en start opnieuw.

## Tests

```
npm test
```

Alle tests moeten groen zijn voor je iets oplevert.

## Wat zit waar

```
data/producten.json      de producten van Bliep
data/kortingscodes.json  de kortingscodes die bestaan
src/catalogus.js         producten opzoeken
src/prijzen.js           alles wat met het bedrag van een mandje te maken heeft
src/server.js            de webserver en de API (Express)
public/                  de webpagina (HTML, CSS en JavaScript)
test/                    de tests
```

## API

| Methode | Pad | Wat |
|---|---|---|
| GET | /health | geeft `{ "status": "ok" }` als de app draait |
| GET | /api/producten | alle producten |
| POST | /api/mandje/totaal | berekent het mandje, body `{ "regels": [{ "id": "...", "aantal": 1 }], "code": "..." }` |

## Een gratis AI-assistent

Voor het labo heb je geen betalende licentie nodig.

### 1. GitHub Copilot Free (de standaard)

Werkt meteen, zonder verificatie.

1. Log in op GitHub en activeer het gratis plan: https://github.com/github-copilot/free_signup
   Je kan je plan ook nakijken via https://github.com/settings/copilot
2. Installeer de extensie **GitHub Copilot** in VS Code en log in met je GitHub-account.
   Handleiding: https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/set-up-copilot/install-copilot-extension

Je krijgt elke maand een beperkt aantal chat- en agent-verzoeken. Je deelt die tussen het labo en de opdracht thuis, dus ga er zuinig mee om.

### 2. GitHub Copilot Student (meer, ook gratis)

1. Vraag GitHub Education aan met je UCLL-e-mailadres: https://github.com/settings/education/benefits
   Uitleg over de aanvraag: https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student
2. Na goedkeuring activeer je Copilot Student op dezelfde pagina.
   Uitleg: https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students

De goedkeuring en de activatie kunnen samen enkele dagen duren. Zie je na je goedkeuring alleen betalende opties? Betaal niets, wacht een paar dagen en probeer opnieuw.

### 3. Plan B: Gemini Code Assist

Geen GitHub-account, of zijn je verzoeken op? Gemini Code Assist heeft een gratis versie voor individuele gebruikers. Je hebt een Google-account nodig.

- Installeer de extensie **Gemini Code Assist** in VS Code en log in met je Google-account.
- Handleiding: https://developers.google.com/gemini-code-assist/docs/set-up-gemini

Lukt geen van drie? Dan werk je in het labo met de gratis webversie van een chatbot en plak je de code zelf over. Dat mag, zeg het wel aan je lector.

### Let op met je gegevens

Werk alleen met de demo-app, nooit met echte klantgegevens of wachtwoorden. Gratis versies mogen je invoer soms gebruiken om hun modellen te verbeteren. Daar komen we in les 3 op terug.
