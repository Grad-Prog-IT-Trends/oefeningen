// Front-end van de Bliep-demo-app. Houdt het mandje bij en vraagt het totaal op aan de server.
const mandje = new Map(); // id -> aantal
let producten = [];

const euro = (bedrag) => new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(bedrag);

async function laadProducten() {
  producten = await (await fetch('/api/producten')).json();
  const lijst = document.getElementById('producten');
  lijst.innerHTML = '';
  for (const p of producten) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.naam}</strong><br>${euro(p.prijs)} ${p.raffle ? '<span class="label">raffle</span>' : ''}<br>`;
    const knop = document.createElement('button');
    knop.textContent = 'In mandje';
    knop.onclick = () => { mandje.set(p.id, (mandje.get(p.id) || 0) + 1); bereken(); };
    li.appendChild(knop);
    lijst.appendChild(li);
  }
}

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

async function bereken() {
  toonMandje();
  const code = document.getElementById('code').value.trim();
  const regels = [...mandje].map(([id, aantal]) => ({ id, aantal }));
  const antwoord = await fetch('/api/mandje/totaal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(code ? { regels, code } : { regels }),
  });
  const data = await antwoord.json();
  document.getElementById('melding').textContent = data.fout || data.kortingscodeFout || '';
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

document.getElementById('bereken').onclick = bereken;
document.getElementById('leeg').onclick = () => { mandje.clear(); bereken(); };
laadProducten().then(bereken);
