/* Shared behaviour across all pages.
   Currently: highlight the active nav link based on the current page. */
(function () {
  "use strict";

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

  document.addEventListener("DOMContentLoaded", highlightActiveNav);
})();
