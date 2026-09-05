/* colors.js — RGB color mixer with persistence.
   Stored key: colors.last -> { r, g, b } */
(function () {
  "use strict";

  var KEY_LAST = "colors.last";

  var r = document.getElementById("r");
  var g = document.getElementById("g");
  var b = document.getElementById("b");
  var rOut = document.getElementById("rOut");
  var gOut = document.getElementById("gOut");
  var bOut = document.getElementById("bOut");
  var swatch = document.getElementById("swatch");
  var copyBtn = document.getElementById("copyBtn");
  var randomBtn = document.getElementById("randomBtn");

  function toHex(n) {
    var h = Number(n).toString(16);
    return h.length === 1 ? "0" + h : h;
  }

  function currentHex() {
    return "#" + toHex(r.value) + toHex(g.value) + toHex(b.value);
  }

  function render(persist) {
    rOut.textContent = r.value;
    gOut.textContent = g.value;
    bOut.textContent = b.value;
    var hex = currentHex();
    swatch.style.background = hex;
    swatch.textContent = hex.toUpperCase();
    if (persist) {
      KVStore.set(KEY_LAST, {
        r: Number(r.value),
        g: Number(g.value),
        b: Number(b.value),
      });
    }
  }

  function onInput() {
    render(true);
  }

  function randomize() {
    r.value = Math.floor(Math.random() * 256);
    g.value = Math.floor(Math.random() * 256);
    b.value = Math.floor(Math.random() * 256);
    render(true);
  }

  function copyHex() {
    var hex = currentHex().toUpperCase();
    var original = copyBtn.textContent;
    function done() {
      copyBtn.textContent = "Copied " + hex;
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(done, done);
    } else {
      done();
    }
  }

  [r, g, b].forEach(function (input) {
    input.addEventListener("input", onInput);
  });
  copyBtn.addEventListener("click", copyHex);
  randomBtn.addEventListener("click", randomize);

  KVStore.get(KEY_LAST).then(function (last) {
    if (last && typeof last === "object") {
      r.value = last.r != null ? last.r : 0;
      g.value = last.g != null ? last.g : 0;
      b.value = last.b != null ? last.b : 0;
    }
    render(false);
  });
})();
