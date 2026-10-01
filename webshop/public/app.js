// Front-end van de Bliep-demo-app. Houdt het mandje bij en vraagt het totaal op aan de server.
//
// Let op: deze code draait in de browser, niet in Node. Je hebt hier document,
// waarmee je de HTML-pagina (index.html) kan lezen en aanpassen. De berekening zelf
// gebeurt op de server: de browser stuurt het mandje op en toont wat de server terugstuurt.
//
// index.html laadt dit bestand met <script type="module">. Zo kan je hier, net als
// in Node, met import een ander bestand uit public/ gebruiken, bv.
// import { iets } from './ander-bestand.js'.

// Een Map is een lijst van sleutel-waardeparen, hier: product-id -> aantal.
const mandje = new Map(); // id -> aantal
let producten = [];

/**
 * Toont een bedrag als euro op de Belgische manier, bv. 24.99 wordt "€ 24,99".
 *
 * @param {number} bedrag
 * @returns {string}
 */
const euro = (bedrag) => new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(bedrag);

/**
 * Haalt de producten op bij de server (GET /api/producten) en toont ze met een knop
 * "In mandje" per product.
 */
async function laadProducten() {
  // Twee keer await: eerst wachten op het antwoord, dan op het omzetten van de JSON.
  producten = await (await fetch('/api/producten')).json();
  const lijst = document.getElementById('producten');
  lijst.innerHTML = '';
  for (const p of producten) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.naam}</strong><br>${euro(p.prijs)} ${p.raffle ? '<span class="label">raffle</span>' : ''}<br>`;
    const knop = document.createElement('button');
    knop.textContent = 'In mandje';
    // Bij een klik: het aantal van dit product met 1 verhogen en opnieuw berekenen.
    knop.onclick = () => { mandje.set(p.id, (mandje.get(p.id) || 0) + 1); bereken(); };
    li.appendChild(knop);
    lijst.appendChild(li);
  }
}

/**
 * Toont de inhoud van het mandje, bv. "2 × Siliconen hoesje".
 */
function toonMandje() {
  const lijst = document.getElementById('mandje');
  lijst.innerHTML = '';
  for (const [id, aantal] of mandje) {
    const p = producten.find((x) => x.id === id);
    const li = document.createElement('li');
    li.textContent = `${aantal} × ${p.naam}`;
    lijst.appendChild(li);
  }
}

/**
 * Stuurt het mandje (en de kortingscode, als die ingevuld is) naar de server
 * (POST /api/mandje/totaal) en toont het overzicht dat terugkomt.
 */
async function bereken() {
  toonMandje();
  const code = document.getElementById('code').value.trim();
  // Van de Map maken we een array van regels: [{ id: 'fairphone-6', aantal: 1 }, ...]
  const regels = [...mandje].map(([id, aantal]) => ({ id, aantal }));
  const antwoord = await fetch('/api/mandje/totaal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(code ? { regels, code } : { regels }),
  });
  const data = await antwoord.json();
  document.getElementById('melding').textContent = data.fout || data.kortingscodeFout || '';
  // Elke rij is [label, bedrag]. Rijen zonder bedrag (null of undefined) laten we weg.
  const rijen = [
    ['Subtotaal', data.subtotaal],
    ['Bundelkorting', data.bundelkorting ? -data.bundelkorting : null],
    ['Kortingscode', data.kortingscode ? -data.kortingscode : null],
    ['Verzendkosten', data.verzendkosten],
  ].filter(([, bedrag]) => bedrag !== null && bedrag !== undefined);
  document.getElementById('overzicht').innerHTML =
    rijen.map(([label, bedrag]) => `<tr><td>${label}</td><td>${euro(bedrag)}</td></tr>`).join('') +
    (data.totaal !== undefined ? `<tr class="totaal"><td>Totaal</td><td>${euro(data.totaal)}</td></tr>` : '');
}

// De knoppen koppelen aan hun functie, en bij het laden van de pagina
// eerst de producten ophalen en daarna een (leeg) overzicht tonen.
document.getElementById('bereken').onclick = bereken;
document.getElementById('leeg').onclick = () => { mandje.clear(); bereken(); };
laadProducten().then(bereken);
