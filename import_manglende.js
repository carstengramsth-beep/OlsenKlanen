// import_manglende.js
// Tilføjer manglende familier + Esther Betty Gram til Firestore membres-samling
// Kør med: node import_manglende.js

const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const PROJECT_ID = 'olsenklanen-familieside';
const COLLECTION = 'membres';
const BASE      = `firestore.googleapis.com`;
const BASE_PATH = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;

// Fra afvigelser_membres.csv: familier der mangler fuldstændigt i Firestore
const MANGLER_I_DB = new Set([
  '4','10','11','12','13','14','15','16','17',
  '20','21','22','23','24','26','27','28','29',
  '30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48','49',
  '50','51','52','53','54','55'
]);

// Esther Betty Gram mangler i familie 8
const ESTHER = {
  navn: 'Esther Betty Gram',
  foedselsdato: '2018-07-05',
  rolle: 'barn',
  email: '',
  mobil: '',
  godkendt: false
};

// ─── HTTP helpers ──────────────────────────────────────────────────────────────
function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    if (data) {
      options.headers = options.headers || {};
      options.headers['Content-Length'] = data.length;
    }
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function loadRefreshToken() {
  const p = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(p)) throw new Error('Firebase-tools config ikke fundet: ' + p);
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  const tok = cfg?.tokens?.refresh_token;
  if (!tok) throw new Error('Ingen refresh_token i ' + p);
  return tok;
}

async function getAccessToken(refreshToken) {
  const res = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  if (!res.body.access_token) throw new Error('Ingen access_token: ' + JSON.stringify(res.body));
  return res.body.access_token;
}

// ─── Firestore konvertering ─────────────────────────────────────────────────────
function toFsVal(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean')          return { booleanValue: val };
  if (typeof val === 'number')           return Number.isInteger(val) ? { integerValue: val } : { doubleValue: val };
  if (typeof val === 'string')           return { stringValue: val };
  if (Array.isArray(val))               return { arrayValue: { values: val.map(toFsVal) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFsVal(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFsDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFsVal(v);
  return { fields };
}

function parseFsVal(val) {
  if (!val) return null;
  if (val.stringValue   !== undefined) return val.stringValue;
  if (val.integerValue  !== undefined) return parseInt(val.integerValue);
  if (val.doubleValue   !== undefined) return parseFloat(val.doubleValue);
  if (val.booleanValue  !== undefined) return val.booleanValue;
  if (val.nullValue     !== undefined) return null;
  if (val.timestampValue!== undefined) return val.timestampValue;
  if (val.mapValue      !== undefined) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) obj[k] = parseFsVal(v);
    return obj;
  }
  if (val.arrayValue !== undefined) return (val.arrayValue.values || []).map(parseFsVal);
  return val;
}

// ─── Firestore PATCH (opretter hvis ikke eksisterer) ───────────────────────────
async function patchDoc(token, docId, data, maskFields) {
  let p = `${BASE_PATH}/${docId}`;
  if (maskFields && maskFields.length) {
    p += '?' + maskFields.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  }
  return httpReq({
    hostname: BASE, path: p, method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
  }, toFsDoc(data));
}

// ─── Firestore GET ──────────────────────────────────────────────────────────────
async function getDoc(token, docId) {
  return httpReq({
    hostname: BASE, path: `${BASE_PATH}/${docId}`, method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
}

// ─── Normaliser person fra PDF-format ──────────────────────────────────────────
function normMedlem(m) {
  return {
    navn: m.navn || '',
    foedselsdato: m.foedselsdato || '2026-01-01',
    rolle: m.rolle || 'forælder',
    email: m.email || '',
    mobil: m.mobil || '',
    godkendt: false
  };
}

// ─── MAIN ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Henter access token...');
  const token = await getAccessToken(loadRefreshToken());
  console.log('Token OK\n');

  const pdfData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'membres_fra_pdf.json'), 'utf8')
  );

  let oprettet = 0, opdateret = 0, fejl = 0;

  // ── 1. Tilføj manglende familier ────────────────────────────────────────────
  console.log('=== 1/3  Opretter manglende familier ===');
  for (const fam of pdfData) {
    if (!MANGLER_I_DB.has(fam.nr)) continue;

    const docData = {
      nr:             fam.nr,
      navne:          fam.navne || fam.fornavn || '',
      fornavn:        fam.fornavn || '',
      efternavn:      fam.efternavn || '',
      adresse:        fam.adresse || '',
      vej:            fam.vej || '',
      postnummer:     fam.postnummer || '',
      by:             fam.by || '',
      tlf:            fam.tlf || '',
      mobil:          fam.mobil || '',
      email:          fam.email || '',
      familiemedlemmer: (fam.familiemedlemmer || []).map(normMedlem),
      begivenheder:   fam.begivenheder || []
    };

    process.stdout.write(`  Nr. ${fam.nr.padStart(2)} (${docData.navne})... `);
    const res = await patchDoc(token, fam.nr, docData);
    if (res.status >= 400) {
      console.log(`FEJL ${res.status}: ${res.body?.error?.message || JSON.stringify(res.body)}`);
      fejl++;
    } else {
      console.log('OK');
      oprettet++;
    }

    // Lille pause for at undgå rate-limit
    await new Promise(r => setTimeout(r, 120));
  }

  // ── 2. Familie 19: opdater familiemedlemmer ─────────────────────────────────
  console.log('\n=== 2/3  Familie 19 – tilføjer familiemedlemmer ===');
  const fam19 = pdfData.find(f => f.nr === '19');
  if (fam19) {
    const medl = (fam19.familiemedlemmer || []).map(normMedlem);
    process.stdout.write('  Nr. 19 (Jette & Tommy V. Olsen)... ');
    const res = await patchDoc(token, '19', { familiemedlemmer: medl }, ['familiemedlemmer']);
    if (res.status >= 400) {
      console.log(`FEJL ${res.status}: ${res.body?.error?.message || JSON.stringify(res.body)}`);
      fejl++;
    } else {
      console.log('OK');
      opdateret++;
    }
  }

  // ── 3. Familie 8: tilføj Esther Betty Gram ─────────────────────────────────
  console.log('\n=== 3/3  Familie 8 – tilføjer Esther Betty Gram ===');
  process.stdout.write('  Henter nr. 8... ');
  const doc8 = await getDoc(token, '8');
  if (doc8.status >= 400) {
    console.log(`FEJL: ${doc8.body?.error?.message}`);
    fejl++;
  } else {
    const currentMedl = (doc8.body.fields?.familiemedlemmer?.arrayValue?.values || [])
      .map(v => parseFsVal(v));
    const estherFindes = currentMedl.some(m => (m.navn || '').toLowerCase().includes('esther'));
    if (estherFindes) {
      console.log('\n  Esther Betty Gram er allerede i familie 8 — springer over.');
    } else {
      const nyMedl = [...currentMedl, ESTHER];
      process.stdout.write('tilføjer Esther... ');
      const res = await patchDoc(token, '8', { familiemedlemmer: nyMedl }, ['familiemedlemmer']);
      if (res.status >= 400) {
        console.log(`FEJL ${res.status}: ${res.body?.error?.message}`);
        fejl++;
      } else {
        console.log('OK');
        opdateret++;
      }
    }
  }

  console.log('\n=== RESULTAT ===');
  console.log(`Oprettet:   ${oprettet} (ud af ${MANGLER_I_DB.size} manglende)`);
  console.log(`Opdateret:  ${opdateret}`);
  console.log(`Fejl:       ${fejl}`);
}

main().catch(e => { console.error('\nUVENTET FEJL:', e.message); process.exit(1); });
