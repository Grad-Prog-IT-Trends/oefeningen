# Les 5: DevSecOps en AIOps

> Les 5 van IT Trends. Voorbereiding en uitleg over de branches: zie de [README op `main`](../../tree/main).

Vandaag leer je een scanrapport lezen en beslissen wat eerst moet. Daarna los je zelf twee dingen op: de kwetsbare packages en een SQL-injectie. De stappen staan op je labofiche.

## Voor je naar de les komt

Je installeert niets nieuws. Je hebt nodig wat je in les 4 al had:

- [ ] **Docker Desktop** gestart, met de images van les 4. Controleer met `docker compose version`.
- [ ] **Node.js 22.18 of hoger**: `node -v`.

## Wat je vandaag doet

**1. De packages.** In de map `webshop`:

```text
cd webshop
npm audit          toont welke packages een bekend lek hebben
npm audit fix      werkt ze bij, zonder iets te breken
npm audit          nog eens: wat blijft er over?
```

**2. De query.** In `webshop/src/raffle.js`, functie `zoekInschrijving`: geef het e-mailadres mee als parameter (`$1`) in plaats van het in de query te plakken.

**3. Controleren.** Terug in de hoofdmap:

```text
cd ..
docker compose up -d --build
```

Surf naar <http://localhost:8080/api/raffle/status?email=' OR '1'='1>. Na je fix krijg je een lege lijst.

## Wat zit waar

```text
webshop/                       de webshop, nu met een drop-melding, een statusknop voor de raffle en drie nieuwe packages
compose.yaml                   de Bliep-omgeving uit les 4, volledig ingevuld
.env.example                   voorbeeld voor je eigen .env, waar een geheim wel mag staan (bonus)
.github/workflows/beveiliging.yml   de pipeline die je lector in de demo toont
scan.yaml, beveiliging/        de scans die in die pipeline draaien (geen leerstof, wel leuk om te lezen)
```

## Problemen oplossen

**`npm audit` zegt `ENOENT` of `no package.json`**
Je staat in de hoofdmap. Ga eerst naar de webshop met `cd webshop`.

**`audit endpoint returned an error` of `ENOTFOUND`**
npm audit heeft internet nodig: hij vraagt de lijst met lekken op. Controleer je verbinding, of gebruik je hotspot.

**npm zegt dat uuid `--force` nodig heeft**
Klopt, en dat doe je niet. Dat is een upgrade naar een nieuwe hoofdversie, en die kan je code breken.

**De aanval toont nog altijd alle e-mailadressen**
Je bouwde niet opnieuw. Doe `docker compose up -d --build` in de hoofdmap.

**`no configuration file provided: not found`**
Je staat in `webshop/`. Ga terug met `cd ..`.
