// Bygger membres-samlingen fra PDF-listen og sammenligner med eksisterende Firestore-data.
// Opretter: membres_fra_pdf.json, afvigelser.csv og uploader til Firestore.
// Kør med: node byg_membres_fra_pdf.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Hjælpefunktioner ───────────────────────────────────────────────────────

function parseDato(str) {
  if (!str) return '2026-01-01';
  str = str.trim().replace(/\./g, '/');
  const parts = str.split('/');
  if (parts.length === 3) {
    let [d, m, y] = parts;
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (y.length === 2) y = parseInt(y) > 30 ? '19' + y : '20' + y;
    return `${y}-${m}-${d}`;
  }
  return '2026-01-01';
}

function splitNavn(fuldt) {
  const parts = fuldt.trim().split(' ');
  if (parts.length === 1) return { fornavn: parts[0], efternavn: '' };
  return { fornavn: parts.slice(0, -1).join(' '), efternavn: parts[parts.length - 1] };
}

function parseAdresse(adresse) {
  if (!adresse) return { vej: '', postnummer: '', by: '' };
  const lines = adresse.split('\n').map(s => s.trim()).filter(Boolean);
  const vej = lines[0] || '';
  const linje2 = lines[1] || '';
  const match = linje2.match(/^(\d{4})\s+(.+)$/);
  if (match) return { vej, postnummer: match[1], by: match[2] };
  const inline = adresse.match(/(\d{4})\s+([A-ZÆØÅa-zæøå\s]+)$/);
  if (inline) return { vej, postnummer: inline[1], by: inline[2].trim() };
  return { vej, postnummer: '', by: linje2 };
}

// ─── PDF-data ───────────────────────────────────────────────────────────────

