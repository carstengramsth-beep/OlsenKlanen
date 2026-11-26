# Live-demo af det gule nyhedsbånd til aviserne

26\. november 2026 · Claude Code sammen med Carsten

- Ny side **`demo-nyhedsbaand.html`** (olsenklanen.dk/demo-nyhedsbaand.html). Kræver **ikke** login.
- Formål: Carsten vil ringe til fx Politiken og Berlingske og vise, hvordan vi bruger deres overskrifter,
  og spørge om en ordning, så medlemmerne kan læse hele artiklen. Skal afstemmes med 5-Banden først.
- Siden viser **ingen familiedata**: Familiesiden er vist som grå felter. Den læser ikke fra Firebase.
  Den henter kun offentlige RSS-feeds – samme kilder og regler som båndet på forsiden (DR/TV2 direkte, 🔒 + smagsprøve ved de andre).
- `noindex, nofollow`, så søgemaskiner ikke viser den. Den er ikke hemmelig: alle med linket kan åbne den, men der står intet privat.
- Linket gives kun til de medier, vi taler med. Siden står også i søgningen på forsiden (`soeg.js`).
- Ændres nyhedskilderne eller reglerne på forsiden, så ret også demosiden.
