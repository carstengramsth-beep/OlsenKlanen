# Søgefelt på forsiden: "🔎 Hvad leder du efter?"

21\. oktober 2026 · Claude Code på pc-1 sammen med Carsten

- Øverst i midten af forsiden. Man skriver et ord (fx "kontakt", "referat 2017", "bryllup") og får links til de sider, hvor svaret findes.
- Listen over sider og søgeord ligger i `soeg.js` (`SIDER`). Et årstal giver direkte link til skovturen og billederne det år.
- **Nye sider skal tilføjes i `SIDER`** (står også i CLAUDE.md).
- Navne: søgningen henter personer fra kartoteket og Slægten (REST) og svarer "👋 Hej <navn> – du søger efter Karin. Vi fandt: …" med links til medlemskort (`medlemskartotek.html?soeg=<fornavn>`), stamtræ og evt. Mindelunden.
- **Log:** hver søgning (≥3 tegn, efter 2,5 sek. pause) gemmes i `olsenpost` med `type: "soegning"`, `soegt`, `antal` (resultater), `nr`, `navn`, `tid`.
  Når Carsten skriver "Tjek søgninger": hent dem via REST, vis især dem med `antal: "0"`, og foreslå nye søgeord i `soeg.js`.
