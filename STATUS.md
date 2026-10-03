# OlsenKlanen — Projektstatus

Sidst opdateret: 2026-10-03

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

## Huskeliste — oprydning (aftalt 3. okt. 2026, tages en anden dag)

- **Gamle build-filer i Google Cloud:** Ved deploy af Cloud Functions 3. okt. kunne Firebase ikke rydde gamle build-filer op. Det kan koste få øre om måneden. Slettes her: https://console.cloud.google.com/gcr/images/olsenklanen-familieside/eu/gcf
- **Bred tilladelse til GitHub:** Servicekontoen `firebase-adminsdk-fbsvc@…` fik 3. okt. rollerne **Redaktør** og **Bruger af servicekonto**, så GitHub kan deploye Cloud Functions. Redaktør er en bred rolle. Overvej at skifte den til smallere roller.
- **Cloud Billing API** blev slået til 3. okt. (krævet af Firebase ved deploy af functions). Koster intet.
- **Gamle filer i repoet:** Der ligger flere kopier og gamle udgaver (fx `admin (1).html`, `admin (2).html`, `forside (6).html`, `forside (10).html`, `forside (11).html`, `blad-2022 (1).html`, `index (22).html`, `medlemskartotek.html.html`, `olsenbanden (2).html`, `olsenbanden (5).html`). Gennemgå og fjern dem, der ikke bruges.

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

---

## Teknisk overblik

- **Firebase-projekt:** `olsenklanen-familieside`
- **Repo:** github.com/carstengramsth-beep/OlsenKlanen (branch: main)
- **Firestore-samlinger:** brugere, nyheder, kalender, billeder, godkendelser, log, system, udviklingslog
- **Realtime Database:** presence/{email} — online-status (Europa-region)
- **Roller:** administrator (Carsten Gram) · redaktør (Kurt, Sanne, Tommy, Karin m.fl.)