const PDF_FAMILIER = [
  {
    nr: '4', navne: 'Bibs & Bent Westergaard-Hansen',
    adresse: 'Nørremøllevej 5\nØ.Snogbæk.\n6400 Sønderborg',
    tlf: '74468171', mobil: '61688171', email: 'bwh@bbsyd.dk',
    personer: [
      { navn: 'Birgit Westergaard-Hansen', foedselsdato: '09/06/1958' },
      { navn: 'Bent V-Westergaard-Hansen', foedselsdato: '30/03/1955' },
    ]
  },
  {
    nr: '8', navne: 'Elisabeth & Carsten Gram',
    adresse: 'Bjælkerupvej 111\n4660 Store Heddinge',
    tlf: '56503249', mobil: '20732525', email: 'cg@paritas.dk / eg@paritas.dk',
    personer: [
      { navn: 'Elisabeth Helen Gram', foedselsdato: '11/01/1948' },
      { navn: 'Carsten Gram', foedselsdato: '15/09/1952' },
    ]
  },
  {
    nr: '10', navne: 'Jannie V. Rumenapp & Nicki Buch',
    adresse: 'Søndermarksvej 9\n4622 Havdrup',
    tlf: '', mobil: '', email: '',
    personer: [
      { navn: 'Jannie Vormslev Rumenapp', foedselsdato: '11/04/1995' },
      { navn: 'Nicki Buch', foedselsdato: '27/05/1993' },
    ]
  },
  {
    nr: '11', navne: 'Martin M. Olsen & Anne M. Lund',
    adresse: 'Vædderens Kvarter 73\n6710 Esbjerg V.',
    tlf: '', mobil: '30223700 / 40785111', email: 'melse.olsen@gmail.com',
    personer: [
      { navn: 'Martin Majgaard Olsen', foedselsdato: '12/04/1989' },
      { navn: 'Anne Marie Lund', foedselsdato: '21/04/1993' },
      { navn: 'Norr Lund Olsen', foedselsdato: '01/04/2018' },
      { navn: 'Fria Lund Olsen', foedselsdato: '13/07/2019' },
    ]
  },
  {
    nr: '12', navne: 'Jesper M. Olsen',
    adresse: 'Ringkøbingvej 16-2.mf.\n6800 Varde',
    tlf: '', mobil: '61516840', email: 'olsen140791@gmail.com',
    personer: [
      { navn: 'Jesper Majgaard Olsen', foedselsdato: '14/07/1991' },
    ]
  },
  {
    nr: '13', navne: 'Gitte V Baldersø',
    adresse: 'Tofteholmen 110\n2690 Karlslunde',
    tlf: '46153299', mobil: '', email: 'vormslev1@hotmail.com',
    personer: [
      { navn: 'Gitte V. Baldersø', foedselsdato: '02/06/1963' },
      { navn: 'Martin V. Baldersø', foedselsdato: '13/08/1987' },
      { navn: 'Jannie V. Rümenapp', foedselsdato: '11/04/1995' },
      { navn: 'Jannik V. Rümenapp', foedselsdato: '04/02/2003' },
    ]
  },
  {
    nr: '14', navne: 'Svend Vormslev Olsen',
    adresse: 'Vejlebrovej 152 2.tv.\n2635 Ishøj',
    tlf: '', mobil: '40566987', email: 'vormslev@ishoejby.dk',
    personer: [
      { navn: 'Svend Vormslev Olsen', foedselsdato: '23/05/1963' },
    ]
  },
  {
    nr: '15', navne: 'Louise M. Olsen',
    adresse: 'Sportsvej 18. 1.tv.\n6705 Esbjerg Ø.',
    tlf: '', mobil: '60856037', email: 'bette.louise@hotmail.com',
    personer: [
      { navn: 'Louise Majgaard Olsen', foedselsdato: '08/02/1995' },
    ]
  },
  {
    nr: '16', navne: 'Christian V. Olsen & Birthe Schøne',
    adresse: 'Kong Hans Alle 1c st. tv.\n2860 Søborg',
    tlf: '44940108', mobil: '50453327', email: 'chone@youmail.dk',
    personer: [
      { navn: 'Christian Vormslev Olsen', foedselsdato: '16/08/1941' },
      { navn: 'Birthe Schøne', foedselsdato: '11/05/1941' },
    ]
  },
  {
    nr: '17', navne: 'René Gram',
    adresse: 'Henningsens allé 42.\n2900 Hellerup',
    tlf: '39303317', mobil: '51223317', email: 'renegram@mckinsey.com',
    personer: [
      { navn: 'René Gram', foedselsdato: '21/07/1972' },
    ]
  },
  {
    nr: '19', navne: 'Jette & Tommy V. Olsen',
    adresse: 'Elmelunden 14\n2635 Ishøj',
    tlf: '43731284', mobil: '20321284 / 24681116 / 29871284',
    email: 'jco@ishoejby.dk / tvo@ishoejby.dk',
    personer: [
      { navn: 'Jette Carlberg Olsen', foedselsdato: '21/01/1963' },
      { navn: 'Tommy Vormslev Olsen', foedselsdato: '08/12/1960' },
    ]
  },
  {
    nr: '20', navne: 'Iben C. Olsen',
    adresse: 'Træningsbanen 46\n4683 Rønnede',
    tlf: '', mobil: '29925429', email: 'Ibse85@hotmail.com',
    personer: [
      { navn: 'Iben Carlberg Olsen', foedselsdato: '20/04/1985' },
      { navn: 'Ronni Olsen', foedselsdato: '30/09/1977' },
      { navn: 'Mikkel E. Olsen', foedselsdato: '17/03/2010' },
      { navn: 'Lina C. Olsen', foedselsdato: '21/03/2013' },
    ]
  },
  {
    nr: '21', navne: 'Jytte Tingberg & Jan Nielsen',
    adresse: 'Lerager 75\n3600 Frederikssund',
    tlf: '47311227', mobil: '20483471', email: 'jan.jytte@tdcadsl.dk',
    personer: [
      { navn: 'Jytte Vormslev Tingberg', foedselsdato: '01/03/1951' },
      { navn: 'Jan Nielsen', foedselsdato: '21/09/1956' },
      { navn: 'Rikke V. Tingberg', foedselsdato: '09/02/1979' },
    ]
  },
  {
    nr: '22', navne: 'Jytte & Kurt V. Olsen',
    adresse: 'Skærager 21\n2620 Albertslund',
    tlf: '43646828', mobil: '40745767', email: 'kvo@vormslev.dk',
    personer: [
      { navn: 'Jytte Olsen', foedselsdato: '26/06/1948' },
      { navn: 'Kurt Vormslev Olsen', foedselsdato: '28/06/1948' },
    ]
  },
  {
    nr: '23', navne: 'Karin & Richard Lund',
    adresse: 'Risvangen 19\n2700 Brønshøj',
    tlf: '38285643', mobil: '25764845 / 20207643', email: 'kld@inmobia.com',
    personer: [
      { navn: 'Karin Lund', foedselsdato: '11/09/1946' },
      { navn: 'Richard Lund', foedselsdato: '26/11/1943' },
    ]
  },
  {
    nr: '24', navne: 'Tine Carlberg Olsen & Simon Peter Hansen',
    adresse: 'Askvej 4\n4683 Rønnede',
    tlf: '', mobil: '', email: 'tine_colsen@hotmail.com',
    personer: [
      { navn: 'Tine Carlberg Olsen', foedselsdato: '02/09/1988' },
      { navn: 'Simon P. Hansen', foedselsdato: '23/02/1984' },
      { navn: 'Alberte E. C. Hansen', foedselsdato: '2026-01-01' },
    ]
  },
  {
    nr: '26', navne: 'Lene Vormslev Hansen & Tom Petersen',
    adresse: 'Ved Skellet 16\n6400 Sønderborg',
    tlf: '', mobil: '22469340 / 22100053', email: 'lenevormslev@gmail.com',
    personer: [
      { navn: 'Lene Vormslev Hansen', foedselsdato: '06/10/1964' },
      { navn: 'Tom Petersen', foedselsdato: '25/11/1963' },
    ]
  },
  {
    nr: '27', navne: 'Lili & Gunner Carlberg',
    adresse: 'Østergården 21 4.th.\n2635 Ishøj',
    tlf: '', mobil: '29990110', email: 'gunlilcarlberg@gmail.com',
    personer: [
      { navn: 'Lili Carlberg', foedselsdato: '14/10/1942' },
      { navn: 'Gunner Carlberg', foedselsdato: '24/07/1941' },
    ]
  },
  {
    nr: '28', navne: 'Lilli & Egon Vormslev Olsen',
    adresse: '', tlf: '', mobil: '', email: 'egonvolsen@youmail.dk',
    personer: [
      { navn: 'Lilli Vinifred Olsen', foedselsdato: '13/09/1927' },
      { navn: 'Egon Vormslev Olsen', foedselsdato: '05/11/1926' },
    ]
  },
  {
    nr: '29', navne: 'Lise & Steen V. Olsen',
    adresse: 'Søndervang 29\n6840 Oksbøl',
    tlf: '', mobil: '50562337', email: 'slolsen@mail.dk',
    personer: [
      { navn: 'Lise Majgaard Olsen', foedselsdato: '22/08/1964' },
      { navn: 'Steen Vormslev Olsen', foedselsdato: '26/04/1961' },
    ]
  },
  {
    nr: '30', navne: 'Lise Olsen',
    adresse: 'Ved Skoven 41 D. st. 6\n6700 Esbjerg',
    tlf: '', mobil: '21256118', email: '',
    personer: [
      { navn: 'Lise Vormslev Olsen', foedselsdato: '30/09/1937' },
      { navn: 'Jørgen Georg Olsen', foedselsdato: '24/11/1933' },
    ]
  },
  {
    nr: '31', navne: 'Jesper H. Petersen',
    adresse: 'Mølleåparken 6,1 lej H\n2800 Kgs. Lyngby',
    tlf: '', mobil: '42718978', email: '',
    personer: [
      { navn: 'Jesper H. Petersen', foedselsdato: '2026-01-01' },
    ]
  },
  {
    nr: '32', navne: 'Nina Lennert',
    adresse: 'Asalunden 12-,2-2\n5200 Odense V.',
    tlf: '', mobil: '42433109', email: 'ninalennert@hotmail.com',
    personer: [
      { navn: 'Nina Vormslev Lennert', foedselsdato: '04/03/1958' },
      { navn: 'Finn Christensen Lennert', foedselsdato: '16/02/1955' },
      { navn: 'Lotte Vormslev Lennert', foedselsdato: '24/05/1987' },
      { navn: 'Jens Vormslev Lennert', foedselsdato: '19/10/1995' },
    ]
  },
  {
    nr: '33', navne: 'Solveig & Jan V. Olsen',
    adresse: 'Vestervej 12\n6980 Tim',
    tlf: '97333070', mobil: '', email: 'vestervej12@yahoo.dk',
    personer: [
      { navn: 'Solveig Præstegaard Olsen', foedselsdato: '10/12/1958' },
      { navn: 'Jan Vormslev Olsen', foedselsdato: '21/12/1957' },
    ]
  },
  {
    nr: '34', navne: 'Tove & Steve Ebersole',
    adresse: 'Bentzonsvej 10. 1tv.\n2000 Frederiksberg',
    tlf: '38870323', mobil: '', email: '',
    personer: [
      { navn: 'Tove Ebersole', foedselsdato: '20/04/1942' },
      { navn: 'Steve Ebersole', foedselsdato: '12/01/1942' },
    ]
  },
  {
    nr: '35', navne: 'Vibeke & Charles Petersen',
    adresse: 'Rugtorvet 8 Karlby\n8543 Hornslet',
    tlf: '86974604', mobil: '', email: '',
    personer: [
      { navn: 'Vibeke Gram Petersen', foedselsdato: '16/12/1948' },
      { navn: 'Charles Aarup Petersen', foedselsdato: '25/09/1946' },
      { navn: 'Jens Gram Petersen', foedselsdato: '08/02/1984' },
    ]
  },
  {
    nr: '36', navne: 'Anja V. Olsen',
    adresse: 'Åbakkevej 38. 2 tv.\n2720 Vanløse',
    tlf: '', mobil: '', email: '',
    personer: [
      { navn: 'Anja Vormslev Olsen', foedselsdato: '08/12/1987' },
      { navn: 'Ulrik Frøling Petersen', foedselsdato: '2026-01-01' },
      { navn: 'Emmeli V. F. Petersen', foedselsdato: '18/01/2009' },
    ]
  },
  {
    nr: '37', navne: 'Christina & Jesper Olesen',
    adresse: 'Madumflodvej 13\n6990 Ulfborg',
    tlf: '', mobil: '28291005', email: '',
    personer: [
      { navn: 'Christina Præstegaard Olesen', foedselsdato: '18/11/1986' },
      { navn: 'Jesper Olesen', foedselsdato: '01/04/1985' },
    ]
  },
  {
    nr: '38', navne: 'Morten Baldersø & Paulina Schmidt',
    adresse: 'Sandvejen 23\n4000 Roskilde',
    tlf: '', mobil: '31140826 / 21252801', email: 'mortenbalder@gmail.com',
    personer: [
      { navn: 'Morten Vormslev Baldersø', foedselsdato: '29/05/1991' },
      { navn: 'Paulina Schmidt', foedselsdato: '28/01/1993' },
    ]
  },
  {
    nr: '39', navne: 'Kenneth Lund & Ria Ø. Larsen',
    adresse: 'Vestre Nørremarksvej 3\n5762 Vester Skerninge',
    tlf: '38896535', mobil: '27146535', email: 'kenneth@hotmail.com',
    personer: [
      { navn: 'Kenneth Lund', foedselsdato: '15/11/1974' },
      { navn: 'Ria Ø. Larsen', foedselsdato: '07/02/1980' },
      { navn: 'Oscar C. Lund', foedselsdato: '02/04/2008' },
      { navn: 'Mads Emil Lund', foedselsdato: '26/11/2010' },
      { navn: 'Svend August Lund', foedselsdato: '03/09/2016' },
    ]
  },
  {
    nr: '40', navne: 'Mette Holmgaard & Thor Poulsen',
    adresse: 'Salbyvej 152\n4600 Køge',
    tlf: '', mobil: '50458419', email: '',
    personer: [
      { navn: 'Mette Holmgaard', foedselsdato: '12/09/1971' },
      { navn: 'Thor Poulsen', foedselsdato: '2026-01-01' },
    ]
  },
  {
    nr: '41', navne: 'Stefan V. Olsen',
    adresse: 'Vejledalen 25 K\n2635 Ishøj',
    tlf: '', mobil: '', email: 'stef@ishoejby.dk',
    personer: [
      { navn: 'Stefan Vormslev Olsen', foedselsdato: '27/05/1973' },
    ]
  },
  {
    nr: '42', navne: 'Jacob P. Olsen & Annemette Jensen',
    adresse: 'Kirkevej 46\n6980 Tim',
    tlf: '', mobil: '40250264', email: 'jacob1304@ofir.dk',
    personer: [
      { navn: 'Jacob Præstegaard Olsen', foedselsdato: '13/04/1982' },
      { navn: 'Annemette Jensen', foedselsdato: '01/06/1979' },
    ]
  },
  {
    nr: '43', navne: 'Tom & Margit Olsen',
    adresse: 'Langsigparken 43\n6740 Bramming',
    tlf: '', mobil: '40412510', email: 'Martomolsen@mail.dk',
    personer: [
      { navn: 'Tom Olsen', foedselsdato: '2026-01-01' },
      { navn: 'Margit Olsen', foedselsdato: '2026-01-01' },
    ]
  },
  {
    nr: '44', navne: 'Michael Baldersø & Matilde Nonboe Nielsen',
    adresse: 'Sankt Hans Gade 24. 2 tv.\n4000 Roskilde',
    tlf: '', mobil: '22348005', email: 'vormslev@hotmail.com',
    personer: [
      { navn: 'Michael Vormslev Baldersø', foedselsdato: '23/01/1985' },
      { navn: 'Matilde Nonboe Nielsen', foedselsdato: '2026-01-01' },
    ]
  },
  {
    nr: '45', navne: 'Flemming Lund & Alba',
    adresse: '', tlf: '', mobil: '', email: '',
    personer: [
      { navn: 'Flemming Lund', foedselsdato: '01/02/1972' },
      { navn: 'Alba Lund', foedselsdato: '2026-01-01' },
      { navn: 'Amaliea Sofie Lund', foedselsdato: '23/11/2004' },
    ]
  },
  {
    nr: '46', navne: 'Anders & Mie Bierbaum',
    adresse: 'Herles 9\n6300 Gråsten',
    tlf: '', mobil: '21901455', email: 'andersbierbaum@gmail.com',
    personer: [
      { navn: 'Anders Bierbaum', foedselsdato: '12/10/1982' },
      { navn: 'Mie Bierbaum', foedselsdato: '22/12/1985' },
      { navn: 'Noa B. Mikkelsen', foedselsdato: '13/02/2012' },
      { navn: 'Malte Christian Bierbaum', foedselsdato: '14/08/2014' },
      { navn: 'Luna Marie Bierbaum', foedselsdato: '12/07/2019' },
    ]
  },
  {
    nr: '47', navne: 'Mette W. Hansen',
    adresse: 'Hollændervej 1. 3tv.\n6000 Kolding',
    tlf: '', mobil: '30496506', email: 'wh.mette@gmail.com',
    personer: [
      { navn: 'Mette Westergaard Hansen', foedselsdato: '05/06/1989' },
    ]
  },
  {
    nr: '48', navne: 'Sanne Gram Fadel',
    adresse: 'Byvej 40\n2650 Hvidovre',
    tlf: '', mobil: '', email: '',
    personer: [
      { navn: 'Sanne Gram Fadel', foedselsdato: '02/10/1975' },
      { navn: 'Nano Fadel', foedselsdato: '06/03/1974' },
      { navn: 'Emma Gram Fadel', foedselsdato: '12/03/2012' },
    ]
  },
  {
    nr: '49', navne: 'Elsebeth & Bent Rasmussen',
    adresse: 'Østergården 22. st.tv.\n2635 Ishøj',
    tlf: '43733736', mobil: '', email: 'bjrebr45@gmail.com / ebrbjr48@gmail.com',
    personer: [
      { navn: 'Elsebeth Rasmussen', foedselsdato: '18/02/1948' },
      { navn: 'Bent Rasmussen', foedselsdato: '15/02/1945' },
    ]
  },
  {
    nr: '50', navne: 'Morten P. Olsen',
    adresse: 'Smedegade 9. 1\n6950 Ringkøbing',
    tlf: '', mobil: '22377420', email: '',
    personer: [
      { navn: 'Morten Præstegaard Olsen', foedselsdato: '11/05/1991' },
      { navn: 'Diana Larsen', foedselsdato: '01/05/1992' },
    ]
  },
  {
    nr: '51', navne: 'Kristine Hernvig & Lars Jørgensen',
    adresse: 'Platanvej 21\n3600 Frederikssund',
    tlf: '47385695', mobil: '', email: '',
    personer: [
      { navn: 'Kristine Vormslev Hernvig', foedselsdato: '26/05/1981' },
      { navn: 'Martin Hernvig', foedselsdato: '06/10/1977' },
      { navn: 'Tricia Vormslev Hernvig', foedselsdato: '02/09/2005' },
      { navn: 'Milia V. Hernvig', foedselsdato: '14/07/2009' },
    ]
  },
  {
    nr: '52', navne: 'Rikke V. Tingberg & Benjamin Bidstrup',
    adresse: 'Ravnekærsvej 16\n2870 Dyssegård',
    tlf: '35395757', mobil: '28122903', email: 'rikke.tingberg@gmail.com',
    personer: [
      { navn: 'Rikke Vormslev Tingberg', foedselsdato: '09/02/1979' },
      { navn: 'Benjamin Bidstrup', foedselsdato: '27/06/1973' },
      { navn: 'Vigga Vormslev Bidstrup', foedselsdato: '28/04/2007' },
      { navn: 'Lyda Vormslev Bidstrup', foedselsdato: '27/02/2010' },
    ]
  },
  {
    nr: '53', navne: 'Katja V. Kanstrup & Kim Kanstrup',
    adresse: 'Hjørnekilden 8 Svogerslev\n4000 Roskilde',
    tlf: '', mobil: '', email: 'kim-katja@mail.dk',
    personer: [
      { navn: 'Katja Vormslev Kanstrup', foedselsdato: '06/05/1975' },
      { navn: 'Kim Kanstrup', foedselsdato: '06/02/1974' },
      { navn: 'Dicte Vormslev Kanstrup', foedselsdato: '12/03/2001' },
      { navn: 'Bertram Vormslev Kanstrup', foedselsdato: '11/06/2003' },
      { navn: 'Astrid Vormslev Kanstrup', foedselsdato: '23/04/2007' },
    ]
  },
  {
    nr: '54', navne: 'Kasper V. Olsen',
    adresse: 'Tyreløkke 16\n4622 Havdrup',
    tlf: '', mobil: '', email: 'kvo@tkeas.dk',
    personer: [
      { navn: 'Kasper Vormslev Olsen', foedselsdato: '12/01/1972' },
      { navn: 'Jeanna B. Olsen', foedselsdato: '19/03/1980' },
      { navn: 'Alexander Vormslev Falsing', foedselsdato: '29/12/1992' },
      { navn: 'Benjamin Vormslev Falsing', foedselsdato: '22/02/1996' },
      { navn: 'Jonathan Vormslev Falsing', foedselsdato: '25/01/2002' },
      { navn: 'Valdemar Brendstrup', foedselsdato: '14/04/2006' },
      { navn: 'Silke Brendstrup', foedselsdato: '20/03/2008' },
    ]
  },
  {
    nr: '55', navne: 'Trine Gram',
    adresse: 'Stenderupgade 10. st.th.\n1738 København V.',
    tlf: '', mobil: '', email: '',
    personer: [
      { navn: 'Trine Gram', foedselsdato: '2026-01-01' },
    ]
  },
];

