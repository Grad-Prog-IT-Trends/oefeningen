# De webshop van Bliep

De webshop van Bliep, in een kleine demo-versie. Dit is de code waarmee je in de oefeningen werkt. In les 4 draait hij in een container: zie de README in de hoofdmap.

Alle commando's hieronder voer je uit **in deze map**. Vanuit de hoofdmap van de repo ga je er zo naartoe:

```text
cd webshop
```

## Opstarten

De webserver gebruikt [Express](https://expressjs.com/). Installeer dat één keer:

```text
npm install
```

Daarna start je de app met:

```text
npm start
```

Surf naar <http://localhost:3000>. Stopt de server niet vanzelf na een wijziging? Stop hem met Ctrl+C en start opnieuw.

## Tests

```text
npm test
```

Alle tests moeten groen zijn voor je iets oplevert.

## Wat zit waar

```text
data/producten.json      de producten van Bliep
data/kortingscodes.json  de kortingscodes die bestaan
src/catalogus.js         producten opzoeken
src/prijzen.js           alles wat met het bedrag van een mandje te maken heeft
src/raffle.js            de raffle, in een PostgreSQL-database (les 4)
src/server.js            de webserver en de API (Express)
public/                  de webpagina (HTML, CSS en JavaScript)
test/                    de tests
```

De code gebruikt ES-modules: je laadt een ander bestand met `import` en stelt functies open met `export`. Uitleg staat in de commentaren bovenaan de bestanden.

## API

| Methode | Pad | Wat |
| --- | --- | --- |
| GET | /health | geeft `{ "status": "ok" }` als de app draait |
| GET | /api/producten | alle producten |
| POST | /api/mandje/totaal | berekent het mandje, body `{ "regels": [{ "id": "...", "aantal": 1 }], "code": "..." }` |
| GET | /api/config | banner, dropmodus, omgeving en versie, uit de omgevingsvariabelen (les 4) |
| GET | /api/raffle | aantal inschrijvingen voor de raffle, 503 zonder database (les 4) |
| POST | /api/raffle | inschrijven, body `{ "email": "..." }` (les 4) |
