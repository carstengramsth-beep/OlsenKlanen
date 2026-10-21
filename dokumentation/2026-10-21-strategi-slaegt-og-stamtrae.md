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

## Bryllupsdage (21. okt.)
- Feltet `bryllup_dato` på personen (ved partneren) i kartotekets Rediger. Kortet viser "⚭ Gift med X <dato> (n år)".
- Forsiden: bryllupsdage vises under "Fremhævede begivenheder" (3 dage tilbage til 45 dage frem) med tag "Bryllupsdag", runde dage navngivet (sølv 25, rubin 40, guld 50, diamant 60, jern 65, platin 70, krondiamant 75). På dagen også i det gule bånd. Kun par, hvor begge er aktive.
- Medlemmet kan skrive en frivillig besked om dagen (`bryllup_besked`); den vises på kortet og på forsiden op til dagen. Sølv-/guld-/diamantbryllup og bryllupsdag er fjernet som valg under Begivenheder (gamle data vises stadig).
- Flyttet fra husstandens Begivenheder: nr. 8 Elisabeth og Carsten 1972-09-23 (fra diamantbryllup 2032), nr. 23 Richard og Karin 1970-01-17 (fra diamantbryllup 2030), nr. 29 Steen og Lise 1988-07-02, nr. 46 Anders og Mie 2013-08-03. Partner-relationer sat for de tre sidste. Begivenhederne er ikke slettet.
- Kortet viser "💍 Næste mærkedag: <type> <dato>" (tin 10, kobber 12½, sølv 25, perle 30, rubin 40, guld 50, diamant 60, jern 65, platin 70).
- Mærkedage-siden (`foedselsdage.html`, oversigt + "Frem i tiden") regner runde bryllupsdage ud fra `bryllup_dato`. Gamle bryllups-begivenheder springes over for husstande, der har en fast bryllupsdato (ingen dobbelte).
- Begivenhedskalenderen på Mærkedage-siden viser KUN mærkebryllupper (fx Kobberbryllup 12½ år) – aftalt med Carsten. Det samme gælder forsiden (liste og bånd).
- Kommende bryllup: ligger `bryllup_dato` i fremtiden, vises det som "💒 Bryllup" (kort, forside-liste og bånd, Mærkedage-kalender og "Frem i tiden"). Bagefter regnes mærkebryllupper ud fra datoen.

## Ret data fra stamtræet (21. okt.)
- Administratorer ser "✏️ Ret data" i personkortet i stamtræet: navn, født, status/død, fortælling og billede for personer i Slægten (gemmes i `olsenpost/slaegt_<pid>`). Billeder formindskes til maks. 800 px og lægges i `gamle_billeder/slaegt/`.
- Kartotekspersoner: knappen sender til Medlemskartoteket.
- Listen "🕯️ Afdøde" i kartoteket viser også afdøde i Slægten (🌿).

## Afdøde-register (aftalt 21. okt.)
- Afdøde, der er fælles for flere husstande (fx Carstens forældre, som også er søsterens), skal IKKE på et husstandskort, men i Slægten.
- Kartoteket → 🕯️ Afdøde: knappen "➕ Opret afdød person (uden medlemskort)" og "✏️ Ret" ved Slægtens afdøde (kun administratorer).
  Felter som Finns: navn, født, død, far/mor/partner, billede, mindeord, gravsted, foto af gravsted, fortælling. Gemmes i `olsenpost/slaegt_<pid>` (status "afdød"); billeder som data-URL (600/800 px).
- Listen er sorteret efter fødselsdato (ældste først).
- Mindelunden viser også Slægtens afdøde ("🌿 Fra Slægten"); alle medlemmer må skrive mindeord om dem.
- Birthe Haugaard er markeret som afdød (datoer mangler endnu).
- Søskende vises automatisk (samme far eller mor) på kartotekskort og i stamtræets personkort. Søskende til en afdød (fx farbror Valter til Svend Aage) kobles ved at give dem samme forældre (forældrene oprettes som afdøde i Slægten).
- Afdøde-listen viser "🟠 Mangler: født, død, billede, forældre, mindeord/fortælling" ved hver person, og antallet øverst. Idé (Carsten): opret personer, vi ved findes, med det samme – prikken viser, hvad der skal findes.
- Oprettet i Slægten: Christian P.T. Olsen (efternavn gættet ud fra "Christian P.T. O." i MyHeritage – skal tjekkes) ⚭ Larsine Larsen = Svend Aages forældre; Valter (stavemåde usikker), bror til Svend Aage – boede i Costa Rica, datteren gift med Costa Ricas præsident.

## Røde prikker, orange felter og bekræftelse (21. okt.)
- Stamtræet: rød prik på personer, hvor der mangler data (født, død, billede, forældre, mindeord/fortælling, og for afdøde: bekræftelse). Personkortet viser "🔴 Mangler: …".
- "✏️ Ret" i stamtræet åbner direkte: kartotekspersoner → `medlemskartotek.html?rediger=<nr>`; afdøde i Slægten → `medlemskartotek.html?ret_afdod=<pid>`.
- Tomme felter farves orange (født, far, mor, død, mindeord, billede) i redigering.
- Afdøde skal bekræftes: kolonnen "Bekræftet" i Afdøde-listen med knappen "✓ Bekræft data" (administratorer). Gemmes som `bekraeftet: { navn, nr, dato }` på personen (membres eller olsenpost/slaegt_<pid>). Rettes data bagefter, nulstilles bekræftelsen.

## Personkort (person.html?pid=…) – 21. okt.
- Ny side med alle data om én person (billede, datoer, medlemsnr./Slægten, bryllup, bekræftelse, mangler, mindeord, fortælling, gravsted) og hele familien op og ned: forældre, bonusforældre, bedsteforældre, oldeforældre · partner, søskende · børn, bonusbørn, børnebørn, oldebørn. Alle navne kan trykkes på (går til deres personkort); rød prik = mangler data.
- "➕ Tilføj slægtning" (administratorer): barn / forælder / søster-bror / partner. Oprettes i Slægten (`olsenpost/slaegt_<pid>`) og kobles på. Ved "forælder" sættes `far_pid`/`mor_pid` på personen (også på kartotekspersoner via `membres`).
- Links: navne i Afdøde-/status-listerne og 👤 ved hver person på husstandskortene, "👤 Fuldt personkort" i stamtræet, og "👤 Personkort" i søgningen.
- Afdød-formularen i kartoteket har nu også "Status: Afdød / Lever" (til levende i Slægten).
- Testoprettelse af "Søren Wormslev Olsen" var KUN testdata (ikke gemt).
