-- Dit script maakt de tabel voor de raffle en zet er drie inschrijvingen in.
-- De officiële PostgreSQL-image voert elk .sql-bestand in /docker-entrypoint-initdb.d
-- uit, maar alleen de allereerste keer: als de database nog leeg is.
-- Bestaat het volume al, dan slaat hij dit bestand over.

CREATE TABLE raffle_inschrijvingen (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  toestel         TEXT NOT NULL,
  ingeschreven_op TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drie verzonnen klanten, zodat je meteen iets ziet.
INSERT INTO raffle_inschrijvingen (email, toestel) VALUES
  ('sofie.vermeulen@example.com', 'Galaxy S26 Ultra'),
  ('driss.mertens@example.com',   'Galaxy S26 Ultra'),
  ('tom.dierckx@example.com',     'Galaxy S26 Ultra');
