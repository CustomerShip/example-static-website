/* Shared behaviour across all pages.
   - Highlight the active nav link based on the current page.
   - Dark/light theme toggle with localStorage persistence. */
(function () {
  "use strict";

  var THEME_KEY = "theme";

  /* ---- Apply saved theme as early as possible ---- */
  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }

  function loadTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === "dark");
  }

  /* ---- Nav active link ---- */
  function highlightActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    var links = document.querySelectorAll(".nav-links a");
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  /* ---- Theme toggle button ---- */
  function initThemeToggle() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isDark = document.body.classList.toggle("dark");
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    highlightActiveNav();
    initThemeToggle();
  });

  /* Also apply theme immediately (before DOMContentLoaded) to avoid flash,
     once the body element is available. If this script is at the end of
     <body> the element already exists. */
  if (document.body) {
    loadTheme();
  }
})();
