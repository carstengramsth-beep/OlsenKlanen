# Søgefelt på forsiden: "🔎 Hvad leder du efter?"

21\. oktober 2026 · Claude Code på pc-1 sammen med Carsten

- Øverst i midten af forsiden. Man skriver et ord (fx "kontakt", "referat 2017", "bryllup") og får links til de sider, hvor svaret findes.
- Listen over sider og søgeord ligger i `soeg.js` (`SIDER`). Et årstal giver direkte link til skovturen og billederne det år.
- **Nye sider skal tilføjes i `SIDER`** (står også i CLAUDE.md).
- Navne: søgningen henter personer fra kartoteket og Slægten (REST) og svarer "👋 Hej <navn> – du søger efter Karin. Vi fandt: …" med links til medlemskort (`medlemskartotek.html?soeg=<fornavn>`), stamtræ og evt. Mindelunden.
- **Log:** hver søgning (≥3 tegn, efter 2,5 sek. pause) gemmes i `olsenpost` med `type: "soegning"`, `soegt`, `antal` (resultater), `nr`, `navn`, `tid`.
  Når Carsten skriver "Tjek søgninger": hent dem via REST, vis især dem med `antal: "0"`, og foreslå nye søgeord i `soeg.js`.
- **Dagligt tjek (planlagt opgave, kl. 7.49 dansk tid):** Claude på pc-1 henter søgningerne fra det seneste døgn og sender Carsten (8-B) en kort besked i OlsenPost (afsender "Claude (dagligt tjek)"). Ingen søgninger = ingen besked. Der rettes intet på siden uden Carstens OK.
- Idé til senere: en rigtig "Spørg OlsenKlanen"-chatrobot (Claude via Firebase Functions). Afventer, om der kommer nok spørgsmål.
- Søgningen leder også i informationerne (`infomails/index.json`: titel, rids, evt. `soegeord`) og anbefaler "📚 Læs Info nr. X" med link til `infoarkiv.html?vis=<id>`. Det daglige tjek nævner også, hvilken info der svarer på en søgning.
