// ============================================================================
//  Konfigurace zaměstnavatele
//  ----------------------------------------------------------------------------
//  Vyplň údaje o své firmě/OSVČ. Tyhle hodnoty jdou do hlavičky každého XML.
//  Pokud máš více variabilních symbolů / IČZ, uprav podle potřeby.
// ============================================================================

const EMPLOYER = {
  ico: '12345678',
  nazev: 'Moje firma s.r.o.',
  variabilniSymbol: '1234567890', // VS přidělený ČSSZ
  icz: '12345678901',             // IČZ (identifikátor zaměstnavatele u ČSSZ)
  ulice: 'Hlavní 1',
  obec: 'Praha',
  psc: '11000',
  stat: 'CZ',
  email: 'mzdy@mojefirma.cz',
  telefon: '+420123456789',
  // Kontaktní osoba pro hlášení
  kontakt: {
    jmeno: 'Jan',
    prijmeni: 'Novák',
    email: 'jan.novak@mojefirma.cz',
    telefon: '+420123456789'
  }
};

// Názvy listů v Google tabulce
const SHEETS = {
  ZAMESTNANCI: 'Zamestnanci',
  VYKAZY: 'Vykazy',
  ZMENY: 'Zmeny_REGZEC'
};

// Limit DPP, nad který se platí pojistné (rok 2026 — orientačně 11 500 Kč,
// ověř aktuální hodnotu v zákoně)
const DPP_LIMIT_KC = 11500;

// Výstupní složka na Google Drive (vytvoří se, pokud neexistuje)
const OUTPUT_FOLDER_NAME = 'JMHZ_export';
