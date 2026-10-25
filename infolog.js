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
  const EMOJI = { opslag: "📌", billede: "📷", rettelse: "✏️", person: "🌳", hilsen: "👋" };

  async function hentLinjer() {
    const r = await fetch(`${URL}:runQuery?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "olsenpost" }],
        where: { fieldFilter: { field: { fieldPath: "type" }, op: "EQUAL", value: { stringValue: "infolog" } } } } }) });
    const j = await r.json();
    return j.filter(x => x.document).map(x => {
      const f = x.document.fields, g = k => f[k] ? Object.values(f[k])[0] : "";
      return { id: x.document.name.split("/").pop(), art: g("art"), tekst: g("tekst"), link: g("link"), billede: g("billede"), hvem_nr: g("hvem_nr"), hvem_navn: g("hvem_navn"), tid: g("tid"), skjult: g("skjult") === true };
    }).filter(x => !x.skjult).sort((a, b) => String(b.tid).localeCompare(String(a.tid)));
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

  async function log({ art, hvad, link, billede }) {
    if (!hvad) return false;
    if (link && await erDublet(link)) return false;
    const tekst = `${fornavn()} har ${hvad}`;
    const felter = { type: "infolog", art: art || "rettelse", tekst, link: link || "", billede: await lilleBillede(billede), hvem_nr: hent("ok_nr"), hvem_navn: hent("ok_navn"),
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
  async function vis(el, antal) {
    if (!el) return;
    try {
      const l = (await hentLinjer()).slice(0, antal || 15);
      el.innerHTML = l.length ? l.map(x => `<a class="infolog-linje" href="${esc(x.link || "#")}"${x.link ? "" : " onclick=\"return false\""}>
          <span class="il-emoji">${EMOJI[x.art] || "✏️"}</span><span class="il-tekst">${x.billede ? `<img class="il-billede" src="${esc(x.billede)}" alt="" loading="lazy">` : ""}${esc(x.tekst)}<span class="il-tid">${x.hvem_navn ? "Fra " + esc(x.hvem_navn) + " · " : ""}${tidspunkt(x.tid)}${x.link ? " · se det →" : ""}</span></span></a>`).join("")
        : `<div class="infolog-tom">Her kommer det nye på siden – fx nye billeder, rettelser og hilsner.</div>`;
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
