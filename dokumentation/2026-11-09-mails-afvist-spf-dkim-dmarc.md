# Info nr. 6: mails til hotmail blev afvist – olsenklanen.dk mangler "ID-papirer" (SPF/DKIM/DMARC)

9\. november 2026 · Claude Code sammen med Carsten · til afstemning med Kurt

## Hvad skete der?
- Info nr. 6 (Tommy, 50 år i DSB) blev sendt til 52 medlemmer kl. 10.46.
- **8 mails kom retur. Alle 8 er hotmail-adresser.**
- Grunden står i tilbagemeldingen fra Microsoft: `550 5.7.1 Message rejected: Message lacks SPF/DKIM/DMARC Auth Records`.
- Det betyder: **Adresserne er sikkert rigtige.** Hotmail/Outlook afviser mail fra post@olsenklanen.dk,
  fordi domænet mangler de indstillinger, der beviser, at mailen virkelig kommer fra os.
- Det rammer **alle mails fra OlsenPost** til hotmail/outlook/live-adresser (infomails, almindelige mails, velkomstmails, postkort).
  Gmail kan også begynde at afvise. En gmail-adresse kom retur med samme slags grund 3. oktober.

## Hvad gør vi?
1. **ID-papirerne sættes op hos Simply** (der hvor olsenklanen.dk og post@olsenklanen.dk ligger).
   Ifølge Simplys egen vejledning skal domænet have:
   - **SPF:** én TXT-post på `olsenklanen.dk` med `include:spf.simply.com` (fx `v=spf1 include:spf.simply.com -all`). Kun én SPF-post må findes.
   - **DKIM:** CNAME `simplycom1._domainkey` → `dkim1.simply.com` og `simplycom2._domainkey` → `dkim2.simply.com`.
   - **DMARC:** CNAME `_dmarc` → `dmarc.simply.com`.
   Tjek først, hvad der allerede står i DNS hos Simply, og ret til. Hjemmesidens A-/CNAME-poster til GitHub Pages må ikke røres.
   Kilde: https://www.simply.com/en/support/faq/mail/136-spf-dkim-and-dmarc/
2. **Bagefter:** send en prøve til en hotmail-adresse. Kommer den frem, sendes Info nr. 6 igen til de 8 med »Send til det valgte medlem«.
3. **Rigtige fejl i adresser** (fra oktober, ikke hotmail): 3 husstande har en adresse, der ikke findes eller har en tastefejl.
   De rettes i Medlemskartoteket. Se navnene i OlsenPost → ⚠️ Ikke leveret.

## Hvor kan man se listen?
OlsenPost → **⚠️ Ikke leveret**. Her står hver adresse med medlem, grund og dato.
Hotmail-afvisningerne står som "Afvist af modtagerens system (spamfilter / afsender ikke godkendt)". Dem skal man **ikke** rette i kartoteket.

## Status 9. nov. 2026 (efter tjek hos Simply)
- Simplys kontrolpanel → olsenklanen.dk → DNS viste:
  - ✅ SPF fandtes allerede: `TXT olsenklanen.dk  v=spf1 include:spf.simply.com ~all`
  - ✅ DKIM fandtes allerede: `simplycom1._domainkey` → `dkim1.simply.com` og `simplycom2._domainkey` → `dkim2.simply.com`
  - ❌ **DMARC manglede.** Det kræver Microsoft (hotmail/outlook) af afsendere.
- **Carsten tilføjede DMARC:** `TXT _dmarc.olsenklanen.dk  v=DMARC1; p=none;` (den blide udgave, der ikke stopper vores egne mails).
  Kan gøres strengere senere (`p=quarantine` eller `p=reject`), når det er set, at alle mails kommer frem.
- Det kan tage op til 24 timer, før ændringen virker.
- **Næste skridt (10. nov.):** send en prøve til en hotmail-adresse. Kommer den frem, sendes Info nr. 6 igen til de 8 med »Send til det valgte medlem«.
- Set samtidig: **automatisk fornyelse er slået fra** hos Simply. Domænet udløber 30. juni 2027. Står på huskelisten i STATUS.md.
