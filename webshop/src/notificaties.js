// Drop-meldingen: als een drop start, krijgt elke klant met de app een pushmelding.
// Bliep gebruikt daarvoor een externe pushdienst. Wie de sleutel heeft, kan in naam
// van Bliep een melding sturen naar elke klant. Dat is dus een geheim.
//
// In deze demo gaat er niets echt weg: we schrijven alleen in de log wat we zouden sturen.
//
// Nieuw in les 5. Een collega schreef dit vlak voor een drop, "even snel, het werkt".

// De sleutel van de pushdienst, live-omgeving.
const PUSH_SLEUTEL = 'bliep_live_2UuQPkfuFuJGnuC63r8cy4IMf5vg58fF';

/**
 * Stuurt (in het echt) een pushmelding naar alle klanten dat de drop gestart is.
 *
 * @param {string} toestel  bv. 'Galaxy S26 Ultra'
 * @param {(niveau: string, bericht: string, extra?: object) => void} log  de logfunctie van de server
 */
function stuurDropMelding(toestel, log) {
  if (!PUSH_SLEUTEL) {
    log('waarschuwing', 'Geen PUSH_SLEUTEL ingesteld: er gaat geen drop-melding weg');
    return;
  }
  // Zo zou het verzoek eruitzien. De sleutel zelf schrijven we nooit in de log.
  const verzoek = {
    url: 'https://push.bliep.example/v1/meldingen',
    headers: { Authorization: 'Bearer ***' },
    body: { titel: 'De drop is gestart', tekst: `De ${toestel} is nu te koop. Wees er snel bij!` },
  };
  log('info', 'Drop-melding verstuurd (demo: er gaat niets echt weg)', { naar: verzoek.url });
}

export { stuurDropMelding };
