// De logica achter de twee tools: voorraad opzoeken en leveringen opzoeken.
//
// Dit bestand weet niets van MCP. Het zijn gewone functies die tekst teruggeven,
// of een fout gooien als de vraag niet klopt. server.js maakt er MCP-tools van.
// Zo kan je de logica apart testen (zie test/voorraad.test.js), en zie je goed
// welk deel MCP is en welk deel gewoon jouw code.

// De voorraad per winkel en de geplande leveringen. Verzonnen data, zoals alles bij Bliep.
// with { type: 'json' } zegt Node dat het om JSON gaat en niet om JavaScript.
import data from '../data/voorraad.json' with { type: 'json' };
// De productnamen halen we uit de catalogus van de webshop, in de map ernaast.
// Zo heten de producten in de demo exact zoals in de webshop.
import producten from '../../webshop/data/producten.json' with { type: 'json' };

// Object.keys() geeft de namen van de velden: ['Antwerpen', 'Gent', 'Webshop'].
const WINKELS = Object.keys(data.voorraad);

/**
 * Geeft de naam van een product, bv. 'pixel-11-pro' wordt 'Pixel 11 Pro 256 GB'.
 *
 * @param {string} id
 * @returns {string}  de naam, of het id zelf als het product niet in de catalogus staat
 */
function naamVan(id) {
  const product = producten.find((p) => p.id === id);
  return product ? product.naam : id;
}

/**
 * Zoekt een winkel op, zonder te letten op hoofdletters of spaties.
 *
 * @param {string} naam  bv. 'gent' of ' Gent '
 * @returns {string}     de juiste schrijfwijze, bv. 'Gent'
 * @throws {Error} als de winkel niet bestaat
 */
function vindWinkel(naam) {
  const gezocht = String(naam ?? '').trim().toLowerCase();
  const winkel = WINKELS.find((w) => w.toLowerCase() === gezocht);
  if (!winkel) {
    throw new Error(`Onbekende winkel "${naam}". Kies uit: ${WINKELS.join(', ')}.`);
  }
  return winkel;
}

/**
 * Hoeveel stuks van een product liggen er nu in een winkel?
 *
 * Je mag een deel van de naam geven: 'pixel' vindt 'Pixel 11 Pro 256 GB'.
 * Passen er meerdere producten, dan krijg je ze allemaal, elk op een eigen regel.
 *
 * @param {{ product: string, winkel: string }} vraag  bv. { product: 'Pixel', winkel: 'Gent' }
 * @returns {string}  bv. 'Pixel 11 Pro 256 GB in Gent: 4 stuks'
 * @throws {Error} als de winkel niet bestaat of er geen product past
 */
function voorraadOpvragen({ product, winkel }) {
  const w = vindWinkel(winkel);
  const gezocht = String(product ?? '').trim().toLowerCase();
  // Object.entries() geeft paren [id, aantal]. We houden de paren waarvan de naam past.
  const treffers = Object.entries(data.voorraad[w])
    .filter(([id]) => gezocht !== '' && naamVan(id).toLowerCase().includes(gezocht));
  if (treffers.length === 0) {
    throw new Error(`Geen product gevonden voor "${product}" in ${w}.`);
  }
  return treffers.map(([id, aantal]) => `${naamVan(id)} in ${w}: ${aantal} stuks`).join('\n');
}

/**
 * Welke leveringen komen er deze week in een winkel?
 *
 * @param {{ winkel: string }} vraag  bv. { winkel: 'Gent' }
 * @returns {string}  één regel per levering, bv. '12 × Pixel 11 Pro 256 GB, vrijdag'
 * @throws {Error} als de winkel niet bestaat
 */
function leveringenOpvragen({ winkel }) {
  const w = vindWinkel(winkel);
  const lijst = data.leveringen[w];
  if (lijst.length === 0) {
    return `Geen leveringen gepland voor ${w} deze week.`;
  }
  return lijst.map((l) => `${l.aantal} × ${naamVan(l.product)}, ${l.dag}`).join('\n');
}

export { WINKELS, vindWinkel, voorraadOpvragen, leveringenOpvragen };