// ─── Byg Firestore-dokumenter ────────────────────────────────────────────────

function byggDokument(fam) {
  const adresseInfo = parseAdresse(fam.adresse);
  const adresse = fam.adresse.replace('\n', '\n');

  const familiemedlemmer = fam.personer.map(p => {
    const dato = p.foedselsdato.includes('/') ? parseDato(p.foedselsdato) : p.foedselsdato;
    return {
      navn: p.navn,
      foedselsdato: dato,
      rolle: 'forælder',  // default
      email: '',
      mobil: '',
    };
  });

  // Marker børn (født efter 1995 som standard)
  const idag = 2025;
  familiemedlemmer.forEach(m => {
    const aar = parseInt(m.foedselsdato.substring(0, 4));
    if (aar >= 1995) {
      const aldersForForaelderCheck = idag - aar;
      // Hvis der er en forælder i listen, og denne er yngre end 30, er det et barn
    }
    if (aar > 2000) m.rolle = 'barn';
  });

  return {
    nr: fam.nr,
    navne: fam.navne,
    fornavn: fam.navne,
    efternavn: '',
    vej: adresseInfo.vej,
    postnummer: adresseInfo.postnummer,
    by: adresseInfo.by,
    adresse: fam.adresse,
    tlf: fam.tlf || '',
    mobil: fam.mobil || '',
    email: fam.email || '',
    kode: '',
    familiemedlemmer,
    begivenheder: [],
  };
}

