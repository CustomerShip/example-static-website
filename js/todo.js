/* todo.js — persistent to-do list.
   Stored key: todo.items -> [{ id, text, done }] */
(function () {
  "use strict";

  var KEY_ITEMS = "todo.items";

  var form = document.getElementById("todoForm");
  var input = document.getElementById("todoInput");
  var list = document.getElementById("todoList");
  var emptyNote = document.getElementById("emptyNote");

  var items = [];

  function save() {
    KVStore.set(KEY_ITEMS, items);
  }

  function render() {
    list.innerHTML = "";
    emptyNote.style.display = items.length ? "none" : "";

    items.forEach(function (item) {
      var li = document.createElement("li");
      if (item.done) li.className = "done";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.done;
      checkbox.setAttribute("aria-label", "Mark complete");
      checkbox.addEventListener("change", function () {
        item.done = checkbox.checked;
        save();
        render();
      });

      var text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = item.text;

      var del = document.createElement("button");
      del.type = "button";
      del.textContent = "\u2715"; // ✕
      del.setAttribute("aria-label", "Delete task");
      del.addEventListener("click", function () {
        items = items.filter(function (i) {
          return i.id !== item.id;
        });
        save();
        render();
      });

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function addItem(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: trimmed,
      done: false,
    });
    save();
    render();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addItem(input.value);
    input.value = "";
    input.focus();
  });

  KVStore.get(KEY_ITEMS).then(function (stored) {
    items = Array.isArray(stored) ? stored : [];
    render();
  });
})();
