# Infomails

Hver infomail er én JSON-fil her (fx `maerkedage.json`) med emne, hilsen, afsnit og slut.
Billeder lægges i `billeder/vejledning/` og nævnes i et afsnit af typen `"trin"`.

Ny infomail:
1. Lav `infomails/<navn>.json` (kopiér `maerkedage.json`).
2. Tilføj den i `infomails/index.json` (så den kommer i Infoarkivet).
3. Tilføj `<navn>: { infomail: "<navn>" }` i `olsenpost-skabeloner.js`.
4. Åbn `meddelelser.html?skabelon=<navn>` → send prøve → send til alle (eller ét medlem).

Serveren (functions/index.js · sendInfomail) bygger mailen med billederne inde i mailen
og sender fra post@olsenklanen.dk. Afsnitstyper: p, h, trin, liste, nummerliste, tip.
