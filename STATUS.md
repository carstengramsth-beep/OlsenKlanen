# OlsenKlanen — Projektstatus

Sidst opdateret: 2026-10-06

---

## Hvad er bygget

| Feature | Status |
|---|---|
| Skovtur 2025 fotogalleri på forsiden | Deployed |
| Responsivt layout (desktop + mobil) | Deployed |
| Årsarkiv-skabelon | Deployed |
| Firebase Auth med roller (administrator/redaktør) | Deployed |
| Online-indikator (Realtime Database presence) | Deployed |
| "Online nu"-panel i admin med grøn/rød status | Deployed |
| Firestore sikkerhedsregler | Klar — afventer indsætning i Firebase Console |
| Realtime Database sikkerhedsregler | Klar — afventer indsætning i Firebase Console |
| OlsenPost: svar med hele mail-tråden | Deployed (3. okt. 2026) |
| OlsenPost: "Læst, forstået og arkiveret" + Arkiv + kvartalsoprydning | Deployed (3. okt. 2026) |
| OlsenPost: faner "Nye mails" / "Læste mails" + besked til de 5 på forsiden | Deployed (3. okt. 2026) |
| OlsenPost: henter også mails, der er åbnet i Simplys webmail | Deployed (3. okt. 2026) |
| Cloud Functions på Node 22 + GitHub Action "Deploy Cloud Functions" | Deployed (3. okt. 2026) |
| OlsenPost: gul post-linje åbner fanen "Intern besked" med den nye besked øverst | Deployed (5. okt. 2026) |
| Fødselsdagshilsen: "Skriv hilsen" på dagen + ⭐ og antal (højst 100) + prøve-hilsen (`forside.html?testhilsen=1`) | Deployed (5. okt. 2026) |
| Fødselsdagskort: navnene på alle afsendere i flæng, kan gemmes som PDF / printes på A4 | Deployed (6. okt. 2026) |

## Huskeliste — oprydning (aftalt 3. okt. 2026, tages en anden dag)

- **Gamle build-filer i Google Cloud:** Ved deploy af Cloud Functions 3. okt. kunne Firebase ikke rydde gamle build-filer op. Det kan koste få øre om måneden. Slettes her: https://console.cloud.google.com/gcr/images/olsenklanen-familieside/eu/gcf
- **Bred tilladelse til GitHub:** Servicekontoen `firebase-adminsdk-fbsvc@…` fik 3. okt. rollerne **Redaktør** og **Bruger af servicekonto**, så GitHub kan deploye Cloud Functions. Redaktør er en bred rolle. Overvej at skifte den til smallere roller.
- **Cloud Billing API** blev slået til 3. okt. (krævet af Firebase ved deploy af functions). Koster intet.
- **EmailJS-stempel i mails:** Alle mails fra OlsenPost får teksten "Email sent via EmailJS.com" nederst. To muligheder:
  1. EmailJS **Personal**: 9 USD/md. (ca. 56–60 kr.), eller ca. 45 kr./md. ved årlig betaling (20 % rabat). Fjerner stemplet ("Completely white label") og giver 2.000 mails/md.
  2. Send mails via Simply (post@olsenklanen.dk) fra en Cloud Function i stedet for EmailJS. Gratis, men en større opgave, der skal testes grundigt. **Anbefalet.**
- **EmailJS' gratis loft:** Gratis-pakken giver kun 200 mails om måneden, og hver modtager tæller som én. En mail til alle med "Vælg alle" kan ramme loftet, og så bliver resten ikke sendt. Følg forbruget, og løs det sammen med punktet ovenfor.
- **Gamle filer i repoet:** Der ligger flere kopier og gamle udgaver (fx `admin (1).html`, `admin (2).html`, `forside (6).html`, `forside (10).html`, `forside (11).html`, `blad-2022 (1).html`, `index (22).html`, `medlemskartotek.html.html`, `olsenbanden (2).html`, `olsenbanden (5).html`). Gennemgå og fjern dem, der ikke bruges.

## Idéer til senere

- **Julehilsner / fælles julekort (Carstens idé, 6. okt. 2026):** Byg videre på fødselsdagshilsnerne og fødselsdagskortet.
  - Fra slutningen af november kan man sende julehilsner, og man får julekort løbende frem mod jul.
  - **Fælles julekort:** Man skriver sig på et kort sammen med andre medlemmer. Man kan selv vælge, hvem man står sammen med, eller lade siden blande navnene tilfældigt.
  - Kortet får julepynt (grantræ, nisser, stjerner, lys) i stedet for flag og kager.
  - Kortet kan gemmes som PDF eller printes på A4 og lægges på julebordet. Nederst står olsenklanen.dk.
  - Husk EmailJS' gratis loft på 200 mails om måneden (se huskelisten ovenfor). Julehilsner kan hurtigt ramme det.

- **Lykønskning ved alle mærkedage (Carstens idé, 6. okt. 2026) — afventer fodslag i familien:** Følg først, om fødselsdagshilsnerne bliver taget godt imod, eller om der kommer indsigelser. Bliv enige, før det bygges.
  - Kartoteket har allerede "➕ Begivenhed" (konfirmation, bryllupsdag, sølv-, guld- og diamantbryllup, jubilæum, andet). Tilføj **Student** og **Svendeprøve / uddannelse**.
  - Vis begivenhederne under "Fremhævede begivenheder" på forsiden, ligesom fødselsdagene.
  - Giv dem samme "Skriv hilsen", ⭐ og kort, som fødselsdagene har. Hver type får sin egen pynt (fx studenterhue, diamanter).
  - Eksempel: Carsten og Elisabeths diamantbryllup om 5–6 år.

## Afventer

- **Firebase Console:** Indsæt regler fra `firestore.rules` (Firestore → Regler) og `database.rules.json` (Realtime Database → Regler)
- **Sannes stamtræ-input:** Indhold modtages fra Sanne Gram Fadel (safi@dr.dk)

---

## Backlog — fremtidige ønsker

1. Systemoversigt over hele OlsenKlanen-arkitekturen
2. Selvbetjening: medlemmer tilmelder sig og tilføjer familie selv
3. Skovtur-tilmelding med navn og foto (`upload_skovtur.html` er et første udkast)
4. Sannes stamtræ-input integreret
5. Beskeder mellem familiemedlemmer
6. Forbedret mobilvisning
7. Egne @olsenklanen.dk-adresser til medlemmer (fx carsten@olsenklanen.dk). Tilbydes som en mulighed, når der er styr på medlemmerne. Oprettes hos Simply, enten som videresendelse til medlemmets egen mail eller som rigtig postkasse. Simplys priser skal undersøges, og så skal det prissættes for medlemmerne. Har intet med EmailJS-loftet at gøre.

---

## Teknisk overblik

- **Firebase-projekt:** `olsenklanen-familieside`
- **Repo:** github.com/carstengramsth-beep/OlsenKlanen (branch: main)
- **Firestore-samlinger:** brugere, nyheder, kalender, billeder, godkendelser, log, system, udviklingslog
- **Realtime Database:** presence/{email} — online-status (Europa-region)
- **Roller:** administrator (Carsten Gram) · redaktør (Kurt, Sanne, Tommy, Karin m.fl.)
