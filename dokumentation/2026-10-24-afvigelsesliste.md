# Afvigelsesliste + spørgsmål på stamtræet

Aftalt med Carsten 24. okt. 2026.

## Ideen
- Vi holder fast i vores egne data, indtil vi er sikre.
- Oplysninger, vi ikke er 100 % sikre på, bliver **markeret** – de bliver ikke rettet i blinde.
- Når vi ved, hvad der er rigtigt, retter vi data og trykker **»✅ Afklaret«**.
  Så gemmes **hvem** der gjorde det og **hvornår**.

## Sådan ser det ud på stamtræet (`stamtrae.html`)
- **Orange ⚠ og orange ring** på kortet = en oplysning skal bekræftes.
- **»? Navn« i kursiv, lilla stiplet kort** = udkast (fx fra MyHeritage), ikke bekræftet.
- Knappen **»❓ Spørgsmål (antal)«** viser listen: åbne spørgsmål øverst, afklarede nederst
  med hvem og hvornår. Tryk på et navn for at åbne personen.
- Administrator trykker »✅ Afklaret – gem hvad der er rigtigt« i personens boks og skriver svaret.
  Retter man en dato, skal den også rettes med ✏️ Ret data.
- Godkendte udkast viser også »✅ Godkendt af … (dato)«.

## Teknik (til den anden Claude)
- Felt på personen: `tvivl` = liste af tekster (åbne spørgsmål).
- Ved afklaring flyttes teksten til `tvivl_afklaret` = [{tekst, svar, af, nr, dato}].
- Virker både for Slægten (`olsenpost/slaegt_<pid>`) og medlemmer (`membres/<nr>`, læser frisk før gem).

## Afvigelsesliste – 24. okt. 2026
Kilde: Renés MyHeritage-data (zip) sammenholdt med vores data. Kun afdøde.

| Person | Hvad | René / MyHeritage | Vores data | Vores kilde | Status |
|---|---|---|---|---|---|
| Birthe Haugaard | Fødselsår | 26. juni 1924 | 26. juni 1925 | Karins mail 22. okt. 2026 (»født 26. juni 1925 – døde 11. juli 2014«) | ✅ Afklaret af Carsten 24. okt. 2026 – vores data er rigtige |
| Agnes Olsen (f. Sejersen) | Dødsår | 1986 (Bispebjerg Hospital) | 7. juni 1987 | Carstens eget MyHeritage-træ (ses i Record Match-mail 21. okt. 2026). Intet dokument endnu | Åben – mangler dokument (fx gravsted eller dødsattest) |
| Betty Marie Nielsen | Dødsår | 1996 | 11. nov. 1998 | Elisabeth + gravstenen | ✅ Afklaret af Carsten 24. okt. 2026 – vores data er rigtige |

**Beslutning 24. okt. 2026 (Carsten):** Birthe og Betty er afklaret. Agnes er stadig åben – Carsten leder efter et svar.

Ingen afvigelse: Svend Aage (morfar) 25. jan. 1900 – 4. apr. 1996 og Erland 19. jan. 1915 – 2003 passer i begge.
Bemærk: Karins mail handler om Birthe og Finn (mor og far) – ikke om mormor og morfar.

Samlet: Christine Jespersen = vores Kristine. Søren (Walter) Peter Vormslev Olsen = vores Walter
(Svends storebror, boede i Costa Rica) – fik datoerne 1894–2000 fra René.

## Åbne spørgsmål om personer (ikke datoer)
- **Svend Aages brødre:** Kurt nævner Einer og en gas-aflæser fra Bellahøj (mail 24. okt. 2026). Carsten kan ikke huske Einers rolle. Ingen af dem er lagt ind.
- **Walter:** stavemåde og datteren, der var gift med Costa Ricas præsident.
- ✅ **Kurts billede »Dalby – Jans konfirmation«** (Gamle billeder): Agnes og Svend Aage med deres 7 børn. Bekræftet af Carsten (efter aftale med Kurt) 24. okt. 2026. Tekst lagt på billedet. Rækkefølgen fra venstre (Carsten er ret sikker): Gydda, Inger, Egon, Agnes, Christian, Svend Aage, Ib, Lise, Birthe.

Den levende liste står altid under »❓ Spørgsmål« på stamtræet. Denne fil er et øjebliksbillede.
Bed Claude om en ny afvigelsesliste, når der er kommet nye data.
