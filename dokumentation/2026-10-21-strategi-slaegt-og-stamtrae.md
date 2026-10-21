# Strategi: Slægten, relationer og stamtræ (forslag – afventer Carstens godkendelse)

21\. oktober 2026 · Claude Code på pc-1 sammen med Carsten

## Principper
1. **Medlemskartoteket (`membres`) er det faste grundlag. Intet slettes.** Afdøde bliver på husstandskortet med status "afdød" og `status_dato`.
2. **Når et medlem dør, KOPIERES data** til registret "Slægten" med henvisning til medlemsnummer og personens faste `pid`. Medlemsdata røres ikke. Fortælling og billeder kan tilføjes i kopien.
3. **Slægten** rummer også personer, der aldrig var medlemmer (fx søskende til Agnes og Svend Aage). De får slægtsnummer S-1, S-2 …
4. **Relationer gemmes på personen:** far, mor, bonusforælder, ægtefælle/partner (som `pid`). Børn/bonusbørn udledes automatisk.
5. **Status-filter i kartoteket:** Alle · Aktive · Afdøde · Udmeldte.
6. **Billeder af alle** (medlemmer har allerede feltet `foto`).
7. **Stamtræ** til sidst, fra Agnes og Svend Aage Olsen (husstand 1) og nedad.
8. **MyHeritage:** Carsten køber adgang. Træet eksporteres som GEDCOM og kobles til `pid`.

Rækkefølge: 5 → 4 → 2+3 → 6 → 7 → 8.

## Allerede gjort (ufarligt)
- Sikkerhedskopi af hele `membres` (47 husstande, 132 personer) i scratchpad på pc-1.
- Hver person i `familiemedlemmer` har fået et fast, usynligt ID i feltet `pid` (fx `p3k9x…`). Intet andet er ændret.
  `pid` indgår ikke i `godkendNoegle`, så godkendelser nulstilles ikke. Kartotekets gem-kode bevarer ukendte felter (`{...p}`).
- **Vigtigt for kode:** nye personer skal også have et `pid`, og `pid` må aldrig ændres eller genbruges.

## Eksempler fra Carsten
Carsten → far Finn Gram, mor Birthe Haugaard; børn Sanne, Trine, René. Emma og Luna → Sanne og Nano.
Rasmus er Tinas søn og Renés bonusbarn.
