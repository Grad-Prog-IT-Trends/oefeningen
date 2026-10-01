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
 * find() loopt over de array en geeft het eerste element terug waarvoor de functie
 * true geeft. (p) => p.id === id is een arrow function: een korte schrijfwijze
 * voor function (p) { return p.id === id; }.
 * Vindt find() niets, dan geeft het undefined. Met || null maken we daar null van.
 *
 * @param {string} id  bijvoorbeeld 'fairphone-6'
 * @returns {object | null}  het product, of null als het niet bestaat
 */
function zoekProduct(id) {
  return producten.find((p) => p.id === id) || null;
}

// Deze functies kunnen andere bestanden gebruiken met
// import { alleProducten, zoekProduct } from './catalogus.js'.
export { alleProducten, zoekProduct };
