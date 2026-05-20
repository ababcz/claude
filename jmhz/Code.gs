// ============================================================================
//  JMHZ + REGZEC generátor XML z Google Sheets
//  ----------------------------------------------------------------------------
//  Po otevření tabulky se v menu objeví "JMHZ" se třemi akcemi:
//    1) Vygenerovat REGZEC pro vybrané zaměstnance (nástup/výstup)
//    2) Vygenerovat JMHZ za vybraný měsíc
//    3) Otevřít výstupní složku na Drive
//
//  POZOR: Element-names XML níže jsou MOJE pracovní pojmenování. Skutečné
//  XSD schéma stáhni z developers.mpsv.cz (sekce JMHZ) a uprav názvy elementů
//  v XmlBuilder.gs tak, aby přesně odpovídaly schématu. Bez validace proti
//  oficiálnímu XSD ti ePortál podání odmítne.
// ============================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('JMHZ')
    .addItem('Vygenerovat REGZEC (nástup/výstup)…', 'generateRegzec')
    .addItem('Vygenerovat JMHZ za měsíc…', 'generateJmhz')
    .addSeparator()
    .addItem('Otevřít výstupní složku', 'openOutputFolder')
    .addItem('Zkontrolovat strukturu tabulky', 'validateSheetStructure')
    .addToUi();
}

// ----------------------------------------------------------------------------
// REGZEC: registrace/odhláška zaměstnance
// ----------------------------------------------------------------------------
function generateRegzec() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt(
    'REGZEC',
    'Zadej ID zaměstnanců oddělené čárkou (např. Z001,Z002). Prázdné = všichni s nezpracovanými změnami.',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const filter = resp.getResponseText().trim();
  const idy = filter ? filter.split(',').map(s => s.trim()) : null;

  const zamestnanci = readZamestnanci();
  const zmeny = readZmeny();

  const udalosti = zmeny.filter(z =>
    z.stav_odeslani !== 'ODESLÁNO' &&
    (!idy || idy.indexOf(z.id_zam) !== -1)
  );

  if (udalosti.length === 0) {
    ui.alert('Žádné události k odeslání.');
    return;
  }

  const xml = buildRegzecXml(udalosti, zamestnanci, EMPLOYER);
  const fileName = `REGZEC_${formatNow()}.xml`;
  const file = saveToDrive(fileName, xml);
  const zipFile = saveZipToDrive(fileName.replace('.xml', '.zip'), file);

  ui.alert(
    'REGZEC vygenerováno',
    `Soubor: ${zipFile.getName()}\nUdálostí: ${udalosti.length}\n\n` +
    `Stáhni ZIP a nahraj na ePortál ČSSZ → "Podání nahráním dat z účetního systému".`,
    ui.ButtonSet.OK
  );
}

// ----------------------------------------------------------------------------
// JMHZ: měsíční hlášení
// ----------------------------------------------------------------------------
function generateJmhz() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt(
    'JMHZ za měsíc',
    'Zadej období ve formátu RRRR-MM (např. 2026-05):',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const obdobi = resp.getResponseText().trim();
  const m = obdobi.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) {
    ui.alert('Špatný formát období. Použij RRRR-MM.');
    return;
  }
  const rok = Number(m[1]);
  const mesic = Number(m[2]);

  const zamestnanci = readZamestnanci();
  const vykazy = readVykazy().filter(v => v.rok === rok && v.mesic === mesic);

  if (vykazy.length === 0) {
    ui.alert(`Pro ${obdobi} žádné výkazy.`);
    return;
  }

  // Validace + propočet odvodů u DPP nad limit
  const chyby = validateVykazy(vykazy, zamestnanci);
  if (chyby.length > 0) {
    ui.alert('Chyby ve výkazech', chyby.join('\n'), ui.ButtonSet.OK);
    return;
  }

  const xml = buildJmhzXml(vykazy, zamestnanci, EMPLOYER, rok, mesic);
  const fileName = `JMHZ_${rok}_${pad2(mesic)}.xml`;
  const file = saveToDrive(fileName, xml);
  const zipFile = saveZipToDrive(fileName.replace('.xml', '.zip'), file);

  ui.alert(
    'JMHZ vygenerováno',
    `Soubor: ${zipFile.getName()}\nZaměstnanců: ${vykazy.length}\n\n` +
    `Stáhni ZIP a nahraj na ePortál ČSSZ.`,
    ui.ButtonSet.OK
  );
}

function openOutputFolder() {
  const folder = getOrCreateFolder(OUTPUT_FOLDER_NAME);
  const url = folder.getUrl();
  const html = HtmlService.createHtmlOutput(
    `<p>Výstupní složka: <a href="${url}" target="_blank">${OUTPUT_FOLDER_NAME}</a></p>`
  ).setWidth(360).setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, 'Složka na Drive');
}

