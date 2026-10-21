# Vigtigt om kommunikation

- Skriv ALTID på dansk til brugeren.
- Brugeren har en hjerneskade. Brug korte sætninger og enkle ord.
- Forklar ét trin ad gangen. Undgå tekniske ord (fx GitHub-ord) eller forklar dem kort.
- Bed ikke brugeren om at gøre ting i GitHub, med mindre det er helt nødvendigt.

# Nye sider — altid genvej til forsiden

- Hver ny side SKAL have en tydelig genvej til forsiden: et link "🏠 Forsiden" øverst på siden
  OG `<script src="forside-knap.js" defer></script>` (den runde knap nederst til venstre).
- Ellers skal brugeren starte forfra hver gang. Det er ikke praktisk.
- Tilføj også siden i søgningen på forsiden: en linje i `SIDER` i `soeg.js` (titel, adresse, kort tekst og søgeord).

# Filer fra brugeren (referater o.l.) — kontrollér altid ved modtagelsen

- Når brugeren sender en fil, så tjek straks, at filen passer til det, brugeren skriver
  (fx årstal, sted og emne). Læs både filnavn og indhold.
- Skriv filens navn, årstal og emne tilbage til brugeren, og få det bekræftet, FØR noget lægges på siden.
- Brugeren sender aldrig det samme materiale to gange. Hvis en fil er sendt før (samme navn,
  størrelse eller indhold), er det ALTID en fejl: sig det med det samme, og læg intet ind.
- Passer filen ikke til beskeden: stop og spørg. Gæt ikke, og gå ikke videre med den forkerte fil.
- Brugeren kan i stedet skrive, at filen ligger i OneDrive-mappen
  "Skrivebord/Olsenklanen/Olsenklanen referater". Så hent den derfra, og bekræft på samme måde.

# Fælles dokumentation (læs ved start af hver opgave)

- Mappen `dokumentation/` er det fælles sted for Claude på pc-2 og Claude Code på pc-1.
- Læs `dokumentation/index.json` og de nyeste noter, før du går i gang. Her står fx hvad der er fundet og lagt op.
- Når du har lavet noget, som den anden bør vide: skriv en kort note `ÅÅÅÅ-MM-DD-emne.md` i mappen,
  og tilføj den øverst i `dokumentation/index.json`. Se `dokumentation/README.md`.
- Noterne kan læses på hjemmesiden under Administration → Dokumentation (`dokumentation.html`).
