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
