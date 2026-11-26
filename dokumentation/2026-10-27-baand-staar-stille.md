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

## Genveje i båndet (tilføjet 26. nov. 2026)
Ønsket af Carsten. Hver del af båndet er nu sin egen genvej (før gik hele båndet til infologgen):
- **Nyheder** → selve artiklen (fra RSS `<link>`), åbner i ny fane. Mangler linket, går den til kildens forside.
- **Fødselsdag** → `#fremhaevede`. **Uddrag af infologgen** → `#infolog`. **Vejret** → dmi.dk.
- **Beskeder fra 5-Banden** kan have et felt `link` i Firestore (`#id` på forsiden eller en webadresse). Tommys besked har `link: "#special-tommy-dsb"`.
  (baand.html har endnu ikke et felt til link – kan tilføjes.)
- Mus over båndet = det står stille, så man kan ramme genvejen.

## Abonnement og smagsprøve (tilføjet 26. nov. 2026)
- **DR og TV2** er gratis (`gratis: true` i `NYHEDS_KILDER`): klik åbner artiklen direkte.
- **Ekstra Bladet, Politiken og Berlingske** kræver tit abonnement: der står **🔒** ved mediets navn i båndet.
  Klik åbner en boks på forsiden med overskrift, **smagsprøven** fra RSS (`<description>`, gjort til ren tekst, højst ca. 400 tegn)
  og beskeden »kræver tit abonnement«, plus knappen »Prøv at læse hele artiklen hos …«.
- Man kan ikke se på forhånd, om netop én artikel er gratis. Derfor får man altid besked ved de tre medier.

## Fødselsdag i båndet → fødselsdagskortet (tilføjet 26. nov. 2026)
- Hver fødselsdag i dag er sin egen del af båndet (`window.OLSEN_FOEDSELSDAG_DELE`, med nøglen til kortet).
- Klik viser **fødselsdagskortet** med hilsnerne (`visKort`). Er der ingen hilsner endnu, hopper den til listen under »Fremhævede begivenheder«, så man kan skrive den første.
