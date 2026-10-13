const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");

initializeApp();
setGlobalOptions({ region: "europe-west1" });

const imapAdgangskode = defineSecret("OLSENPOST_IMAP_PASSWORD");

// Samme 5 postansvarlige som i meddelelser.html (Carsten, Kurt, Sanne, Karin, Tommy)
const POSTANSVARLIGE = ["8-B", "19-A", "22-B", "23-B", "48-B"];

/**
 * Bekræfter medlemsnummer + PIN server-side mod "membres"-samlingen (samme
 * kode-felt som hoveddør-login bruger), og udsteder — hvis det lykkes — et
 * Firebase Auth custom token med claims postansvarlig:true/false og
 * bekraeftet:true/false. Klienten logger derefter ind med
 * signInWithCustomToken(), så Firestore-reglerne for olsenpost_mail kan
 * stole på request.auth.token.
 *
 * bekraeftet:true betyder, at husstanden har trykket "Bekræft data og
 * medlemskab" i Medlemskartoteket — det er adgangsbilletten, der lader et
 * almindeligt medlem (ikke kun de 5 postansvarlige) sende én-til-én mail
 * til et andet medlem via OlsenPost.
 */
exports.logInPostansvarlig = onCall(async (request) => {
  const nrRaa = String(request.data && request.data.nr || "").trim().toUpperCase();
  const pin = String(request.data && request.data.pin || "").trim();

  const m = nrRaa.match(/^(\d+)\s*[-\s]?\s*([A-ZÆØÅ]|\d+)?$/);
  if (!m || !pin) {
    throw new HttpsError("invalid-argument", "Skriv både medlemsnummer og PIN-kode.");
  }
  const hus = m[1];
  const del = (m[2] || "").trim();
  const fuldtNr = del ? `${hus}-${del}` : hus;

  const snap = await getFirestore().doc("membres/" + hus).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Medlemsnummer ikke fundet.");
  }
  const husstand = snap.data();
  const rigtigKode = String(husstand.kode || "").trim();
  if (!rigtigKode || rigtigKode !== pin) {
    throw new HttpsError("permission-denied", "Forkert PIN-kode.");
  }

  const erPostansvarlig = POSTANSVARLIGE.includes(fuldtNr);
  const erBekraeftet = !!husstand.medlemskab_bekraeftet;
  const uid = "medlem_" + fuldtNr.replace(/[^A-Z0-9]/g, "");
  const token = await getAuth().createCustomToken(uid, {
    postansvarlig: erPostansvarlig,
    bekraeftet: erBekraeftet,
    medlemsnr: fuldtNr
  });

  // Kort fra medlem til medlem: PIN er tjekket ovenfor, så afsenderen er bevist.
  // Kortet lægges i kø her (med admin-rettigheder) og sendes af tjekIndkommendeMail.
  if (request.data && request.data.kort) {
    const kortId = await koeMedlemsKort(fuldtNr, husstand, request.data.kort);
    return { token, postansvarlig: erPostansvarlig, bekraeftet: erBekraeftet, kortId };
  }

  return { token, postansvarlig: erPostansvarlig, bekraeftet: erBekraeftet };
});

/**
 * Lægger et kort fra ét medlem til ét andet i kø (olsenpost_mail, type "kort_medlem").
 * Krav: Begge husstande har bekræftet deres data i kartoteket ("godkendt"),
 * og både afsender og modtager har en EGEN mail. Højst 20 kort pr. afsender pr. døgn.
 */