// ─── Sammenlign med eksisterende Firestore-data ───────────────────────────────

function sammenlign(pdfFamilier, firestoreFamilier) {
  const fsMap = {};
  firestoreFamilier.forEach(f => { fsMap[f.nr || f.id] = f; });

  const afvigelser = [];

  for (const pdf of pdfFamilier) {
    const fs = fsMap[pdf.nr];
    if (!fs) {
      afvigelser.push({
        nr: pdf.nr,
        type: 'MANGLER I DATABASE',
        felt: 'alle',
        pdf_vaerdi: pdf.navne,
        db_vaerdi: '',
        note: `Familie "${pdf.navne}" er ikke i Firestore`,
      });
      continue;
    }

    // Tjek email
    const pdfEmail = (pdf.email || '').replace(/\s/g, '').toLowerCase();
    const dbEmail = (fs.email || '').replace(/\s/g, '').toLowerCase();
    if (pdfEmail !== dbEmail) {
      afvigelser.push({
        nr: pdf.nr, type: 'FORSKEL', felt: 'email',
        pdf_vaerdi: pdf.email, db_vaerdi: fs.email,
        note: `E-mail i PDF og database er forskellig`,
      });
    }

    // Tjek adresse
    const pdfVej = (pdf.adresse || '').split('\n')[0].trim();
    const dbVej = (fs.vej || fs.adresse || '').split('\n')[0].trim();
    if (pdfVej && dbVej && pdfVej.toLowerCase() !== dbVej.toLowerCase()) {
      afvigelser.push({
        nr: pdf.nr, type: 'FORSKEL', felt: 'adresse',
        pdf_vaerdi: pdfVej, db_vaerdi: dbVej,
        note: `Adresse er forskellig`,
      });
    }

    // Tjek familiemedlemmer
    const dbMedl = (fs.familiemedlemmer || []);
    if (dbMedl.length === 0 && pdf.personer.length > 0) {
      afvigelser.push({
        nr: pdf.nr, type: 'MANGLER FAMILIEMEDLEMMER', felt: 'familiemedlemmer',
        pdf_vaerdi: pdf.personer.map(p => p.navn).join('; '),
        db_vaerdi: '(tom)',
        note: `Ingen familiemedlemmer i databasen`,
      });
    }
  }

  // Find numre i Firestore der ikke er i PDF
  for (const fs of firestoreFamilier) {
    const nr = fs.nr || fs.id;
    const pdfMatch = pdfFamilier.find(p => p.nr === nr);
    if (!pdfMatch) {
      afvigelser.push({
        nr, type: 'EKSTRA I DATABASE',
        felt: 'alle', pdf_vaerdi: '',
        db_vaerdi: fs.navne || fs.fornavn || nr,
        note: `Nummer ${nr} er i databasen men ikke i PDF`,
      });
    }
  }

  return afvigelser;
}

