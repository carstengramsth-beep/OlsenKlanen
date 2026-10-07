// Laver kalenderen som PDF:  node lav-pdf.mjs
import { createRequire } from "module";
import { execSync } from "child_process";
import path from "path";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }
const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + path.resolve("kalender.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.pdf({ path: "GalleriEG-kunstkalender-2027.pdf", preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log("PDF lavet: GalleriEG-kunstkalender-2027.pdf");
