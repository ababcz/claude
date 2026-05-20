// ============================================================================
//  Stavba XML pro REGZEC a JMHZ
//  ----------------------------------------------------------------------------
//  DŮLEŽITÉ: Element-names a namespace níže jsou ORIENTAČNÍ. Skutečné XSD
//  schéma musíš stáhnout z developers.mpsv.cz/api-list/jednotne-mesicni-
//  hlaseni-zamestnavatelu/ a upravit konstanty NS_* + názvy elementů tak,
//  aby přesně odpovídaly XSD. ePortál ČSSZ validuje proti XSD a odmítne
//  cokoliv, co se odchýlí.
// ============================================================================

const NS_REGZEC = 'http://schemas.cssz.cz/regzec/v1';  // TODO: ověř v XSD
const NS_JMHZ   = 'http://schemas.cssz.cz/jmhz/v1';    // TODO: ověř v XSD

// ----------------------------------------------------------------------------
// REGZEC
// ----------------------------------------------------------------------------
function buildRegzecXml(udalosti, zamestnanci, employer) {
  const indexZam = {};
  zamestnanci.forEach(z => { indexZam[z.id_zam] = z; });

  const ns = XmlService.getNamespace(NS_REGZEC);
  const root = XmlService.createElement('Podani', ns);
  root.addContent(buildZamestnavatel(employer, ns));

  const seznam = XmlService.createElement('Udalosti', ns);
  udalosti.forEach(u => {
    const z = indexZam[u.id_zam];
    if (!z) return;
    const el = XmlService.createElement('Udalost', ns)
      .setAttribute('typ', String(u.typ_udalosti))
      .setAttribute('datum', formatDate(u.datum_udalosti));
    el.addContent(buildZamestnanec(z, ns));
    seznam.addContent(el);
  });
  root.addContent(seznam);

  return serialize(root);
}

// ----------------------------------------------------------------------------
// JMHZ
// ----------------------------------------------------------------------------
function buildJmhzXml(vykazy, zamestnanci, employer, rok, mesic) {
  const indexZam = {};
  zamestnanci.forEach(z => { indexZam[z.id_zam] = z; });

  const ns = XmlService.getNamespace(NS_JMHZ);
  const root = XmlService.createElement('JMHZ', ns);

  const hlavicka = XmlService.createElement('Hlavicka', ns);
  hlavicka.addContent(buildZamestnavatel(employer, ns));
  const obdobi = XmlService.createElement('Obdobi', ns);
  obdobi.addContent(textEl('Rok', rok, ns));
  obdobi.addContent(textEl('Mesic', pad2(mesic), ns));
  hlavicka.addContent(obdobi);
  hlavicka.addContent(textEl('DatumVytvoreni', formatDate(new Date()), ns));
  root.addContent(hlavicka);

  const seznam = XmlService.createElement('Zamestnanci', ns);
  vykazy.forEach(v => {
    const z = indexZam[v.id_zam];
    if (!z) return;
    const el = XmlService.createElement('Zamestnanec', ns);
    el.addContent(buildOsobaIdent(z, ns));
    el.addContent(buildVykaz(v, z, ns));
    seznam.addContent(el);
  });
  root.addContent(seznam);

  return serialize(root);
}

// ----------------------------------------------------------------------------
// Stavební bloky
// ----------------------------------------------------------------------------
function buildZamestnavatel(e, ns) {
  const el = XmlService.createElement('Zamestnavatel', ns);
  el.addContent(textEl('ICO', e.ico, ns));
  el.addContent(textEl('Nazev', e.nazev, ns));
  el.addContent(textEl('VariabilniSymbol', e.variabilniSymbol, ns));
  el.addContent(textEl('ICZ', e.icz, ns));
  el.addContent(buildAdresa(e, ns));

  const k = XmlService.createElement('Kontakt', ns);
  k.addContent(textEl('Jmeno', e.kontakt.jmeno, ns));
  k.addContent(textEl('Prijmeni', e.kontakt.prijmeni, ns));
  k.addContent(textEl('Email', e.kontakt.email, ns));
  k.addContent(textEl('Telefon', e.kontakt.telefon, ns));
  el.addContent(k);
  return el;
}

function buildAdresa(src, ns) {
  const a = XmlService.createElement('Adresa', ns);
  if (src.ulice || src.ulice_cislo) a.addContent(textEl('Ulice', src.ulice || src.ulice_cislo, ns));
  if (src.obec) a.addContent(textEl('Obec', src.obec, ns));
  if (src.psc)  a.addContent(textEl('PSC',  String(src.psc).replace(/\s/g, ''), ns));
  if (src.stat) a.addContent(textEl('Stat', src.stat, ns));
  return a;
}

