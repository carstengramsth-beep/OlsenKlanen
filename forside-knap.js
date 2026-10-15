// Fast genvej til forsiden nederst til venstre på alle undersider – så man ikke skal
// rulle helt op eller "tilbage til hoveddøren" for at komme videre.
(function () {
  var side = (location.pathname.split("/").pop() || "").toLowerCase();
  if (side === "" || side === "forside.html" || side === "index.html" || side === "login.html" || side === "404.html") return;
  if (document.getElementById("forside-knap")) return;
  if (document.querySelector(".til-forsiden")) return; // siden har allerede sin egen faste forside-knap
  var stil = document.createElement("style");
  stil.textContent =
    "#forside-knap{position:fixed;left:14px;bottom:14px;z-index:9000;background:#2d5016;color:#f5e6a8;" +
    "font:600 15px Georgia,'Times New Roman',serif;text-decoration:none;padding:9px 14px;border-radius:24px;" +
    "box-shadow:0 2px 8px rgba(0,0,0,.3);border:1px solid #f5e6a8;}" +
    "#forside-knap:hover{background:#3d6b1f;}" +
    "@media print{#forside-knap{display:none!important;}}";
  document.head.appendChild(stil);
  var a = document.createElement("a");
  a.id = "forside-knap";
  a.href = "forside.html";
  a.title = "Til forsiden";
  a.textContent = "🏠 Forside";
  (document.body || document.documentElement).appendChild(a);
})();
