(function () {
  "use strict";
  var data = JSON.parse(document.getElementById("story-data").textContent);
  var cards = Array.from(document.querySelectorAll(".hs-song-card"));
  var draft = document.getElementById("hs-draft");
  var feedback = document.getElementById("hs-copy-feedback");
  var storageStatus = document.getElementById("hs-draft-storage");
  var count = document.getElementById("hs-draft-count");
  var current = data.songs[0];
  var memory = {};
  var storageAvailable = true;
  var messages = {
    saved: ["Bu tarayıcıda kaydedildi.", "Saved in this browser."],
    private: ["Depolama kullanılamıyor. Sayfadan ayrılmadan taslağını indir veya kopyala.", "Storage is unavailable. Download or copy your draft before leaving."],
    empty: ["Önce bir hikâye taslağı yaz.", "Write a story draft first."],
    copied: ["Taslağın panoya kopyalandı.", "Your draft was copied."],
    copyFailed: ["Panoya erişilemedi. Metni seçip Ctrl+C ile kopyalayabilirsin.", "Clipboard access failed. Select the text and use Ctrl+C to copy it."],
    downloaded: ["Taslak dosyan hazırlandı.", "Your draft file is ready."],
    cleared: ["Bu şarkının taslağı temizlendi.", "This song's draft was cleared."]
  };
  var lastMessage = "";
  function en() { return document.documentElement.lang === "en"; }
  function text(key) { return messages[key][en() ? 1 : 0]; }
  function key() { return "rezonanslar.story.v1:" + location.pathname + ":" + current.id; }
  function announce(message) { lastMessage = message; feedback.textContent = text(message); }
  function updateStatus() {
    storageStatus.textContent = text(storageAvailable ? "saved" : "private");
    count.textContent = draft.value.length + " / 3000";
  }
  function save() {
    memory[key()] = draft.value;
    try {
      if (draft.value) localStorage.setItem(key(), draft.value);
      else localStorage.removeItem(key());
      storageAvailable = true;
    } catch (_) { storageAvailable = false; }
    updateStatus();
  }
  function load() {
    var value = memory[key()] || "";
    try { value = localStorage.getItem(key()) || value; storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    draft.value = value.slice(0, 3000);
    updateStatus();
  }
  function render() {
    cards.forEach(function (button) {
      var selected = button.dataset.song === current.id;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.getElementById("hs-selected-song").textContent = current.title;
    document.getElementById("hs-selected-question").textContent = current[en() ? "en" : "tr"];
    draft.placeholder = en() ? "This song reminds me of ... because ..." : "Bu şarkı bana ... hatırlatıyor; çünkü ...";
    if (lastMessage) feedback.textContent = text(lastMessage);
    updateStatus();
  }
  cards.forEach(function (button) {
    button.addEventListener("click", function () {
      var next = data.songs.find(function (song) { return song.id === button.dataset.song; });
      if (!next) return;
      save(); current = next; lastMessage = ""; feedback.textContent = ""; load(); render();
    });
  });
  draft.addEventListener("input", function () { lastMessage = ""; feedback.textContent = ""; save(); });
  document.getElementById("hs-clear").addEventListener("click", function () {
    draft.value = ""; save(); announce("cleared"); draft.focus();
  });
  function nonempty() {
    if (draft.value.trim()) return true;
    announce("empty"); draft.focus(); return false;
  }
  document.getElementById("hs-copy").addEventListener("click", async function () {
    if (!nonempty()) return;
    try { await navigator.clipboard.writeText(draft.value); announce("copied"); }
    catch (_) { draft.focus(); draft.select(); announce("copyFailed"); }
  });
  document.getElementById("hs-download").addEventListener("click", function () {
    if (!nonempty()) return;
    var content = data.artist + " — " + current.title + "\n\n" + draft.value + "\n";
    var url = URL.createObjectURL(new Blob(["\uFEFF" + content], {type: "text/plain;charset=utf-8"}));
    var link = document.createElement("a");
    link.href = url; link.download = "REZONANSLAR_" + current.id + "_hikayem.txt";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("downloaded");
  });
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
  load(); render();
})();
