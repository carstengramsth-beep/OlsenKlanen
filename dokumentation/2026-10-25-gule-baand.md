# Det gule bånd styres nu fra hjemmesiden

Aftalt med Carsten 25. okt. 2026.

- Ny side **`baand.html`** (Administration → 🟨 Det gule bånd). Kun for admin og OlsenBanden.
  Genvej også nederst i infologgen på forsiden (»🟨 Ret teksten i det gule bånd«, kun admin/OlsenBanden).
- Man skriver en tekst (højst 200 tegn), vælger **vis fra** og **vis til og med**, ser en gul forhåndsvisning og trykker Gem (bekræftes).
- Lister: Kører nu / Kommer senere / Udløbet. Knapper: ✏️ Ret, ⏹ Stop nu, 🔁 Vis igen i 7 dage, 🗑 Slet.
  Der gemmes hvem der skrev/rettede og hvornår.
- Data: `olsenpost`, `type: "baand"`, felter `tekst, fra, til, oprettet_af, oprettet, rettet_af, rettet, slettet`.
- Forsiden henter beskederne selv. Den gamle faste liste `BAAND_BESKEDER` i `forside.html` er tom nu.
- De to beskeder om Info nr. 5 (udgivet til 5. nov. og beklagelsen til 29. okt.) er flyttet over.
