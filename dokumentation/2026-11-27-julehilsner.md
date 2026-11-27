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
