/* counter.js — click counter with live session + all-time stats.

   Persistent state (stored in the browser via KVStore / IndexedDB):
     counter.total        -> total clicks ever, this browser
     counter.firstClickTs  -> timestamp (ms) of the very first click ever

   Session state (in-memory only, resets on reload):
     sessionClicks        -> clicks since the page loaded
     sessionFirstClickTs   -> timestamp of first click this session

   Clicks/s are computed from the first click time to "now" (updated live). */
(function () {
  "use strict";

  var KEY_TOTAL = "counter.total";
  var KEY_FIRST = "counter.firstClickTs";

  // Session (in-memory) state.
  var sessionClicks = 0;
  var sessionFirstClickTs = null;

  // Persistent state (mirrored in memory once loaded).
  var totalClicks = 0;
  var totalFirstClickTs = null;

  // DOM references.
  var el = {};
  ["count", "clickBtn", "sessionClicks", "totalClicks", "sessionCps",
   "totalCps", "resetSessionBtn", "resetAllBtn", "storageNote"]
    .forEach(function (id) {
      el[id] = document.getElementById(id);
    });

  function fmtInt(n) {
    return Number(n).toLocaleString();
  }

  /* Clicks per second measured from the first click until now.
     Returns 0 until there is at least one click and some elapsed time. */
  function cps(clicks, firstTs) {
    if (!clicks || !firstTs) return 0;
    var elapsedSec = (Date.now() - firstTs) / 1000;
    if (elapsedSec <= 0) return 0;
    return clicks / elapsedSec;
  }

  function render() {
    el.count.textContent = fmtInt(sessionClicks);
    el.sessionClicks.textContent = fmtInt(sessionClicks);
    el.totalClicks.textContent = fmtInt(totalClicks);
    el.sessionCps.textContent = cps(sessionClicks, sessionFirstClickTs).toFixed(2);
    el.totalCps.textContent = cps(totalClicks, totalFirstClickTs).toFixed(2);
  }

  function handleClick() {
    var now = Date.now();

    sessionClicks += 1;
    if (sessionFirstClickTs === null) sessionFirstClickTs = now;

    totalClicks += 1;
    if (totalFirstClickTs === null) totalFirstClickTs = now;

    render();

    // Persist all-time state (fire-and-forget; UI already updated).
    KVStore.set(KEY_TOTAL, totalClicks);
    if (totalFirstClickTs === now) {
      // Only write the first-click timestamp once, when it is first set.
      KVStore.set(KEY_FIRST, totalFirstClickTs);
    }
  }

  function resetSession() {
    sessionClicks = 0;
    sessionFirstClickTs = null;
    render();
  }

  function resetAll() {
    if (!window.confirm("Reset all-time click data for this browser?")) return;
    totalClicks = 0;
    totalFirstClickTs = null;
    Promise.all([KVStore.set(KEY_TOTAL, 0), KVStore.set(KEY_FIRST, null)])
      .then(render);
  }

  function init() {
    el.clickBtn.addEventListener("click", handleClick);
    el.resetSessionBtn.addEventListener("click", resetSession);
    el.resetAllBtn.addEventListener("click", resetAll);

    // Load persisted state.
    Promise.all([KVStore.get(KEY_TOTAL), KVStore.get(KEY_FIRST)])
      .then(function (results) {
        totalClicks = Number(results[0]) || 0;
        totalFirstClickTs = results[1] || null;
        el.storageNote.textContent =
          "Loaded all-time total of " + fmtInt(totalClicks) +
          " click(s) from browser storage.";
        render();
      })
      .catch(function () {
        el.storageNote.textContent =
          "Could not read browser storage; stats are session-only.";
        render();
      });

    // Keep clicks/s figures ticking live even without new clicks.
    setInterval(render, 1000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
