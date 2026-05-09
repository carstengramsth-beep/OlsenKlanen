// Opretter en CSV-fil med én linje pr. familiemedlem: familienummer, fornavn, efternavn, fødselsdato, rolle
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'membres_fra_pdf.json'), 'utf8'));

const linjer = ['Familienr;Fornavn;Efternavn;Fødselsdato;Rolle;Familie'];

for (const fam of data) {
  for (const m of fam.familiemedlemmer) {
    const navneParts = (m.navn || '').trim().split(' ');
    const efternavn = navneParts.length > 1 ? navneParts[navneParts.length - 1] : '';
    const fornavn = navneParts.length > 1 ? navneParts.slice(0, -1).join(' ') : navneParts[0];
    const dato = m.foedselsdato || '2026-01-01';
    const rolle = m.rolle || 'forælder';

    linjer.push([
      fam.nr,
      fornavn,
      efternavn,
      dato,
      rolle,
      fam.navne,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(';'));
  }
}

const fil = path.join(__dirname, 'alle_personer.csv');
fs.writeFileSync(fil, '﻿' + linjer.join('\n'), 'utf8');
console.log(`Gemt: ${fil}`);
console.log(`Antal linjer: ${linjer.length - 1} personer`);
