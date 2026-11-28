# Billeder til kort: godkendelse før de bliver til kort

28\. november 2026 · Claude Code sammen med Carsten

- `send-kunst.html`: alle medlemmer (logget ind) kan sende **tegning, maleri eller foto** og vælge lejlighed (tema).
- Før man kan sende, skal man sætte **3 kryds**: lov til at dele · alle der kan genkendes har sagt ja (forældre for børn) · ordentligt. Gemmes som `samtykke`.
- Billedet får `status: "afventer"` og vises ikke for andre. **Carsten** (8-B) får besked i OlsenPost med det samme.
- **Godkendere** (Carstens beslutning): Carsten → ved forfald Kurt (22-B) → Sanne (48-B) → Tommy (19-A) og Karin (23-B).
  Serveren (`rykGodkendelse` i `tjekIndkommendeMail`) giver besked til Kurt efter 24 timer, Sanne efter 48, Tommy og Karin efter 72, hvis billedet stadig venter (`varslet`).
- Godkenderne ser listen nederst på `send-kunst.html` med billedet som kort-prøve: **✅ Godkend** / **❌ Afvis** (med grund). Afsenderen får besked.
  Godkender en anden end Carsten, får Carsten besked.
- Godkendt → Claude laver kortet (ny linje i `KORT` i `kort.html` under rette lejlighed), og derefter trykkes »🖼️ Lagt op som kort« (afsenderen får besked).
- Status: `afventer` → `godkendt` / `afvist` → `lagt op`. Gamle indsendelser (`modtaget`, uden `samtykke`) vises med en advarsel.
- **Regel (Carsten, 28-11-2026):** alle billeder godkendes og lægges op **inden for 24 timer**. Ellers tager den næste ansvaret.
  Afsenderen kan altid ringe til Carsten og lave en aftale, hvis det haster, eller kommunikationen hænger (står på siden og i kvitteringen).
