# Stamtræet – arbejdsgang og nye visninger

Aftalt med Carsten 21. okt. 2026:

- **Stamtræet er indgangen.** Man finder personen i træet, trykker på kortet og vælger **✏️ Ret data**.
  Så er det tydeligt, hvad der mangler, og man rammer den rigtige person.
- Manglende billede: stiplet orange ramme + 📷. Manglende data: rød prik + "🙏 Hjælp med at gøre X færdig".
- Tryk på et billede (panel/personkort) → vises stort (`stort-billede.js`).
- Tilløbnes egne forældre (fx Erland & Betty Nielsen) vises som kort i rækken over, ved siden af
  ægtefællens forældre, med stiplet gul streg ned (`placerSvigre()` i stamtrae.html).
  Knappen "⬆ Erland & Betty" viser træet fra dem.
- Kort i et par er lige store.
- Feltet `tidligere_navne` (fx Elisabeth født Nielsen) vises og kan søges på.
- Åbent spørgsmål: kantfarve efter køn (blå/gul) – kræver nyt felt `koen`. Afventer Carstens svar.
