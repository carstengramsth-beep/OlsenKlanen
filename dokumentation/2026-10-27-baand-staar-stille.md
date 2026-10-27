# Det gule bånd står stille og viser det nye på siden

Ønsket af Carsten 27. okt. 2026.

- Båndet nederst på forsiden **ruller ikke længere**. Teksten står stille og kan fylde to linjer.
- **DR-/TV2-nyheder og vejret er taget ud** af båndet.
- Båndet viser nu, i denne rækkefølge, adskilt med »·«:
  1. Fødselsdag (som før).
  2. Beskeder fra 5-Banden (skrives på `baand.html`, som før).
  3. **Sammenfatning af infologgen**, fx »📣 I dag (27-10): 8 nye indlæg i infologgen af Kurt«.
     Flere personer: »– 6 af Kurt og 2 af Carsten«. Intet nyt i dag: »📣 Seneste nyt (25-10): …«.
- Klik på båndet ruller ned til infologgen. Sammenfatningen opdateres hvert 2. minut.
- Teknik: `infolog.js` har fået `InfoLog.hent()` (= de synlige linjer, nyeste først). Forsiden tæller linjerne pr. dag og pr. fornavn.
- Siden får automatisk plads nok i bunden, så båndet ikke dækker indholdet. Mindre skrift på mobil.
