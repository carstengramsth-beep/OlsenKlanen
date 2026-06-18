// ════════════════════════════════════════════════════════════════
//  besoegstaeller.js  —  OlsenKlanen
//  Viser tre tal i en boks paa forsiden:
//    • Aktive lige nu   (livstegn de sidste 3 min)
//    • Besoeg i dag     (unikke medlemmer i dag, 1 pr. dag)
//    • Besoeg i alt     (alle dage lagt sammen)
//  INGEN navne gemmes. Kun anonyme markoerer og tal.
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
function minMarkoer() {
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

// ── Hjaelp: skriv tal i boksen hvis elementet findes ──
function saetTal(id, vaerdi) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = vaerdi;
  el.className = "tavle-tal-tal" + (id === "besoeg-ialt" ? " ialt" : "") + (vaerdi === 0 ? " nul" : "");
}
