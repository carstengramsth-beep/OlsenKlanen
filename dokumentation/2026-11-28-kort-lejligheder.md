# Kort til alle lejligheder – efterlysning og plan

28\. november 2026 · Claude Code sammen med Carsten

## Lavet nu
- Ny boks **»🎨 Vi mangler illustrationer til lejlighedskort!«** (`kort-efterlysning.js`) på forsiden (højre kolonne, under julehilsner) og på `kort.html` (i trin 1).
  Viser lejlighederne, vejen til kortene (Forsiden → Skriv et kort → Vælg et kort) og knappen »🎨 Send dit billede« (`send-kunst.html`).
- `kort-temaer.js`: nye temaer til lejligheder (Jul, Nytår, Fødselsdag, God bedring, Bryllup, Udlært og eksamen, Barnedåb, Kondolence),
  så man kan vælge lejlighed, når man sender et billede. Tomme temaer vises ikke på kortsiden.
- Forsidens menupunkt »Skriv et kort«: undertekst »Kort til alle lejligheder · print på A4«.

## Plan (Carstens beslutning)
1. Efterlysning (lavet).
2. **Tekstbank:** færdige tekster pr. lejlighed på kortsiden (gratis).
3. **Skrivehjælp med Claude:** spørgeskema (anledning, til hvem, lidt om personen, pointer, tone) → forslag til korttekst eller kort tale.
   En fast service for medlemmerne, inkl. i kontingentet – **foreningen betaler** (få øre pr. tekst). Kræver en API-konto hos Anthropic og en Cloud Function.
- Idé: Claude kan tegne enkle illustrationer til kort (fx nytår), men familiens egne værker er førstevalg.
