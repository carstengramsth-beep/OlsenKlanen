const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

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

  return { token, postansvarlig: erPostansvarlig, bekraeftet: erBekraeftet };
});

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
  { schedule: "every 5 minutes", secrets: [imapAdgangskode], timeoutSeconds: 120 },
  async () => {
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
