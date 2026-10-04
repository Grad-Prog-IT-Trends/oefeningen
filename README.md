# Les 4: Infrastructure as Code en GitOps

> Les 4 van IT Trends. Voorbereiding en uitleg over de branches: zie de [README op `main`](../../tree/main).

Vandaag beschrijf je de volledige omgeving van Bliep als code, breek je ze af en bouw je ze in één commando weer op. Daarna rol je een wijziging uit zonder ooit zelf aan de server te komen: alleen via een pull request.

Alle commando's voer je uit **in de hoofdmap van de repo**, niet in `webshop/`.

## Voor je naar de les komt

Doe dit thuis. Op het schoolnetwerk met twintig mensen tegelijk duurt het downloaden van images lang.

- [ ] **Docker Desktop** geïnstalleerd en gestart: <https://www.docker.com/products/docker-desktop/>. Je kent het uit IT Landscape. Controleer met `docker compose version`.
- [ ] **De images alvast binnengehaald.** Eén keer, met Docker Desktop gestart:

```text
docker pull node:22-alpine
docker pull postgres:17-alpine
docker pull caddy:2-alpine
```

- [ ] **Je GitHub-account** werkt, en je kan inloggen in VS Code (je deed dat in les 2 voor Copilot).

## Wat zit waar

```text
compose.yaml                   de omgeving van Bliep, als code (labo deel 1: hier vul je aan)
config/bliep.env               banner, dropmodus en omgeving (labo deel 2: dit wijzig je via een pull request)
db/init.sql                    maakt de tabel voor de raffle, de eerste keer dat de database start
proxy/Caddyfile                de instellingen van de reverse proxy
webshop/                       de webshop uit les 2, nu met een Dockerfile, een banner en een raffle
gitops/sync.js                 de GitOps-agent: houdt "de server" gelijk aan main
gitops/controleer-config.js    de controle op config/bliep.env, die de GitHub Action gebruikt
.github/workflows/controle.yml de GitHub Action die elke pull request controleert
```

## Deel 1: van klik naar code

De stappen staan op je labofiche. Kort:

```text
docker compose up -d --build     opstarten (of bijwerken na een wijziging)
docker compose ps                wat draait er, en is het gezond?
docker compose logs web          de logs van één service
docker compose down              afbreken, de gegevens blijven
docker compose down -v           afbreken, de gegevens zijn ook weg
```

Is alles klaar, dan surf je naar <http://localhost:8080>.

## Deel 2: deployen via een pull request

Je laptop speelt twee rollen: je werkplek, en "de server" (de map `server/`, die maakt de agent zelf aan). De stappen staan op je labofiche. Kort:

1. Maak op GitHub een lege, **publieke** repo `bliep-gitops`, zonder README.
2. Zet je werk erop, vanuit de terminal van VS Code:

```text
git add -A
git commit -m "les 4: compose-file volledig"
git remote add mijn https://github.com/<jouw-gebruikersnaam>/bliep-gitops.git
git push -u mijn les-04-iac-gitops:main
```

3. Stop je stack van deel 1 (`docker compose down`) en start de agent in een tweede terminal:

```text
node gitops/sync.js
```

4. Wijzig `config/bliep.env` op een eigen branch, open een pull request op GitHub, wacht op het groene vinkje en merge. Binnen vijftien seconden volgt de server.

## Problemen oplossen

**`docker` wordt niet herkend, of `Cannot connect to the Docker daemon`**
Docker Desktop draait niet. Start het en wacht tot het walvisje stilstaat.

**`port is already allocated` bij poort 8080**
Er draait nog iets anders op 8080, vaak je stack van deel 1. Doe `docker compose down` in de hoofdmap en probeer opnieuw.

**`yaml: line 42: did not find expected key`**
Een fout in het inspringen. YAML werkt met spaties, twee per niveau, nooit met tabs. Vergelijk je regel met dezelfde regel bij `web`.

**`dependency failed to start: container bliep-db-1 is unhealthy`**
Kijk in `docker compose logs db`. Meestal klopt het wachtwoord of de gebruikersnaam niet met wat in `DATABASE_URL` van `web` staat.

**De raffle toont nog drie inschrijvingen, ook al wijzigde je `db/init.sql`**
Dat script draait alleen als de database leeg is. Je volume bestaat nog. `docker compose down -v` en opnieuw `up`.

**`git push` vraagt een wachtwoord**
Je wachtwoord van GitHub werkt daar niet. Doe de push vanuit de terminal van **VS Code**: die laat je inloggen via de browser.

**De agent zegt `Ik vind geen remote met de naam "mijn"`**
Stap 2 van deel 2 is niet gelukt, of je gaf de remote een andere naam. Start de agent met `node gitops/sync.js --repo https://github.com/<jij>/bliep-gitops.git`.
