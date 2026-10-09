/* Photo Swipe app logic. Static only, no network calls except manifest.json
   and the ./photos/ images. Decision codes: 0 = keep, 1 = archive, 2 = ig pick. */

(function () {
  "use strict";

  var DECIDE = { keep: 0, archive: 1, igpick: 2 };
  var THRESHOLD_X = 90;   // px needed left/right
  var THRESHOLD_UP = -90; // px needed upward

  var gate = document.getElementById("gate");
  var gateForm = document.getElementById("gate-form");
  var gateInput = document.getElementById("gate-input");
  var gateError = document.getElementById("gate-error");
  var app = document.getElementById("app");
  var end = document.getElementById("end");
  var stage = document.getElementById("stage");
  var counter = document.getElementById("counter");
  var batchLabel = document.getElementById("batch-label");
  var progressFill = document.getElementById("progress-fill");

  var manifest = null;
  var photos = [];
  var index = 0;                 // next undecided photo
  var decisions = [];            // parallel to photos: 0/1/2 or null
  var history = [];              // stack of {index, decision} for undo
  var topCard = null;
  var drag = null;
  var busy = false;              // true while a card is flying out

  /* ---------- Password gate ---------- */

  function configuredPassword() {
    if (window.SWIPE_CONFIG && typeof window.SWIPE_CONFIG.password === "string") {
      return window.SWIPE_CONFIG.password;
    }
    return "changeme";
  }

  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (gateInput.value === configuredPassword()) {
      gate.hidden = true;
      app.hidden = false;
      start();
    } else {
      gateError.hidden = false;
      var card = gate.querySelector(".gate-card");
      card.classList.remove("shake");
      void card.offsetWidth; /* restart animation */
      card.classList.add("shake");
      gateInput.value = "";
      gateInput.focus();
    }
  });

  /* ---------- Boot ---------- */

  function start() {
    var cfg = window.SWIPE_CONFIG || {};
    batchLabel.textContent = cfg.batchId ? "Batch " + cfg.batchId : "";
    fetch("manifest.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        manifest = data;
        photos = Array.isArray(data.photos) ? data.photos : [];
        decisions = photos.map(function () { return null; });
        if (photos.length === 0) {
          stage.innerHTML = '<p class="hint">This batch has no photos.</p>';
          updateProgress();
          return;
        }
        preload(0);
        render();
      })
      .catch(function () {
        stage.innerHTML =
          '<p class="hint">Could not load manifest.json. Serve this folder over ' +
          'HTTP (for example: python3 -m http.server) instead of opening the file directly.</p>';
      });
  }

  function preload(i) {
    for (var k = i; k < Math.min(i + 3, photos.length); k++) {
      var im = new Image();
      im.src = "photos/" + photos[k];
    }
  }

  /* ---------- Rendering ---------- */

  function clearStage() {
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  function makeCard(photoIdx, under) {
    var card = document.createElement("div");
    card.className = "card" + (under ? " under" : "");
    card.dataset.photoIndex = String(photoIdx);

    var img = document.createElement("img");
    img.src = "photos/" + photos[photoIdx];
    img.alt = "Photo " + (photoIdx + 1) + " of " + photos.length;
    img.draggable = false;
    card.appendChild(img);

    var stamps = [
      ["stamp-archive", "Archive"],
      ["stamp-keep", "Keep"],
      ["stamp-igpick", "IG Pick"]
    ];
    stamps.forEach(function (s) {
      var el = document.createElement("div");
      el.className = "stamp " + s[0];
      el.textContent = s[1];
      card.appendChild(el);
    });

    return card;
  }

  function render() {
    clearStage();
    topCard = null;
    updateProgress();
    if (index >= photos.length) {
      busy = false;
      finish();
      return;
    }
    // next card peeking behind
    if (index + 1 < photos.length) {
      stage.appendChild(makeCard(index + 1, true));
    }
    topCard = makeCard(index, false);
    stage.appendChild(topCard);
    attachGestures(topCard);
    document.getElementById("btn-undo").disabled = history.length === 0;
    busy = false;
  }

  function updateProgress() {
    var done = Math.min(index, photos.length);
    counter.textContent = done + " / " + photos.length;
    var pct = photos.length ? (done / photos.length) * 100 : 0;
    progressFill.style.width = pct + "%";
  }

  /* ---------- Gestures ---------- */

  function attachGestures(card) {
    card.addEventListener("pointerdown", onDown);
  }

  function onDown(e) {
    if (!topCard || drag || busy) return;
    drag = {
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      pointerId: e.pointerId
    };
    topCard.setPointerCapture(e.pointerId);
    topCard.addEventListener("pointermove", onMove);
    topCard.addEventListener("pointerup", onUp, { once: true });
    topCard.addEventListener("pointercancel", onCancel, { once: true });
    e.preventDefault();
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.dx = e.clientX - drag.startX;
    drag.dy = e.clientY - drag.startY;
    var rot = Math.max(-14, Math.min(14, drag.dx * 0.06));
    topCard.style.transform =
      "translate(" + drag.dx + "px," + drag.dy + "px) rotate(" + rot + "deg)";
    updateStamps();
  }

  function updateStamps() {
    var dir = dominantDirection();
    var sA = topCard.querySelector(".stamp-archive");
    var sK = topCard.querySelector(".stamp-keep");
    var sI = topCard.querySelector(".stamp-igpick");
    sA.style.opacity = dir === "archive" ? "1" : "0";
    sK.style.opacity = dir === "keep" ? "1" : "0";
    sI.style.opacity = dir === "igpick" ? "1" : "0";
  }

  function dominantDirection() {
    var dx = drag.dx, dy = drag.dy;
    if (dx <= -THRESHOLD_X && Math.abs(dx) >= Math.abs(dy)) return "archive";
    if (dx >= THRESHOLD_X && Math.abs(dx) >= Math.abs(dy)) return "keep";
    if (dy <= THRESHOLD_UP && Math.abs(dy) >= Math.abs(dx)) return "igpick";
    return null;
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    var dir = dominantDirection();
    cleanupDrag();
    if (dir) {
      flyOut(dir);
    } else {
      snapBack();
    }
  }

  function onCancel() {
    cleanupDrag();
    snapBack();
  }

  function cleanupDrag() {
    if (topCard) {
      topCard.removeEventListener("pointermove", onMove);
    }
    drag = null;
  }

  function snapBack() {
    if (!topCard) return;
    topCard.style.transition = "transform 0.22s ease";
    topCard.style.transform = "";
    topCard.querySelectorAll(".stamp").forEach(function (s) { s.style.opacity = "0"; });
    setTimeout(function () {
      if (topCard) topCard.style.transition = "";
    }, 240);
  }

  function flyOut(dir) {
    var card = topCard;
    busy = true;
    var w = stage.clientWidth, h = stage.clientHeight;
    var target = { archive: [-w * 1.4, 40, -18], keep: [w * 1.4, 40, 18], igpick: [0, -h * 1.4, 0] }[dir];
    card.style.transition = "transform 0.28s ease-in";
    card.style.transform =
      "translate(" + target[0] + "px," + target[1] + "px) rotate(" + target[2] + "deg)";
    setTimeout(function () { recordDecision(dir); }, 290);
  }

  /* Buttons animate the card the same way a swipe would */
  function decideViaButton(dir) {
    if (!topCard || drag || busy) return;
    var s = topCard.querySelector(
      dir === "archive" ? ".stamp-archive" : dir === "keep" ? ".stamp-keep" : ".stamp-igpick"
    );
    if (s) s.style.opacity = "1";
    flyOut(dir);
  }

  /* ---------- Decisions ---------- */

  function recordDecision(dir) {
    decisions[index] = DECIDE[dir];
    history.push({ index: index, decision: DECIDE[dir] });
    index += 1;
    preload(index);
    render();
  }

  function undo() {
    if (history.length === 0 || busy) return;
    var last = history.pop();
    decisions[last.index] = null;
    index = last.index;
    // hide end screen if we had finished
    end.hidden = true;
    app.hidden = false;
    render();
  }

  /* ---------- Finish + results code ---------- */

  function packBits(vals) {
    var bytes = [];
    var cur = 0, bits = 0;
    for (var i = 0; i < vals.length; i++) {
      cur = (cur << 2) | (vals[i] & 3);
      bits += 2;
      if (bits === 8) { bytes.push(cur); cur = 0; bits = 0; }
    }
    if (bits > 0) { cur <<= (8 - bits); bytes.push(cur); }
    return bytes;
  }

  function base64url(bytes) {
    var bin = "";
    var CHUNK = 8192;
    for (var i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.slice(i, i + CHUNK));
    }
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function resultsCode() {
    var batchId = (manifest && manifest.batch_id) ||
      ((window.SWIPE_CONFIG || {}).batchId) || "unknown";
    // sanitize batch id: no colons allowed
    batchId = String(batchId).replace(/:/g, "-");
    return "SWIPE:" + batchId + ":" + base64url(packBits(decisions));
  }

  function finish() {
    app.hidden = true;
    end.hidden = false;
    var keep = 0, archive = 0, igpick = 0;
    decisions.forEach(function (d) {
      if (d === 0) keep++;
      else if (d === 1) archive++;
      else if (d === 2) igpick++;
    });
    document.getElementById("count-keep").textContent = keep;
    document.getElementById("count-archive").textContent = archive;
    document.getElementById("count-igpick").textContent = igpick;
    document.getElementById("summary").textContent =
      "You reviewed " + photos.length + " photos: " + keep + " kept, " +
      archive + " archived, " + igpick + " picked for Instagram.";
    document.getElementById("results-code").textContent = resultsCode();
  }

  /* ---------- Controls ---------- */

  document.getElementById("btn-archive").addEventListener("click", function () { decideViaButton("archive"); });
  document.getElementById("btn-keep").addEventListener("click", function () { decideViaButton("keep"); });
  document.getElementById("btn-igpick").addEventListener("click", function () { decideViaButton("igpick"); });
  document.getElementById("btn-undo").addEventListener("click", undo);

  document.addEventListener("keydown", function (e) {
    if (!gate.hidden || !end.hidden) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); decideViaButton("archive"); }
    else if (e.key === "ArrowRight") { e.preventDefault(); decideViaButton("keep"); }
    else if (e.key === "ArrowUp") { e.preventDefault(); decideViaButton("igpick"); }
    else if (e.key === "z" || e.key === "Z") { undo(); }
  });

  document.getElementById("btn-copy").addEventListener("click", function () {
    var code = document.getElementById("results-code").textContent;
    var status = document.getElementById("copy-status");
    function done() { status.textContent = "Copied. Send it back to apply your decisions."; }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (err) { status.textContent = "Copy failed. Long-press the code to copy it manually."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, fallback);
    } else {
      fallback();
    }
  });

  /* Expose for testing */
  window.SWIPE_APP = { packBits: packBits, base64url: base64url, DECIDE: DECIDE };
})();
