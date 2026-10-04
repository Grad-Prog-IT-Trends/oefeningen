// De raffle van de volgende drop: klanten schrijven zich in met hun e-mailadres.
// De inschrijvingen staan in een PostgreSQL-database, niet in een JSON-bestand.
// Waarom? In les 4 zie je wat er met die gegevens gebeurt als je de omgeving
// verwoest en opnieuw opbouwt. De infrastructuur komt terug, de gegevens niet vanzelf.
//
// pg is de bekendste PostgreSQL-bibliotheek voor Node. Een Pool houdt een paar
// verbindingen met de database open en hergebruikt ze, zodat niet elk verzoek
// een nieuwe verbinding moet opzetten.
import pg from 'pg';

// Het toestel van de volgende raffle. In het echt komt dit uit de dropkalender.
const TOESTEL = 'Galaxy S26 Ultra';

// DATABASE_URL ziet er zo uit: postgres://gebruiker:wachtwoord@host:5432/database
// Draait de webshop zonder database (bv. met npm start op je laptop, of in de tests),
// dan is DATABASE_URL niet ingesteld en werkt de rest van de webshop gewoon verder.
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

/**
 * Is er een database ingesteld?
 *
 * @returns {boolean}
 */
function raffleActief() {
  return pool !== null;
}

/**
 * Telt de inschrijvingen voor de raffle.
 * De $1 in de query is een parameter: pg vult hem veilig in met de waarde uit de lijst.
 * Zo plak je nooit zelf tekst in een query (daarover meer in les 5: SQL-injectie).
 *
 * @returns {Promise<{ toestel: string, inschrijvingen: number }>}
 */
async function telInschrijvingen() {
  const resultaat = await pool.query(
    'SELECT COUNT(*)::int AS aantal FROM raffle_inschrijvingen WHERE toestel = $1',
    [TOESTEL],
  );
  return { toestel: TOESTEL, inschrijvingen: resultaat.rows[0].aantal };
}

/**
 * Schrijft een e-mailadres in voor de raffle.
 * ON CONFLICT DO NOTHING: wie al ingeschreven is, wordt niet dubbel geteld.
 *
 * @param {string} email
 * @returns {Promise<{ toestel: string, inschrijvingen: number }>}
 */
async function schrijfIn(email) {
  const schoon = String(email ?? '').trim().toLowerCase();
  // Een heel eenvoudige controle: iets, dan een @, dan iets met een punt erin.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoon)) {
    throw new Error('Dat lijkt geen geldig e-mailadres');
  }
  await pool.query(
    'INSERT INTO raffle_inschrijvingen (email, toestel) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
    [schoon, TOESTEL],
  );
  return telInschrijvingen();
}

export { raffleActief, telInschrijvingen, schrijfIn };
