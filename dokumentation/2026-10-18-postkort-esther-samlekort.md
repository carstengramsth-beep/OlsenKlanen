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
- Åbent: at kunstnere selv kan vælge et tema eller finde på et nyt, når de sender en tegning eller et maleri ind.