async function koeMedlemsKort(fraNr, fraHusstand, kort) {
  const db = getFirestore();
  const tekst = v => String(v == null ? "" : v).trim();
  const aktiv = p => p && p.status !== "afdød" && p.status !== "udmeldt";
  const fornavnAf = p => tekst(p.fornavn || tekst(p.navn).split(/\s+/)[0]);

  if (!fraHusstand.medlemskab_bekraeftet) {
    throw new HttpsError("failed-precondition", "Din husstand har ikke godkendt sine oplysninger i kartoteket endnu.");
  }
  // Afsenderens egen mail: personen i husstanden med samme fornavn
  const fraFornavn = tekst(kort.fra_fornavn).toLowerCase();
  const afsender = (fraHusstand.familiemedlemmer || []).find(p => aktiv(p) && fornavnAf(p).toLowerCase() === fraFornavn && tekst(p.email).includes("@"));
  if (!afsender) {
    throw new HttpsError("failed-precondition", "Du har ikke din egen mail i kartoteket.");
  }

  // Modtageren — "til mig selv" sendes til afsenderens egen mail
  const tilSelv = kort.til_selv === true;
  const tilHus = tilSelv ? fraNr.split("-")[0] : tekst(kort.til_hus);
  const tilIdx = parseInt(kort.til_idx, 10);
  const tilSnap = tilHus ? await db.doc("membres/" + tilHus).get() : null;
  const tilHusstand = tilSnap && tilSnap.exists ? tilSnap.data() : null;
  const modtager = tilSelv ? afsender : (tilHusstand && (tilHusstand.familiemedlemmer || [])[tilIdx]);
  if (!tilHusstand || !aktiv(modtager) || !tekst(modtager.email).includes("@")) {
    throw new HttpsError("not-found", "Modtageren har ikke en egen mail i kartoteket.");
  }
  if (!tilHusstand.medlemskab_bekraeftet) {
    throw new HttpsError("failed-precondition", "Modtagerens husstand har ikke godkendt sine oplysninger endnu.");
  }

  // Højst 20 kort pr. døgn fra samme afsender
  const siden = Date.now() - 24 * 3600 * 1000;
  const mine = await db.collection("olsenpost_mail").where("fra_nr", "==", fraNr).get();
  if (mine.docs.filter(d => d.data().type === "kort_medlem" && (d.data().sendt_lokal || 0) > siden).length >= 20) {
    throw new HttpsError("resource-exhausted", "Du har sendt mange kort i dag. Prøv igen i morgen.");
  }

  const fil = tekst(kort.kort_fil);
  const fraNavn = tekst(kort.fra_navn).slice(0, 80) || fornavnAf(afsender);
  const tilNavn = [tekst(modtager.fornavn), tekst(modtager.efternavn)].filter(Boolean).join(" ") || tekst(modtager.navn);
  const ref = await db.collection("olsenpost_mail").add({
    type: "kort_medlem", status: "afventer",
    fra_nr: fraNr, fra_navn: fraNavn, fra_email: tekst(afsender.email),
    til_nr: tilHus, til_navn: tilNavn, til_email: tekst(modtager.email), til_fornavn: fornavnAf(modtager),
    emne: tekst(kort.emne).slice(0, 100) || ("Et kort fra " + fraNavn),
    tekst: [tekst(kort.kort_til), tekst(kort.kort_besked), "", tekst(kort.kort_slut), tekst(kort.kort_fra)].join("\n").slice(0, 1500),
    kort_fil: /^billeder\/kort\/[\w\-]+\.jpg$/.test(fil) ? fil : "",
    kort_maler: tekst(kort.kort_maler).slice(0, 60),
    kort_art: tekst(kort.kort_art).slice(0, 20) || "Maleri",
    kort_nr: Number.isInteger(kort.kort_nr) ? kort.kort_nr : null,
    kort_titel: tekst(kort.kort_titel).slice(0, 120),
    kort_titel_vis: tekst(kort.kort_titel_vis).slice(0, 120),
    kort_til: tekst(kort.kort_til).slice(0, 80), kort_besked: tekst(kort.kort_besked).slice(0, 900),
    kort_slut: tekst(kort.kort_slut).slice(0, 60), kort_fra: tekst(kort.kort_fra).slice(0, 80),
    kort_skrift: Number.isInteger(kort.kort_skrift) ? kort.kort_skrift : 0,
    sendt: FieldValue.serverTimestamp(), sendt_lokal: Date.now(),
    besvaret: false, besvaret_af: null, besvaret_tid: null
  });
  return ref.id;
}

/**
 * Tjekker løbende post@olsenklanen.dks postkasse (hos Simply.com) for nye
 * mails via IMAP.
 *
 * "Ny" betyder: kommet ind i postkassen efter sidste tjek — uanset om nogen
 * allerede har åbnet den i Simplys webmail. Det huskes i
 * olsenpost/imap_status (højeste behandlede UID). Første gang (eller hvis
 * Simply nulstiller postkassen) bruges de ulæste mails i stedet, så hele
 * den gamle postkasse ikke hentes ind. Samme mail hentes aldrig to gange
 * (tjekkes på Message-ID).
 *
 * For hver ny mail:
 *  - Lægges den altid ind i olsenpost_indkomne, så den kan ses under
 *    "Indkomne mails" i OlsenPost.
 *  - Hvis den kan matches til en tidligere afsendt, ubesvaret mail i
 *    olsenpost_mail (samme afsender-mailadresse), markeres den oprindelige
 *    mail som besvaret.
 * Mailen markeres også som læst i selve postkassen bagefter.
 */
