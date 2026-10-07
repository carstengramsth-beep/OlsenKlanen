# GalleriEG kunstkalender 2027

> Kladde — må IKKE lægges på olsenklanen.dk (main), før kalenderen er færdig.
> Skal først bruges på Elisabeths side (Galleri EG).

Kunstkalender med malerier af Elisabeth Gram. Bygget efter modellen fra 2023.

## Format (som modellen)
- Forside: 30 × 40 cm
- Omslag med årstal: 30 × 60 cm
- Introside: 30 × 30 cm
- 12 månedssider: 30 × 60 cm (billede øverst, dage nederst)

## Sådan rettes den
- **Billeder:** læg dem i `billeder/` med navnene `forside.jpg`, `omslag.jpg`,
  `intro-1.jpg` … `intro-3.jpg` og `01.jpg` … `12.jpg`.
- **Billedtekster og tekster:** ret i `indhold.js`.
- **Datoer:** regnes ud automatisk (ugedage, ugenumre, påske, pinse, advent,
  sommertid, flagdage). Egne mærkedage kan tilføjes i `indhold.js` under `egneDage`.
- **Lav PDF:** `node lav-pdf.mjs` → `GalleriEG-kunstkalender-2027.pdf`

## Ændringer i forhold til 2023
- Store Bededag er fjernet (afskaffet fra 2024).
- Kongehusets titler er opdateret (Kong Frederik X, Dronning Mary, Kronprins Christian,
  Dronning Margrethe, Grev/Komtesse for Prins Joachims børn).
- Palmesøndag er tilføjet. Advent følger 2027 (1. søndag i advent er 28. november).
- "PrinfoParitas – 105 år" fra 2023 er ikke med.
