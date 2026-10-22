# Info nr. 5 sendt – og sikrere afsendelse i OlsenPost

22. okt. 2026 · Claude Code (pc-1) med Carsten

- Info nr. 5 »Familietræet er ved at blive bygget« blev sendt til alle 45 – desværre **tre gange** (18.25, 18.26 og 19.16).
  Carsten valgte ikke at sende en undskyldning.
- Rettet i `meddelelser.html` (fanen 📚 Informationer):
  - Gul boks »📮 Klar til afsendelse« øverst (infos med `"klar": true` i `infomails/index.json`, som ikke er sendt til alle).
  - »Send til alle« kræver **altid** PIN-kode i en boks, der viser hvad, til hvor mange og hvem der sender.
  - En info kan kun sendes til alle **én gang**: tjek af `olsenpost_mail` før afsendelse, knappen skjules når den er sendt, spærre mod dobbeltklik.
  - Grøn linje »👤 Du er logget ind som …« + »Ikke dig? Log ind igen« (på fælles computer kan en ny fane arve den andens login).
