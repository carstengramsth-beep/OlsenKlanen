# Procedure: Rundsendelse af en information (Info nr. …) – kun én gang

Gælder for de 5 postansvarlige. Aftalt med Carsten 22. okt. 2026.

## Forberedelse (Claude / 5-Banden)
1. Teksten skrives som `infomails/<navn>.json` og godkendes af Carsten (forhåndsvisning først).
2. Den lægges i `infomails/index.json` med næste nummer og `"klar": true`.
3. Så ligger den i den gule boks **»📮 Klar til afsendelse«** i OlsenPost → 📚 Informationer.

## Afsendelse (postansvarlig)
1. Log ind via forsiden. Gå til **OlsenPost** i navigationen.
2. Tjek den grønne linje: **»👤 Du er logget ind som …«**. Står der en anden, tryk »Ikke dig? Log ind igen«.
3. Fanen **📚 Informationer** → den gule boks → evt. **🧪 Prøve til mig selv** først.
4. Tryk **📨 Send til alle**. En boks viser hvad, til hvor mange og hvem der sender.
5. Skriv **PIN-koden** (kræves hver gang ved »Send til alle«) → **Bekræft og send**.
6. En stor boks viser **»… er på vej«**. Tryk ikke igen. Når den er sendt: **»✅ Sendt til 45 medlemmer – én gang«**.
7. Informationen forsvinder fra den gule boks. Knappen hedder nu »🔁 Send igen / med rettelser …«.

## Hvis man vil sende den igen
- Siden siger: **»⚠️ Denne besked er tidligere rundsendt«** (med dato og antal) og giver tre valg:
  - **Annullér – send ikke** (standard)
  - **✏️ Send med rettelser** → skriv hvad der skal rettes → de 5 får en intern besked. Den rettede udgave laves og lægges i »Klar til afsendelse«.
  - **🔁 Send den igen til alle** → kræver PIN igen; boksen siger tydeligt **IGEN**. Gemmes med `gensendt: true`.
- Er den **på vej lige nu**, kan den slet ikke sendes igen (»Den er allerede på vej«).
- Info nr. 1–4 er sendt før systemet (`sendt_foer` i index.json) og tæller som sendt.

## Baggrund
Info nr. 5 blev sendt tre gange, fordi der ikke var tydelig besked om, at den var på vej. Serveren (functions) opdateres ikke automatisk, så sikringen ligger i `meddelelser.html`.

## Tilføjet 23. okt.: Almindelig mail (»Send mail til medlem«)
- Ved tryk på send kommer straks en stor boks: **»Mailen er modtaget til afsendelse«** → »Sender … 3 af 45« → **»✅ Mailen er sendt – én gang«**. Man kan ikke trykke igen imens.
- Mere end 3 modtagere = rundsendelse → **PIN-kode hver gang**.
- Er en mail med **samme emne** sendt til nogen af modtagerne inden for 7 dage: **»⚠️ Denne mail er sendt før«** → Annullér / Ret først / Send igen.
