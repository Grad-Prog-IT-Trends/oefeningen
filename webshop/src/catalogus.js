// Leest de producten van Bliep in. In het echt komt dit uit een database,
// voor de demo-app is een JSON-bestand genoeg.
//
// import laadt een ander bestand in. Bij een .json-bestand zet Node de inhoud
// meteen om naar gewone JavaScript-objecten, hier een array van producten.
// with { type: 'json' } zegt Node dat het om JSON gaat en niet om JavaScript.
// Het pad begint met ../ omdat data/ een map hoger staat dan src/.
// Node leest het bestand één keer in, bij het opstarten. Pas je producten.json
// aan, herstart dan de server.
import producten from '../data/producten.json' with { type: 'json' };
// lodash is een verzameling hulpfuncties. Hier gebruiken we er één van: _.find().
import _ from 'lodash';

/**
 * Geeft alle producten van Bliep terug.
 *
 * @returns {{ id: string, naam: string, categorie: string, prijs: number, raffle: boolean }[]}
 */
function alleProducten() {
  return producten;
}

/**
 * Zoekt één product op aan de hand van zijn id.
 *
 * _.find(lijst, { id }) geeft het eerste element terug met dezelfde id.
 * Vindt het niets, dan geeft het undefined. Met || null maken we daar null van.
 * (Ja, producten.find() uit gewoon JavaScript kan dit ook. Onthoud die gedachte
 * voor de bespreking in les 5.)
 *
 * @param {string} id  bijvoorbeeld 'fairphone-6'
 * @returns {object | null}  het product, of null als het niet bestaat
 */
function zoekProduct(id) {
  return _.find(producten, { id }) || null;
}

// Deze functies kunnen andere bestanden gebruiken met
// import { alleProducten, zoekProduct } from './catalogus.js'.
export { alleProducten, zoekProduct };
