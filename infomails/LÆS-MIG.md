# Infomails

Hver infomail er én JSON-fil her (fx `maerkedage.json`) med emne, hilsen, afsnit og slut.
Billeder lægges i `billeder/vejledning/` og nævnes i et afsnit af typen `"trin"`.

Ny infomail:
1. Lav `infomails/<navn>.json` (kopiér `maerkedage.json`).
2. Tilføj den i `infomails/index.json` med næste nummer (`nr`) og dato – så kommer den i
   OlsenPost → 📚 Informationer og i Infoarkivet. Numret står i mailens emne: »Info nr. 2 – …«.
3. OlsenPost → 📚 Informationer → send prøve → send til alle (eller ét medlem).
   Medlemmer kan læse dem og trykke »Bed om at få den tilsendt« (intern besked til de 5).

Serveren (functions/index.js · sendInfomail) bygger mailen med billederne inde i mailen
og sender fra post@olsenklanen.dk. Afsnitstyper: p, h, trin, liste, nummerliste, tip.
