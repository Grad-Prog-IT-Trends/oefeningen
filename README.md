# Les 5: DevSecOps en AIOps

> Les 5 van IT Trends. Voorbereiding en uitleg over de branches: zie de [README op `main`](../../tree/main).

Vandaag maak je de pipeline van Bliep streng. Drie scanners zoeken naar een gelekte sleutel, kwetsbare packages en een gevaarlijk stuk code. Jij laat ze rood kleuren, leest wat ze vonden, beslist wat echt dringend is, en maakt ze groen door de problemen op te lossen.

Alle commando's voer je uit **in de hoofdmap van de repo**, tenzij er `cd webshop` bij staat.

## Voor je naar de les komt

Doe dit thuis. Op het schoolnetwerk met twintig mensen tegelijk duurt het downloaden lang. De scanner `semgrep` is een groot image.

- [ ] **Docker Desktop** gestart, zoals in les 4.
- [ ] **De scanners alvast binnengehaald.** Eén keer, met Docker Desktop gestart:

```text
docker pull zricethezav/gitleaks:v8.28.0
docker pull semgrep/semgrep:1.180.0
docker pull node:22-alpine
```

- [ ] **Node.js 22.18 of hoger** werkt nog: `node -v`. Je kent het uit les 2.

## Wat zit waar

```text
scan.yaml                      de drie scans, als code (net als compose.yaml in les 4)
beveiliging/gitleaks.toml      de regels voor de scan op geheimen
beveiliging/semgrep.yml        de regel voor de scan op code: lees hem, het is er maar één
.github/workflows/beveiliging.yml   dezelfde scans in de pipeline op GitHub
.env.example                   voorbeeld voor je eigen .env, waar geheimen wel mogen staan
compose.yaml                   de Bliep-omgeving uit les 4, volledig ingevuld
webshop/                       de webshop, nu met een drop-melding, een statusknop voor de raffle en drie nieuwe packages
```

## De scans

```text
docker compose -f scan.yaml run --rm geheimen
docker compose -f scan.yaml run --rm afhankelijkheden
docker compose -f scan.yaml run --rm code
```

Een scan die iets vindt, eindigt met een foutcode. In de pipeline is dat rood. De stappen staan op je labofiche.

## De webshop starten

Wil je zelf zien wat een SQL-injectie doet? Start de omgeving zoals in les 4:

```text
docker compose up -d --build
```

Surf naar <http://localhost:8080>. De logs volg je met `docker compose logs -f web`.

## Problemen oplossen

**`docker` wordt niet herkend, of `Cannot connect to the Docker daemon`**
Docker Desktop draait niet. Start het en wacht tot het walvisje stilstaat.

**`no configuration file provided: not found`**
Je staat in de verkeerde map. Ga naar de hoofdmap van de repo, waar `scan.yaml` staat.

**De scan `code` blijft lang hangen bij `Pulling`**
Het image van semgrep is groot en werd niet thuis binnengehaald. Wacht, of werk intussen verder met de andere twee scans.

**`npm audit` zegt `audit endpoint returned an error` of `ENOTFOUND`**
De scan heeft internet nodig: hij vraagt de databank met lekken op bij npm. Controleer je verbinding, of probeer je hotspot.

**Na `npm audit fix` is de scan `afhankelijkheden` nog altijd rood**
Je deed `npm audit fix` in de hoofdmap in plaats van in `webshop/`. Kijk of `webshop/package-lock.json` gewijzigd is met `git status`.

**De scan `geheimen` blijft rood, ook al haalde je de sleutel weg**
Lees de regel `File:` in de uitvoer. Staat de sleutel nog ergens anders, bv. in commentaar of in `config/bliep.env`?
