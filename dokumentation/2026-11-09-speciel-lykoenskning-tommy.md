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
