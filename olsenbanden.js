/* ════════════════════════════════════════════════════════════
   OlsenBanden — de 5 postansvarlige. ÉN fælles liste for hele siden.
   Indsættes med:  <script src="olsenbanden.js"></script>

   Mailadressen hentes altid fra medlemskartoteket (membres), så en ny mail
   kun skal rettes ét sted: på personens egen medlemsside (+ "✓ Godkend medlemsdata").
   "email" herunder er kun en reserve, hvis kartoteket ikke kan hentes, og
   "tidligere" er gamle mails, som gamle data (fx vagtplanen) kan være gemt under.
   ════════════════════════════════════════════════════════════ */
(function(){
  const BANDEN = [
    { nr: "8-B",  fornavn: "Carsten", navn: "Carsten Gram",         init: "CG",  rolle: "Administrator", email: "cg@gallerieg.dk" },
    { nr: "22-B", fornavn: "Kurt",    navn: "Kurt Vormslev Olsen",  init: "KO",  rolle: "Redaktør",      email: "kurt@vormslev.dk" },
    { nr: "48-B", fornavn: "Sanne",   navn: "Sanne Gram Fadel",     init: "SGF", rolle: "Redaktør",      email: "safi@dr.dk" },
    { nr: "19-A", fornavn: "Tommy",   navn: "Tommy Vormslev Olsen", init: "TVO", rolle: "Redaktør",      email: "tvo@ishoejby.dk" },
    { nr: "23-B", fornavn: "Karin",   navn: "Karin Lund",           init: "KL",  rolle: "Redaktør",      email: "kld@bitreact.io", tidligere: ["kld@inmobia.com"] }
  ];
  BANDEN.forEach(b => { b.tidligere = (b.tidligere || []).concat(b.email); b.reserveEmail = b.email; });
  window.OLSENBANDEN = BANDEN;

  const URL = "https://firestore.googleapis.com/v1/projects/olsenklanen-familieside/databases/(default)/documents/membres/";
  const NOEGLE = "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU";
  function vaerdi(x){
    if (!x) return null;
    const k = Object.keys(x)[0], y = x[k];
    if (k === "mapValue") { const o = {}; Object.entries(y.fields || {}).forEach(([a, b]) => o[a] = vaerdi(b)); return o; }
    if (k === "arrayValue") return (y.values || []).map(vaerdi);
    return y;
  }
  // Find personen i husstanden: fast nummer → bogstav → fornavn
  function findPerson(hus, b){
    const alle = (hus.familiemedlemmer || []).filter(p => p.status !== "afdød" && p.status !== "udmeldt");
    const bogstav = b.nr.split("-")[1];
    return alle.find(p => String(p.fastNr || "") === b.nr)
        || alle.find(p => String(p.bogstav || "") === bogstav && p.rolle !== "barn")
        || alle.find(p => String(p.fornavn || "").trim().toLowerCase() === b.fornavn.toLowerCase());
  }

  let loefte = null;
  // Henter de aktuelle mails fra kartoteket. Returnerer listen (også hvis det fejler — så med reserve-mails).
  window.hentOlsenbanden = function(){
    if (loefte) return loefte;
    loefte = Promise.all(BANDEN.map(async b => {
      try {
        const svar = await fetch(URL + encodeURIComponent(b.nr.split("-")[0]) + "?key=" + NOEGLE);
        if (!svar.ok) return;
        const hus = vaerdi({ mapValue: (await svar.json()) });
        const p = findPerson(hus || {}, b);
        const mail = String((p && p.email) || "").split("/")[0].trim().toLowerCase();
        if (mail.includes("@")) {
          b.email = mail;
          if (!b.tidligere.includes(mail)) b.tidligere.push(mail);
        }
      } catch(e) { /* behold reserve-mailen */ }
    })).then(() => BANDEN);
    return loefte;
  };
  // Hvem i banden har denne mail (ny eller gammel)?
  window.findIOlsenbanden = function(mail){
    const m = String(mail || "").trim().toLowerCase();
    return BANDEN.find(b => b.email === m || b.tidligere.map(x => x.toLowerCase()).includes(m)) || null;
  };
})();
