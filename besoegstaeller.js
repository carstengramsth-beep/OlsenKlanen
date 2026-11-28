// ════════════════════════════════════════════════════════════════
//  besoegstaeller.js  —  OlsenKlanen
//  Viser tre tal i en boks paa forsiden:
//    • Aktive lige nu   (livstegn de sidste 3 min)
//    • Besoeg i dag     (unikke medlemmer i dag, 1 pr. dag)
//    • Besoeg i alt     (alle dage lagt sammen)
//  INGEN navne gemmes. Kun anonyme markoerer og tal.
//  Fra 28-11-2026 er markoeren en kode ud fra medlemsnummeret (1 pr. medlem).
//
//  VIGTIGT: bruger NAVNGIVEN Firebase-app ("okBesoeg") saa den
//  ikke kolliderer med sidens egen default-app (samme laering
//  som post-varsel.js).
// ════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, onValue, set, remove, onDisconnect, serverTimestamp, get, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU",
  authDomain: "olsenklanen-familieside.firebaseapp.com",
  databaseURL: "https://olsenklanen-familieside-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olsenklanen-familieside",
  storageBucket: "olsenklanen-familieside.firebasestorage.app",
  messagingSenderId: "640843662410",
  appId: "1:640843662410:web:e749b77ec9271e75c4d2b3"
};

// Navngiven app — kolliderer ikke med sidens default-app
const okBesoegApp = initializeApp(firebaseConfig, "okBesoeg");
const bdb = getDatabase(okBesoegApp);

// ── Hjaelp: dagens dato som "2026-06-18" (dansk tid, robust) ──
function iDagKey() {
  const d = new Date();
  const aar = d.getFullYear();
  const maaned = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return aar + "-" + maaned + "-" + dag;
}

// ── Hvem er jeg? (kun til at undgaa dobbelttaelling — aldrig vist) ──
// Bruger e-mail fra login hvis den findes, ellers en tilfaeldig markoer
// gemt i denne browser. Ingen navne gemmes i databasen.
// Fra 28-11-2026: er man logget ind med medlemsnummer, bruges en kode lavet ud fra nummeret
// ("n_" + tal). Så tæller et medlem kun én gang, uanset mobil eller computer. Ingen navne.
function nrKode(nr) {
  let h = 2166136261;                                   // FNV-1a – laver nummeret om til en kode
  const t = "olsenklanen|" + String(nr).trim().toUpperCase();
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return "n_" + (h >>> 0).toString(36);
}
function minMarkoer() {
  const nr = sessionStorage.getItem("ok_nr") || localStorage.getItem("ok_nr") || "";
  const niveau = (sessionStorage.getItem("ok_niveau") || localStorage.getItem("ok_niveau") || "").toLowerCase();
  if (nr.trim() && niveau !== "gaest") return nrKode(nr);
  let m = sessionStorage.getItem("ok_email");
  if (m && m.trim()) return "m_" + btoa(unescape(encodeURIComponent(m.trim()))).replace(/[^a-zA-Z0-9]/g, "");
  let g = localStorage.getItem("ok_besoeg_id");
  if (!g) {
    g = "g_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("ok_besoeg_id", g);
  }
  return g;
}

const markoer = minMarkoer();
const dag = iDagKey();
const AKTIV_VINDUE = 3 * 60 * 1000; // 3 minutter regnes som "lige nu"

// ════════════════════════════════════════════════════════════════
//  1) AKTIVE LIGE NU  —  livstegn under /besoeg/aktive/<markoer>
// ════════════════════════════════════════════════════════════════
const minAktiveRef = ref(bdb, "besoeg/aktive/" + markoer);

function meldAktiv() {
  set(minAktiveRef, Date.now()).catch(() => {});
}
// Fjern mig hvis fanen lukkes / mister forbindelse
onDisconnect(minAktiveRef).remove();
meldAktiv();
// Forny livstegn hvert minut
setInterval(meldAktiv, 60 * 1000);
// Sidste forsoeg paa at rydde op naar siden forlades
window.addEventListener("pagehide", () => { remove(minAktiveRef).catch(() => {}); });

// Lyt og vis tallet (taeller kun dem med friskt livstegn)
const alleAktiveRef = ref(bdb, "besoeg/aktive");
onValue(alleAktiveRef, (snap) => {
  const naa = Date.now();
  let antal = 0;
  snap.forEach((barn) => {
    const t = barn.val();
    if (typeof t === "number" && (naa - t) < AKTIV_VINDUE) antal++;
  });
  saetTal("besoeg-nu", antal);
});

// ════════════════════════════════════════════════════════════════
//  2) BESOEG I DAG  —  1 pr. markoer pr. dag
//     /besoeg/dage/<dag>/medlemmer/<markoer> = true
//     /besoeg/dage/<dag>/antal               = optaelling
//     /besoeg/total                          = alle dage lagt sammen
// ════════════════════════════════════════════════════════════════
async function registrerDagsBesoeg() {
  const medlemRef = ref(bdb, "besoeg/dage/" + dag + "/medlemmer/" + markoer);
  try {
    const findes = await get(medlemRef);
    if (findes.exists()) return; // allerede talt i dag
    await set(medlemRef, true);
    // Hæv dagens tal og totalen (atomisk)
    await runTransaction(ref(bdb, "besoeg/dage/" + dag + "/antal"), (n) => (n || 0) + 1);
    await runTransaction(ref(bdb, "besoeg/total"), (n) => (n || 0) + 1);
  } catch (e) { /* stille fejl — tælleren maa aldrig braekke siden */ }
}
registrerDagsBesoeg();

