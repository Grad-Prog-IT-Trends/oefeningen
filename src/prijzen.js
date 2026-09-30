// Alles wat met het bedrag van een mandje te maken heeft.
// Bedragen zijn in euro, altijd inclusief btw.

const VERZENDKOSTEN = 4.95;
const GRATIS_VERZENDING_VANAF = 50;

// Rondt een bedrag af op twee cijfers na de komma.
function rondAf(bedrag) {
  return Math.round(bedrag * 100) / 100;
}

function regelBedrag(product, aantal) {
  return rondAf(product.prijs * aantal);
}

// Bundelactie: koop je twee of meer van hetzelfde accessoire,
// dan krijg je het tweede stuk aan halve prijs (een keer per product).
function bundelKorting(product, aantal) {
  if (product.categorie !== 'accessoire' || aantal < 2) {
    return 0;
  }
  return rondAf(product.prijs / 2);
}

function verzendkosten(bedrag) {
  if (bedrag === 0 || bedrag >= GRATIS_VERZENDING_VANAF) {
    return 0;
  }
  return VERZENDKOSTEN;
}

// Berekent het volledige overzicht van een mandje.
// Een regel is { id, aantal }. zoekProduct geeft bij een id het product terug.
function berekenTotaal(regels, zoekProduct) {
  let subtotaal = 0;
  let bundel = 0;

  for (const regel of regels) {
    const product = zoekProduct(regel.id);
    if (!product) {
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

  return {
    subtotaal,
    bundelkorting: bundel,
    verzendkosten: verzending,
    totaal: rondAf(naKorting + verzending),
  };
}

module.exports = { rondAf, regelBedrag, bundelKorting, verzendkosten, berekenTotaal };
