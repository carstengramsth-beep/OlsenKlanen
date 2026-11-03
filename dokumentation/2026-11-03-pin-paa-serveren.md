# PIN tjekkes på serveren (sikkerhed, trin 1 af PIN-beskyttelsen)

3. nov. 2026, godkendt af Carsten.

## Lavet nu
- PIN-kontrollen ligger i `pinTjek` (functions/index.js). login.html kalder `logInPostansvarlig({ kunTjek: true })`,
  fordi den nye funktion `tjekPin` ikke kunne gøres offentlig fra GitHub-deployet (manglende IAM-ret).
- Efter 10 forkerte forsøg på samme husstand spærres i 15 minutter (gemmes i `pin_forsoeg`,
  som Firestore-reglerne ikke nævner, og som derfor er lukket for alle andre end serveren).
  Samme spærring gælder `logInPostansvarlig` (OlsenPost og postkort).
- Reserve: kan serveren ikke nås, bruger login den gamle kontrol i browseren, så login aldrig går i stå.
  Reserven fjernes i næste trin.

## Næste trin (ikke lavet endnu)
- Flyt PIN-koderne fra `membres` til en lukket samling (`pinkoder`), som kun serveren kan læse.
- Ret medlemskartoteket (visning/ændring af PIN og "Godkend medlemsdata") og gaester.html til at bruge serveren.
- Slet derefter `kode` fra `membres`, og fjern reserven i login.html.

## Vigtigt at vide (fundet 3. nov.)
- olsenklanen.dk vises fra GitHub Pages, ikke fra Firebase Hosting (domænet er ikke koblet på Firebase).
  Repoet må derfor IKKE gøres privat, før domænet er flyttet til Firebase.
- De aktive Firestore-regler (fra 2. okt.) er ikke de samme som `firestore.rules` i repoet.
  Realtime Database-reglerne er heller ikke de samme som `database.rules.json`.
