/**
 * Премиум-лайтбокс галереи (10 кадров). Карточки: .mem-card, .vet-squad-card, .review-card, a.event-card
 */
(function () {
  var STUB = "images/no-image-gallery.jpg";
  var PHOTO_COUNT = 10;
  var root = null;
  var slides = [];
  var meta = { title: "", date: "", subtitle: "" };
  var currentGalleryCard = null;
  var idx = 0;
  var openState = false;
  var animating = false;
  var infoHideTimer = null;

  function makeLead(full, maxLen) {
    if (!full) return "";
    var t = String(full).trim();
    if (t.length <= maxLen) return t;
    var cut = t.substring(0, maxLen);
    var sp = cut.lastIndexOf(" ");
    if (sp > 50) cut = cut.substring(0, sp);
    return cut + "…";
  }

  function slideStub(src) {
    return { src: src, info: null };
  }

  function buildSlidesDefault() {
    var a = [];
    for (var i = 0; i < PHOTO_COUNT; i++) a.push(slideStub(STUB));
    return a;
  }

  /** data-description: JSON {"lead","full"} или обычная строка (полный текст). */
  function parseCardDescription(card) {
    if (!card || !card.getAttribute) return null;
    var raw = card.getAttribute("data-description");
    if (raw == null || String(raw).trim() === "") {
      try {
        if (card.dataset && card.dataset.description != null) {
          raw = String(card.dataset.description);
        }
      } catch (e0) {}
    }
    if (raw == null) return null;
    raw = String(raw).trim();
    if (!raw) return null;
    if (raw.charAt(0) === "{") {
      try {
        var o = JSON.parse(raw);
        if (!o || typeof o !== "object") return null;
        var full = String(o.full != null ? o.full : "").trim();
        var lead = String(o.lead != null ? o.lead : "").trim();
        if (!full && !lead) return null;
        if (!lead && full) lead = makeLead(full, 200);
        if (!full && lead) full = lead;
        return { lead: lead, full: full };
      } catch (err) {
        return { lead: makeLead(raw, 200), full: raw };
      }
    }
    var fullPlain = raw;
    return { lead: makeLead(fullPlain, 200), full: fullPlain };
  }

  /** Если атрибут не прочитался — берём видимый текст с карточки. */
  function descriptionFallbackFromCard(card) {
    if (!card || !card.querySelector) return null;
    var ex = card.querySelector(".event-text");
    if (ex) {
      var full = ex.textContent.replace(/\s+/g, " ").trim();
      if (full) return { lead: makeLead(full, 200), full: full };
    }
    var mt = card.querySelector(".mem-title, .vet-squad-title, .event-title");
    if (mt) {
      var t = mt.textContent.replace(/\s+/g, " ").trim();
      if (t) return { lead: t, full: t };
    }
    return null;
  }

  /** Один и тот же текст на каждом слайде; без картинки — src пустой (не STUB), чтобы не было «чёрного экрана». */
  function slidesWithSharedInfo(info0, srcFirst, srcSecond) {
    var out = [];
    var info = info0;
    function padWithTextOnly() {
      while (out.length < PHOTO_COUNT) {
        out.push({ src: null, info: info });
      }
    }
    if (srcFirst && String(srcFirst).trim()) {
      out.push({ src: srcFirst, info: info });
      if (srcSecond && String(srcSecond).trim()) {
        out.push({ src: srcSecond, info: info });
      }
      padWithTextOnly();
      return out;
    }
    if (info && (info.lead || info.full)) {
      for (var k = 0; k < PHOTO_COUNT; k++) {
        out.push({ src: null, info: info });
      }
      return out;
    }
    return buildSlidesDefault();
  }

  function buildSlidesForCard(card) {
    var info0 = parseCardDescription(card);

    if (card && card.classList && card.classList.contains("mem-card")) {
      var galM = card.getAttribute("data-gallery") || "";
      if (galM === "gallery-1") {
        return slidesWithSharedInfo(
          info0,
          "images/razvlekatelnyy-centr-1.png",
          "images/razvlekatelnyy-centr-2.png"
        );
      }
    }

    if (card && card.matches && card.matches("a.event-card")) {
      var gal = card.getAttribute("data-gallery") || "";
      var et = card.querySelector(".event-title");
      var title = et ? et.textContent.replace(/\s+/g, " ").trim() : "";
      var isCentr =
        gal === "gallery-1" || title === "Посещение развлекательного центра";
      if (isCentr) {
        return slidesWithSharedInfo(
          info0,
          "images/razvlekatelnyy-centr-1.png",
          "images/razvlekatelnyy-centr-2.png"
        );
      }
    }

    if (!info0 || (!info0.lead && !info0.full)) {
      var fb = descriptionFallbackFromCard(card);
      if (fb) info0 = fb;
    }
    if (info0 && (info0.lead || info0.full)) {
      return slidesWithSharedInfo(info0, null, null);
    }
    return buildSlidesDefault();
  }

  function ensureModal() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "premiumGalleryRoot";
    root.className = "event-modal premium-lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<button type="button" class="premium-lightbox-close" aria-label="Закрыть">×</button>' +
      '<button type="button" class="premium-lightbox-nav premium-lightbox-nav--prev modal-prev" aria-label="Предыдущее фото">‹</button>' +
      '<button type="button" class="premium-lightbox-nav premium-lightbox-nav--next modal-next" aria-label="Следующее фото">›</button>' +
      '<div class="premium-lightbox-inner">' +
      '<div class="premium-lightbox-stage">' +
      '<div class="premium-lightbox-img-wrap">' +
      '<img id="premiumGalleryImg" src="" alt="">' +
      "</div>" +
      "</div>" +
      '<div id="lightbox-info" class="premium-lightbox-info" style="display: none;" aria-live="polite">' +
      '<div class="lightbox-meta">' +
      '<time class="lightbox-date" id="lightboxInfoDate"></time>' +
      '<h3 class="lightbox-title" id="lightboxInfoTitle"></h3>' +
      "</div>" +
      '<p class="lightbox-lead" id="lightboxInfoLead"></p>' +
      '<button type="button" class="btn-more" id="lightboxMoreBtn" hidden>Подробнее</button>' +
      '<div class="lightbox-full" id="lightboxInfoFull" hidden></div>' +
      "</div>" +
      "</div>";
    document.body.appendChild(root);
    return root;
  }

  function q(sel) {
    return root.querySelector(sel);
  }

  function extractMeta(card) {
    if (card.classList.contains("review-card")) {
      var cap = card.querySelector(".rc-caption");
      var section = card.closest(".review-section");
      var st = section ? section.querySelector(".review-block-title") : null;
      var title = (st ? st.textContent.trim() + " — " : "") + (cap ? cap.textContent.trim() : "");
      return { date: "", title: title, subtitle: "" };
    }
    if (card.classList.contains("mem-card")) {
      var md = card.querySelector(".mem-date");
      var mt = card.querySelector(".mem-title");
      return {
        date: md ? md.textContent.trim() : "",
        title: mt ? mt.textContent.trim() : "",
        subtitle: "",
      };
    }
    if (card.classList.contains("vet-squad-card")) {
      var vd = card.querySelector(".vet-squad-date");
      var vt = card.querySelector(".vet-squad-title");
      return {
        date: vd ? vd.textContent.trim() : "",
        title: vt ? vt.textContent.trim() : "",
        subtitle: "",
      };
    }
    if (card.matches("a.event-card")) {
      var et = card.querySelector(".event-title");
      var ed = card.querySelector(".event-date");
      var ex = card.querySelector(".event-text");
      return {
        date: ed ? ed.textContent.trim() : card.getAttribute("data-date") || "",
        title: et ? et.textContent.trim() : card.getAttribute("data-title") || "",
        subtitle: ex ? ex.textContent.trim() : "",
      };
    }
    return { date: "", title: "", subtitle: "" };
  }

  function isDetiPage() {
    var p = (location.pathname || "").replace(/\\/g, "/").toLowerCase();
    return /(^|\/)deti\.html$/.test(p);
  }

  function eventCardOpensGallery(card) {
    if (!card.matches("a.event-card") || !card.closest(".activities-container .events-grid")) return false;
    if (isDetiPage()) {
      if (card.hasAttribute("data-gallery")) return true;
      var h = (card.getAttribute("href") || "").trim();
      return h === "#";
    }
    return true;
  }

  function isGalleryCard(card) {
    if (!card) return false;
    if (card.closest("#premiumGalleryRoot")) return false;
    if (document.getElementById("regionModal") && card.closest("#regionModal")) return false;
    if (card.closest("nav") || card.closest("footer") || card.closest(".fbot")) return false;
    if (card.classList.contains("mem-card")) return true;
    if (card.classList.contains("vet-squad-card")) return true;
    if (card.classList.contains("review-card") && card.closest(".review-grid")) return true;
    if (card.matches("a.event-card")) return eventCardOpensGallery(card);
    return false;
  }

  function fillInfoPanel(infoEl, block) {
    if (!root) return;
    var dateEl = root.querySelector("#lightboxInfoDate");
    var titleEl = root.querySelector("#lightboxInfoTitle");
    var leadEl = root.querySelector("#lightboxInfoLead");
    var fullEl = root.querySelector("#lightboxInfoFull");
    var moreBtn = root.querySelector("#lightboxMoreBtn");
    if (!dateEl || !titleEl || !leadEl || !fullEl || !moreBtn) return;
    dateEl.textContent = meta.date || "";
    titleEl.textContent = meta.title || "";
    var lead = (block && block.lead) || "";
    var full = (block && block.full) || "";
    leadEl.textContent = lead;
    fullEl.textContent = full;
    fullEl.hidden = true;
    fullEl.classList.remove("is-expanded");
    var descAttr =
      currentGalleryCard &&
      currentGalleryCard.getAttribute &&
      String(currentGalleryCard.getAttribute("data-description") || "").trim();
    var hasBlockText =
      !!(
        (lead && String(lead).trim()) ||
        (full && String(full).trim())
      );
    var showMore = !!(descAttr || hasBlockText);
    moreBtn.hidden = !showMore;
    moreBtn.textContent = "Подробнее";
    moreBtn.setAttribute("aria-expanded", "false");
  }

  /** Текст и кнопка «Подробнее» на всех слайдах с описанием (в т.ч. без фото). */
  function updateLightboxInfo(i) {
    ensureModal();
    var infoEl = root.querySelector("#lightbox-info");
    if (!infoEl) return;
    clearTimeout(infoHideTimer);

    var block = slides[i] && slides[i].info;
    var hasText =
      block &&
      ((block.lead && block.lead.trim()) ||
        (block.full && block.full.trim()));

    if (!hasText) {
      infoEl.classList.remove("is-visible");
      infoEl.style.display = "none";
      return;
    }

    fillInfoPanel(infoEl, block);
    infoEl.style.display = "flex";
    infoEl.classList.remove("is-visible");
    void infoEl.offsetHeight;
    requestAnimationFrame(function () {
      infoEl.classList.add("is-visible");
    });
  }

  function wireMoreButtonOnce() {
    if (!root) return;
    var moreBtn = root.querySelector("#lightboxMoreBtn");
    var fullEl = root.querySelector("#lightboxInfoFull");
    if (!moreBtn || !fullEl || moreBtn.dataset.wired === "1") return;
    moreBtn.dataset.wired = "1";
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var expanded = !fullEl.classList.contains("is-expanded");
      if (expanded) {
        fullEl.hidden = false;
        fullEl.classList.add("is-expanded");
      } else {
        fullEl.classList.remove("is-expanded");
        fullEl.hidden = true;
      }
      moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      moreBtn.textContent = expanded ? "Свернуть" : "Подробнее";
    });
  }

  function applyMainSrc(i, withAnim) {
    var img = q("#premiumGalleryImg");
    var wrap = root && root.querySelector(".premium-lightbox-img-wrap");
    var raw = slides[i] && slides[i].src;
    var hasImg = !!(raw && String(raw).trim());
    var src = hasImg ? String(raw).trim() : "";
    if (hasImg && img.hidden) withAnim = false;

    function applyNoImage() {
      img.removeAttribute("src");
      img.alt = "";
      img.hidden = true;
      img.classList.remove("fade-out", "fade-in");
      if (wrap) wrap.classList.add("is-empty");
    }

    function applyWithSrc() {
      img.hidden = false;
      if (wrap) wrap.classList.remove("is-empty");
    }

    if (!hasImg) {
      if (withAnim && animating) return;
      if (!withAnim) {
        applyNoImage();
        return;
      }
      if (animating) return;
      animating = true;
      var safety0 = setTimeout(function () {
        img.removeEventListener("transitionend", onEndHide);
        img.classList.remove("fade-out", "fade-in");
        applyNoImage();
        animating = false;
      }, 400);
      img.classList.add("fade-out");
      function onEndHide(ev) {
        if (ev.propertyName !== "opacity") return;
        clearTimeout(safety0);
        img.removeEventListener("transitionend", onEndHide);
        applyNoImage();
        img.classList.remove("fade-out");
        animating = false;
      }
      img.addEventListener("transitionend", onEndHide);
      return;
    }

    if (!withAnim) {
      img.classList.remove("fade-out", "fade-in");
      applyWithSrc();
      img.src = src;
      img.alt = (meta.title || "Фото") + " — " + (i + 1);
      return;
    }
    if (animating) return;
    animating = true;
    var safety = setTimeout(function () {
      img.removeEventListener("transitionend", onEnd);
      img.classList.remove("fade-out", "fade-in");
      animating = false;
    }, 400);
    img.classList.add("fade-out");
    function onEnd(ev) {
      if (ev.propertyName !== "opacity") return;
      clearTimeout(safety);
      img.removeEventListener("transitionend", onEnd);
      applyWithSrc();
      img.src = src;
      img.alt = (meta.title || "Фото") + " — " + (i + 1);
      img.classList.remove("fade-out");
      void img.offsetWidth;
      img.classList.add("fade-in");
      var safetyIn = setTimeout(function () {
        img.removeEventListener("transitionend", onIn);
        img.classList.remove("fade-in");
        animating = false;
      }, 400);
      function onIn(e2) {
        if (e2.propertyName !== "opacity") return;
        clearTimeout(safetyIn);
        img.removeEventListener("transitionend", onIn);
        img.classList.remove("fade-in");
        animating = false;
      }
      img.addEventListener("transitionend", onIn);
    }
    img.addEventListener("transitionend", onEnd);
  }

  function goTo(i, animated) {
    if (i < 0 || i >= slides.length) return;
    idx = i;
    updateLightboxInfo(i);
    applyMainSrc(i, animated);
  }

  function step(d) {
    goTo((idx + d + slides.length) % slides.length, true);
  }

  function openGallery(m, card) {
    ensureModal();
    wireMoreButtonOnce();
    root.classList.remove("is-closing");
    currentGalleryCard = card || null;
    meta = m;
    slides = buildSlidesForCard(card);
    idx = 0;
    goTo(0, false);

    document.body.classList.add("modal-open");
    openState = true;
    root.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("is-open");
        q(".modal-prev").focus();
      });
    });
  }

  function closeGallery() {
    if (!root || !openState) return;
    clearTimeout(infoHideTimer);
    currentGalleryCard = null;
    openState = false;
    root.classList.add("is-closing");
    root.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    var infoEl = root.querySelector("#lightbox-info");
    if (infoEl) {
      infoEl.classList.remove("is-visible");
      infoEl.style.display = "none";
    }
    if (root) {
      var wrap = root.querySelector(".premium-lightbox-img-wrap");
      if (wrap) wrap.classList.remove("is-empty");
    }
    var fullEl = root.querySelector("#lightboxInfoFull");
    var moreBtn = root.querySelector("#lightboxMoreBtn");
    if (fullEl) {
      fullEl.hidden = true;
      fullEl.classList.remove("is-expanded");
    }
    if (moreBtn) {
      moreBtn.textContent = "Подробнее";
      moreBtn.setAttribute("aria-expanded", "false");
    }
    setTimeout(function () {
      root.classList.remove("is-closing");
      root.setAttribute("aria-hidden", "true");
      var img = q("#premiumGalleryImg");
      if (img) {
        img.removeAttribute("src");
        img.removeAttribute("hidden");
        img.classList.remove("fade-out", "fade-in");
      }
    }, 300);
  }

  function init() {
    ensureModal();
    wireMoreButtonOnce();

    document.addEventListener(
      "click",
      function (e) {
        ensureModal();
        if (openState || root.classList.contains("is-closing")) return;
        var card = e.target.closest(".mem-card, .vet-squad-card, .review-card, a.event-card");
        if (!card || !isGalleryCard(card)) return;
        if (
          card.matches("a.event-card") ||
          (card.classList.contains("mem-card") && card.hasAttribute("data-description"))
        ) {
          e.preventDefault();
        }
        e.stopPropagation();
        openGallery(extractMeta(card), card);
      },
      true
    );

    document.addEventListener("keydown", function (e) {
      ensureModal();
      if (openState) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeGallery();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          step(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          step(1);
        }
        return;
      }
      if (root.classList.contains("is-closing")) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".mem-card, .vet-squad-card, .review-card, a.event-card");
      if (!card || !isGalleryCard(card)) return;
      e.preventDefault();
      openGallery(extractMeta(card), card);
    });

    root.addEventListener("click", function (e) {
      if (e.target === root) closeGallery();
    });

    q(".premium-lightbox-close").addEventListener("click", function (e) {
      e.stopPropagation();
      closeGallery();
    });

    q(".premium-lightbox-inner").addEventListener("click", function (e) {
      e.stopPropagation();
    });

    q(".modal-prev").addEventListener("click", function (e) {
      e.stopPropagation();
      step(-1);
    });
    q(".modal-next").addEventListener("click", function (e) {
      e.stopPropagation();
      step(1);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
