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

  // Modtageren
  const tilHus = tekst(kort.til_hus);
  const tilIdx = parseInt(kort.til_idx, 10);
  const tilSnap = tilHus ? await db.doc("membres/" + tilHus).get() : null;
  const tilHusstand = tilSnap && tilSnap.exists ? tilSnap.data() : null;
  const modtager = tilHusstand && (tilHusstand.familiemedlemmer || [])[tilIdx];
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
async function sendBrevkort() {
  const db = getFirestore();
  const koe = await db.collection("olsenpost_mail").where("status", "==", "afventer").get();
  // brevkort: til alle (kun fra postansvarlige) · kort_medlem: til ét medlem (lagt i kø af logInPostansvarlig)
  const kort = koe.docs.filter(d => (d.data().type === "brevkort" && POSTANSVARLIGE.includes(d.data().fra_nr)) || d.data().type === "kort_medlem");
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
    ${billede ? '<div style="text-align:center;"><img src="cid:maleri" alt="" style="max-width:100%;max-height:380px;width:auto;height:auto;display:inline-block;"></div>' : ""}
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
      ${k.kort_maler ? "Maleri: " + escHtml(k.kort_maler) + " · " : ""}<a href="https://olsenklanen.dk" style="color:#8a7a3f;">olsenklanen.dk</a>
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
