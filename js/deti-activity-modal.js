/**
 * Модальная галерея мероприятий на deti.html
 */
(function () {
  var PHOTO_SRC = "images/no-image-gallery.jpg";
  var PHOTO_COUNT = 15;
  var RELATED_COUNT = 5;

  var overlay = document.getElementById("detiEventModal");
  var cards = [].slice.call(document.querySelectorAll("a.event-card[data-gallery]"));
  if (!cards.length || !overlay) return;

  function buildPhotos() {
    var a = [];
    for (var p = 0; p < PHOTO_COUNT; p++) a.push(PHOTO_SRC);
    return a;
  }
  var photos = buildPhotos();

  var evIdx = 0;
  var phIdx = 0;

  var elDate = document.getElementById("detiModalDate");
  var elTitle = document.getElementById("detiModalTitle");
  var elText = document.getElementById("detiModalText");
  var elImg = document.getElementById("detiModalImg");
  var elCounter = document.getElementById("detiModalPhCounter");
  var elRelated = document.getElementById("detiModalRelated");
  var elThumbs = document.getElementById("detiModalThumbs");
  var btnPrev = document.getElementById("detiModalPrevPh");
  var btnNext = document.getElementById("detiModalNextPh");
  var btnClose = document.getElementById("detiModalClose");

  if (!elDate || !elTitle || !elText || !elImg || !elCounter || !elRelated || !elThumbs || !btnPrev || !btnNext || !btnClose) {
    return;
  }

  function cardMeta(card) {
    var t = card.getAttribute("data-title") || "";
    var d = card.getAttribute("data-date") || "";
    var te = card.querySelector(".event-text");
    return { title: t, date: d, text: te ? te.textContent.trim() : "" };
  }

  function relatedIndices(center, n, total) {
    var count = Math.min(n, total);
    var start = center - Math.floor(count / 2);
    var out = [];
    for (var o = 0; o < count; o++) {
      out.push((start + o + total * 50) % total);
    }
    return out;
  }

  function renderRelated() {
    var idxs = relatedIndices(evIdx, Math.min(RELATED_COUNT, cards.length), cards.length);
    elRelated.innerHTML = "";
    idxs.forEach(function (ri) {
      var c = cards[ri];
      var m = cardMeta(c);
      var im = c.querySelector(".event-image");
      var src = im ? im.getAttribute("src") : PHOTO_SRC;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "deti-related-card" + (ri === evIdx ? " is-active" : "");
      b.setAttribute("data-idx", String(ri));
      b.innerHTML =
        '<img src="' +
        src +
        '" alt="">' +
        '<div class="deti-related-date"></div>' +
        '<div class="deti-related-title"></div>';
      b.querySelector(".deti-related-date").textContent = m.date;
      var shortT = m.title.length > 72 ? m.title.slice(0, 70) + "…" : m.title;
      b.querySelector(".deti-related-title").textContent = shortT;
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        evIdx = ri;
        phIdx = 0;
        syncEvent();
      });
      elRelated.appendChild(b);
    });
  }

  function renderThumbs() {
    elThumbs.innerHTML = "";
    photos.forEach(function (src, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "deti-modal-thumb" + (idx === phIdx ? " is-active" : "");
      b.setAttribute("aria-label", "Фото " + (idx + 1) + " из " + photos.length);
      b.setAttribute("data-index", String(idx));
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      b.appendChild(img);
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        phIdx = idx;
        updatePhotoOnly();
      });
      elThumbs.appendChild(b);
    });
  }

  function updatePhotoOnly() {
    var card = cards[evIdx];
    var m = cardMeta(card);
    elImg.src = photos[phIdx];
    elImg.alt = m.date + " — " + m.title;
    elCounter.textContent = "Фото " + (phIdx + 1) + " из " + photos.length;
    var one = photos.length <= 1;
    btnPrev.disabled = one;
    btnNext.disabled = one;
    [].forEach.call(elThumbs.querySelectorAll(".deti-modal-thumb"), function (btn, idx) {
      btn.classList.toggle("is-active", idx === phIdx);
    });
  }

  function syncEvent() {
    var card = cards[evIdx];
    var m = cardMeta(card);
    elDate.textContent = m.date;
    elTitle.textContent = m.title;
    elText.textContent = m.text || m.title;
    renderThumbs();
    updatePhotoOnly();
    renderRelated();
  }

  function prevPhoto() {
    if (photos.length <= 1) return;
    phIdx = (phIdx - 1 + photos.length) % photos.length;
    updatePhotoOnly();
  }

  function nextPhoto() {
    if (photos.length <= 1) return;
    phIdx = (phIdx + 1) % photos.length;
    updatePhotoOnly();
  }

  function openModal(index) {
    evIdx = index;
    phIdx = 0;
    syncEvent();
    overlay.hidden = false;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    btnClose.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    elImg.src = "";
  }

  cards.forEach(function (card, i) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(i);
    });
  });

  btnPrev.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    prevPhoto();
  });
  btnNext.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    nextPhoto();
  });
  btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    closeModal();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevPhoto();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextPhoto();
    }
  });
})();