// Vis dagens tal
onValue(ref(bdb, "besoeg/dage/" + dag + "/antal"), (snap) => {
  saetTal("besoeg-idag", snap.val() || 0);
});
// Vis total
onValue(ref(bdb, "besoeg/total"), (snap) => {
  saetTal("besoeg-ialt", snap.val() || 0);
});

// ════════════════════════════════════════════════════════════════
//  4) FORSKELLIGE BESOEGENDE DE SIDSTE 30 DAGE
//     Taeller hvor mange FORSKELLIGE markoerer der har vaeret paa siden
//     i de sidste 30 dage. Stadig uden navne – kun et antal.
//     (En person paa baade mobil og computer uden login-mail kan taelle 2 gange,
//      og en husstand med faelles mail kan taelle som 1.)
// ════════════════════════════════════════════════════════════════
async function visForskellige30() {
  const el = document.getElementById("besoeg-30");
  if (!el) return;
  try {
    const snap = await get(ref(bdb, "besoeg/dage"));
    const graense = new Date(); graense.setDate(graense.getDate() - 29);
    const fraDag = graense.getFullYear() + "-" + String(graense.getMonth() + 1).padStart(2, "0") + "-" + String(graense.getDate()).padStart(2, "0");
    const forskellige = new Set();
    snap.forEach(dagSnap => {
      if (dagSnap.key < fraDag) return;
      const m = dagSnap.child("medlemmer");
      m.forEach(x => { forskellige.add(x.key); });
    });
    saetTal("besoeg-30", forskellige.size);

    // ── Besøg i år og sidste år (til sammenligning) ──
    // Et besøg = én markør på én dag (samme som "Besøg i dag").
    const iAar = new Date().getFullYear();
    const iDagMD = iDagKey().slice(5);                       // "MM-DD" – til "samme periode sidste år"
    const aar = {};                                          // år → { besoeg, forskellige:Set, mail:Set, nr:Set, tilSammeDag }
    snap.forEach(dagSnap => {
      const y = +String(dagSnap.key).slice(0, 4);
      if (!y) return;
      const a = aar[y] || (aar[y] = { besoeg: 0, forskellige: new Set(), mail: new Set(), nr: new Set(), tilSammeDag: 0 });
      let n = 0;
      dagSnap.child("medlemmer").forEach(x => {
        n++; a.forskellige.add(x.key);
        if (x.key.startsWith("m_")) a.mail.add(x.key);       // login-mail: hver er mindst én rigtig person
        if (x.key.startsWith("n_")) a.nr.add(x.key);         // medlemsnummer: præcis én person
      });
      a.besoeg += n;
      if (String(dagSnap.key).slice(5) <= iDagMD) a.tilSammeDag += n;
    });
    window.BESOEG_AAR = { aar, iAar };
    window.opdaterBesoegsTabel();
  } catch (e) { el.textContent = "–"; }
}
visForskellige30();

// Tabel: én kolonne pr. år, nyeste til venstre (højst 3 år).
// Til og med 2026 kunne samme person tælle flere gange → "ca." og for "forskellige" et interval:
//   mindst = flest forskellige login-mails eller medlemsnumre (hver er mindst én person)
//   højst  = antal forskellige markører, dog aldrig flere end der er aktive medlemmer i kartoteket
window.opdaterBesoegsTabel = function () {
  const tabel = document.getElementById("besoeg-tabel");
  if (!tabel || !window.BESOEG_AAR) return;
  const { aar, iAar } = window.BESOEG_AAR;
  const aarListe = Object.keys(aar).map(Number).filter(y => y <= iAar).sort((x, y) => y - x).slice(0, 3);
  if (!aarListe.includes(iAar)) aarListe.unshift(iAar);
  const v = y => aar[y] || { besoeg: 0, forskellige: new Set(), mail: new Set(), nr: new Set(), tilSammeDag: 0 };
  const ca = y => y <= 2026 ? "ca. " : "";
  const forskellige = y => {
    const a = v(y);
    if (y > 2026) return String(a.nr.size || a.forskellige.size);
    const mindst = Math.max(a.mail.size, a.nr.size);
    let hoejst = a.forskellige.size;
    if (window.OLSEN_ANTAL_MEDLEMMER) hoejst = Math.min(hoejst, window.OLSEN_ANTAL_MEDLEMMER);
    return mindst && mindst < hoejst ? "mellem " + mindst + " og " + hoejst : "ca. " + hoejst;
  };
  tabel.querySelector("thead tr").innerHTML = "<th></th>" + aarListe.map(y => "<th>" + y + "</th>").join("");
  const rk = tabel.querySelectorAll("tbody tr");
  rk[0].innerHTML = "<td>Besøg i alt i året</td>" + aarListe.map(y => "<td" + (y < iAar ? " title=\"Til samme dag: " + ca(y) + v(y).tilSammeDag + "\"" : "") + ">" + ca(y) + v(y).besoeg + "</td>").join("");
  // "Forskellige medlemmer i året" vises først fra 2027 – for 2026 kan det ikke opgøres (samme person kunne tælle flere gange)
  const visForskellige = aarListe.some(y => y > 2026);
  rk[1].style.display = visForskellige ? "" : "none";
  rk[1].innerHTML = "<td>Forskellige medlemmer i året</td>" + aarListe.map(y => "<td>" + (y > 2026 ? String(v(y).nr.size || v(y).forskellige.size) : "–") + "</td>").join("");
  const note = document.getElementById("besoeg-note");
  if (note) note.style.display = aarListe.some(y => y <= 2026) ? "" : "none";
};

// ── Hjaelp: skriv tal i boksen hvis elementet findes ──
function saetTal(id, vaerdi) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = vaerdi;
  el.className = "tavle-tal-tal" + (id === "besoeg-ialt" ? " ialt" : "") + (vaerdi === 0 ? " nul" : "");
}
