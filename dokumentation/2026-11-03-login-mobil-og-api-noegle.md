# Login på mobil rettet + kontrol af Google API-nøglen

3. nov. 2026, aftalt med Carsten.

## Login på mobil
- Iben skrev 31. okt.: på mobilen kom kun sangteksten frem, ikke login-feltet.
- Årsag: siden 16. okt. (Skovtursangens tekst) blev login-siden højere end skærmen.
  Siden centrerede alt i en fast højde, så toppen (logo, medlemsnummer, PIN) blev skubbet op over kanten.
- Rettet i `login.html`: kun `html` har fast højde; `body` må vokse og rulle. Ser uændret ud på computer.

## GitGuardian-advarsel (9. okt.) om Google API-nøgle
- Nøglen er Firebases almindelige webnøgle. Den må gerne stå i koden. Skal IKKE slettes eller udskiftes.
- Kontrolleret i Google Cloud: kun én nøgle; den er begrænset til 25 Firebase-API'er; ingen tegn på misbrug de seneste 30 dage.
- Mangler: nøglen er ikke låst til hjemmesiden (HTTP-henvisere). Gøres senere, efter aftale.
- Den egentlige risiko er Firestore-reglerne (`membres` m.fl. kan læses og ændres af alle). Se `2026-10-22-sikkerhed-personoplysninger.md`.
