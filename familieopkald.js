/* ════════════════════════════════════════════════════════════
   Familieopkald — ring direkte til et familiemedlem, der er på siden
   Indsættes på en side med:
     <script type="module" src="familieopkald.js"></script>

   • Melder dig som "aktiv", så længe du har siden åben (vmr_opkald/online)
   • Lytter efter opkald til dig (vmr_opkald/kald/<dit nr>)
   • Ved opkald: et lille bip og et vindue "X ringer til dig" → Tag den / Afvis
   • Tag den → familiechat.html?rum=... åbner video + chat (Jitsi)
   Intet gemmes: opkaldet slettes, når det er besvaret, afvist eller udløbet,
   og samtalen (video og chat) gemmes ikke nogen steder.

   Bruger en navngiven Firebase-app ("okOpkald"), så den ikke kolliderer
   med sidens egen app (samme læring som post-varsel.js).
   ════════════════════════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, remove, update, onValue, onDisconnect }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU",
  authDomain: "olsenklanen-familieside.firebaseapp.com",
  databaseURL: "https://olsenklanen-familieside-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olsenklanen-familieside",
  storageBucket: "olsenklanen-familieside.firebasestorage.app",
  messagingSenderId: "640843662410",
  appId: "1:640843662410:web:e749b77ec9271e75c4d2b3"
}, "okOpkald");
const db = getDatabase(app);

function hent(n){ return sessionStorage.getItem(n) || localStorage.getItem(n) || ""; }
const MIT_NR   = hent("ok_nr").trim();
const MIT_NAVN = hent("ok_navn").trim() || ("Medlem " + MIT_NR);
// Nøgle i databasen (punktum o.l. er ikke tilladt)
export function nrNoegle(nr){ return String(nr).replace(/[.#$\[\]\/]/g, "_"); }

const ER_GAEST = (hent("ok_niveau") || "").toLowerCase() === "gaest";
const UDLOEB_MS = 35 * 1000;   // et opkald ringer i højst 35 sekunder

if (MIT_NR && !ER_GAEST) {
  // ── 1) Jeg er aktiv ──
  const migRef = ref(db, "vmr_opkald/online/" + nrNoegle(MIT_NR));
  const meld = () => set(migRef, { nr: MIT_NR, navn: MIT_NAVN, tid: Date.now() }).catch(() => {});
  onValue(ref(db, ".info/connected"), s => { if (s.val()) { onDisconnect(migRef).remove(); meld(); } });
  setInterval(meld, 60 * 1000);
  window.addEventListener("pagehide", () => { remove(migRef).catch(() => {}); });

  // ── 2) Lyt efter opkald til mig ──
  const kaldRef = ref(db, "vmr_opkald/kald/" + nrNoegle(MIT_NR));
  let bipTimer = null;
  onValue(kaldRef, snap => {
    const k = snap.val();
    if (!k || k.svar || Date.now() - (k.tid || 0) > UDLOEB_MS) { skjulOpkald(); return; }
    visOpkald(k);
  });

  function visOpkald(k){
    // Er jeg allerede i en samtale? Så svares der "optaget"
    if (window.__okISamtale) { update(kaldRef, { svar: "optaget" }).catch(() => {}); return; }
    let boks = document.getElementById("ok-opkald");
    if (!boks) {
      const css = document.createElement("style");
      css.textContent = `
        #ok-opkald { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2147483646;
          display: flex; align-items: center; justify-content: center; padding: 16px; font-family: Georgia, serif; }
        #ok-opkald .boks { background: #fff; border-radius: 14px; padding: 26px 24px; max-width: 380px; width: 100%;
          text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.35); border-top: 8px solid #2d7a2d; }
        #ok-opkald .ikon { font-size: 46px; animation: okring 1s ease-in-out infinite; display: inline-block; }
        @keyframes okring { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
        #ok-opkald .hvem { font-size: 22px; color: #2d5016; font-weight: bold; margin: 8px 0 4px; }
        #ok-opkald .tekst { color: #666; margin-bottom: 18px; }
        #ok-opkald button { font-family: inherit; font-size: 17px; border: none; border-radius: 8px; padding: 12px 22px; margin: 0 6px; cursor: pointer; }
        #ok-opkald .ja { background: #2d7a2d; color: #fff; }
        #ok-opkald .nej { background: #b03030; color: #fff; }`;
      document.head.appendChild(css);
      boks = document.createElement("div");
      boks.id = "ok-opkald";
      document.body.appendChild(boks);
    }
    boks.innerHTML = `<div class="boks">
        <div class="ikon">📞</div>
        <div class="hvem"></div>
        <div class="tekst">ringer til dig</div>
        <button class="ja">📹 Tag den</button><button class="nej">Afvis</button>
      </div>`;
    boks.querySelector(".hvem").textContent = k.fraNavn || "Et familiemedlem";
    boks.querySelector(".ja").onclick = () => {
      update(kaldRef, { svar: "ja" }).catch(() => {});
      stopBip();
      location.href = "familiechat.html?rum=" + encodeURIComponent(k.rum) + "&med=" + encodeURIComponent(k.fraNavn || "");
    };
    boks.querySelector(".nej").onclick = () => {
      update(kaldRef, { svar: "nej" }).catch(() => {});
      setTimeout(() => remove(kaldRef).catch(() => {}), 3000);
      skjulOpkald();
    };
    boks.style.display = "flex";
    startBip();
    // Ringer ikke længere end UDLOEB_MS
    clearTimeout(window.__okOpkaldUdloeb);
    window.__okOpkaldUdloeb = setTimeout(skjulOpkald, Math.max(0, UDLOEB_MS - (Date.now() - (k.tid || 0))));
  }

  function skjulOpkald(){
    stopBip();
    const boks = document.getElementById("ok-opkald");
    if (boks) boks.style.display = "none";
  }

  // Et enkelt lille bip hvert 2,5 sekund, mens det ringer
  function bip(){
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.4);
      o.start(); o.stop(ac.currentTime + 0.45);
      setTimeout(() => ac.close().catch(() => {}), 800);
    } catch(e){}
  }
  function startBip(){ if (bipTimer) return; bip(); bipTimer = setInterval(bip, 2500); }
  function stopBip(){ if (bipTimer) { clearInterval(bipTimer); bipTimer = null; } }
}
