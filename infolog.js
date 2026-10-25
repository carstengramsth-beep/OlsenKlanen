// Olsenklanens infolog – fælles for alle sider.
// Gemmer korte linjer som "Carsten har lagt en besked på opslagstavlen" i olsenpost (type "infolog").
//   InfoLog.log({ art, hvad, link, billede }) – gemmer med det samme (fx opslag på opslagstavlen). billede = URL eller data-URL (gøres lille)
//   InfoLog.spoerg({ art, hvad, link })  – spørger først: "Må denne ændring annonceres …?"
//   InfoLog.vis(element)                 – viser de nyeste linjer (forsiden)
// Når man kommer ind via en genvej med #id, bliver det opslag/billede fundet og fremhævet.
(function () {
  const KEY = "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU";
  const URL = "https://firestore.googleapis.com/v1/projects/olsenklanen-familieside/databases/(default)/documents";
  const hent = k => { try { return sessionStorage.getItem(k) || localStorage.getItem(k) || ""; } catch (e) { return ""; } };
  const fornavn = () => (hent("ok_navn") || "Et medlem").trim().split(/\s+/)[0];
  const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // 5-Banden må fjerne indlæg og kommentarer: Carsten (8), Tommy (19), Kurt (22), Karin (23), Sanne (48)
  const erFemBanden = () => { const hus = hent("ok_nr").split("-")[0].trim(), fn = (hent("ok_navn") || "").trim().split(/\s+/)[0].toLowerCase();
    return (hent("ok_niveau") || "").toLowerCase() === "admin" && ({ "8": "carsten", "19": "tommy", "22": "kurt", "23": "karin", "48": "sanne" })[hus] === fn; };
  const EMOJI = { opslag: "📌", billede: "📷", rettelse: "✏️", person: "🌳", hilsen: "👋" };

  // Firestore-værdi → JS
  const fra = v => { const [t, x] = Object.entries(v)[0];
    if (t === "arrayValue") return (x.values || []).map(fra);
    if (t === "mapValue") { const o = {}; for (const [k, y] of Object.entries(x.fields || {})) o[k] = fra(y); return o; }
    if (t === "booleanValue") return x; if (t === "nullValue") return null; return x; };
  const til = v => Array.isArray(v) ? { arrayValue: { values: v.map(til) } }
    : (v && typeof v === "object") ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, y]) => [k, til(y)])) } }
    : typeof v === "boolean" ? { booleanValue: v } : { stringValue: String(v ?? "") };

  async function hentLinjer() {
    const r = await fetch(`${URL}:runQuery?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "olsenpost" }],
        where: { fieldFilter: { field: { fieldPath: "type" }, op: "EQUAL", value: { stringValue: "infolog" } } } } }) });
    const j = await r.json();
    return j.filter(x => x.document).map(x => {
      const o = { id: x.document.name.split("/").pop() }; for (const [k, v] of Object.entries(x.document.fields || {})) o[k] = fra(v);
      o.tommel = Array.isArray(o.tommel) ? o.tommel : []; o.svar = Array.isArray(o.svar) ? o.svar : []; return o;
    }).filter(x => x.skjult !== true).sort((a, b) => String(b.tid).localeCompare(String(a.tid)));
  }
  // Læs frisk, ret og gem ét felt (tommel eller svar)
  async function retFelt(id, felt, fn) {
    const d = await (await fetch(`${URL}/olsenpost/${id}?key=${KEY}`)).json();
    const nu = d.fields && d.fields[felt] ? fra(d.fields[felt]) : [];
    const ny = fn(Array.isArray(nu) ? nu : []);
    const r = await fetch(`${URL}/olsenpost/${id}?key=${KEY}&updateMask.fieldPaths=${felt}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { [felt]: til(ny) } }) });
    if (!r.ok) throw new Error("gem");
  }

  // Samme person + samme genvej inden for 30 min → ingen ny linje (undgår mange linjer for én rettelse)
  async function erDublet(link) {
    try {
      const nr = hent("ok_nr"), graense = new Date(Date.now() - 30 * 60000).toISOString();
      return (await hentLinjer()).some(x => x.link === link && x.hvem_nr === nr && x.tid > graense);
    } catch (e) { return false; }
  }

  // Et billede gemt som data-URL gøres lille (ca. 240 px), så loggen er hurtig
  function lilleBillede(src) {
    return new Promise(ok => {
      if (!src || !String(src).startsWith("data:")) return ok(src || "");
      const img = new Image();
      img.onload = () => { const k = Math.min(1, 240 / Math.max(img.width, img.height)); const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        try { ok(c.toDataURL("image/jpeg", 0.8)); } catch (e) { ok(""); } };
      img.onerror = () => ok(""); img.src = src;
    });
  }

  async function log({ art, hvad, link, billede, indhold }) {
    if (!hvad) return false;
    if (link && await erDublet(link)) return false;
    const tekst = `${fornavn()} har ${hvad}`;
    const felter = { type: "infolog", art: art || "rettelse", tekst, link: link || "", billede: await lilleBillede(billede), indhold: String(indhold || "").slice(0, 600), hvem_nr: hent("ok_nr"), hvem_navn: hent("ok_navn"),
      tid: new Date().toISOString(), sendt_lokal: String(Date.now()) };
    const fields = {}; for (const [k, v] of Object.entries(felter)) fields[k] = { stringValue: v };
    try { const r = await fetch(`${URL}/olsenpost?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) }); return r.ok; }
    catch (e) { return false; }
  }

  function spoerg({ art, hvad, link, billede }) {
    return new Promise(async svar => {
      if (!hvad || (link && await erDublet(link))) return svar(false);
      const tekst = `${fornavn()} har ${hvad}`;
      const bg = document.createElement("div");
      bg.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:20000;display:flex;align-items:center;justify-content:center;padding:16px";
      bg.innerHTML = `<div style="background:#fff;border-radius:12px;max-width:440px;width:100%;padding:20px 22px;font-family:Georgia,serif;box-shadow:0 10px 40px rgba(0,0,0,.35)">
        <div style="font-size:20px;color:#2d5016;margin-bottom:10px">📣 Må denne ændring annonceres på Olsenklanens infolog?</div>
        <div style="background:#faf3dc;border-left:4px solid #c89e3c;padding:10px 12px;border-radius:6px;font-size:16px;margin-bottom:16px;display:flex;gap:10px;align-items:center">${billede ? `<img src="${esc(billede)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0">` : ""}<span>${EMOJI[art] || "✏️"} ${esc(tekst)}</span></div>
        <div style="font-size:14px;color:#555;margin-bottom:16px">Linjen kommer på forsiden, så familien kan se det nye.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button data-ja style="flex:1;min-width:150px;font-size:17px;padding:12px;border:0;border-radius:8px;background:#2d5016;color:#fff;cursor:pointer">✅ Ja, annoncér</button>
          <button data-nej style="flex:1;min-width:150px;font-size:17px;padding:12px;border:1px solid #bbb;border-radius:8px;background:#fff;cursor:pointer">Nej tak</button>
        </div></div>`;
      document.body.appendChild(bg);
      bg.querySelector("[data-nej]").onclick = () => { bg.remove(); svar(false); };
      bg.querySelector("[data-ja]").onclick = async e => { e.target.disabled = true; e.target.textContent = "⏳ Gemmer …"; const ok = await log({ art, hvad, link, billede }); bg.remove(); svar(ok); };
    });
  }

  // "søndag 25. okt. kl. 10.42"
  function tidspunkt(iso) {
    const d = new Date(iso); if (isNaN(d)) return "";
    return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "short" }) + " kl. " + d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  }
  const kort = x => {
    const mig = hent("ok_nr"), harTommel = x.tommel.some(t => t.nr === mig), fem = erFemBanden(), synligeSvar = x.svar.filter(v => !v.skjult);
    const tNavne = x.tommel.map(t => (t.navn || "").split(" ")[0]).filter(Boolean).join(", ");
    const indhold = `${x.billede ? `<img class="il-billede" src="${esc(x.billede)}" alt="" loading="lazy">` : ""}<div class="il-tekst">${EMOJI[x.art] || "✏️"} ${esc(x.tekst)}</div>${x.indhold ? `<div class="il-opslag">${esc(x.indhold)}${x.rettet_tid ? `<div class="il-rettet">✏️ Rettet ${tidspunkt(x.rettet_tid)}${x.rettet_af ? " af " + esc(String(x.rettet_af).split(" ")[0]) : ""}</div>` : ""}</div>` : ""}`;
    return `<div class="il-kort" data-id="${esc(x.id)}">
      <div class="il-top"><span class="il-dato">${tidspunkt(x.tid)}</span><span class="il-fra">${esc(x.hvem_navn || "")}</span></div>
      ${x.link ? `<a class="il-indhold" href="${esc(x.link)}">${indhold}<span class="il-se">Se det →</span></a>` : `<div class="il-indhold">${indhold}</div>`}
      <div class="il-handling">
        <button class="il-tommel${harTommel ? " valgt" : ""}" data-tommel title="${esc(tNavne ? "Synes godt om: " + tNavne : "Giv en tommel op")}">👍 ${x.tommel.length || ""}</button>
        <button class="il-svar-knap" data-svar-aaben>💬 Kommentér indlæg</button>
        ${x.art === "opslag" && (fem || (mig && x.hvem_nr === mig)) ? `<button class="il-ret" data-ret title="Ret teksten i opslaget">✏️ Ret</button>` : ""}
        ${fem ? `<button class="il-fjern" data-fjern title="Kun 5-Banden: fjern indlægget">🗑 Fjern</button>` : ""}
        ${tNavne ? `<span class="il-tnavne">👍 ${esc(tNavne)}</span>` : ""}
      </div>
      ${synligeSvar.length ? `<div class="il-svarliste"><div class="il-svar-titel">💬 ${synligeSvar.length} ${synligeSvar.length === 1 ? "kommentar" : "kommentarer"}</div>${x.svar.map((v, i) => v.skjult ? "" : `<div class="il-svar"><div class="il-svar-top"><b>${esc(v.navn || "")}</b> · ${tidspunkt(v.tid)}${fem ? ` <button class="il-fjern lille" data-fjern-svar="${i}" title="Kun 5-Banden: fjern kommentaren">🗑</button>` : ""}</div>${esc(v.tekst)}</div>`).join("")}</div>` : ""}
      <div class="il-retfelt" style="display:none">
        <div class="il-kommenterer">Ret teksten i dit opslag (højst 500 tegn). Der kommer »rettet« og tidspunkt på.</div>
        <textarea>${esc(x.indhold || "")}</textarea>
        <div class="il-kommenterer"><span data-ret-tal>${String(x.indhold || "").length}</span> / 500 tegn</div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button data-ret-annuller class="hvid">Fortryd</button><button data-ret-gem>💾 Gem rettelsen</button></div></div>
      <div class="il-svarfelt" style="display:none">
        <div class="il-kommenterer">Du kommenterer: <b>»${esc(String(x.tekst).slice(0, 70))}${String(x.tekst).length > 70 ? " …" : ""}«</b> fra ${esc((x.hvem_navn || "").split(" ")[0])}, ${tidspunkt(x.tid)}</div>
        <textarea maxlength="300" placeholder="Skriv din kommentar …"></textarea>
        <div class="il-kommenterer">Dit navn, dato og klokkeslæt kommer automatisk på.</div>
        <button data-svar-send>Send kommentar</button></div>
    </div>`;
  };

  async function vis(el, antal) {
    if (!el) return;
    if (el.contains(document.activeElement) && document.activeElement.tagName === "TEXTAREA") return; // forstyr ikke, mens man skriver
    try {
      const l = (await hentLinjer()).slice(0, antal || 15);
      el.innerHTML = l.length ? l.map(kort).join("") : `<div class="infolog-tom">Her kommer det nye på siden – fx nye billeder, rettelser og hilsner.</div>`;
      if (!el._klik) { el._klik = true;
        el.addEventListener("input", e => { const f = e.target.closest(".il-retfelt"); if (!f) return; const n = e.target.value.length, s = f.querySelector("[data-ret-tal]"); s.textContent = n; s.style.color = n > 500 ? "#c0392b" : n >= 450 ? "#b9770e" : ""; });
        el.addEventListener("click", async e => {
        const k = e.target.closest(".il-kort"); if (!k) return; const id = k.dataset.id;
        const mig = { nr: hent("ok_nr"), navn: hent("ok_navn") };
        if (e.target.closest("[data-tommel]")) {
          if (!mig.nr) return alert("Log ind for at give en tommel op.");
          e.target.closest("[data-tommel]").disabled = true;
          try { await retFelt(id, "tommel", l => l.some(t => t.nr === mig.nr) ? l.filter(t => t.nr !== mig.nr) : [...l, { ...mig, tid: new Date().toISOString() }]); } catch (err) { alert("Kunne ikke gemme. Prøv igen."); }
          return vis(el, antal);
        }
        if (e.target.closest("[data-ret]")) { const f = k.querySelector(".il-retfelt"); f.style.display = f.style.display === "none" ? "" : "none"; if (f.style.display === "") f.querySelector("textarea").focus(); return; }
        if (e.target.closest("[data-ret-annuller]")) { k.querySelector(".il-retfelt").style.display = "none"; return vis(el, antal); }
        if (e.target.closest("[data-ret-gem]")) {
          const t = k.querySelector(".il-retfelt textarea"), tekst = t.value.trim(), b = e.target.closest("[data-ret-gem]");
          if (tekst.length < 3) return alert("Skriv lidt mere – mindst 3 tegn.");
          if (tekst.length > 500) return alert(`Teksten er ${tekst.length} tegn – der er plads til 500. Fjern ${tekst.length - 500} tegn.`);
          b.disabled = true; b.textContent = "⏳ Gemmer …";
          try {
            const x = (await hentLinjer()).find(y => y.id === id) || {}, nu = new Date().toISOString(), af = mig.navn || mig.nr;
            const m = String(x.link || "").match(/opslagstavlen\.html#o-(.+)$/);
            if (m) { const r = await fetch(`${URL}/opslagstavle/${m[1]}?key=${KEY}&updateMask.fieldPaths=tekst&updateMask.fieldPaths=rettet_tid&updateMask.fieldPaths=rettet_af`, { method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: { tekst: { stringValue: tekst }, rettet_tid: { stringValue: nu }, rettet_af: { stringValue: af } } }) }); if (!r.ok) throw 0; }
            const r2 = await fetch(`${URL}/olsenpost/${id}?key=${KEY}&updateMask.fieldPaths=indhold&updateMask.fieldPaths=rettet_tid&updateMask.fieldPaths=rettet_af`, { method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: { indhold: { stringValue: tekst }, rettet_tid: { stringValue: nu }, rettet_af: { stringValue: af } } }) }); if (!r2.ok) throw 0;
          } catch (err) { alert("Kunne ikke gemme rettelsen. Prøv igen."); b.disabled = false; b.textContent = "💾 Gem rettelsen"; return; }
          return vis(el, antal);
        }
        if (e.target.closest("[data-fjern]")) {
          if (!erFemBanden()) return;
          if (!confirm("Fjern dette indlæg fra infologgen?\n\nDet kan ikke ses af andre bagefter.")) return;
          try { const r = await fetch(`${URL}/olsenpost/${id}?key=${KEY}&updateMask.fieldPaths=skjult&updateMask.fieldPaths=fjernet_af&updateMask.fieldPaths=fjernet_tid`, { method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields: { skjult: { booleanValue: true }, fjernet_af: { stringValue: mig.navn || mig.nr }, fjernet_tid: { stringValue: new Date().toISOString() } } }) }); if (!r.ok) throw 0; }
          catch (err) { alert("Kunne ikke fjerne. Prøv igen."); }
          return vis(el, antal);
        }
        if (e.target.closest("[data-fjern-svar]")) {
          if (!erFemBanden()) return; const i = +e.target.closest("[data-fjern-svar]").dataset.fjernSvar;
          if (!confirm("Fjern denne kommentar?")) return;
          try { await retFelt(id, "svar", l => l.map((v, j) => j === i ? { ...v, skjult: true, fjernet_af: mig.navn || mig.nr, fjernet_tid: new Date().toISOString() } : v)); } catch (err) { alert("Kunne ikke fjerne. Prøv igen."); }
          return vis(el, antal);
        }
        if (e.target.closest("[data-svar-aaben]")) { const f = k.querySelector(".il-svarfelt"); f.style.display = f.style.display === "none" ? "" : "none"; if (f.style.display === "") f.querySelector("textarea").focus(); return; }
        if (e.target.closest("[data-svar-send]")) {
          if (!mig.nr) return alert("Log ind for at kommentere.");
          const t = k.querySelector(".il-svarfelt textarea"), tekst = t.value.trim(); if (!tekst) return t.focus();
          const b = e.target.closest("[data-svar-send]"); b.disabled = true; b.textContent = "⏳ Sender …";
          try { await retFelt(id, "svar", l => [...l, { ...mig, tekst, tid: new Date().toISOString() }]); t.blur(); }
          catch (err) { alert("Kunne ikke sende kommentaren. Prøv igen."); b.disabled = false; b.textContent = "Send kommentar"; return; }
          return vis(el, antal);
        }
      }); }
    } catch (e) { el.innerHTML = `<div class="infolog-tom">Infologgen kunne ikke hentes lige nu.</div>`; }
  }

  // Genvej med #id: find opslaget/billedet (det kan komme lidt senere) og fremhæv det
  function fremhaev() {
    const id = decodeURIComponent(location.hash.slice(1)); if (!id || id === "skriv") return;
    let n = 0; const t = setInterval(() => {
      const e = document.getElementById(id);
      if (e) { clearInterval(t); e.scrollIntoView({ behavior: "smooth", block: "center" }); e.style.transition = "box-shadow .4s"; e.style.boxShadow = "0 0 0 4px #f1c40f"; setTimeout(() => e.style.boxShadow = "", 6000); }
      else if (++n > 40) clearInterval(t);
    }, 250);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fremhaev); else fremhaev();

  window.InfoLog = { log, spoerg, vis };
})();
