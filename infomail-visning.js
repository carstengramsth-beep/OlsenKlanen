/* ════════════════════════════════════════════════════════════
   Viser en infomail (infomails/<navn>.json) som HTML på hjemmesiden.
   Bruges af OlsenPost (forhåndsvisning) og Infoarkivet.
   Selve mailen bygges af serveren (functions/index.js · infomailIndhold) med samme indhold.
   ════════════════════════════════════════════════════════════ */
(function(){
  const e = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  window.infoDato = d => { const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + ". " + ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"][+m[2] - 1] + " " + m[1] : String(d || ""); };
  window.INFOMAIL_FODLINJE = "Kun til medlemmer af OlsenKlanen – send den ikke videre.";
  window.infomailHtml = function(data, visHoved, meta){
    const nrLinje = meta && meta.nr ? `<div style="font-size:13px;color:#8a7a3f;margin:0 0 10px;"><b>Info nr. ${e(meta.nr)}</b>${meta.dato ? " · " + e(window.infoDato ? window.infoDato(meta.dato) : meta.dato) : ""}</div>` : "";
    const noteLinje = meta && meta.note ? `<div style="font-size:12px;color:#888;margin:-6px 0 10px;font-style:italic;">${e(meta.note)}</div>` : "";
    const dele = [`<p style="font-size:19px;margin:0 0 16px;">${e(data.hilsen)}</p>`];
    (data.afsnit || []).forEach(a => {
      if (a.type === "p") dele.push(`<p style="margin:0 0 14px;">${e(a.tekst).replace(/\n/g, "<br>")}</p>`);
      else if (a.type === "billede") dele.push(`<div style="margin:0 0 16px;text-align:center;"><img src="${e(a.billede)}" alt="" style="display:inline-block;width:100%;max-width:${Number(a.bredde) || 420}px;border-radius:4px;">${a.tekst ? `<div style="font-size:12px;color:#8a7a3f;font-style:italic;margin-top:4px;">${e(a.tekst)}</div>` : ""}</div>`);
      else if (a.type === "h") dele.push(`<h3 style="color:#2d5016;margin:22px 0 8px;">${e(a.tekst)}</h3>`);
      else if (a.type === "trin") dele.push(`<div style="margin:0 0 16px;"><p style="margin:0 0 6px;"><b style="background:#2d5016;color:#fff;border-radius:12px;padding:1px 9px;margin-right:6px;">${e(a.nr)}</b>${e(a.tekst)}</p>${a.billede ? `<img src="${e(a.billede)}" alt="" style="display:block;width:100%;max-width:${Number(a.bredde) || 552}px;border:1px solid #ddd;border-radius:6px;">` : ""}</div>`);
      else if (a.type === "liste" || a.type === "nummerliste") { const t = a.type === "liste" ? "ul" : "ol"; dele.push(`<${t} style="margin:0 0 14px;">` + (a.punkter || []).map(x => `<li style="margin:4px 0;">${e(x)}</li>`).join("") + `</${t}>`); }
      else if (a.type === "tip") dele.push(`<p style="background:#fff8e1;border-left:4px solid #b8860b;padding:8px 12px;margin:0 0 14px;">${e(a.tekst)}</p>`);
    });
    dele.push(`<p style="margin:18px 0 0;">${(data.slut || []).map(e).join("<br>")}</p>`);
    dele.push(`<div style="border-top:1px solid #d8cfae;margin-top:22px;padding-top:8px;font-size:12px;color:#8a7a3f;font-style:italic;">Familieforeningen OlsenKlanen · olsenklanen.dk<br>${e(window.INFOMAIL_FODLINJE)}</div>`);
    const hoved = visHoved ? `<div style="font-size:13px;color:#666;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:14px;"><b>Fra:</b> OlsenKlanen &lt;post@olsenklanen.dk&gt;<br><b>Emne:</b> ${meta && meta.nr ? "Info nr. " + e(meta.nr) + " – " : ""}${e(data.emne)}</div>` : "";
    return `<div style="background:#f5f1e8;padding:16px;font-family:Georgia,serif;color:#2c3e1f;line-height:1.55;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;">${hoved}${nrLinje}${noteLinje}${dele.join("")}</div></div>`;
  };
})();
