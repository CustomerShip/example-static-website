/* db.js — tiny Promise-based IndexedDB key/value store.
   Exposes a global `KVStore` with get/set/getAll helpers.

   Database: "exampleSiteDB"
   Object store: "kv" (keyPath: "key")

   Falls back to localStorage automatically if IndexedDB is unavailable
   (e.g. some private-browsing modes), so pages keep working. */
(function (global) {
  "use strict";

  var DB_NAME = "exampleSiteDB";
  var DB_VERSION = 1;
  var STORE = "kv";

  var dbPromise = null;
  var useFallback = typeof indexedDB === "undefined";

  function openDB() {
    if (useFallback) return Promise.reject(new Error("no-indexeddb"));
    if (dbPromise) return dbPromise;

    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
    return dbPromise;
  }

  /* ---------- localStorage fallback ---------- */
  var LS_PREFIX = "exampleSiteDB::";

  function lsGet(key) {
    try {
      var raw = localStorage.getItem(LS_PREFIX + key);
      return Promise.resolve(raw === null ? undefined : JSON.parse(raw));
    } catch (e) {
      return Promise.resolve(undefined);
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      /* storage full / blocked — ignore */
    }
    return Promise.resolve(value);
  }

  /* ---------- Public API ---------- */
  function get(key) {
    if (useFallback) return lsGet(key);
    return openDB()
      .then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, "readonly");
          var req = tx.objectStore(STORE).get(key);
          req.onsuccess = function () {
            resolve(req.result ? req.result.value : undefined);
          };
          req.onerror = function () {
            reject(req.error);
          };
        });
      })
      .catch(function () {
        // If IndexedDB fails at runtime, degrade to localStorage.
        useFallback = true;
        return lsGet(key);
      });
  }

  function set(key, value) {
    if (useFallback) return lsSet(key, value);
    return openDB()
      .then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, "readwrite");
          tx.objectStore(STORE).put({ key: key, value: value });
          tx.oncomplete = function () {
            resolve(value);
          };
          tx.onerror = function () {
            reject(tx.error);
          };
        });
      })
      .catch(function () {
        useFallback = true;
        return lsSet(key, value);
      });
  }

  global.KVStore = { get: get, set: set };
})(window);