function buildOsobaIdent(z, ns) {
  const el = XmlService.createElement('Osoba', ns);
  if (z.rodne_cislo) {
    el.addContent(textEl('RodneCislo', String(z.rodne_cislo).replace(/\D/g, ''), ns));
  } else {
    el.addContent(textEl('DatumNarozeni', formatDate(z.datum_narozeni), ns));
  }
  el.addContent(textEl('Prijmeni', z.prijmeni, ns));
  el.addContent(textEl('Jmeno', z.jmeno, ns));
  if (z.titul_pred) el.addContent(textEl('TitulPred', z.titul_pred, ns));
  if (z.titul_za)   el.addContent(textEl('TitulZa', z.titul_za, ns));
  if (z.pohlavi)    el.addContent(textEl('Pohlavi', z.pohlavi, ns));
  if (z.statni_obcanstvi) el.addContent(textEl('StatniObcanstvi', z.statni_obcanstvi, ns));
  return el;
}

function buildZamestnanec(z, ns) {
  const el = buildOsobaIdent(z, ns);
  el.addContent(buildAdresa(z, ns));
  if (z.cislo_uctu) el.addContent(textEl('CisloUctu', z.cislo_uctu, ns));
  if (z.email)      el.addContent(textEl('Email', z.email, ns));
  if (z.typ_smlouvy) el.addContent(textEl('TypSmlouvy', z.typ_smlouvy, ns));
  if (z.druh_cinnosti) el.addContent(textEl('DruhCinnosti', z.druh_cinnosti, ns));
  if (z.datum_nastupu)   el.addContent(textEl('DatumNastupu', formatDate(z.datum_nastupu), ns));
  if (z.datum_ukonceni)  el.addContent(textEl('DatumUkonceni', formatDate(z.datum_ukonceni), ns));
  if (z.zdravotni_pojistovna) el.addContent(textEl('ZdravotniPojistovna', String(z.zdravotni_pojistovna), ns));
  el.addContent(textEl('ProhlaseniPoplatnika', toBool(z.prohlaseni_poplatnika) ? 'true' : 'false', ns));
  el.addContent(textEl('Student', toBool(z.je_studentem) ? 'true' : 'false', ns));
  return el;
}

function buildVykaz(v, z, ns) {
  const el = XmlService.createElement('Vykaz', ns);
  el.addContent(textEl('TypSmlouvy', z.typ_smlouvy || '', ns));
  el.addContent(textEl('DruhCinnosti', z.druh_cinnosti || '', ns));
  el.addContent(textEl('OdpracovaneHodiny', v.odpracovane_hodiny, ns));
  el.addContent(textEl('HrubaOdmena', v.hruba_odmena.toFixed(2), ns));
  el.addContent(textEl('ZalohovaDan', v.zalohova_dan.toFixed(2), ns));
  el.addContent(textEl('SrazkovaDan', v.srazkova_dan_15.toFixed(2), ns));

  const poj = XmlService.createElement('Pojistne', ns);
  poj.addContent(textEl('SocialniZamestnanec', v.socialni_pojisteni_zam.toFixed(2), ns));
  poj.addContent(textEl('ZdravotniZamestnanec', v.zdravotni_pojisteni_zam.toFixed(2), ns));
  poj.addContent(textEl('SocialniZamestnavatel', v.socialni_pojisteni_zamestnavatel.toFixed(2), ns));
  poj.addContent(textEl('ZdravotniZamestnavatel', v.zdravotni_pojisteni_zamestnavatel.toFixed(2), ns));
  el.addContent(poj);

  el.addContent(textEl('CistaMzda', v.cista_mzda.toFixed(2), ns));
  if (v.datum_vyplaty) el.addContent(textEl('DatumVyplaty', formatDate(v.datum_vyplaty), ns));
  if (v.poznamka) el.addContent(textEl('Poznamka', String(v.poznamka), ns));
  return el;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function textEl(name, value, ns) {
  return XmlService.createElement(name, ns).setText(value === undefined || value === null ? '' : String(value));
}

function serialize(rootElement) {
  const doc = XmlService.createDocument(rootElement);
  const fmt = XmlService.getPrettyFormat().setEncoding('UTF-8');
  return fmt.format(doc);
}
