# Ny side: Send materiale (indsend.html)

18\. oktober 2026 · Claude Code på pc-1 sammen med Carsten

- Ny side **olsenklanen.dk/indsend.html** – kun **efter aftale**. Admin åbner pr. husstand på medlemskortet
  (Rediger → "📤 Send materiale", feltet `send_materiale: true` på `membres/<nr>`). Så får husstanden en knap på sit eget kort.
  Admin har altid adgang. Andre ser "Siden er ikke åbnet for dig endnu".
- Login med nr. + kode.
  Er man ikke logget ind, sendes man til login og derefter tilbage (`login.html?videre=indsend.html`).
- Medlemmer kan trække filer eller en hel mappe ind (alle filtyper, ingen størrelsesgrænse).
- Filerne lægges i lageret under `gamle_billeder/indsendt/<nr>_<navn>/<dato>/<mappens egen struktur>`.
  De vises **ikke** på hjemmesiden. Sendes noget igen, springes det over, der allerede ligger der.
- Hver forsendelse giver en note i `olsenpost` med `type: "indsendt"` (afsender, antal, MB, kommentar).
- Admin ser alt modtaget nederst på siden (og via Administration → 📥 Indsendt materiale).
- Lavet til Bent W-H (husstand 4), som har ca. 500 MB på en ekstern harddisk.
- Liste over filer uden login: `https://firebasestorage.googleapis.com/v0/b/olsenklanen-familieside.firebasestorage.app/o?prefix=gamle_billeder/indsendt/`

## Beskeder og status (tilføjet samme dag)

- Medlemmet **skal** skrive, hvad materialet handler om, før der kan sendes.
- Når admin åbner på medlemskortet, får husstandens voksne en besked i OlsenPost med vejledning.
- Når medlemmet begynder at sende, får Carsten (8-B) en besked. Når alt er modtaget, får Carsten en ny besked, og afsenderen får en tak.
- Noten i `olsenpost` (type `indsendt`) har `status`: "på vej" → "modtaget" (eller "delvist") → "fordelt".
- Admin-oversigten på `indsend.html` viser: hvem der er åbnet for (med "🔒 Luk igen") og alle forsendelser med besked og status.
  Knappen "✅ Markér som gennemgået og fordelt" kan også sende en besked til afsenderen.
- Claude kan følge med via REST: `olsenpost` med `type == "indsendt"`.
