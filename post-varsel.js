/* ════════════════════════════════════════════════════════════
   OlsenPost — fælles post-varsel
   Lægger en gul linje øverst der glider frem, blinker, og glider væk.
   Vises på ENHVER side blot ved at indsætte:
     <script type="module" src="post-varsel.js"></script>
   Den dukker op igen med jævne mellemrum så længe der er ulæst post,
   og stopper når man er inde på OlsenPost (meddelelser.html).
   ════════════════════════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU",
  authDomain: "olsenklanen-familieside.firebaseapp.com",
  projectId: "olsenklanen-familieside",
  storageBucket: "olsenklanen-familieside.firebasestorage.app",
  messagingSenderId: "640843662410",
  appId: "1:640843662410:web:e749b77ec9271e75c4d2b3"
};

/* Vis ikke varsel på selve OlsenPost-siden */
const PAA_OLSENPOST = location.pathname.toLowerCase().indexOf("meddelelser") !== -1;

const MIT_NR = sessionStorage.getItem("ok_nr") || localStorage.getItem("ok_nr") || "";
if (MIT_NR && !PAA_OLSENPOST) {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => setTimeout(start, 800));
  else
    setTimeout(start, 800);
}

function start(){
  /* ── Stil til linjen ── */
  const css = document.createElement("style");
  css.textContent = `
    #ok-postvarsel {
      position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
      z-index: 2147483647 !important;
      transform: translateY(-140px); transition: transform 0.5s ease;
      display: flex !important; justify-content: center !important; pointer-events: none;
      font-family: Georgia, 'Times New Roman', serif !important; margin: 0 !important;
    }
    #ok-postvarsel.frem { transform: translateY(0); }
    #ok-postvarsel .indhold {
      pointer-events: auto;
      margin: 12px 20px; max-width: 1100px; width: 100%;
      background: #fff8e1; border: 2px solid #c89e3c; border-left: 8px solid #c89e3c;
      border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; gap: 14px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22); text-decoration: none; color: #5a4a1f;
    }
    #ok-postvarsel.blink .indhold { animation: okblink 0.6s ease-in-out 3; }
    @keyframes okblink {
      0%,100% { background:#fff8e1; }
      50%     { background:#ffe9a8; }
    }
    #ok-postvarsel .ikon { font-size: 28px; }
    #ok-postvarsel .tekst { font-size: 16px; font-weight: bold; flex: 1; }
    #ok-postvarsel .laes { font-size: 14px; font-style: italic; color: #8a7a3f; white-space: nowrap; }
  `;
  document.head.appendChild(css);

  /* ── Selve linjen ── */
  const wrap = document.createElement("div");
  wrap.id = "ok-postvarsel";
  wrap.innerHTML = `
    <a class="indhold" href="meddelelser.html">
      <span class="ikon">📬</span>
      <span class="tekst" id="ok-pv-tekst"></span>
      <span class="laes">Klik for at læse →</span>
    </a>`;
  document.body.appendChild(wrap);

  const app = initializeApp(firebaseConfig);
  const db  = getFirestore(app);

  let antalUlaeste = 0;
  let afsendere = [];
  let timer = null;

  const qy = query(collection(db, "olsenpost"), where("til", "array-contains", MIT_NR));
  onSnapshot(qy, snap => {
    const beskeder = snap.docs.map(d => d.data());
    const ulaeste = beskeder.filter(m => !(m.set_af||[]).includes(MIT_NR));
    antalUlaeste = ulaeste.length;
    afsendere = [...new Set(ulaeste.map(m => m.fra_navn).filter(Boolean))];
    if (antalUlaeste > 0) startCyklus();
    else stopCyklus();
  }, e => console.log("Postvarsel-fejl:", e));

  function byggTekst(){
    if (antalUlaeste === 1)
      return "Du har 1 ny besked i OlsenPost fra " + (afsendere[0] || "et medlem");
    return "Du har " + antalUlaeste + " nye beskeder i OlsenPost fra " + afsendere.join(", ");
  }

  function visEngang(){
    if (!document.body.contains(wrap)) document.body.appendChild(wrap);
    document.getElementById("ok-pv-tekst").textContent = byggTekst();
    wrap.classList.add("frem", "blink");
    // Stå fremme i 6 sekunder, glид så væk igen
    setTimeout(() => { wrap.classList.remove("frem"); wrap.classList.remove("blink"); }, 6000);
  }

  function startCyklus(){
    if (timer) return;          // kører allerede
    visEngang();                // vis med det samme
    timer = setInterval(visEngang, 25000);  // og igen hvert 25. sekund
  }

  function stopCyklus(){
    if (timer) { clearInterval(timer); timer = null; }
    wrap.classList.remove("frem", "blink");
  }
}