// ----------------------------------------------------------------------------
// Čtení dat ze Sheetů
// ----------------------------------------------------------------------------
function readZamestnanci() {
  return readSheetAsObjects(SHEETS.ZAMESTNANCI);
}
function readVykazy() {
  const rows = readSheetAsObjects(SHEETS.VYKAZY);
  return rows.map(r => Object.assign(r, {
    rok: Number(r.rok),
    mesic: Number(r.mesic),
    odpracovane_hodiny: Number(r.odpracovane_hodiny) || 0,
    hruba_odmena: Number(r.hruba_odmena) || 0,
    srazkova_dan_15: Number(r.srazkova_dan_15) || 0,
    zalohova_dan: Number(r.zalohova_dan) || 0,
    socialni_pojisteni_zam: Number(r.socialni_pojisteni_zam) || 0,
    zdravotni_pojisteni_zam: Number(r.zdravotni_pojisteni_zam) || 0,
    socialni_pojisteni_zamestnavatel: Number(r.socialni_pojisteni_zamestnavatel) || 0,
    zdravotni_pojisteni_zamestnavatel: Number(r.zdravotni_pojisteni_zamestnavatel) || 0,
    cista_mzda: Number(r.cista_mzda) || 0
  }));
}
function readZmeny() {
  return readSheetAsObjects(SHEETS.ZMENY);
}

function readSheetAsObjects(sheetName) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh) throw new Error(`List "${sheetName}" v tabulce neexistuje.`);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(c => c !== '' && c !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
}

// ----------------------------------------------------------------------------
// Validace
// ----------------------------------------------------------------------------
function validateVykazy(vykazy, zamestnanci) {
  const chyby = [];
  const indexZam = {};
  zamestnanci.forEach(z => { indexZam[z.id_zam] = z; });

  vykazy.forEach(v => {
    const z = indexZam[v.id_zam];
    if (!z) {
      chyby.push(`Výkaz ${v.id_zam} ${v.rok}-${v.mesic}: neznámý zaměstnanec.`);
      return;
    }
    if (!z.rodne_cislo && !z.datum_narozeni) {
      chyby.push(`${v.id_zam}: chybí rodné číslo i datum narození.`);
    }
    if (z.typ_smlouvy === 'DPP' && v.hruba_odmena >= DPP_LIMIT_KC) {
      if (v.socialni_pojisteni_zamestnavatel === 0 && v.zdravotni_pojisteni_zamestnavatel === 0) {
        chyby.push(`${v.id_zam} ${v.rok}-${pad2(v.mesic)}: odměna ≥ ${DPP_LIMIT_KC} Kč ale nulové odvody zaměstnavatele.`);
      }
    }
  });
  return chyby;
}

function validateSheetStructure() {
  const ui = SpreadsheetApp.getUi();
  const required = {
    [SHEETS.ZAMESTNANCI]: ['id_zam','prijmeni','jmeno','rodne_cislo','typ_smlouvy','datum_nastupu'],
    [SHEETS.VYKAZY]: ['id_zam','rok','mesic','odpracovane_hodiny','hruba_odmena'],
    [SHEETS.ZMENY]: ['id_zam','typ_udalosti','datum_udalosti','stav_odeslani']
  };
  const issues = [];
  for (const [sheetName, cols] of Object.entries(required)) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sh) { issues.push(`Chybí list "${sheetName}".`); continue; }
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
    cols.forEach(c => {
      if (headers.indexOf(c) === -1) issues.push(`List "${sheetName}": chybí sloupec "${c}".`);
    });
  }
  ui.alert(issues.length === 0 ? 'OK, struktura sedí.' : issues.join('\n'));
}

// ----------------------------------------------------------------------------
// Uložení na Drive + ZIP (XSD spec: XML musí být v ZIP archivu)
// ----------------------------------------------------------------------------
function saveToDrive(fileName, xmlContent) {
  const folder = getOrCreateFolder(OUTPUT_FOLDER_NAME);
  const blob = Utilities.newBlob(xmlContent, 'application/xml', fileName);
  return folder.createFile(blob);
}

function saveZipToDrive(zipName, xmlFile) {
  const folder = getOrCreateFolder(OUTPUT_FOLDER_NAME);
  const zipBlob = Utilities.zip([xmlFile.getBlob()], zipName);
  return folder.createFile(zipBlob);
}

function getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

// ----------------------------------------------------------------------------
// Pomocné
// ----------------------------------------------------------------------------
function pad2(n) { return String(n).padStart(2, '0'); }

function formatNow() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad2(value.getMonth()+1)}-${pad2(value.getDate())}`;
  }
  return String(value);
}

function toBool(v) {
  if (v === true || v === false) return v;
  const s = String(v).trim().toUpperCase();
  return s === 'ANO' || s === 'A' || s === 'TRUE' || s === '1';
}
