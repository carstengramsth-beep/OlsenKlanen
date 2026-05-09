// ret_esther.js
// Flytter Esther Betty Gram fra familie 8 til familie 55 med undernummer 55.1
// Retter Trine Grams rolle til forælder i familie 55
// Kør med: node ret_esther.js

const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const PROJECT_ID = 'olsenklanen-familieside';
const BASE_PATH  = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/membres`;

function loadRefreshToken() {
  const p = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  const tok = cfg?.tokens?.refresh_token;
  if (!tok) throw new Error('Ingen refresh_token');
  return tok;
}

function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    if (data) { options.headers = options.headers || {}; options.headers['Content-Length'] = data.length; }
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

async function getAccessToken(tok) {
  const r = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: tok, grant_type: 'refresh_token',
  });
  if (!r.body.access_token) throw new Error('Ingen access_token: ' + JSON.stringify(r.body));
  return r.body.access_token;
}

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

function parseFsVal(val) {
  if (!val) return null;
  if (val.stringValue   !== undefined) return val.stringValue;
  if (val.integerValue  !== undefined) return parseInt(val.integerValue);
  if (val.doubleValue   !== undefined) return parseFloat(val.doubleValue);
  if (val.booleanValue  !== undefined) return val.booleanValue;
  if (val.nullValue     !== undefined) return null;
  if (val.mapValue      !== undefined) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) obj[k] = parseFsVal(v);
    return obj;
  }
  if (val.arrayValue !== undefined) return (val.arrayValue.values || []).map(parseFsVal);
  return val;
}

async function getDoc(token, docId) {
  return httpReq({
    hostname: 'firestore.googleapis.com', path: `${BASE_PATH}/${docId}`, method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
}

async function patchField(token, docId, fieldName, value) {
  const p = `${BASE_PATH}/${docId}?updateMask.fieldPaths=${encodeURIComponent(fieldName)}`;
  return httpReq({
    hostname: 'firestore.googleapis.com', path: p, method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
  }, { fields: { [fieldName]: toFsVal(value) } });
}

async function main() {
  console.log('Henter access token...');
  const token = await getAccessToken(loadRefreshToken());
  console.log('Token OK\n');

  // ── Hent familie 8 ─────────────────────────────────────────────────────────
  process.stdout.write('Henter familie 8... ');
  const doc8 = await getDoc(token, '8');
  if (doc8.status >= 400) { console.log('FEJL:', doc8.body?.error?.message); process.exit(1); }
  console.log('OK');

  const medl8 = (doc8.body.fields?.familiemedlemmer?.arrayValue?.values || []).map(parseFsVal);

  const estherIdx = medl8.findIndex(m => (m.navn || '').toLowerCase().includes('esther'));
  if (estherIdx < 0) {
    console.log('⚠  Esther ikke fundet i familie 8 — allerede flyttet?');
  }

  const esther = estherIdx >= 0 ? medl8[estherIdx] : null;
  const nyMedl8 = medl8.filter((_, i) => i !== estherIdx);

  // ── Fjern Esther fra familie 8 ─────────────────────────────────────────────
  if (esther) {
    process.stdout.write('Fjerner Esther fra familie 8... ');
    const r = await patchField(token, '8', 'familiemedlemmer', nyMedl8);
    if (r.status >= 400) { console.log('FEJL:', r.body?.error?.message); process.exit(1); }
    console.log('OK');
    console.log('  Esther:', JSON.stringify(esther));
  }

  // ── Hent familie 55 ────────────────────────────────────────────────────────
  process.stdout.write('\nHenter familie 55... ');
  const doc55 = await getDoc(token, '55');
  if (doc55.status >= 400) { console.log('FEJL:', doc55.body?.error?.message); process.exit(1); }
  console.log('OK');

  const medl55 = (doc55.body.fields?.familiemedlemmer?.arrayValue?.values || []).map(parseFsVal);
  console.log('  Nuværende medlemmer i familie 55:');
  medl55.forEach((m, i) => console.log(`    ${i}: ${m.navn} (${m.rolle}, ${m.foedselsdato}, undernummer: ${m.undernummer || '—'})`));

  // ── Opdater Trine Grams rolle til forælder + tilføj Esther ─────────────────
  const nyMedl55 = medl55.map(m =>
    m.navn === 'Trine Gram' ? { ...m, rolle: 'forælder' } : m
  );

  // Tilføj Esther kun hvis hun ikke allerede er der
  const estherFindes55 = nyMedl55.some(m => (m.navn || '').toLowerCase().includes('esther'));
  if (!estherFindes55) {
    const esterObj = {
      navn: 'Esther Betty Gram',
      foedselsdato: '2018-07-05',
      rolle: 'barn',
      email: '',
      mobil: '',
      undernummer: '55.1',
      godkendt: false
    };
    nyMedl55.push(esterObj);
    console.log('\n  Tilføjer Esther med undernummer 55.1');
  } else {
    console.log('\n  Esther allerede i familie 55');
  }

  process.stdout.write('Opdaterer familie 55... ');
  const r55 = await patchField(token, '55', 'familiemedlemmer', nyMedl55);
  if (r55.status >= 400) { console.log('FEJL:', r55.body?.error?.message); process.exit(1); }
  console.log('OK');

  console.log('\n=== RESULTAT ===');
  console.log(`Familie 8:  ${nyMedl8.length} medlemmer (Esther fjernet)`);
  console.log(`Familie 55: ${nyMedl55.length} medlemmer (Trine→forælder, Esther tilføjet med 55.1)`);
}

main().catch(e => { console.error('FEJL:', e.message); process.exit(1); });
