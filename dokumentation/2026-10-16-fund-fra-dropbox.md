# Fundet materiale fra Dropbox (pc-2)

16\. oktober 2026 · Claude på pc-2 sammen med Carsten

Den 16. oktober 2026 blev der lagt 3 medlemsblade og 266 billeder på olsenklanen.dk.
Alt stammer fra Carstens gamle Dropbox-mappe "Olsenklanen" på pc-2.

- Mappen ligger her: `C:\Users\cg\Dropbox\Olsenklanen` (ca. 420 filer, ca. 2 GB).
- Bladene ligger i Årbogen (`aarbogen.html`).
- Billederne ligger i Årenes billeder (`aarenes-billeder.html`) under 2015, 2016 og 2017.

## Medlemsblade lagt i Årbogen

Bladet for et år handler om skovturen året før.

| Årbog | Blad | Indhold | Fil i Dropbox | Side | Bemærkning |
| --- | --- | --- | --- | --- | --- |
| 2019 | Information nr. 44 (april 2019, 16 sider) | Skovtur 1.–3. juni 2018, Kolonien Højbjerghus ved Fårevejle + indkaldelse til 2019 på Lejrcenter Holmsborg | `kor. info 2019 - no. 44/03_65013_OlsenKlanen_2019.pdf` | `blad-2019.html` | Mappen hedder "kor." – kan være en korrektur |
| 2018 | Information nr. 43 (april 2018, 16 sider) | Skovtur 26.–28. maj 2017, Visby Fritidscenter ved Bredebro + indkaldelse til 2018 | `02_51548_PF_olsenklanen trykfil 2017.pdf` | `blad-2018.html` | Trykfil – ser ud til at være den færdige udgave |
| 2017 | Information nr. 42 (april 2017, 16 sider) | Referat af skovtur 2016, skovtursangen + indkaldelse til 2017 i Visby | `udflugt 2016/51548_OlsenKlanen_2017_korr_1_lav 270317 kl.pdf` | `blad-2017.html` | **Korrekturudgave** (1. korrektur, marts 2017) – mærket på siden |

Teknisk: siderne er lavet som `blad-2016.html` (sider som JPEG, 1241×1754, indlejret i filen). Posterne står i listen i `aarbogen.html`. Lagt op i PR #115.

## Billeder lagt i Årenes billeder

266 billeder: 70 fra 2015, 124 fra 2016 og 72 fra 2017. Dubletter er sorteret fra.
Billederne er gjort mindre (højst 2000 punkter) og fordelt efter klokkeslættet på billedet.
Hvor filnavnet havde en tekst, står den under billedet.

| Gruppe på siden | 2015 | 2016 | 2017 |
| --- | --- | --- | --- |
| Fredag · Aftensmad og aftenhygge | 16 | 24 | 15 |
| Lørdag · Flaghejsning og morgensang | 6 | 6 | 17 |
| Lørdag · Morgenmad og morgenhygge | 7 | 17 | 7 |
| Lørdag · Generalforsamling | 4 | 10 | 3 |
| Lørdag · Årets fællesfoto | 3 | 2 | 8 |
| Lørdag · Det store tag-selv-bord | 20 | 4 | 12 |
| Lørdag · Konkurrencer, leg og hygge | 6 | 22 | 10 |
| Lørdag · Det store kaffebord | – | 1 | – |
| Lørdag · Grillpølser m.m. | – | 7 | – |
| Lørdag · Aftenhygge til sengetid | 3 | 21 | – |
| Søndag · Morgenmad og morgenhygge | 5 | 10 | – |
| **I alt** | **70** | **124** | **72** |

- **2015** (Kolonien Lønsømaj ved Nordborg): 35 fra Carsten og 35 fra Lise.
- **2016**: fra mapperne for 3., 4. og 5. juni 2016, "Billeder 2016 – til bladet" og "Billeder fra Iben 2016".
- **2017** (Visby Fritidscenter): 70 fra Carsten og 2 fra Bent. Der lå i forvejen 8, så der nu er 80. Billederne i mappen "udflugt 2018 og 2019" er fra 2017.

Teknisk: lagt i Firebase Storage under `fotovaeg/<år>/<gruppe>/` med metadata `tekst`, `navn` og `uploaderNr = 8B`.
Uploadet med en engangs-GitHub Action fra grenen `foto-import-dropbox` (kan slettes).

## Fundet, men ikke lagt op endnu

| Materiale | Hvor i Dropbox | Kunne bruges til |
| --- | --- | --- |
| Billeder i mails fra Nina (drager, Højer sluse m.m., 2017) | Rodmappen + "udflugt 2018 og 2019" (4 mails, ca. 55 MB) | Årenes billeder 2017 |
| Billeder i mails fra Tommy (skovtur 2017) | "udflugt 2018 og 2019" (2 mails, ca. 16 MB) | Årenes billeder 2017 |
| "Billeder til info 41" (mail) | "udflugt 2015/Korrektur" | Årenes billeder 2015 |
| 25 billeder i råformat (.CR2) og 1 video (.MOV) | "udflugt 2016" og "udflugt 2018 og 2019" | Kræver omdannelse først |
| Referater af generalforsamling 2016, 2017 og 2018 + skovtur 2016 (Word) | "udflugt 2016" og "udflugt 2018 og 2019" | Arrangementer / Historier |
| Program, begivenhedskalender og særlige begivenheder 2017–2019 (Word) | Samme mapper | Arrangementer |
| Program skovtur 2020 (aflyst) | Rodmappen | Årbogen 2020 |
| Trykt udgave af nr. 42 (2017) | Ikke fundet | Skal erstatte korrekturen i Årbogen |

## Til afstemning med Kurt

- [ ] Har nogen det trykte blad nr. 42 (2017)? Så skal korrekturen udskiftes.
- [ ] Er blad nr. 44 (2019) den færdige udgave eller en korrektur?
- [ ] Ligger billederne i de rigtige grupper? Flyt dem, der sidder forkert.
- [ ] 8 af Ibens billeder fra 2016 står med Carsten som fotograf. Skal navnet rettes?
- [ ] Er der billeder fra 2018 og 2019 et andet sted?
- [ ] Skal billederne i mails fra Nina og Tommy også lægges op?
- [ ] Skal referaterne fra 2016–2018 lægges på siden?
