// Klik på et billede med data-stort → vis det stort.
// Zoom: rul med musehjulet, knib med to fingre, dobbeltklik, eller brug knapperne + / −.
// Flyt rundt: træk i billedet. Luk: ✕, Esc eller klik ved siden af billedet.
(function () {
  const css = document.createElement("style");
  css.textContent = `img[data-stort]{cursor:zoom-in}
#stort-billede{position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;z-index:5000;overflow:hidden;touch-action:none;user-select:none}
#stort-billede .sb-scene{position:absolute;inset:0 0 54px 0;display:flex;align-items:center;justify-content:center}
#stort-billede img{max-width:96%;max-height:96%;border-radius:6px;box-shadow:0 4px 30px rgba(0,0,0,.6);background:#fff;transform-origin:0 0;cursor:grab}
#stort-billede img.traek{cursor:grabbing}
#stort-billede .sb-bund{position:absolute;left:0;right:0;bottom:0;height:54px;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;gap:10px;padding:0 10px}
#stort-billede .sb-tekst{color:#fff;font-size:16px;margin-right:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#stort-billede button{background:#fff;border:0;border-radius:22px;min-width:44px;height:44px;font-size:20px;cursor:pointer;padding:0 12px}
#stort-billede .sb-luk{position:absolute;top:12px;right:16px;z-index:2}
#stort-billede .sb-hjaelp{position:absolute;top:16px;left:16px;color:#ddd;font-size:14px;z-index:2}`;
  document.head.appendChild(css);
  let boks, img, scene, s = 1, x = 0, y = 0;
  const MAX = 8;
  function saet() { img.style.transform = `translate(${x}px,${y}px) scale(${s})`; }
  function nulstil() { s = 1; x = 0; y = 0; saet(); }
  // Zoom omkring et punkt (cx, cy) i skærmkoordinater
  function zoom(faktor, cx, cy) {
    const r = img.getBoundingClientRect();
    const ny = Math.min(MAX, Math.max(1, s * faktor));
    if (ny === s) return;
    const bx = r.left - x, by = r.top - y;            // billedets position uden flytning
    const px = (cx - r.left) / s, py = (cy - r.top) / s; // punktet i billedets egne koordinater
    s = ny;
    x = cx - bx - px * s; y = cy - by - py * s;
    if (s === 1) { x = 0; y = 0; }
    saet();
  }
  function midt() { const r = scene.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function byg() {
    boks = document.createElement("div");
    boks.id = "stort-billede";
    boks.innerHTML = '<button class="sb-luk" title="Luk">✕</button><div class="sb-hjaelp">Rul eller knib for at zoome · træk for at flytte</div>'
      + '<div class="sb-scene"><img alt="" draggable="false"></div>'
      + '<div class="sb-bund"><div class="sb-tekst"></div><button data-z="ud" title="Zoom ud">−</button><button data-z="ind" title="Zoom ind">+</button><button data-z="nul" title="Hele billedet" style="font-size:15px">Hele billedet</button></div>';
    document.body.appendChild(boks);
    img = boks.querySelector("img"); scene = boks.querySelector(".sb-scene");
    boks.querySelector(".sb-luk").onclick = luk;
    scene.addEventListener("click", e => { if (e.target === scene && s === 1) luk(); });
    boks.querySelectorAll("[data-z]").forEach(b => b.onclick = () => {
      const [cx, cy] = midt();
      if (b.dataset.z === "ind") zoom(1.6, cx, cy); else if (b.dataset.z === "ud") zoom(1 / 1.6, cx, cy); else nulstil();
    });
    boks.addEventListener("wheel", e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.25 : 0.8, e.clientX, e.clientY); }, { passive: false });
    img.addEventListener("dblclick", e => { if (s > 1) nulstil(); else zoom(2.5, e.clientX, e.clientY); });
    // Træk og knib (pointer events)
    const pk = new Map(); let sidst = null, afst = 0;
    img.addEventListener("pointerdown", e => { img.setPointerCapture(e.pointerId); pk.set(e.pointerId, [e.clientX, e.clientY]); img.classList.add("traek"); sidst = [e.clientX, e.clientY];
      if (pk.size === 2) { const [a, b] = [...pk.values()]; afst = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    img.addEventListener("pointermove", e => {
      if (!pk.has(e.pointerId)) return;
      pk.set(e.pointerId, [e.clientX, e.clientY]);
      if (pk.size === 2) {
        const [a, b] = [...pk.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (afst) zoom(d / afst, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); afst = d;
      } else if (sidst && s > 1) { x += e.clientX - sidst[0]; y += e.clientY - sidst[1]; saet(); sidst = [e.clientX, e.clientY]; }
    });
    const slip = e => { pk.delete(e.pointerId); if (pk.size < 2) afst = 0; if (!pk.size) { img.classList.remove("traek"); sidst = null; } else sidst = [...pk.values()][0]; };
    img.addEventListener("pointerup", slip); img.addEventListener("pointercancel", slip);
  }
  function vis(src, tekst) {
    if (!boks) byg();
    img.src = src; nulstil();
    boks.querySelector(".sb-tekst").textContent = tekst || "";
    boks.style.display = "block";
    document.body.style.overflow = "hidden";
  }
  function luk() { if (boks) boks.style.display = "none"; document.body.style.overflow = ""; }
  document.addEventListener("click", e => {
    const el = e.target.closest && e.target.closest("img[data-stort]");
    if (!el || (boks && boks.contains(el))) return;
    e.preventDefault(); e.stopPropagation();
    vis(el.dataset.fuld || el.src, el.dataset.stort);
  }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") luk(); });
})();
