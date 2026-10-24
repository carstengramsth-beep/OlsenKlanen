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

| Person | Hvad | René / MyHeritage | Vores data | Status |
|---|---|---|---|---|
| Birthe Haugaard | Fødselsår | 1924 | 1925 | Åben – vi beholder 1925 |
| Agnes Olsen (f. Sejersen) | Dødsår | 1986 | 1987 (7. juni) | Åben – vi beholder 1987 |
| Betty Marie Nielsen | Dødsår | 1996 | 1998 (gravstenen) | Åben – vi beholder 1998 |

Samlet: Christine Jespersen = vores Kristine. Søren (Walter) Peter Vormslev Olsen = vores Walter
(Svends storebror, boede i Costa Rica) – fik datoerne 1894–2000 fra René.

Den levende liste står altid under »❓ Spørgsmål« på stamtræet. Denne fil er et øjebliksbillede.
Bed Claude om en ny afvigelsesliste, når der er kommet nye data.
