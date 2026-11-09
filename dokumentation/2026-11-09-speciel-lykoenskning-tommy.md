# Speciel lykønskning på forsiden: Tommy 50 år på skinner

9\. november 2026 · Claude Code sammen med Carsten

- Ny boks **"🚂 Speciel lykønskning"** øverst i midten af forsiden, over "Fremhævede begivenheder og lykønskninger".
- Tekst: "Det kører på skinner for Tommy!" — tillykke med 50 år i DSB (november 1976 – november 2026).
- Billede: samlebillede fra Facebook (4 fotos fra jubilæet), godkendt af Carsten.
  Ligger i `billeder/hilsner/tommy-50-aar-paa-skinner.webp`. Tryk = stort billede (`stort-billede.js`).
- Boksen vises kun **1.–30. november 2026** og forsvinder af sig selv 1. december.

## Sådan laves en ny speciel lykønskning

1. Læg billedet i `billeder/hilsner/`.
2. Kopiér `<div class="special-hilsen" …>`-blokken i `forside.html`, og giv den et nyt `id`.
3. Ret `data-fra` og `data-til` (ÅÅÅÅ-MM-DD) — boksen vises kun i den periode.
4. Ret billede, overskrift og tekst. Få teksten godkendt af Carsten, før den lægges op.

## 👍 Tommel op (tilføjet 9. nov. 2026)

- Under hilsenen er der en knap "👍 Giv Tommy en tommel op". Tryk igen = fjern.
- Navnene på dem, der har givet en tommel, står ved siden af ("Synes godt om: …").
- Gemmes i Firestore `olsenpost/special_<data-tommel>` som `tommel: [{nr, navn, tid}]` (samme form som i infologgen).
- En ny speciel lykønskning får tommel op ved at sætte `data-tommel="<unikt navn>"` og evt. `data-tommel-tekst` på boksen.
