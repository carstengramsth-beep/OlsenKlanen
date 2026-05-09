// Eksporter membres-samlingen fra Firestore til JSON
// Kør med: node export_membres.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Hent refresh token fra firebase-tools config
const configPath = path.join(
  process.env.USERPROFILE || process.env.HOME,
  '.config', 'configstore', 'firebase-tools.json'
);

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens.refresh_token;

const PROJECT_ID = 'olsenklanen-familieside';
const COLLECTION = 'membres';
const OUTPUT_FILE = path.join(__dirname, 'membres_export.json');

function refreshAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi', // Firebase CLI client secret
    });

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error('Ingen access_token: ' + JSON.stringify(parsed)));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fetchPage(token, pageToken) {
  return new Promise((resolve, reject) => {
    let urlPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?pageSize=300`;
    if (pageToken) urlPath += `&pageToken=${pageToken}`;

    const options = {
      hostname: 'firestore.googleapis.com',
      path: urlPath,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue);
  if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.timestampValue !== undefined) return val.timestampValue;
  if (val.mapValue !== undefined) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  if (val.arrayValue !== undefined) {
    return (val.arrayValue.values || []).map(parseFirestoreValue);
  }
  return val;
}

function parseDocument(doc) {
  const id = doc.name.split('/').pop();
  const fields = {};
  for (const [key, val] of Object.entries(doc.fields || {})) {
    fields[key] = parseFirestoreValue(val);
  }
  return { id, ...fields };
}

async function main() {
  console.log('Henter ny access token...');
  let token;
  try {
    token = await refreshAccessToken(refreshToken);
    console.log('Token hentet OK');
  } catch (e) {
    console.error('Token fejl:', e.message);
    console.log('Prøver med eksisterende token...');
    token = config.tokens.access_token;
  }

  const allDocuments = [];
  let pageToken = null;
  let page = 1;

  do {
    console.log(`Henter side ${page}...`);
    const result = await fetchPage(token, pageToken);

    if (result.error) {
      console.error('Firestore fejl:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    const docs = result.documents || [];
    console.log(`  ${docs.length} dokumenter på side ${page}`);
    allDocuments.push(...docs.map(parseDocument));

    pageToken = result.nextPageToken || null;
    page++;
  } while (pageToken);

  console.log(`\nTotal: ${allDocuments.length} dokumenter`);

  // Sorter på familienummer, derefter efternavn
  allDocuments.sort((a, b) => {
    const famA = parseInt(a.familienummer || a.familieNummer || 9999);
    const famB = parseInt(b.familienummer || b.familieNummer || 9999);
    if (famA !== famB) return famA - famB;
    return (a.efternavn || '').localeCompare(b.efternavn || '', 'da');
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDocuments, null, 2), 'utf8');
  console.log(`\nGemt til: ${OUTPUT_FILE}`);

  // Print oversigt
  console.log('\n=== OVERSIGT ===');
  const fields = new Set();
  allDocuments.forEach(d => Object.keys(d).forEach(k => fields.add(k)));
  console.log('Felter fundet:', [...fields].sort().join(', '));
  console.log('\nFørste 5 poster:');
  allDocuments.slice(0, 5).forEach(d => {
    console.log(`  [${d.familienummer || d.familieNummer || '?'}] ${d.fornavn || ''} ${d.efternavn || ''} - ${d.foedselsdato || d.fødselsdato || 'ingen fødselsdato'}`);
  });
}

main().catch(console.error);
