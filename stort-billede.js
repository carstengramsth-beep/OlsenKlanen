// Klik på et billede med data-stort → vis det stort. Luk med klik, ✕ eller Esc.
(function () {
  const css = document.createElement("style");
  css.textContent = `img[data-stort]{cursor:zoom-in}
#stort-billede{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;flex-direction:column;z-index:5000;cursor:zoom-out;padding:16px;box-sizing:border-box}
#stort-billede img{max-width:100%;max-height:85vh;border-radius:10px;box-shadow:0 4px 30px rgba(0,0,0,.6);background:#fff}
#stort-billede .sb-tekst{color:#fff;font-size:18px;margin-top:.7rem;text-align:center}
#stort-billede .sb-luk{position:absolute;top:12px;right:16px;background:#fff;border:0;border-radius:50%;width:44px;height:44px;font-size:22px;cursor:pointer}`;
  document.head.appendChild(css);
  let boks;
  function vis(src, tekst) {
    if (!boks) {
      boks = document.createElement("div");
      boks.id = "stort-billede";
      boks.innerHTML = '<button class="sb-luk" title="Luk">✕</button><img alt=""><div class="sb-tekst"></div>';
      boks.onclick = () => boks.style.display = "none";
      document.body.appendChild(boks);
    }
    boks.querySelector("img").src = src;
    boks.querySelector(".sb-tekst").textContent = tekst || "";
    boks.style.display = "flex";
  }
  document.addEventListener("click", e => {
    const img = e.target.closest && e.target.closest("img[data-stort]");
    if (!img) return;
    e.preventDefault(); e.stopPropagation();
    vis(img.src, img.dataset.stort);
  }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && boks) boks.style.display = "none"; });
})();
