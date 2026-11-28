// ════════════════════════════════════════════════════════════════
//  kort-efterlysning.js — OlsenKlanen
//  Boks: "Vi mangler kort til alle lejligheder!" + hvor man finder kortene.
//  Sættes ind, hvor siden har <div id="kort-efterlysning"></div>
//  (forsiden og kort.html). Carstens ønske 28-11-2026.
// ════════════════════════════════════════════════════════════════
(function () {
  const LEJLIGHEDER = [
    ["🎆", "Nytår"], ["🎂", "Fødselsdag"], ["🌷", "God bedring"], ["💍", "Bryllup"],
    ["🎓", "Udlært og eksamen"], ["👶", "Barnedåb"], ["🕊️", "Kondolence"], ["🌸", "Bare en hilsen"]
  ];
  const css = `
  .kef { background: linear-gradient(135deg, #fffaf0, #f3ecd6); border: 2px solid #c89e3c; border-radius: 12px; padding: 14px 16px; margin: 14px 0; font-family: Georgia, serif; color: #2c3e1f; }
  .kef h3 { margin: 0 0 4px; font-size: 18px; color: #2d5016; }
  .kef p { margin: 4px 0 8px; font-size: 14px; line-height: 1.45; }
  .kef .kef-lej { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 10px; }
  .kef .kef-lej span { background: #fff; border: 1px solid #e0d8bd; border-radius: 14px; padding: 3px 10px; font-size: 13px; white-space: nowrap; }
  .kef .kef-vej { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; color: #555; margin: 6px 0 10px; }
  .kef .kef-vej b { background: #2d5016; color: #f5e6a8; border-radius: 8px; padding: 3px 8px; font-weight: normal; white-space: nowrap; }
  .kef .kef-knapper { display: flex; gap: 8px; flex-wrap: wrap; }
  .kef .kef-knapper a { text-decoration: none; border-radius: 8px; padding: 8px 14px; font-size: 14px; font-weight: bold; }
  .kef .kef-send { background: #a4161a; color: #fff; }
  .kef .kef-se { background: #2d5016; color: #f5e6a8; }`;
  function tegn() {
    const el = document.getElementById("kort-efterlysning");
    if (!el) return;
    if (!document.getElementById("kef-css")) { const s = document.createElement("style"); s.id = "kef-css"; s.textContent = css; document.head.appendChild(s); }
    const paaKortSiden = /kort\.html$/.test(location.pathname);
    el.innerHTML = `<div class="kef">
      <h3>🎨 Vi mangler illustrationer til lejlighedskort!</h3>
      <p>Har du en tegning, et maleri eller et godt foto? Send det til os – så bliver det måske til et postkort, som hele familien kan bruge.</p>
      <div class="kef-lej">${LEJLIGHEDER.map(([i, t]) => `<span>${i} ${t}</span>`).join("")}</div>
      ${paaKortSiden ? "" : `<div class="kef-vej">Her finder du kortene: <b>🏠 Forsiden</b> → <b>🖼️ Skriv et kort</b> → <b>Vælg et kort</b></div>`}
      <div class="kef-knapper">
        <a class="kef-send" href="send-kunst.html">🎨 Send dit billede</a>
        ${paaKortSiden ? "" : `<a class="kef-se" href="kort.html">🖼️ Se kortene</a>`}
      </div>
    </div>`;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tegn); else tegn();
})();