// ─── Skriv CSV ────────────────────────────────────────────────────────────────

function skrivCsv(afvigelser, fil) {
  const header = 'Nr.;Type;Felt;PDF-værdi;Database-værdi;Note';
  const linjer = afvigelser.map(a =>
    [a.nr, a.type, a.felt, a.pdf_vaerdi, a.db_vaerdi, a.note]
      .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
      .join(';')
  );
  fs.writeFileSync(fil, '﻿' + [header, ...linjer].join('\n'), 'utf8');
}

// ─── Firestore upload ─────────────────────────────────────────────────────────

function loadFirebaseRefreshToken() {
  const os = require('os');
  const cfgPath = require('path').join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const cfg = JSON.parse(require('fs').readFileSync(cfgPath, 'utf8'));
  return cfg.tokens.refresh_token;
}

async function getToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: loadFirebaseRefreshToken(),
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    });
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const parsed = JSON.parse(d);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(JSON.stringify(parsed)));
      });
    });
    req.write(body); req.end();
  });
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

async function upsertDocument(token, projectId, collection, docId, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(toFirestoreDoc(data));
    const path = `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
    const req = https.request({
      hostname: 'firestore.googleapis.com', path, method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const result = JSON.parse(d);
        if (result.error) reject(new Error(JSON.stringify(result.error)));
        else resolve(result);
      });
    });
    req.write(body); req.end();
  });
}

// ─── Hoved ───────────────────────────────────────────────────────────────────

async function main() {
  const projektDir = __dirname;
  const eksisterendeFil = path.join(projektDir, 'membres_export.json');

  // 1. Byg nye dokumenter fra PDF
  const nyeFamilier = PDF_FAMILIER.map(byggDokument);
  fs.writeFileSync(
    path.join(projektDir, 'membres_fra_pdf.json'),
    JSON.stringify(nyeFamilier, null, 2), 'utf8'
  );
  console.log(`\n✓ membres_fra_pdf.json skrevet (${nyeFamilier.length} familier)`);

  // 2. Sammenlign med eksisterende
  const eksisterende = JSON.parse(fs.readFileSync(eksisterendeFil, 'utf8'));
  const afvigelser = sammenlign(PDF_FAMILIER, eksisterende);
  const csvFil = path.join(projektDir, 'afvigelser_membres.csv');
  skrivCsv(afvigelser, csvFil);
  console.log(`✓ afvigelser_membres.csv skrevet (${afvigelser.length} afvigelser)`);

  // Udskriv oversigt
  console.log('\n=== AFVIGELSER ===');
  afvigelser.forEach(a => console.log(`  [${a.nr}] ${a.type}: ${a.note}`));

  // 3. Upload til Firestore
  console.log('\nHenter access token...');
  const token = await getToken();
  console.log('Token OK. Uploader til Firestore membres-samling...');

  let ok = 0, fejl = 0;
  for (const fam of nyeFamilier) {
    try {
      await upsertDocument(token, 'olsenklanen-familieside', 'membres', fam.nr, fam);
      process.stdout.write('.');
      ok++;
    } catch (e) {
      console.error(`\nFEJL ved nr ${fam.nr}:`, e.message);
      fejl++;
    }
  }

  console.log(`\n\n✓ Firestore opdateret: ${ok} familier uploadet, ${fejl} fejl`);
  console.log('\nFÆRDIG! Åbn afvigelser_membres.csv i Excel for at se sammenligning.');
}

main().catch(console.error);
