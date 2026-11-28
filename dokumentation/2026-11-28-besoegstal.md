# Besøgstal på forsiden: forskellige medlemmer og år for år

28\. november 2026 · Claude Code sammen med Carsten

Formål: følge udviklingen i den samlede aktivitet – målet er, at medlemmerne kommunikerer mere via hjemmesiden end via Facebook.

## Besøgsboksen på forsiden
- 🟢 Aktive lige nu · 📅 Besøg i dag · 👥 Forskellige medlemmer de sidste 30 dage.
- Tabel med én kolonne pr. år (nyeste til venstre, højst 3 år): **Besøg i alt i året** og **Forskellige medlemmer i året (ca.)**.
  Tidligere år viser »til samme dag« som tooltip, så man kan sammenligne.
- Et besøg = ét medlem/én markør på én dag (som før).

## Markøren (ingen navne)
- **Fra 28-11-2026:** logget ind med medlemsnummer → markøren er en kode lavet ud fra nummeret (`n_…`, FNV-hash). Et medlem tæller kun én gang, uanset mobil eller computer.
- Før: login-mail (`m_…`) eller en tilfældig browser-id (`g_…`). Derfor er »forskellige i 2026« for højt (171 pr. 28-11, for ~100 medlemmer).
  Tallet bliver mere præcist fremover; de gamle tal rettes ikke bagud. Fra 2027 er tallet rigtigt for hele året.
- Data: Realtime Database `besoeg/dage/<dag>/medlemmer/<markør>`. Ingen navne vises eller gemmes.

## Interval for 2026 (tilføjet 28-11-2026)
- »Forskellige medlemmer i året« for 2026 vises som **»mellem X og Y«**:
  X = flest forskellige login-mails (`m_`) eller medlemsnumre (`n_`) – hver er mindst én rigtig person;
  Y = antal forskellige markører, dog højst antallet af aktive medlemmer i kartoteket (`window.OLSEN_ANTAL_MEDLEMMER`).
- Fra 2027 vises ét præcist tal (antal medlemsnumre).

## Ændret 28-11-2026 (Carstens ønske)
- Intervallet gav ingen mening (fx »mellem 1 og 127«). Rækken »Forskellige medlemmer i året« er **skjult for 2026** og vises først, når der er tal for 2027 (ét præcist tal pr. år ud fra medlemsnumre).
- »Forskellige medlemmer de sidste 30 dage« vises stadig.

## Besøgsprocent (tilføjet 28-11-2026, Carstens ønske)
- Ny linje i besøgsboksen: **📊 Besøgsprocent (sidste 30 dage): X af N medlemmer = Y %** + en grøn bjælke.
- X = forskellige medlemsnumre (`n_`) de sidste 30 dage. Gæster og gamle markører (`m_`, `g_`) tæller ikke.
- N = aktive medlemmer i kartoteket (`window.OLSEN_ANTAL_MEDLEMMER`, ca. 127).
- Præcis fra 28-11-2026; fra 28-12-2026 dækker den hele 30 dage.
- Formål: vise alle, hvor mange der bruger siden – en grund til at holde hjemmesiden i luften.
- Ændret samme dag: indtil 28-12-2026 bruger procenten samme tal som »Forskellige medlemmer de sidste 30 dage« (med »ca.«), og beregningen vises (fx »30 ÷ 127 = ca. 24 %«). Fra 28-12-2026 skifter den selv til medlemsnumre (præcist).
- Ændret igen samme dag (Carstens beslutning): procenten er **skjult indtil 28-12-2026** – »ca.«-tallet kunne vildlede. Fra 28-12-2026 vises den automatisk, præcist ud fra medlemsnumre (`n_`). Uger/perioder før 28-11-2026 kan ikke opgøres (medlemsnummeret blev ikke gemt).

## Besøgsprocent pr. dag, uge og måned (besluttet 28-11-2026 af Carsten)
- Erstatter 30-dages-procenten. Boksen »📊 Besøgsprocent« viser forskellige medlemsnumre (`n_`) ÷ aktive medlemmer, med bjælke:
  - **I dag** – fra 29-11-2026 (første hele dag).
  - **Denne uge** (mandag–søndag) – fra 30-11-2026 (første hele uge).
  - **Denne måned (indtil nu)** og **sidste måned** – fra 1-1-2027 (december 2026 er første hele måned).
- Hver linje vises først, når den er præcis. Boksen er skjult, indtil der er mindst én linje.
- Kode: `visBesoegsProcent()` og `window.BESOEG_PCT` i `besoegstaeller.js`.
