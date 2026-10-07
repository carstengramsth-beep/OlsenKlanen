/* ════════════════════════════════════════════════════════════
   GalleriEG kunstkalender 2027 — INDHOLD
   Her rettes billeder, billedtekster og tekster.
   Datoer, ugedage, ugenumre og helligdage regnes ud automatisk
   i kalender.html ud fra AAR.
   ════════════════════════════════════════════════════════════ */
window.KALENDER = {
  AAR: 2027,

  // Forside (30 × 40 cm) og omslag med årstal (30 × 60 cm)
  forside: { fil: "billeder/forside.jpg", tekst: "Akryl 60 x 60 cm" },
  omslag:  { fil: "billeder/omslag.jpg" },

  // DEMO: billeder og tekster er lånt fra kalender 2023, indtil de nye kommer.
  // Ét billede pr. måned. Filnavn: billeder/01.jpg … billeder/12.jpg
  // tekst = linjen under billedet, fx: "Vinterstemning". Olie 50 x 40 cm.
  maaneder: [
    { fil: "billeder/01.jpg", tekst: "“Vinterstemning”. Olie 50 x 40 cm." },
    { fil: "billeder/02.jpg", tekst: "“Morgenstemning”. Olie 50 x 40 cm." },
    { fil: "billeder/03.jpg", tekst: "Fra serien “Damer for sjov”. Akryl 40 x 50 cm." },
    { fil: "billeder/04.jpg", tekst: "Fra serien “Pæoner i haven”. Akryl 60 x 60 cm." },
    { fil: "billeder/05.jpg", tekst: "Fra serien “Pæoner i haven”. Akryl 60 x 60 cm." },
    { fil: "billeder/06.jpg", tekst: "Fra serien “Pæoner i haven”. Akryl 60 x 60 cm." },
    { fil: "billeder/07.jpg", tekst: "“Forunderlig valmue”. Akryl 60 x 60 cm." },
    { fil: "billeder/08.jpg", tekst: "Fra serien “Valmuer”. Akryl 60 x 60 cm." },
    { fil: "billeder/09.jpg", tekst: "Inspiration “Syrisk rose”. 60 x 60 cm." },
    { fil: "billeder/10.jpg", tekst: "Fra serien “Damer for sjov” – “Damen med sølvhår”. Akryl 40 x 40 cm." },
    { fil: "billeder/11.jpg", tekst: "Fra serien “Damer for sjov”. “Damen med guldhår”. Akryl 40 x 40 cm." },
    { fil: "billeder/12.jpg", tekst: "" }
  ],

  // Egne mærkedage (kommer med i kalenderen). Format "MM-DD": "tekst"
  egneDage: {
    // "11-18": "Eksempel på egen mærkedag"
  },

  // Introside (30 × 30 cm)
  intro: {
    titel: "Kunstkalender 2027",
    // Elisabeths tekst om årets kalender — afsnit adskilles med tom linje
    aaretsTekst:
`[Elisabeths tekst om kalender 2027 kommer her.]

[Fx: hvilke motiver og serier der er valgt i år, udstillinger i 2026 og planer for 2027.]

Følg mig på instagram: galleri.eg og min hjemmeside: www.elisabeth.minisite.dk og hold dig opdateret om mine udstillinger i 2027.`,
    billeder: ["billeder/intro-1.jpg", "billeder/intro-2.jpg", "billeder/intro-3.jpg"],
    omMigTitel: "Og lidt om mig selv.",
    // Fra kalender 2023 — skal læses igennem af Elisabeth
    omMig:
`Jeg maler fortrinsvis landskaber, himmel/hav ekspressivt og med abstraktioner, men også huse, ansigter, mennesker, blomster – også med abstraktioner. Jeg maler abstrakte malerier, hvor motivet ikke er figurativt.

Jeg har gennem de sidste 13 år deltaget i flere kurser – både i ind- og udlandet. Jeg har bl.a. været på ”Kunsthøjskolen på Ærø”, ”Kunstskolen Sønderbygaard”, Vinderup, ”Kragekær Kunstskole”, Tåsinge, flere gange. Jeg har været på kursus i Sydfrankrig og Sydafrika. Jeg er tilknyttet et par kunstskoler og et par malehold, hvor jeg henter inspiration og får udvidet mit kendskab til forskellige maleteknikker.

Jeg har udstillet mine malerier forskellige steder – både fælles udstillinger og alene. Jeg har udstillet gennem Stevns Kunstforening nogle gange, bl.a. på ”Kulturloftet” i Store Heddinge. Derudover har jeg udstillet flere steder på Stevns, i Køge, i Greve, i Herlev, i Brøndby, på CPH Art Space på Docken i København, Byens hus i Gentofte, Galleri Pialeh Frederiksberg, Sognegården i Stenløse.

Jeg er i 2019 igen begyndt at lave stentøj, som ellers har været lagt på hylden i nogle år p g a en skulderskade. Jeg laver små skulpturer, blomster og fugle i stentøj.`,
    kontakt: "Elisabeth Gram • Store Heddinge • 20604377 • eg@paritas.dk • elisabeth.minisite.dk • instagram: galleri.eg"
  }
};
