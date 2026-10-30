# Specialkort: nyt kort nr. 17 og fast procedure

30\. oktober 2026 · Claude Code sammen med Carsten

- Gruppen "Særlige kort" på `kort.html` hedder nu **"Specialkort"** (gruppe-id er stadig `saerlige`).
- Nyt kort **nr. 17 "Halloween – fra Elisabeth & Carsten"**: samme billede som nr. 16
  (`billeder/kort/halloween-esther-luna.jpg`), men med Elisabeth og Carstens egen hilsen.
- **Nr. 16 bliver liggende**, så andre medlemmer også kan sende en Halloween-hilsen.
- `forslag` på et kort kan nu også have `til` og `fra` (ud over `besked`, `slut` og `skrift`).
  De sættes ind i felterne, når kortet vælges, og kan rettes.
- Ny linje på `kort.html` under "Vælg et kort": man kan bestille et specialkort via post@olsenklanen.dk.
- Næste ledige motiv-nummer: **18**.

## Procedure: Sådan laves et specialkort

1. **Bestilling:** Et medlem skriver til Carsten (post@olsenklanen.dk) med anledning, billeder og evt. ønske til hilsen.
   Billeder kan også sendes via `send-kunst.html`.
2. **Tjek:** Carsten bekræfter anledning og billeder med bestilleren. Er der børn på billederne,
   skal forældrene have sagt ja til, at billedet bruges.
3. **Billedet:** Carsten og Claude laver kortets billede (højst ca. 2900 punkter bredt) og lægger det i `billeder/kort/`.
4. **Hilsen:** Claude skriver et forslag til hilsen. Bestilleren godkender teksten.
5. **Kortet lægges op:** Ny linje i `KORT` i `kort.html` med næste nr., `gruppe: "saerlige"` og
   `forslag: { til, besked, slut, fra, skrift }`.
6. **Afsendelse:** Bestilleren (eller Carsten) vælger kortet på `kort.html`, sender først en prøve til sig selv,
   og sender så kortet. Til alle medlemmer kræver det en af de 5 postansvarlige og PIN-kode.
7. **Bagefter:** Kortet bliver liggende under "Specialkort", så andre også kan bruge det.
