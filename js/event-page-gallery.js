/**
 * Галерея для страниц с блоком #eventGallery (events/, news/, meropriyatiya и т.д.)
 * Плейсхолдер кадра галереи: images/no-image-gallery.jpg (16:9). Превью карточек — no-image.jpg.
 */
(function () {
  var root = document.getElementById("eventGallery");
  if (!root) return;

  var main = document.getElementById("galleryMainImg");
  var counter = document.getElementById("galleryCounter");
  var prev = root.querySelector(".event-gallery__nav--prev");
  var next = root.querySelector(".event-gallery__nav--next");
  var thumbNodes = [].slice.call(root.querySelectorAll(".event-gallery__thumb"));

  if (!main || !counter || !prev || !next) return;

  var slides = [];
  thumbNodes.forEach(function (btn) {
    var im = btn.querySelector("img");
    if (!im) return;
    var src = im.getAttribute("src");
    if (!src) return;
    slides.push({
      btn: btn,
      src: src,
      alt: im.getAttribute("alt") || "",
    });
  });

  if (!slides.length) return;

  var i = 0;

  function show(n) {
    i = (n + slides.length) % slides.length;
    main.src = slides[i].src;
    main.alt = slides[i].alt;
    counter.textContent = i + 1 + " / " + slides.length;
    slides.forEach(function (s, idx) {
      s.btn.classList.toggle("is-active", idx === i);
    });
    var one = slides.length <= 1;
    prev.disabled = one;
    next.disabled = one;
  }

  function prevPhoto() {
    if (slides.length <= 1) return;
    show(i - 1);
  }

  function nextPhoto() {
    if (slides.length <= 1) return;
    show(i + 1);
  }

  prev.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    prevPhoto();
  });
  next.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    nextPhoto();
  });

  slides.forEach(function (s, idx) {
    s.btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      show(idx);
    });
  });

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function allowGalleryKeys(e) {
    var t = e.target;
    if (!t || !t.closest) return false;
    if (isTypingTarget(t)) return false;
    if (t.closest("nav") || t.closest("footer") || t.closest(".topbar")) return false;
    return true;
  }

  document.addEventListener("keydown", function (e) {
    if (!allowGalleryKeys(e)) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevPhoto();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextPhoto();
    }
  });

  root.tabIndex = 0;
  show(0);
})();
