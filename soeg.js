// ════════════════════════════════════════════════════════════════
//  soeg.js — "Hvad leder du efter?" på forsiden.
//  Man skriver et ord (fx "kontakt", "referat 2017", "bryllup"),
//  og får en liste med de sider, hvor svaret kan findes.
//  Nye sider: tilføj en linje i SIDER herunder.
// ════════════════════════════════════════════════════════════════
(function () {
  const SIDER = [
    { t: "Medlemskartotek", u: "medlemskartotek.html", i: "👥", d: "Alle familier, adresser, telefon, mail. Ret jeres egne data.", k: "medlem medlemmer adresse telefon tlf mail email kartotek ret data husstand flytte nummer medlemsnummer afdød afdøde udmeldt svævere relation far mor partner børn" },
    { t: "Afdøde", u: "medlemskartotek.html", i: "🕯️", d: "I kartoteket: tryk på knappen 🕯️ Afdøde. Opret og ret afdøde, bekræft data.", k: "afdød afdøde død døde død dødsdato mindeord gravsted kirkegård bekræft" },
    { t: "Mindelunden", u: "mindelunden.html", i: "🕯️", d: "Mindesider for tidligere medlemmer og slægtninge – skriv mindeord.", k: "mindelund minde mindeord afdød død gravsted grav" },
    { t: "Stamtræ", u: "stamtrae.html", i: "🌳", d: "Sådan hænger klanen sammen. Mit træ, hele træet, ret data.", k: "stamtræ slægt slægten slægtstræ familie træ forældre børn søskende bedsteforældre oldeforældre myheritage relation agnes svend" },
    { t: "Personkort", u: "stamtrae.html", i: "👤", d: "Alle data og hele familien op og ned for én person. Søg på navnet her, eller tryk på en person i stamtræet / Afdøde-listen.", k: "personkort person data familie forældre børn børnebørn bedsteforældre oldeforældre søskende tilføj slægtning" },
    { t: "Mærkedage", u: "foedselsdage.html", i: "🎉", d: "Fødselsdage, jubilæer og bryllupsdage – indeværende og kommende år.", k: "mærkedag mærkedage fødselsdag fødselsdage rund jubilæum bryllup bryllupsdag sølvbryllup guldbryllup diamantbryllup kobberbryllup kalender begivenhed konfirmation" },
    { t: "Fødselsdagshilsen", u: "forside.html#fremhaevede", i: "🎂", d: "På forsiden under ⭐ Fremhævede begivenheder – skriv en hilsen på dagen.", k: "hilsen hilsner lykønskning tillykke fødselsdagskort kort" },
    { t: "Skovturen – år for år", u: "arrangementer.html", i: "🌲", d: "Program, priser, komité, referater og billeder for hvert år.", k: "skovtur skovturen arrangement program pris priser tilmelding frist komité komite referat generalforsamling gf beretning sted lejr koloni" },
    { t: "Indkøbsliste til skovturen", u: "indkoebsliste.html", i: "🛒", d: "Hvad skal købes ind til en skovturs-weekend.", k: "indkøb indkøbsliste mad handle komité" },
    { t: "Årbogen", u: "aarbogen.html", i: "📚", d: "Informationsblade, indbydelser og regnskaber gennem årene.", k: "årbog blad information informationsblad indbydelse regnskab økonomi kasserer gamle" },
    { t: "Årenes billeder", u: "aarenes-billeder.html", i: "📸", d: "Billeder fra skovturene år for år.", k: "billeder billede foto fotos fællesfoto årenes" },
    { t: "Fotovæg", u: "fotovaeg-galleri.html", i: "🖼️", d: "Fotovæggen med billeder fra klanen.", k: "fotovæg foto billeder galleri" },
    { t: "Gamle billeder", u: "gamle-billeder.html", i: "🗃️", d: "Gamle familiebilleder – læg selv billeder op og skriv kommentarer.", k: "gamle billeder gammelt foto familiebilleder" },
    { t: "Historier", u: "historier.html", i: "📖", d: "Små historier og erindringer fra klanen.", k: "historie historier erindring erindringer fortælling familiekrønike risvangen" },
    { t: "Musik og sange", u: "musik.html", i: "🎵", d: "Klanens sange – hør dem, og syng med.", k: "musik sang sange syng skovtursang jubijæ slagsang birthe" },
    { t: "Syng med: Jubijæ – Jubijæ", u: "syng-med.html?find=jubij", i: "🎤", d: "Skovtursangen 2015 med tekst, der lyser op.", k: "jubijæ skovtursang syng med sangtekst" },
    { t: "Olsenklanens slagsang", u: "slagsang.html", i: "🎶", d: "Slagsangen med tekst.", k: "slagsang sang" },
    { t: "OlsenPost", u: "meddelelser.html", i: "✉️", d: "Beskeder til og fra klanen og OlsenBanden.", k: "post olsenpost besked beskeder meddelelse brev skriv kontakt mail" },
    { t: "Kontakt OlsenBanden", u: "meddelelser.html", i: "📮", d: "Skriv til OlsenBanden i OlsenPost – eller mail post@olsenklanen.dk.", k: "kontakt kontakte spørgsmål hjælp olsenbanden bestyrelse departementet fut fart 5 banden formand kasserer" },
    { t: "Infoarkiv", u: "infoarkiv.html", i: "🗂️", d: "Information og dokumenter samlet ét sted.", k: "info infoarkiv information dokument arkiv" },
    { t: "Vedtægter", u: "vedtaegter.html", i: "📜", d: "Klanens vedtægter.", k: "vedtægt vedtægter regler forening" },
    { t: "Send materiale (efter aftale)", u: "indsend.html", i: "📤", d: "Send billeder og gamle papirer til klanen – åbnes på dit medlemskort.", k: "send sende materiale upload billeder papirer harddisk indsend" },
    { t: "Skriv et kort", u: "kort.html", i: "💌", d: "Send et postkort til familien.", k: "kort postkort brevkort skriv" },
    { t: "Skriv til familien", u: "familiechat.html", i: "💬", d: "Familiechat.", k: "chat familiechat skriv snak" },
    { t: "Videofon – mødesal", u: "videofon-moederum.html", i: "📹", d: "Videomøde for familien.", k: "video videofon møde mødesal opkald" },
    { t: "Opslagstavlen", u: "opslagstavlen.html", i: "📌", d: "Opslag fra klanen.", k: "opslag opslagstavle" },
    { t: "Nyt om hjemmesiden", u: "nyheder.html", i: "🆕", d: "Hvad er nyt på hjemmesiden.", k: "nyt nyheder hjemmeside ændringer" },
    { t: "Administration", u: "admin.html", i: "⚙️", d: "Kun for OlsenBanden.", k: "admin administration olsenbanden dokumentation" }
  ];

  const norm = s => String(s || "").toLowerCase().normalize("NFC");
  const hent = n => { try { return (sessionStorage.getItem(n) || localStorage.getItem(n) || "").trim(); } catch (e) { return ""; } };
  const MIT_NAVN = hent("ok_navn").split(/\s+/)[0] || "";
  const MIT_NR = hent("ok_nr");

  // ── Personer fra kartoteket og Slægten (hentes én gang, når man begynder at skrive) ──
  const KEY = "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU";
  const BASE = "https://firestore.googleapis.com/v1/projects/olsenklanen-familieside/databases/(default)/documents";
  let PERSONER = null, henter = null;
  const vaerdi = x => { if (!x) return ""; const [k, v] = Object.entries(x)[0]; if (k === "mapValue") { const o = {}; Object.entries(v.fields || {}).forEach(([a, b]) => o[a] = vaerdi(b)); return o; } if (k === "arrayValue") return (v.values || []).map(vaerdi); return v; };
  function hentPersoner() {
    if (henter) return henter;
    henter = (async () => {
      const liste = [];
      try {
        const r = await fetch(`${BASE}/membres?pageSize=300&key=${KEY}`).then(x => x.json());
        (r.documents || []).forEach(d => {
          const h = vaerdi({ mapValue: d }); const nr = String(h.nr || d.name.split("/").pop());
          (h.familiemedlemmer || []).forEach(p => {
            const navn = [p.fornavn, p.mellemnavn, p.efternavn].filter(Boolean).join(" ").trim() || p.navn || "";
            if (!navn) return;
            const pnr = p.fastNr || (p.bogstav && p.status !== "udmeldt" ? nr + "-" + p.bogstav : nr);
            liste.push({ navn, nr, pnr, pid: p.pid, afdod: p.status === "afdød", kilde: "kartotek" });
          });
        });
        const q = { structuredQuery: { from: [{ collectionId: "olsenpost" }], where: { fieldFilter: { field: { fieldPath: "type" }, op: "EQUAL", value: { stringValue: "slaegt" } } } } };
        const r2 = await fetch(`${BASE}:runQuery?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) }).then(x => x.json());
        (r2 || []).forEach(x => { if (!x.document) return; const p = vaerdi({ mapValue: x.document });
          liste.push({ navn: p.navn || p.fornavn || "", pid: p.pid, afdod: p.status === "afdød", kilde: "slaegt" }); });
      } catch (e) { console.log("Søgning: kunne ikke hente personer", e); }
      PERSONER = liste;
      return liste;
    })();
    return henter;
  }
  function findPersoner(q) {
    if (!PERSONER) return [];
    const ord = norm(q).split(/\s+/).filter(o => o.length >= 2 && !/^\d+$/.test(o));
    if (!ord.length) return [];
    return PERSONER.filter(p => ord.every(o => norm(p.navn).split(/\s+/).some(n => n.startsWith(o)))).slice(0, 6);
  }

  // ── Informationer (infomails/index.json) – anbefal den info, der svarer på spørgsmålet ──
  let INFOS = null;
  fetch("infomails/index.json?t=" + Date.now()).then(r => r.json()).then(l => { INFOS = l; }).catch(() => { INFOS = []; });
  const FYLD = new Set(["ind","ud","op","ned","og","i","på","til","af","en","et","de","det","der","som","med","for","om","at","er","hvordan","hvor","hvad","jeg","man","kan","min","mit","den"]);
  function findInfos(q) {
    if (!INFOS) return [];
    const ord = norm(q).split(/\s+/).filter(o => o.length >= 3 && !FYLD.has(o) && !/^\d+$/.test(o));
    if (!ord.length) return [];
    return INFOS.map(m => {
      const t = norm([m.titel, m.rids, m.gruppe, m.soegeord].join(" "));
      const point = ord.filter(o => t.includes(o) || (o.length > 4 && t.includes(o.slice(0, -1)))).length;
      return { m, point };
    }).filter(x => x.point).sort((a, b) => b.point - a.point || (b.m.nr || 0) - (a.m.nr || 0)).slice(0, 2).map(x => x.m);
  }

  // ── Log af søgninger (så OlsenBanden kan se, hvad folk leder efter) ──
  const logget = new Set();
  function logSoegning(q, antal) {
    q = norm(q).trim();
    if (q.length < 3 || logget.has(q)) return;
    logget.add(q);
    const felter = { type: "soegning", til: [], soegt: q, antal: String(antal), nr: MIT_NR, navn: hent("ok_navn"), tid: new Date().toISOString() };
    const body = { fields: Object.fromEntries(Object.entries(felter).map(([k, v]) => [k, Array.isArray(v) ? { arrayValue: {} } : { stringValue: v }])) };
    fetch(`${BASE}/olsenpost?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function find(q) {
    q = norm(q).trim();
    if (q.length < 2) return [];
    const ord = q.split(/\s+/).filter(o => o && !(typeof FYLD !== "undefined" && FYLD.has(o)));
    const aar = (q.match(/\b(19[6-9]\d|20[0-4]\d)\b/) || [])[1];
    const res = [];
    SIDER.forEach(s => {
      const tekst = norm(s.t + " " + s.d + " " + s.k);
      let point = 0;
      ord.forEach(o => { if (/^\d{4}$/.test(o)) return; if (tekst.includes(o)) point += norm(s.t).includes(o) ? 3 : 1; else if (o.length > 4 && tekst.includes(o.slice(0, -1))) point += 1; });
      if (point) res.push({ ...s, point });
    });
    // Et årstal: vis året direkte
    if (aar) {
      res.unshift({ t: "Skovturen " + aar, u: "arrangementer.html?aar=" + aar, i: "🌲", d: "Program, priser, referater og billeder fra " + aar + ".", point: 99 });
      res.splice(1, 0, { t: "Billeder fra " + aar, u: "aarenes-billeder.html?aar=" + aar, i: "📸", d: "Årenes billeder – " + aar + ".", point: 98 });
    }
    return res.sort((a, b) => b.point - a.point).slice(0, 8);
  }

  function byg() {
    const mid = document.querySelector("main.mid");
    if (!mid || document.getElementById("soeg-boks")) return;
    const boks = document.createElement("div");
    boks.id = "soeg-boks";
    boks.innerHTML = `
      <style>
        #soeg-boks{background:#fff;border:1px solid #e0d8c0;border-radius:10px;padding:12px 14px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
        #soeg-boks .soeg-titel{font-weight:bold;color:#2d5016;margin-bottom:6px;font-size:15px}
        #soeg-felt{width:100%;padding:10px 12px;font-size:16px;border:1.5px solid #c8b98a;border-radius:8px;font-family:inherit;box-sizing:border-box}
        #soeg-resultat a{display:flex;gap:10px;align-items:flex-start;padding:8px 6px;border-bottom:1px solid #f0ead8;text-decoration:none;color:#2b2b2b}
        #soeg-resultat a:hover{background:#faf3dc}
        #soeg-resultat .r-ikon{font-size:20px;width:26px;text-align:center}
        #soeg-resultat .r-titel{font-weight:bold;color:#2d5016}
        #soeg-resultat .r-tekst{font-size:13px;color:#5a5a40}
        #soeg-resultat .ingen{font-size:14px;color:#5a5a40;padding:8px 4px}
        #soeg-resultat .hej{font-size:14px;color:#2d5016;padding:8px 4px 4px}
        #soeg-resultat .person-svar{display:flex;gap:10px;align-items:flex-start;padding:8px 6px;border-bottom:1px solid #f0ead8}
        #soeg-resultat a.lille{display:inline-block;padding:2px 8px;margin:4px 6px 0 0;border:1px solid #c8b98a;border-radius:12px;font-size:13px;color:#2d5016;text-decoration:none}
      </style>
      <div class="soeg-titel">🔎 Hvad leder du efter?</div>
      <input id="soeg-felt" type="search" autocomplete="off" placeholder="Skriv fx kontakt, referat 2017, bryllup, stamtræ …">
      <div id="soeg-resultat"></div>`;
    mid.insertBefore(boks, mid.firstChild);
    const felt = boks.querySelector("#soeg-felt"), ud = boks.querySelector("#soeg-resultat");
    let logTimer = null;
    async function vis() {
      const q = felt.value;
      if (norm(q).trim().length < 2) { ud.innerHTML = ""; return; }
      if (!PERSONER) { hentPersoner().then(() => { if (felt.value === q) vis(); }); }
      const r = find(q);
      const pers = findPersoner(q);
      let html = "";
      if (pers.length) {
        const fornavn = q.trim().split(/\s+/)[0];
        html += `<div class="hej">👋 Hej${MIT_NAVN ? " " + esc(MIT_NAVN) : ""} – du søger efter <b>${esc(fornavn.charAt(0).toUpperCase() + fornavn.slice(1))}</b>. Vi fandt ${pers.length === 1 ? "denne person" : "disse personer"}:</div>`;
        html += pers.map(p => `<div class="person-svar"><span class="r-ikon">${p.afdod ? "🕯️" : "👤"}</span><span><span class="r-titel">${esc(p.navn)}</span>${p.pnr ? ` <span class="r-tekst">(medl.nr. ${esc(p.pnr)})</span>` : p.kilde === "slaegt" ? ` <span class="r-tekst">(i Slægten)</span>` : ""}<br>
          ${p.kilde === "kartotek" ? `<a class="lille" href="medlemskartotek.html?soeg=${encodeURIComponent(p.navn.split(" ")[0])}">📇 Se medlemskortet</a>` : ""}
          ${p.pid ? `<a class="lille" href="person.html?pid=${encodeURIComponent(p.pid)}">👤 Personkort</a>` : ""}
          ${p.pid ? `<a class="lille" href="stamtrae.html?top=${encodeURIComponent(p.pid)}">🌳 Se i stamtræet</a>` : ""}
          ${p.afdod ? `<a class="lille" href="mindelunden.html">🕯️ Mindelunden</a>` : ""}</span></div>`).join("");
        html += r.length ? `<div class="hej" style="margin-top:6px">Er det noget andet, du leder efter? Se også:</div>` : `<div class="hej" style="margin-top:6px;color:#5a5a40">Er det noget andet, du leder efter? Skriv et andet ord – eller spørg OlsenBanden i <a href="meddelelser.html" style="display:inline;padding:0;border:0;color:#2d5016;font-weight:bold">OlsenPost</a>.</div>`;
      }
      const infos = findInfos(q);
      if (infos.length) html += infos.map(m => `<a href="infoarkiv.html?vis=${encodeURIComponent(m.id)}"><span class="r-ikon">📚</span><span><span class="r-titel">Læs Info nr. ${esc(m.nr)}: ${esc(m.titel)}</span><br><span class="r-tekst">${esc(m.rids || "")} Du kan også få den på mail i OlsenPost → 📚 Informationer.</span></span></a>`).join("");
      html += r.length
        ? r.map(s => `<a href="${esc(s.u)}"><span class="r-ikon">${s.i}</span><span><span class="r-titel">${esc(s.t)}</span><br><span class="r-tekst">${esc(s.d)}</span></span></a>`).join("")
        : (pers.length || infos.length ? "" : `<div class="ingen">Ingen sider passer på "${esc(q)}". Prøv et andet ord – eller skriv til OlsenBanden i <a href="meddelelser.html" style="display:inline;padding:0;border:0;color:#2d5016;font-weight:bold">OlsenPost</a>.</div>`);
      ud.innerHTML = html;
      clearTimeout(logTimer);
      logTimer = setTimeout(() => logSoegning(q, r.length + pers.length + infos.length), 2500);
    }
    felt.addEventListener("input", vis);
    felt.addEventListener("focus", () => hentPersoner());
    felt.addEventListener("keydown", e => { if (e.key === "Enter") { const a = ud.querySelector("a"); if (a) location.href = a.getAttribute("href"); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", byg); else byg();
})();
