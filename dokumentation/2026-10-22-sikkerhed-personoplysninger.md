# Sikkerhed: personoplysninger fjernet fra repoet + status på databasen

Aftalt med Carsten 22. okt. 2026 (efter nyheden om PHP2Shell-hullet).

## PHP2Shell
- Hjemmesiden bruger ikke PHP. Den kører på Firebase Hosting. Hullet rammer ikke os.

## Rettet nu
- Fjernet fra repoet (som er offentligt på GitHub): `alle_personer.csv`, `membres_fra_pdf.json`,
  `afvigelser_membres.csv`, `afvigelser_membres.xlsx` og `byg_membres_fra_pdf.js`.
  De indeholdt navne, adresser, telefonnumre, mails og fødselsdatoer.
- Filerne var engangs-værktøjer. Data ligger allerede i Firestore (`membres`).
- `.gitignore` stopper nye CSV/XLSX- og medlemsfiler.
- `firebase.json` stopper, at den slags filer og hjælpe-scripts lægges ud på olsenklanen.dk.

## Mangler stadig
1. **Git-historikken:** Filerne findes stadig i gamle versioner på GitHub. Repoet bør gøres privat
   (GitHub → Settings → Danger Zone → Change visibility). Deploy sker via Firebase, så siden virker stadig.
2. **Firestore-reglerne:** `membres` har `read: if true` og `write: if true`. Alle på nettet kan
   læse (og ændre) kartoteket, også PIN-koderne, fordi login tjekker PIN i browseren.
   Det samme gælder `olsenpost`, `olsenpost_mail` og `olsenpost_indkomne` (læsning).
   Kræver ny login-løsning (PIN tjekkes i en Cloud Function, som giver et Firebase-login),
   før reglerne kan strammes. Ellers holder siden op med at virke.