exports.tjekIndkommendeMail = onSchedule(
  { schedule: "every 5 minutes", secrets: [imapAdgangskode], timeoutSeconds: 540 },
  async () => {
    // Fødselsdagshilsner skrevet dagen før sendes på selve dagen (fejl her stopper ikke mail-tjekket)
    try { await sendPlanlagteHilsner(); } catch (e) { console.log("Planlagte hilsner fejlede:", e && e.message); }
    // Brevkort til alle medlemmer (sat i kø fra kort.html af en postansvarlig)
    try { await sendBrevkort(); } catch (e) { console.log("Brevkort fejlede:", e && e.message); }
    // Medlemmer, der selv har bedt om at få en information tilsendt (automatisk)
    try { await behandlInfoAnmodninger(); } catch (e) { console.log("Info-anmodninger fejlede:", e && e.message); }
    const db = getFirestore();
    const client = new ImapFlow({
      host: "imap.simply.com",
      port: 993,
      secure: true,
      auth: { user: "post@olsenklanen.dk", pass: imapAdgangskode.value() },
      logger: false
    });

    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const statusRef = db.doc("olsenpost/imap_status");
        const statusSnap = await statusRef.get();
        const status = statusSnap.exists ? statusSnap.data() : {};
        const uidValidity = String(client.mailbox.uidValidity);
        const kendtPostkasse = status.uid_validity === uidValidity && Number(status.sidste_uid) > 0;
        let hoejesteUid = kendtPostkasse ? Number(status.sidste_uid) : 0;

        const nyeUids = kendtPostkasse
          ? await client.search({ uid: (hoejesteUid + 1) + ":*" }, { uid: true })
          : await client.search({ seen: false }, { uid: true });
        // "N:*" giver altid mindst den sidste mail — også selv om den er gammel
        const uids = (nyeUids || []).filter(u => u > hoejesteUid).sort((a, b) => a - b);

        if (!uids.length) {
          console.log("Ingen nye mails.");
        }

        let fejlUid = null;

        for (const uid of uids) {
          try {
            const besked = await client.fetchOne(uid, { source: true }, { uid: true });
            const parsed = await simpleParser(besked.source);
            const messageId = String(parsed.messageId || "").trim();

            // Allerede hentet ind (fx før denne ændring)? Så spring over.
            if (messageId) {
              const findes = await db.collection("olsenpost_indkomne")
                .where("message_id", "==", messageId).limit(1).get();
              if (!findes.empty) {
                hoejesteUid = Math.max(hoejesteUid, uid);
                continue;
              }
            }

            const fraNavn = (parsed.from && parsed.from.value[0] && parsed.from.value[0].name) || "";
            const fraEmail = ((parsed.from && parsed.from.value[0] && parsed.from.value[0].address) || "").toLowerCase().trim();
            const emne = parsed.subject || "(intet emne)";
            const tekst = (parsed.text || "").trim();

            // Spring mails fra klanens egen adresse over (undgå selv-løkker)
            if (!fraEmail || fraEmail === "post@olsenklanen.dk") {
              await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
              hoejesteUid = Math.max(hoejesteUid, uid);
              continue;
            }

            // Forsøg at matche til en tidligere ubesvaret, afsendt mail
            const matchSnap = await db.collection("olsenpost_mail")
              .where("til_email", "==", fraEmail)
              .where("besvaret", "==", false)
              .orderBy("sendt_lokal", "desc")
              .limit(1)
              .get();

            if (!matchSnap.empty) {
              await matchSnap.docs[0].ref.update({
                besvaret: true,
                besvaret_af: fraNavn || fraEmail,
                besvaret_tid: FieldValue.serverTimestamp()
              });
            }

            await db.collection("olsenpost_indkomne").add({
              fra_navn: fraNavn || fraEmail,
              fra_email: fraEmail,
              emne,
              tekst,
              message_id: messageId || null,
              modtaget: FieldValue.serverTimestamp(),
              modtaget_lokal: Date.now(),
              besvaret: false,
              besvaret_af: null,
              besvaret_tid: null
            });

            await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
            hoejesteUid = Math.max(hoejesteUid, uid);
            console.log("Behandlet mail fra", fraEmail);
          } catch (indreFejl) {
            console.log("Fejl ved behandling af mail (uid " + uid + "):", indreFejl);
            if (status.fejl_uid === uid) {
              // Fejlede også sidste gang — spring den over, så den ikke blokerer de næste mails
              hoejesteUid = Math.max(hoejesteUid, uid);
              continue;
            }
            // Stop her, så mailen prøves igen ved næste tjek
            fejlUid = uid;
            break;
          }
        }

        // Første gang: start fra den nyeste mail i postkassen, så gamle mails ikke hentes ind
        if (!kendtPostkasse && !fejlUid && client.mailbox.uidNext) {
          hoejesteUid = Math.max(hoejesteUid, Number(client.mailbox.uidNext) - 1);
        }
        await statusRef.set({
          uid_validity: uidValidity,
          sidste_uid: hoejesteUid,
          fejl_uid: fejlUid,
          opdateret: FieldValue.serverTimestamp()
        });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }
  }
);

