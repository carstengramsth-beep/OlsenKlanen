/* ════════════════════════════════════════════════════════════
   Færdige mails til OlsenPost ("Send mail til medlem").
   Åbnes med:  meddelelser.html?skabelon=<navn>
   En skabelon med "infomail" viser en færdig mail med billeder og knapperne
   "Send prøve til mig selv" og "Send til alle". En skabelon med emne/tekst udfylder
   den almindelige mail (og "alle" vælger alle medlemmer med mail).
   Man kan altid rette teksten, før man trykker "Send".
   Hilsen og afsenderens navn tilføjes automatisk nederst af OlsenPost.
   ════════════════════════════════════════════════════════════ */
window.OLSENPOST_SKABELONER = {
  // Infomail med tekst og billeder i selve mailen. Indholdet står i infomails/maerkedage.json
  // og sendes af serveren fra post@olsenklanen.dk (som brevkortene).
  maerkedage: { infomail: "maerkedage" }
};
