# OlsenKlanen — Projektstatus

Sidst opdateret: 2026-05-06

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