/**
 * Fødselsdagshilsner, der er skrevet DAGEN FØR fødselsdagen, gemmes i
 * "hilsener" med planlagt_til (ÅÅÅÅ-MM-DD) og mail_sendt:false. Denne
 * funktion sender dem på selve dagen (fra kl. 7 dansk tid) via Simply med
 * post@olsenklanen.dk som afsender og afsenderens egen mail som svar-adresse.
 * Modtagerens mail slås op i kartoteket (fornavn + fødselsdato), så den ikke
 * skal gemmes i hilsenen. Kaldes fra tjekIndkommendeMail (hvert 5. minut),
 * så en fejl prøves igen. (Ikke en selvstændig funktion: en ny planlagt
 * funktion kræver en IAM-rolle, som deploy-kontoen ikke har.)
 */
async function sendPlanlagteHilsner() {
    const db = getFirestore();
    const nu = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
    if (nu.getHours() < 7) return;
    const idag = nu.getFullYear() + "-" + String(nu.getMonth() + 1).padStart(2, "0") + "-" + String(nu.getDate()).padStart(2, "0");

    const snap = await db.collection("hilsener").where("mail_sendt", "==", false).get();
    const klar = snap.docs.filter(d => (d.data().planlagt_til || "9999") <= idag);
    if (!klar.length) return;

    // Find modtagerens mail i kartoteket: fornavn + fødselsdato (afdøde/udmeldte springes over)
    const membres = await db.collection("membres").get();
    function findMail(fornavn, foedselsdato) {
      let mail = "";
      membres.forEach(d => {
        const fam = d.data();
        (fam.familiemedlemmer || []).forEach(p => {
          if (mail || p.status === "afdød" || p.status === "udmeldt") return;
          const fn = (p.fornavn || String(p.navn || "").trim().split(/\s+/)[0] || "").trim();
          if (fn === fornavn && p.foedselsdato === foedselsdato) {
            mail = String(p.email || (p.rolle !== "barn" ? fam.email : "") || "").trim();
          }
        });
      });
      return mail;
    }

    const transport = nodemailer.createTransport({
      host: "smtp.simply.com", port: 587, secure: false,
      auth: { user: "post@olsenklanen.dk", pass: imapAdgangskode.value() }
    });

    for (const d of klar) {
      const h = d.data();
      const [, fornavn, foedselsdato] = String(h.tilNoegle || "").split("|");
      const til = findMail(fornavn, foedselsdato);
      if (!til) {
        await d.ref.update({ mail_fejl: "Ingen mail i kartoteket" });
        continue;
      }
      try {
        await transport.sendMail({
          from: { name: (h.mail_fra_navn || "Et medlem") + " – Olsenklanen", address: "post@olsenklanen.dk" },
          to: til,
          replyTo: h.mail_svar_til || "post@olsenklanen.dk",
          subject: h.mail_emne || ("🎂 Tillykke med fødselsdagen, " + fornavn + "!"),
          text: h.mail_tekst || h.besked || ""
        });
        await d.ref.update({ mail_sendt: true, mail_sendt_tid: FieldValue.serverTimestamp(), mail_fejl: FieldValue.delete() });
      } catch (e) {
        console.log("Kunne ikke sende planlagt hilsen", d.id, e && e.message);
        await d.ref.update({ mail_fejl: String(e && e.message || e).slice(0, 300) });
      }
    }
}

/**
 * Brevkort til alle medlemmer. En postansvarlig (PIN-bekræftet) lægger kortet
 * i olsenpost_mail med type "brevkort" og status "afventer" fra kort.html.
 * Her sendes det fra post@olsenklanen.dk til alle aktive medlemmer med EGEN
 * mail i kartoteket (hver mail én gang), med maleriet i mailen. Status og
 * antal skrives tilbage på dokumentet.
 */
function escHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/**
 * Infomail til alle medlemmer: tekst og billeder ligger i selve mailen (ingen links nødvendige).
 * Indholdet hentes fra hjemmesiden: infomails/<skabelon>.json (tekst) og billeder/vejledning/*.
 * Lægges i kø fra OlsenPost (meddelelser.html?skabelon=...) med type "infomail".
 */
