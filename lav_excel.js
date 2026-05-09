// Opretter afvigelser_membres.xlsx med farvekodet styling
// Kør med: node lav_excel.js

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// ─── Farver ───────────────────────────────────────────────────────────────────
const ROED   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } };
const GUEL   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
const GROEN  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB6D7A8' } };
const HVID   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const HEADER = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A8A' } };

const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
const NORMAL_FONT = { name: 'Calibri', size: 10 };
const BOLD_FONT   = { bold: true, name: 'Calibri', size: 10 };

const BORDER = {
  top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
};

function parseCSV(fil) {
  const raw = fs.readFileSync(fil, 'utf8').replace(/^﻿/, '');
  const linjer = raw.split('\n').filter(l => l.trim());
  const headers = linjer[0].split(';').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = linjer.slice(1).map(l => {
    const cols = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < l.length; i++) {
      if (l[i] === '"') { inQuote = !inQuote; continue; }
      if (l[i] === ';' && !inQuote) { cols.push(current); current = ''; continue; }
      current += l[i];
    }
    cols.push(current);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
    return obj;
  });
  return { headers, rows };
}

function stilRow(row, fylde, skrifttype) {
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill = fylde;
    cell.font = skrifttype || NORMAL_FONT;
    cell.border = BORDER;
    cell.alignment = { wrapText: false, vertical: 'middle' };
  });
}

