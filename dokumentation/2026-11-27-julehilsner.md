# 🎄 Julehilsner på olsenklanen.dk

27\. november 2026 · Claude Code sammen med Carsten. Idéen er godkendt med Trine og Elisabeth.

## Sådan virker det
- **Ny side `julehilsner.html`**: alle julehilsner i den nuværende julesæson, nyeste øverst. Hver hilsen viser motivet (eller eget billede),
  teksten i den valgte skrifttype og hvem den er fra. Øverst: »Julehilsner fra: …« (som navnene på et fødselsdagskort).
  Afsenderen selv og 5-Banden kan fjerne en hilsen (`skjult: true`, intet slettes).
- **Send en hilsen (`kort.html`)**: nyt trin **»🎄 Læg kortet op på julehilsensiden«** (for alle, der er logget ind).
  Man kan stadig også sende kortet til en bestemt person som før.
  **📷 Eget billede**: kan vælges i trin 1 (gøres højst 1600 px, gemmes i Storage `fotovaeg/julehilsner/`). Kan indtil videre kun bruges på julehilsensiden.
  `kort.html?jul=1` starter med Esthers "Jul" (nr. 13), »Kære alle i OlsenKlanen« og »Glædelig jul og godt nytår«.
- **Forsiden**: boksen **🎄 Julehilsner** øverst i højre kolonne (15. nov. – 10. jan., eller når der er hilsner) med de 3 nyeste og knapperne
  »➕ Læg en julehilsen op« og »Se alle →«. I det **gule bånd** står »🎄 Julehilsen fra …« (hilsner fra de sidste 7 dage) med genvej til hilsenen.
- Når en hilsen lægges op, kommer der også en linje i **infologgen**.

## Data
- Firestore `olsenpost`, `type: "julehilsen"`: `saeson` (juli–dec = året, jan–jun = året før), `fra_nr`, `fra_navn`, `kort_fil` (motiv-sti eller Storage-URL),
  `eget_billede`, `kort_maler`, `kort_art`, `kort_nr`, `kort_titel_vis`, `kort_til`, `kort_besked`, `kort_slut`, `kort_fra`, `kort_skrift`, `tid`, `sendt_lokal`, `skjult`.
- Kun billeder fra Firebase Storage eller `billeder/…` vises (sikkerhed).

## Regler
- Er der børn på et eget billede, skal forældrene have sagt ja (står på kort.html). Esthers julekage-billede: Trine og Elisabeth har sagt ja.

## Ændret 27. nov. 2026 (Carstens ønske)
- **Eget billede = personligt specialkort.** Et eget billede bliver aldrig et kort, som andre kan vælge. Det bruges kun til den ene hilsen.
- Kortet med eget billede kan nu **sendes til et familiemedlem som intern post** (billedet lægges i Storage `fotovaeg/kort/`, `eget_billede: true`)
  eller **lægges op på julehilsensiden**. Som mail og »send til alle« går det ikke endnu (serveren kender kun de faste kort).
- OlsenPost viser kort med eget billede (Storage-URL), og `kort.html?vis=intern:<id>` kan vise dem.
- Julehilsensiden viser altid **hele billedet** (ikke beskåret).
- Esthers julekage-foto blev brugt som eksempel, men er et privat foto: det er **ikke** lagt ind som specialkort og ikke i repoet.

## Guide: »🎄 Lav et julekort« (tilføjet 27. nov. 2026)
- Knappen i boksen 🎄 Julehilsner på forsiden (og på julehilsensiden) hedder nu **»🎄 Lav et julekort«** og går til `kort.html?jul=1&guide=1`.
- `guide=1` viser en lille guide nederst på skærmen, trin for trin: 1) Vælg dit billede, 2) Skriv din hilsen,
  3) Læg den op til hele familien, 4) … eller send den til én person. Hvert trin fremhæves med en gul ramme. »Næste«, »Tilbage«, »Luk guiden«.

## Forhåndsvisning (tilføjet 27. nov. 2026)
- I den røde boks »🎄 Læg kortet op på julehilsensiden« står nu **»👀 Sådan kommer den til at se ud på julehilsensiden«**:
  billede, tekst, skrifttype og »Lagt op af …«, som den vil stå på julehilsensiden. Den skifter, mens man skriver (`opdaterJulVisning`).
- Kortet som A4 ses stadig til højre (nederst på mobil). Guiden fortæller om begge dele.

## Start forfra (tilføjet 27. nov. 2026)
- Knappen **»🔄 Start forfra – slet mit udkast«** under trin 2 på `kort.html` fjerner eget billede og tekst (spørger først)
  og går tilbage til start-kortet (Esthers "Jul" ved `?jul=1`). »✕ Fjern mit billede« fjerner kun billedet.

## Reaktioner: 👍 og 🎅 (tilføjet 28. nov. 2026, Carstens ønske)
- Under hver julehilsen er der to knapper: **👍 Tommel op** og **🎅 Glad julemand**, med antal. Under knapperne står fornavnene på dem, der har trykket.
- Ét tryk giver en reaktion; tryk igen for at fjerne den. Hvert medlem kan give én af hver slags (pr. medlemsnummer).
- Gemmes på hilsenen i Firestore: `reaktioner.tommel.<medlemsnr> = fornavn` og `reaktioner.julemand.<medlemsnr> = fornavn`.

## Kommentarer (tilføjet 28. nov. 2026, Carstens ønske)
- Under hver julehilsen (under 👍/🎅) kan medlemmer, der er logget ind, skrive en kommentar. **Kun tekst – ingen billeder.** Højst 500 tegn.
- Hver kommentar viser fulde navn og dato, så modtageren kan se, hvem den er fra.
- Kan fjernes af den, der skrev den, af den, der lagde kortet op, og af 5-Banden.
- Gemmes på hilsenen: `kommentarer.<id> = { nr, navn, tekst, tid }`. Halvskrevne kommentarer bevares, når siden opdateres.
- **DEMO-mærke (28. nov. 2026):** hilsner, hvor »Til«-teksten starter med »TEST« (fx »🧪 TEST – …«), får en grøn bjælke øverst: »🧪 DEMO – kun en prøve«.
