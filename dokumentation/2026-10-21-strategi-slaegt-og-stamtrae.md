# Strategi: Slægten, relationer og stamtræ (godkendt af Carsten 21. okt. 2026)

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

## Slægtsnummer (aftalt)
- **Agnes og Svend Aage Olsen deler nr. 1** (som par).
- Personer født efter dem tæller opad efter fødselsdato, ældste først: 2, 3, 4 …
- Personer født før dem tæller nedad: −1 (født tættest på dem), −2, −3 …
- Gælder **alle** i slægten: medlemmer, afdøde og ikke-medlemmer. Medlemsnummeret står ved siden af.
- Nummeret **beregnes automatisk** (rykker, når nye personer kommer til). Relationer bruger altid `pid`, aldrig slægtsnummeret.
- Vises som **"nr / antal"**, fx "1 / 208".
- Personer uden kendt fødselsdato lægges sidst.

## Medlemmer, der ikke er i slægt (løses senere)
Ægtefæller, bonusbørn og "venner af huset". De fleste hænger på træet via en relation (partner til / bonusbarn af).
Resten markeres som **"tilknyttet"** med henvisning, fx "ven af huset hos nr. 51".

## Allerede gjort (ufarligt)
- Sikkerhedskopi af hele `membres` (47 husstande, 132 personer) i scratchpad på pc-1.
- Hver person i `familiemedlemmer` har fået et fast, usynligt ID i feltet `pid` (fx `p3k9x…`). Intet andet er ændret.
  `pid` indgår ikke i `godkendNoegle`, så godkendelser nulstilles ikke. Kartotekets gem-kode bevarer ukendte felter (`{...p}`).
- **Vigtigt for kode:** nye personer skal også have et `pid`, og `pid` må aldrig ændres eller genbruges.

## Eksempler fra Carsten
Carsten → far Finn Gram, mor Birthe Haugaard; børn Sanne, Trine, René. Emma og Luna → Sanne og Nano.
Rasmus er Tinas søn og Renés bonusbarn.

## Status 21. okt. 2026 (trin 5 og 4 lavet)
- Kartoteket har status-knapper: Alle husstande · Aktive · Afdøde · Udmeldte (liste med født/død/alder/husstand).
- Hver person kan i Rediger have: Far, Mor, Bonusforælder (2 felter), Ægtefælle/partner — felterne `far_pid`, `mor_pid`, `bonus1_pid`, `bonus2_pid`, `partner_pid`.
- Kortet viser relationer og udleder Børn/Bonusbørn automatisk. Partner vises begge veje.
- Nye personer får automatisk `pid`.
- Rettet gammel fejl: personer med rollen "ægtefælle" (husstand 8) blev ikke vist på kortet.
- Relationsfelterne er nu søgefelter: skriv personligt medlemsnr. (fx 8-B) eller navn, eller vælg fra listen.
- Ny knap **🧩 Svævere**: alle, der ikke hænger sammen med Agnes og Svend Aage (husstand 1) via far/mor/bonus/partner. Kolonnen "Mangler" viser "Ingen relationer endnu" eller "Ikke forbundet til Agnes og Svend Aage". Ved start: 130 svævere af 132.

## Stamtræ (første udgave, 21. okt.)
- Ny side `stamtrae.html` (kun medlemmer). Læser relationer fra `membres` (og senere `olsenpost` type "slaegt").
- Start: Agnes og Svend Aage. Knapper: "Hele træet", "Mit træ" (starter ved egen far/mor), søg + "Vis træ herfra" (`?top=<pid>`).
- Partnere står ved siden af (gul = tilløben), bonusbørn med stiplet ramme. Slægtsnr. "n / N" på dem, der hænger sammen med Agnes og Svend Aage.
- Links: forsiden (🌳 Stamtræ) og kartoteket (🌳 Se stamtræet).
- Relationer lagt ind efter Carstens oplysninger: Carsten (far Finn, partner Elisabeth); Sanne, Trine, René (far Carsten); Sanne ⚭ Nano; René ⚭ Tina; Emma og Luna (mor Sanne, far Nano); Rasmus (mor Tina, bonusforælder René).
- Mangler: Carstens mor Birthe (data kommer). Asta-Elisabeth (nr. 17) er ikke koblet – spørg Carsten.

## Slægten startet (21. okt.)
- Personer i Slægten gemmes i `olsenpost` med `type: "slaegt"`, dok-id `slaegt_<pid>`, `til: []` (vises ikke som post). Felter som i kartoteket + `fortaelling`.
- Oprettet: Gydda, Birthe Haugaard (Carstens mor, partner Finn Gram) og Inger – alle børn af Svend Aage og Agnes. Datoer mangler.
- Kartoteket læser Slægten: personerne kan vælges i relationsfelterne ("Slægten · …"), vises med 🌿 og tæller med i svæver-beregningen.
- Relationer lagt ind (Carstens oplysninger): Svend Aage ⚭ Agnes; Lise, Ib, Christian = børn af Svend Aage og Agnes; Carsten: mor Birthe; René+Tina: Asta-Elisabeth og Carl-Kristian; René: Thera.
- Agnes og Svend Aage fik 7 børn: Gydda, Birthe, Lise, Ib, Christian, Inger og Egon (bekræftet af Carsten – alle 7 er nu koblet på).

## Forslag til rettelser (aftalt med Carsten)
- Personkortet i stamtræet har knappen "✏️ Foreslå en rettelse". Forslag gemmes i `olsenpost` med `type: "slaegt_forslag"`, `status: "ny"`, `pid`, `person`, `tekst`, `afsender`, `tid`. Træet ændres ikke.
- Når Carsten skriver "Tjek forslag til stamtræet": hent forslagene via REST, gennemgå dem ét ad gangen med Carsten, læg kun det godkendte ind, og sæt `status` til "godkendt" eller "afvist".
- MyHeritage-data lægges for sig som "ikke bekræftet" (afventer GEDCOM-fil). Spurgt: Birthes fulde navn (Haugaard eller Vormslev?) og om Gydda skal hedde Gram Pedersen.
- Karin Gram Lund (23-B) koblet som datter af Finn og Birthe.