const INFOMAIL_FODLINJE = "Kun til medlemmer af OlsenKlanen – send den ikke videre.";
function infomailDato(d) {
  const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (+m[3]) + ". " + ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"][+m[2] - 1] + " " + m[1] : "";
}
function infomailIndhold(data, billeder, meta) {
  const html = [], tekst = [];
  if (meta && meta.nr) {
    const linje = "Info nr. " + meta.nr + (meta.dato ? " · " + infomailDato(meta.dato) : "") + (meta.gensendt ? "" : "");
    html.push(`<p style="font-size:13px;color:#8a7a3f;margin:0 0 10px;"><b>${escHtml(linje)}</b></p>`);
    tekst.push(linje, "");
  }
  const p = t => `<p style="font-size:16px;line-height:1.55;margin:0 0 14px;">${escHtml(t).replace(/\n/g, "<br>")}</p>`;
  html.push(`<p style="font-size:19px;margin:0 0 16px;">${escHtml(data.hilsen || "")}</p>`);
  tekst.push(data.hilsen || "", "");
  for (const a of data.afsnit || []) {
    if (a.type === "p") { html.push(p(a.tekst)); tekst.push(a.tekst, ""); }
    else if (a.type === "billede") {
      const b = billeder.get(a.billede);
      if (b) html.push(`<div style="margin:0 0 16px;text-align:center;"><img src="cid:${b.cid}" alt="" width="${a.bredde || 420}" style="display:inline-block;width:100%;max-width:${a.bredde || 420}px;height:auto;border-radius:4px;">${a.tekst ? `<div style="font-size:12px;color:#8a7a3f;font-style:italic;margin-top:4px;">${escHtml(a.tekst)}</div>` : ""}</div>`);
      if (a.tekst) tekst.push("[Billede: " + a.tekst + "]", "");
    }
    else if (a.type === "h") { html.push(`<h2 style="color:#2d5016;font-size:19px;margin:26px 0 10px;">${escHtml(a.tekst)}</h2>`); tekst.push(String(a.tekst).toUpperCase()); }
    else if (a.type === "trin") {
      const b = billeder.get(a.billede);
      html.push(`<div style="margin:0 0 18px;"><p style="font-size:16px;line-height:1.55;margin:0 0 8px;"><b style="display:inline-block;background:#2d5016;color:#fff;border-radius:12px;padding:1px 9px;margin-right:6px;">${escHtml(a.nr)}</b>${escHtml(a.tekst)}</p>` +
        (b ? `<img src="cid:${b.cid}" alt="" width="${a.bredde || 552}" style="display:block;width:100%;max-width:${a.bredde || 552}px;height:auto;border:1px solid #ddd;border-radius:6px;">` : "") + `</div>`);
      tekst.push(a.nr + ". " + a.tekst);
    }
    else if (a.type === "liste" || a.type === "nummerliste") {
      const tag = a.type === "liste" ? "ul" : "ol";
      html.push(`<${tag} style="font-size:16px;line-height:1.55;margin:0 0 14px;padding-left:24px;">` + (a.punkter || []).map(x => `<li style="margin:4px 0;">${escHtml(x)}</li>`).join("") + `</${tag}>`);
      (a.punkter || []).forEach((x, i) => tekst.push((a.type === "liste" ? "- " : (i + 1) + ". ") + x));
      tekst.push("");
    }
    else if (a.type === "tip") { html.push(`<p style="font-size:15px;line-height:1.5;margin:0 0 14px;background:#fff8e1;border-left:4px solid #b8860b;padding:8px 12px;">${escHtml(a.tekst)}</p>`); tekst.push(a.tekst, ""); }
  }
  html.push(`<p style="font-size:16px;line-height:1.5;margin:20px 0 0;">${(data.slut || []).map(escHtml).join("<br>")}</p>`);
  tekst.push("", ...(data.slut || []));
  return {
    html: `<div style="background:#f5f1e8;padding:20px 0;font-family:Georgia,'Times New Roman',serif;color:#2c3e1f;">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    ${html.join("\n    ")}
    <div style="border-top:1px solid #d8cfae;margin-top:22px;padding-top:8px;font-size:12px;color:#8a7a3f;font-style:italic;">Familieforeningen OlsenKlanen · olsenklanen.dk<br>${escHtml(INFOMAIL_FODLINJE)}</div>
  </div>
</div>`,
    tekst: tekst.join("\n") + "\n\n— Familieforeningen OlsenKlanen · olsenklanen.dk\n" + INFOMAIL_FODLINJE
  };
}

