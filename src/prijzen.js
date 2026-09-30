// Alles wat met het bedrag van een mandje te maken heeft.
// Bedragen zijn in euro, altijd inclusief btw.
//
// Dit bestand is een "module": een los JavaScript-bestand met functies.
// Onderaan staat module.exports. Alleen wat daar staat, kunnen andere
// bestanden gebruiken via require('./prijzen').
//
// Boven elke functie staat een commentaar in de vorm /** ... */ (JSDoc).
// VS Code toont die uitleg als je met je muis over de naam van de functie gaat.
// @param beschrijft wat je meegeeft, @returns wat je terugkrijgt.

// Constanten schrijven we in HOOFDLETTERS. Met const kan je de waarde
// daarna niet meer aanpassen.
const VERZENDKOSTEN = 4.95;
const GRATIS_VERZENDING_VANAF = 50;

/**
 * Rondt een bedrag af op twee cijfers na de komma, dus op hele centen.
 *
 * @param {number} bedrag  bijvoorbeeld 12.3456
 * @returns {number}       bijvoorbeeld 12.35
 */
function rondAf(bedrag) {
  return Math.round(bedrag * 100) / 100;
}

/**
 * Het bedrag van één regel in het mandje: prijs van het product maal het aantal.
 *
 * @param {{ prijs: number }} product  een product uit de catalogus
 * @param {number} aantal              hoeveel stuks de klant koopt
 * @returns {number}                   het afgeronde bedrag van de regel
 */
function regelBedrag(product, aantal) {
  return rondAf(product.prijs * aantal);
}

/**
 * Bundelactie: koop je twee of meer van hetzelfde accessoire,
 * dan krijg je het tweede stuk aan halve prijs (een keer per product).
 *
 * @param {{ prijs: number, categorie: string }} product  een product uit de catalogus
 * @param {number} aantal                                 hoeveel stuks de klant koopt
 * @returns {number}  het bedrag van de korting, of 0 als er geen korting is
 */
function bundelKorting(product, aantal) {
  // !== betekent "is niet gelijk aan". || betekent "of".
  if (product.categorie !== 'accessoire' || aantal < 2) {
    return 0;
  }
  return rondAf(product.prijs / 2);
}

/**
 * De verzendkosten voor een mandje.
 * Een leeg mandje (bedrag 0) en een mandje vanaf 50 euro verzenden we gratis.
 *
 * @param {number} bedrag  het bedrag van het mandje, na de bundelkorting
 * @returns {number}       0 of 4.95
 */
function verzendkosten(bedrag) {
  // === betekent "is exact gelijk aan". Gebruik in JavaScript altijd ===
  // en niet ==, want == doet soms verrassende omzettingen.
  if (bedrag === 0 || bedrag >= GRATIS_VERZENDING_VANAF) {
    return 0;
  }
  return VERZENDKOSTEN;
}

/**
 * Berekent het volledige overzicht van een mandje.
 *
 * zoekProduct is een functie die je als parameter meegeeft. In de echte app is
 * dat de functie uit catalogus.js, in de tests een kleine nepcatalogus. Zo kan
 * je de berekening testen zonder de echte producten te gebruiken.
 *
 * @param {{ id: string, aantal: number }[]} regels  de regels van het mandje,
 *   bijvoorbeeld [{ id: 'fairphone-6', aantal: 1 }]
 * @param {(id: string) => object | null} zoekProduct  geeft bij een id het product
 *   terug, of null als het product niet bestaat
 * @returns {{ subtotaal: number, bundelkorting: number, verzendkosten: number, totaal: number }}
 * @throws {Error} als een product niet bestaat of een aantal ongeldig is
 */
function berekenTotaal(regels, zoekProduct) {
  // let in plaats van const, omdat we deze waarden in de lus aanpassen.
  let subtotaal = 0;
  let bundel = 0;

  // for...of loopt over elk element van een array (lijst).
  for (const regel of regels) {
    const product = zoekProduct(regel.id);
    if (!product) {
      // throw stopt de functie meteen met een fout. Wie de functie aanroept,
      // kan die fout opvangen (zie de foutafhandeling onderaan server.js).
      // De backticks `...` maken een template string: ${...} vult een waarde in.
      throw new Error(`Onbekend product: ${regel.id}`);
    }
    if (!Number.isInteger(regel.aantal) || regel.aantal < 1) {
      throw new Error(`Ongeldig aantal voor ${regel.id}`);
    }
    subtotaal += regelBedrag(product, regel.aantal);
    bundel += bundelKorting(product, regel.aantal);
  }

  subtotaal = rondAf(subtotaal);
  bundel = rondAf(bundel);
  const naKorting = rondAf(subtotaal - bundel);
  const verzending = verzendkosten(naKorting);

  // We geven een object terug. De server stuurt dit object als JSON naar de browser.
  // "bundelkorting: bundel" betekent: de sleutel heet bundelkorting, de waarde is
  // de variabele bundel. Bij "subtotaal," zijn sleutel en variabele gelijk,
  // dan mag je de naam één keer schrijven.
  return {
    subtotaal,
    bundelkorting: bundel,
    verzendkosten: verzending,
    totaal: rondAf(naKorting + verzending),
  };
}

// Deze functies stellen we open voor andere bestanden (de server en de tests).
module.exports = { rondAf, regelBedrag, bundelKorting, verzendkosten, berekenTotaal };
