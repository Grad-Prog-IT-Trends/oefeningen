// Leest de producten van Bliep in. In het echt komt dit uit een database,
// voor de demo-app is een JSON-bestand genoeg.
const producten = require('../data/producten.json');

function alleProducten() {
  return producten;
}

function zoekProduct(id) {
  return producten.find((p) => p.id === id) || null;
}

module.exports = { alleProducten, zoekProduct };