async function sendInfomail(d) {
  const db = getFirestore();
  const taget = await db.runTransaction(async t => {
    const frisk = await t.get(d.ref);
    if (frisk.data().status !== "afventer") return false;
    t.update(d.ref, { status: "sender", sender_start: FieldValue.serverTimestamp() });
    return true;
  });
  if (!taget) return;
  const k = d.data();
  try {
    const navn = String(k.skabelon || "");
    if (!/^[a-z0-9\-]+$/.test(navn)) throw new Error("Ukendt infomail");
    const svar = await fetch("https://olsenklanen.dk/infomails/" + navn + ".json?t=" + Date.now());
    if (!svar.ok) throw new Error("Kunne ikke hente infomails/" + navn + ".json");
    const data = await svar.json();
    // Nummer og dato fra listen (infomails/index.json)
    let meta = {};
    try { meta = ((await (await fetch("https://olsenklanen.dk/infomails/index.json?t=" + Date.now())).json()) || []).find(x => x.id === navn) || {}; } catch (e) { /* uden nummer */ }

    // Billederne hentes én gang og lægges ind i mailen (cid)
    const billeder = new Map();
    let i = 0;
    for (const a of data.afsnit || []) {
      const fil = String(a.billede || "");
      if (!fil || billeder.has(fil) || !/^billeder\/(vejledning|kort)\/[\w\-]+\.(png|jpg)$/.test(fil)) continue;
      const b = await fetch("https://olsenklanen.dk/" + fil);
      if (!b.ok) throw new Error("Kunne ikke hente " + fil);
      i++;
      billeder.set(fil, { cid: "billede" + i, filnavn: fil.split("/").pop(), indhold: Buffer.from(await b.arrayBuffer()) });
    }
    const { html, tekst } = infomailIndhold(data, billeder, meta);
    const vedhaeft = [...billeder.values()].map(b => ({ filename: b.filnavn, content: b.indhold, cid: b.cid }));

    // Modtagere: aktive personer med egen mail (hver mail én gang) — eller kun afsenderen ved en prøve
    const modtagere = new Map();
    // Prøve (til afsenderen) eller ét bestemt medlem (fx et nyt medlem): kun til den mail
    if ((k.prove || k.enkelt) && String(k.til_email || "").includes("@")) modtagere.set("en", String(k.til_email).trim());
    else if (k.enkelt) throw new Error("Medlemmet har ingen mail");
    else (await db.collection("membres").get()).forEach(m => (m.data().familiemedlemmer || []).forEach(p => {
      if (p.status === "afdød" || p.status === "udmeldt") return;
      const mail = String(p.email || "").trim();
      if (mail.includes("@") && !modtagere.has(mail.toLowerCase())) modtagere.set(mail.toLowerCase(), mail);
    }));

    const transport = nodemailer.createTransport({
      host: "smtp.simply.com", port: 587, secure: false, pool: true, maxConnections: 1,
      auth: { user: "post@olsenklanen.dk", pass: imapAdgangskode.value() }
    });
    let sendt = 0;
    const fejl = [];
    for (const mail of modtagere.values()) {
      try {
        await transport.sendMail({
          from: { name: "OlsenKlanen", address: "post@olsenklanen.dk" },
          to: mail,
          replyTo: k.fra_email || "post@olsenklanen.dk",
          subject: (k.prove ? "[PRØVE] " : "") + (meta.nr ? "Info nr. " + meta.nr + " – " : "") + (data.emne || k.emne || "Nyt fra OlsenKlanen"),
          text: tekst,
          html,
          attachments: vedhaeft
        });
        sendt++;
      } catch (e) {
        fejl.push(mail + ": " + String(e && e.message || e).slice(0, 120));
      }
      await new Promise(r => setTimeout(r, 300));
    }
    transport.close();
    await d.ref.update({
      status: "sendt", antal_sendt: sendt, antal_fejl: fejl.length,
      fejl_liste: fejl.slice(0, 20), sendt_faerdig: FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.log("Infomail", d.id, "fejlede:", e && e.message);
    await d.ref.update({ status: "fejl", mail_fejl: String(e && e.message || e).slice(0, 300) });
  }
}

/**
 * Et medlem beder selv om at få en information (infomail) tilsendt — fra OlsenPost → 📚 Informationer.
 * Anmodningen ligger i "olsenpost" med type "info_anmodning" og status "afventer".
 * Den sendes automatisk, men KUN til en mail, der står på en person i medlemmets egen husstand
 * i kartoteket (så ingen kan få post sendt til fremmede adresser), og højst 3 gange pr. døgn pr. mail.
 */
async function behandlInfoAnmodninger() {
  const db = getFirestore();
  const snap = await db.collection("olsenpost").where("type", "==", "info_anmodning").where("status", "==", "afventer").get();
  for (const d of snap.docs) {
    const taget = await db.runTransaction(async t => {
      const frisk = await t.get(d.ref);
      if (frisk.data().status !== "afventer") return false;
      t.update(d.ref, { status: "behandles" });
      return true;
    });
    if (!taget) continue;
    const a = d.data();
    const afvis = grund => d.ref.update({ status: "afvist", grund, behandlet: FieldValue.serverTimestamp() });
    try {
      const id = String(a.skabelon || "");
      if (!/^[a-z0-9\-]+$/.test(id)) { await afvis("Ukendt information."); continue; }
      const mail = String(a.email || "").trim().toLowerCase();
      const hus = String(a.fra_nr || "").split("-")[0];
      if (!mail.includes("@") || !/^\d+$/.test(hus)) { await afvis("Mailen mangler."); continue; }
      // Mailen skal stå på en (levende) person i medlemmets egen husstand
      const husDoc = await db.collection("membres").doc(hus).get();
      const husData = husDoc.exists ? husDoc.data() : {};
      const kendte = new Set();
      (husData.familiemedlemmer || []).forEach(p => {
        if (p.status === "afdød" || p.status === "udmeldt") return;
        String(p.email || "").split(/[\/;,\s]+/).forEach(m => { m = m.trim().toLowerCase(); if (m.includes("@")) kendte.add(m); });
      });
      String(husData.email || "").split(/[\/;,\s]+/).forEach(m => { m = m.trim().toLowerCase(); if (m.includes("@")) kendte.add(m); });
      if (!kendte.has(mail)) { await afvis("Mailen står ikke på din familie i Medlemskartoteket. Ret den i kartoteket, eller bed de 5 om hjælp."); continue; }
      // Højst 3 automatiske pr. døgn til samme mail
      const igaar = Date.now() - 24 * 60 * 60 * 1000;
      const tidligere = await db.collection("olsenpost_mail").where("til_email", "==", mail).get();
      if (tidligere.docs.filter(x => x.data().auto && (x.data().sendt_lokal || 0) > igaar).length >= 3) { await afvis("Du har allerede fået 3 informationer i dag. Prøv igen i morgen."); continue; }
      // Læg den i kø som en almindelig infomail til ét medlem — og send den med det samme
      const ref = await db.collection("olsenpost_mail").add({
        type: "infomail", status: "afventer", skabelon: id, auto: true,
        fra_nr: "auto", fra_navn: "Automatisk (bestilt af " + (a.fra_navn || a.fra_nr) + ")", fra_email: "post@olsenklanen.dk",
        til_nr: a.fra_nr || "", til_navn: a.fra_navn || "", til_email: mail,
        prove: false, enkelt: true, emne: "", tekst: "Automatisk genfremsendelse af information (" + id + ")",
        sendt: FieldValue.serverTimestamp(), sendt_lokal: Date.now(),
        besvaret: false, besvaret_af: null, besvaret_tid: null
      });
      await sendInfomail(await ref.get());
      const resultat = (await ref.get()).data() || {};
      if (resultat.status === "sendt") await d.ref.update({ status: "sendt", behandlet: FieldValue.serverTimestamp(), mail_id: ref.id });
      else await afvis("Mailen kunne ikke sendes: " + (resultat.mail_fejl || "ukendt fejl"));
    } catch (e) {
      console.log("Info-anmodning", d.id, "fejlede:", e && e.message);
      await afvis("Der skete en fejl. Prøv igen senere.");
    }
  }
}

async function sendBrevkort() {
  const db = getFirestore();
  const koe = await db.collection("olsenpost_mail").where("status", "==", "afventer").get();
  // brevkort: til alle (kun fra postansvarlige) · kort_medlem: til ét medlem (lagt i kø af logInPostansvarlig)
  const kort = koe.docs.filter(d => (d.data().type === "brevkort" && POSTANSVARLIGE.includes(d.data().fra_nr)) || d.data().type === "kort_medlem");
  // Færdige infomails med billeder i selve mailen (kun fra postansvarlige)
  for (const d of koe.docs.filter(d => d.data().type === "infomail" && POSTANSVARLIGE.includes(d.data().fra_nr))) {
    await sendInfomail(d);
  }
  if (!kort.length) return;

  for (const d of kort) {
    // Tag kortet (så det ikke sendes to gange, hvis funktionen kører igen imens)
    const taget = await db.runTransaction(async t => {
      const frisk = await t.get(d.ref);
      if (frisk.data().status !== "afventer") return false;
      t.update(d.ref, { status: "sender", sender_start: FieldValue.serverTimestamp() });
      return true;
    });
    if (!taget) continue;
    const k = d.data();

    try {
      // Modtagere: aktive personer med egen mail
      const membres = await db.collection("membres").get();
      const modtagere = new Map();   // mail -> fornavn
      // En prøve sendes kun til afsenderen selv
      if (k.type === "kort_medlem") modtagere.set("en", { mail: k.til_email, fornavn: k.til_fornavn || "" });
      else if (k.prove && String(k.til_email || "").includes("@")) modtagere.set("prove", { mail: k.til_email, fornavn: String(k.fra_navn || "").split(/\s+/)[0] });
      else membres.forEach(m => (m.data().familiemedlemmer || []).forEach(p => {
        if (p.status === "afdød" || p.status === "udmeldt") return;
        const mail = String(p.email || "").trim();
        if (!mail.includes("@") || modtagere.has(mail.toLowerCase())) return;
        const fornavn = (p.fornavn || String(p.navn || "").trim().split(/\s+/)[0] || "").trim();
        modtagere.set(mail.toLowerCase(), { mail, fornavn });
      }));

      // Maleriet hentes én gang fra hjemmesiden og lægges ind i mailen
      const fil = String(k.kort_fil || "");
      let billede = null;
      if (/^billeder\/kort\/[\w\-]+\.jpg$/.test(fil)) {
        const svar = await fetch("https://olsenklanen.dk/" + fil);
        if (svar.ok) billede = Buffer.from(await svar.arrayBuffer());
      }

      const transport = nodemailer.createTransport({
        host: "smtp.simply.com", port: 587, secure: false, pool: true, maxConnections: 1,
        auth: { user: "post@olsenklanen.dk", pass: imapAdgangskode.value() }
      });

      let sendt = 0;
      const fejl = [];
      for (const { mail, fornavn } of modtagere.values()) {
        const til = k.kort_til || (fornavn ? "Kære " + fornavn : "");
        const html = `<div style="background:#f5f1e8;padding:20px 0;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    ${billede ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td><img src="cid:maleri" alt="" style="max-width:100%;max-height:380px;width:auto;height:auto;display:block;"></td></tr>
      <tr><td style="text-align:right;font-size:12px;color:#8a7a3f;font-style:italic;padding-top:4px;">${k.kort_maler ? escHtml(k.kort_art || "Maleri") + (k.kort_nr ? " nr. " + escHtml(k.kort_nr) : "") + (k.kort_titel_vis ? " · \u201c" + escHtml(k.kort_titel_vis) + "\u201d ·" : ":") + " © " + escHtml(k.kort_maler) + " · " : ""}olsenklanen.dk</td></tr></table>` : ""}
    <div style="padding:22px 10px 6px;color:#2c3e1f;">
      ${til ? `<p style="font-size:20px;margin:0 0 14px;">${escHtml(til)}</p>` : ""}
      <p style="font-size:16px;line-height:1.55;margin:0;white-space:pre-wrap;">${escHtml(k.kort_besked)}</p>
      ${k.kort_slut ? `<p style="font-size:16px;margin:18px 0 0;">${escHtml(k.kort_slut)}</p>` : ""}
      ${k.kort_fra ? `<p style="font-size:18px;margin:2px 0 0;">${escHtml(k.kort_fra)}</p>` : ""}
    </div>
    <div style="text-align:center;margin:20px 0 6px;">
      <a href="https://olsenklanen.dk/kort.html?vis=${d.id}" style="display:inline-block;background:#2d5016;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:15px;">🖨️ Åbn kortet til print</a>
    </div>
    <div style="border-top:1px solid #d8cfae;margin-top:18px;padding-top:8px;font-size:12px;color:#8a7a3f;font-style:italic;">
      Kortet er lavet på <a href="https://olsenklanen.dk" style="color:#8a7a3f;">olsenklanen.dk</a> — Familieforeningen OlsenKlanen
    </div>
  </div>
</div>`;
        const tekst = [til, k.kort_besked, "", k.kort_slut, k.kort_fra, "", "— olsenklanen.dk"].filter((x, i) => x || i === 2 || i === 5).join("\n");
        try {
          await transport.sendMail({
            from: { name: (k.fra_navn || "OlsenKlanen") + " – Olsenklanen", address: "post@olsenklanen.dk" },
            to: mail,
            replyTo: k.fra_email || "post@olsenklanen.dk",
            subject: (k.prove ? "[PRØVE] " : "") + (k.emne || "Et kort fra OlsenKlanen"),
            text: tekst,
            html,
            attachments: billede ? [{ filename: "maleri.jpg", content: billede, cid: "maleri" }] : []
          });
          sendt++;
        } catch (e) {
          fejl.push(mail + ": " + String(e && e.message || e).slice(0, 120));
        }
        await new Promise(r => setTimeout(r, 300));   // lidt luft mellem mails
      }
      transport.close();
      await d.ref.update({
        status: "sendt", antal_sendt: sendt, antal_fejl: fejl.length,
        fejl_liste: fejl.slice(0, 20), sendt_faerdig: FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.log("Brevkort", d.id, "fejlede:", e && e.message);
      await d.ref.update({ status: "fejl", mail_fejl: String(e && e.message || e).slice(0, 300) });
    }
  }
}
