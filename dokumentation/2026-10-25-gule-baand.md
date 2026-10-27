# Det gule bånd styres nu fra hjemmesiden

Aftalt med Carsten 25. okt. 2026.

- Ny side **`baand.html`** (Administration → 🟨 Det gule bånd). **Kun 5-Banden** (Carsten 8, Tommy 19, Kurt 22, Karin 23, Sanne 48 – skal også være admin).
  Genvej også nederst i infologgen på forsiden (»🟨 Ret teksten i det gule bånd«, kun 5-Banden).
- Man skriver en tekst (højst 200 tegn), vælger **vis fra** og **vis til og med**, ser en gul forhåndsvisning og trykker Gem (bekræftes).
- Lister: Kører nu / Kommer senere / Udløbet. Knapper: ✏️ Ret, ⏹ Stop nu, 🔁 Vis igen i 7 dage, 🗑 Slet.
  Der gemmes hvem der skrev/rettede og hvornår.
- Data: `olsenpost`, `type: "baand"`, felter `tekst, fra, til, oprettet_af, oprettet, rettet_af, rettet, slettet`.
- Forsiden henter beskederne selv. Den gamle faste liste `BAAND_BESKEDER` i `forside.html` er tom nu.
- De to beskeder om Info nr. 5 (udgivet til 5. nov. og beklagelsen til 29. okt.) er flyttet over.

Rettet 27. okt. 2026: uddrag fra infologgen kommer nu med i båndet, og Politiken er ny nyhedskilde. Se 2026-10-27-baand-staar-stille.md.
