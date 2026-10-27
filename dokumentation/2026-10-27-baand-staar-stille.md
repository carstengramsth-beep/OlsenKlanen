# Det gule bånd: rulletekst med uddrag fra infologgen + nyheder

Ønsket af Carsten 27. okt. 2026. (Samme dag blev båndet først gjort stillestående. Carsten ville have liv igen, så det ruller nu igen.)

## Hvad står der i båndet (i denne rækkefølge)
1. Fødselsdag.
2. Beskeder fra 5-Banden (skrives på `baand.html`).
3. **Uddrag fra infologgen** for den seneste dag med nyt, fx
   »📣 NYT I INFOLOGGEN i dag (27-10) – 8 indlæg: Kurt har tilføjet Gudrun i stamtræet ▸ … ▸ og 3 mere – se infologgen«.
   Højst 5 linjer; ved opslag kommer også et kort uddrag af teksten. Opdateres hvert 2. minut.
4. Vejret (open-meteo).
5. Nyheder: DR, TV2, Politiken, Berlingske, Ekstra Bladet (4 fra hver, blandet).

Klik på båndet = gå til infologgen. Mus over båndet = det står stille, så man kan læse.

## Nyhederne
- Nyhederne hentes i browseren. TV2 tillader det direkte fra olsenklanen.dk. De andre går via gratis mellemtjenester (allorigins, rss2json), som er ustabile. Derfor kan det ske, at kun TV2 kommer med.
- **Bedre løsning, ikke sat op endnu:** en GitHub-opgave, der hver halve time henter overskrifterne og gemmer dem i Firestore `olsenpost/nyhedsbaand` (`type: "nyhedsfeed"`, `titler`, `hentet`). Forsiden læser allerede dokumentet, hvis det er under 6 timer gammelt.
  Opgaven blev afvist ved upload 27. okt.: Carstens adgangsnøgle på pc-1 mangler retten `workflow`. Kan lægges op fra GitHub i browseren eller med en nøgle med `workflow`-ret. Koden er testet (alle 5 kilder gav 4 overskrifter):
  `.github/workflows/nyheder.yml` (cron `*/30 * * * *`, node 22, kører scriptet) og `.github/scripts/hent-nyheder.mjs` (henter RSS, blander, PATCH til dokumentet med web-API-nøglen).

## Teknik
- `infolog.js` har `InfoLog.hent()` (= de synlige linjer, nyeste først).
