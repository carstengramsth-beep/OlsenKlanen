# Adgang til den gamle hjemmeside (minisite)

**Dato:** 11-11-2026 · **Af:** Claude (claude.ai) · **Besluttet af:** Carsten

- Nyt kort på forsidens opslagstavle: "📜 Den gamle hjemmeside" → https://olsenklanen.minisite.dk
- Åbner i en **ny fane**, så den nye side bliver stående bagved (den gamle side har ingen vej tilbage).
- Ses kun af medlemmer, der er **logget ind** (forsiden kræver login).
- Kortet siger, at tilmelding og betaling på den gamle side ikke længere gælder.
- Medlemmer skal selv kende evt. adgangskode til den gamle side.
- Tilføjet i søgningen (`soeg.js`); eksterne links i søgningen åbner nu i ny fane.

**Rettet 11-11-2026 (Claude Code):** Linket virkede ikke. `https://olsenklanen.minisite.dk` giver en sikkerhedsadvarsel i browseren
(den gamle side har ikke et gyldigt certifikat). Linket er nu `http://www.olsenklanen.minisite.dk` på forsiden, i søgningen og på skovtur2026.html.
Browseren viser "Ikke sikker" i adresselinjen, men siden åbner. Testet af Carsten.

**Tilføjet 11-11-2026:** Koden til den gamle side (**oldermand**, små bogstaver – bekræftet af Carsten efter tjek med Kurt) står nu i boksen på forsiden.
Når man trykker på knappen, kopieres koden automatisk, så den kan sættes ind med Ctrl+V. Den gamle side kan ikke tage imod koden via linket.