function headerRow(sheet, cols) {
  const hrow = sheet.addRow(cols.map(c => c.header));
  hrow.height = 20;
  hrow.eachCell({ includeEmpty: true }, cell => {
    cell.fill = HEADER;
    cell.font = HEADER_FONT;
    cell.border = BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  return hrow;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'OlsenKlanen';
  wb.created = new Date();

  // ── ARK 1: Alle personer ─────────────────────────────────────────────────
  const shPersoner = wb.addWorksheet('Alle personer', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultColWidth: 15 },
  });

  const kolPersoner = [
    { header: 'Familienr', key: 'Familienr', width: 12 },
    { header: 'Fornavn',   key: 'Fornavn',   width: 22 },
    { header: 'Efternavn', key: 'Efternavn', width: 22 },
    { header: 'Fødselsdato', key: 'Fødselsdato', width: 14 },
    { header: 'Rolle',     key: 'Rolle',     width: 12 },
    { header: 'Familie',   key: 'Familie',   width: 35 },
    { header: 'Rettet af', key: 'Rettet af', width: 18 },
  ];
  shPersoner.columns = kolPersoner.map(k => ({ key: k.key, width: k.width }));
  headerRow(shPersoner, kolPersoner);

  const personData = parseCSV(path.join(DIR, 'alle_personer.csv'));
  for (const rad of personData.rows) {
    const manglNr   = !rad['Familienr'] || rad['Familienr'].trim() === '';
    const manglDato = rad['Fødselsdato'] === '2026-01-01';

    const nr = manglNr ? 'MEDLEMSNUMMER MANGLER' : rad['Familienr'];

    const row = shPersoner.addRow({
      'Familienr':   nr,
      'Fornavn':     rad['Fornavn'],
      'Efternavn':   rad['Efternavn'],
      'Fødselsdato': rad['Fødselsdato'],
      'Rolle':       rad['Rolle'],
      'Familie':     rad['Familie'],
      'Rettet af':   '',
    });
    row.height = 18;

    if (manglNr) {
      stilRow(row, ROED, BOLD_FONT);
    } else if (manglDato) {
      stilRow(row, GUEL, NORMAL_FONT);
    } else {
      stilRow(row, GROEN, NORMAL_FONT);
    }
  }

  // AutoFilter på ark 1
  shPersoner.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: kolPersoner.length },
  };

  // ── ARK 2: Afvigelser (fra CSV) ──────────────────────────────────────────
  const shAfv = wb.addWorksheet('Afvigelser', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const kolAfv = [
    { header: 'Nr.',           key: 'Nr.',           width: 8  },
    { header: 'Type',          key: 'Type',          width: 26 },
    { header: 'Felt',          key: 'Felt',          width: 22 },
    { header: 'PDF-værdi',     key: 'PDF-værdi',     width: 35 },
    { header: 'Database-værdi',key: 'Database-værdi',width: 35 },
    { header: 'Note',          key: 'Note',          width: 42 },
    { header: 'Rettet af',     key: 'Rettet af',     width: 18 },
  ];
  shAfv.columns = kolAfv.map(k => ({ key: k.key, width: k.width }));
  headerRow(shAfv, kolAfv);

  const afvData = parseCSV(path.join(DIR, 'afvigelser_membres.csv'));
  for (const rad of afvData.rows) {
    const type = rad['Type'] || '';
    const row = shAfv.addRow({
      'Nr.':           rad['Nr.'] || '',
      'Type':          type,
      'Felt':          rad['Felt'] || '',
      'PDF-værdi':     rad['PDF-værdi'] || '',
      'Database-værdi':rad['Database-værdi'] || '',
      'Note':          rad['Note'] || '',
      'Rettet af':     '',
    });
    row.height = 18;

    if (type.includes('MANGLER I DATABASE')) {
      stilRow(row, ROED, NORMAL_FONT);
    } else if (type.includes('MANGLER FAMILIEMEDLEMMER')) {
      stilRow(row, GUEL, NORMAL_FONT);
    } else if (type.includes('FORSKEL')) {
      stilRow(row, GUEL, NORMAL_FONT);
    } else {
      stilRow(row, GROEN, NORMAL_FONT);
    }
  }

  shAfv.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: kolAfv.length },
  };

  // ── ARK 3: Legende ───────────────────────────────────────────────────────
  const shLeg = wb.addWorksheet('Legende');
  shLeg.columns = [{ width: 30 }, { width: 50 }];

  const legData = [
    ['FARVE',           'BETYDNING'],
    ['RØD',            'Medlemsnummer mangler eller familie mangler i database'],
    ['GUL',            'Fødselsdato ukendt (01/01/2026) eller data afviger fra PDF'],
    ['GRØN',           'Data er OK'],
    ['Kolonne "Rettet af"', 'Skriv initialer/navn når data er verificeret eller rettet'],
  ];
  legData.forEach((ld, i) => {
    const row = shLeg.addRow(ld);
    row.height = 20;
    row.getCell(1).font = i === 0 ? HEADER_FONT : BOLD_FONT;
    row.getCell(2).font = i === 0 ? HEADER_FONT : NORMAL_FONT;
    if (i === 0) {
      row.getCell(1).fill = HEADER;
      row.getCell(2).fill = HEADER;
    } else {
      const farver = [ROED, GUEL, GROEN, HVID];
      row.getCell(1).fill = farver[i - 1] || HVID;
      row.getCell(2).fill = farver[i - 1] || HVID;
    }
    row.eachCell(cell => { cell.border = BORDER; cell.alignment = { vertical: 'middle' }; });
  });

  // ── Gem ──────────────────────────────────────────────────────────────────
  const udFil = path.join(DIR, 'afvigelser_membres.xlsx');
  await wb.xlsx.writeFile(udFil);

  console.log(`\n✓ Gemt: afvigelser_membres.xlsx`);
  console.log(`  Ark 1 "Alle personer": ${personData.rows.length} rækker`);
  console.log(`  Ark 2 "Afvigelser":    ${afvData.rows.length} rækker`);
  console.log(`  Ark 3 "Legende":       farveforklaring`);

  // Tæl farver
  let roed = 0, guel = 0, groen = 0;
  for (const rad of personData.rows) {
    if (!rad['Familienr']) roed++;
    else if (rad['Fødselsdato'] === '2026-01-01') guel++;
    else groen++;
  }
  console.log(`\n  Røde (mangler nr/dato):  ${roed}`);
  console.log(`  Gule (ukendt fødselsdato): ${guel}`);
  console.log(`  Grønne (OK):              ${groen}`);
}

main().catch(console.error);
