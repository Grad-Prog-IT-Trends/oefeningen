# De webshop van Bliep

De webshop van Bliep, in een kleine demo-versie. Dit is de code waarmee je in de oefeningen van les 2 werkt.

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
