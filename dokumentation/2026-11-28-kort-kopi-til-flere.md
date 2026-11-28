# Kort: kopi til flere modtagere (CC)

28\. november 2026 · Claude Code sammen med Carsten

- På `kort.html`, boksen »Send kortet til et familiemedlem«: under »Til hvem?« er der nu **»Kopi til flere (valgfrit)«** – vælg og tryk »➕ Tilføj«. Højst 5 ekstra. Fjernes med ✕.
- **Intern post:** alle kommer i `til`/`til_navne` på samme opslag i `olsenpost` (som ved interne beskeder).
- **Rigtig mail:** én mail til hovedmodtageren med de andre som **CC**. Serveren (`koeMedlemsKort`) tjekker hver CC-modtager: aktiv, egen mail, godkendt husstand. Gemmes som `cc_emails`, `cc_navne` i `olsenpost_mail`; afsendelsen sætter `cc` på mailen.
- Kræver deploy af Cloud Functions (Actions → »Deploy Cloud Functions«).
