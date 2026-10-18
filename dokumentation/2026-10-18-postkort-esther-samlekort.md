# Postkort: Esthers tegninger og samlekort

18\. oktober 2026 · Claude (claude.ai) sammen med Carsten

- 4 nye børnetegninger af Esther på `kort.html`: nr. 11 Fastelavn, 12 Halloween, 13 Jul, 14 Påske
  (gruppe "boern", filer `billeder/kort/esther-*.jpg`, lavet af Carstens "hjemmesideklar"-filer).
- Nyt samlekort nr. 15 "Alle vores kort" i ny gruppe "Særlige kort" (`billeder/kort/samlekort.jpg`).
  Viser alle 14 motiver + en plads med "Din tegning eller dit maleri her?". Bruges til opfordring om at indsende.
- Samlekortet laves med `python3 lav_samlekort.py .` (i repoets rod). Tilføj nye filnavne i listen og kør igen ved nye motiver.
- Næste ledige motiv-nummer: 16.
- Temaer (aftalt med Carsten): felt `tema` på hvert motiv i `KORT`, og listen `TEMAER` i `kort.html`.
  Nu: Landskaber (nr. 2, 3, 7), Illustrationer (nr. 4, 6, 9), Natur og blomster (nr. 1, 5, 8), plus "Uden tema"
  for motiver uden tema eller med et tema, der ikke står i listen. Temaer vises kun i en gruppe, hvor mindst ét motiv har et tema.
  Flere temaer laves, når der kommer nye relevante.
- Temalisten står nu i `kort-temaer.js` (deles af `kort.html` og `send-kunst.html`).
- Ny side **olsenklanen.dk/send-kunst.html**: alle medlemmer (logget ind) kan sende én tegning/ét maleri ad gangen.
  Felter: billede, titel, kunstner, alder (valgfri), art (tegning/maleri/andet), tema (fra listen, eget nyt tema,
  eller "Ved ikke" — så tager Carsten en snak med kunstneren), besked.
  Billedet gemmes i lageret under `gamle_billeder/kunst/<nr>_<navn>/kunst_<nr>_<tid>.<endelse>`.
  Note i `olsenpost` med `type: "kunst_indsendt"`, `status`: "modtaget" → "lagt op". Carsten (8-B) får besked, afsenderen får tak.
  Admin ser listen nederst på siden og trykker "Lagt op som postkort" → afsenderen får besked.
  Link fra `kort.html` ("Har du selv en tegning eller et maleri? Send det her"). Man kan også maile til post@olsenklanen.dk.
- Arbejdsgang for et indsendt værk: Carsten og Claude henter billedet, beskærer/tilpasser det (højst 1600 punkter),
  lægger det i `billeder/kort/`, tilføjer en linje i `KORT` med næste nr. og tema, kører `lav_samlekort.py` igen,
  og trykker "Lagt op som postkort".
