// Laver kalenderen som PDF:
//   node lav-pdf.mjs        → trykformat 30 × 60 cm (som kalenderen fra 2023)
//   node lav-pdf.mjs a4     → korrektur-udskrift, hver side tilpasset A4
//   node lav-pdf.mjs a3     → korrektur-udskrift, hver side tilpasset A3
import { createRequire } from "module";
import { execSync } from "child_process";
import path from "path";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

const papir = (process.argv[2] || "").toLowerCase();
const PAPIR = { a4: [210, 297], a3: [297, 420] }[papir];
const fil = PAPIR ? `GalleriEG-kunstkalender-2027-korrektur-${papir.toUpperCase()}.pdf` : "GalleriEG-kunstkalender-2027.pdf";

const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + path.resolve("kalender.html"));
await page.evaluate(() => document.fonts.ready);
if (PAPIR) {
  const [b, h] = PAPIR, kant = 8;   // 8 mm hvid kant, så printeren ikke skærer noget af
  const fit = (w, hh) => Math.min((b - 2 * kant) / w, (h - 2 * kant) / hh).toFixed(4);
  await page.addStyleTag({ content: `
    @page forside { size: ${b}mm ${h}mm; margin: 0; }
    @page lang { size: ${b}mm ${h}mm; margin: 0; }
    @page kvadrat { size: ${b}mm ${h}mm; margin: 0; }
    html, body { background: #fff; }
    .side { margin: ${kant}mm auto 0 !important; }
    .side.forside { zoom: ${fit(300, 400)}; }
    .side.lang    { zoom: ${fit(300, 600)}; }
    .side.kvadrat { zoom: ${fit(300, 300)}; }` });
}
await page.waitForTimeout(500);
await page.pdf({ path: fil, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log("PDF lavet: " + fil);
