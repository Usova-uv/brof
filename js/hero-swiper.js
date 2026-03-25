/**
 * Главный экран: Swiper 11 (fade, автопрокрутка 6 с, стрелки и точки).
 * Фото: см. index.html — обычный src (lazy Swiper отключён, чтобы первый слайд всегда отображался).
 * WordPress: разметку слайдов и img лучше вывести из шаблона (цикл по полям/вложениям), этот файл подключать как есть.
 */
(function () {
  function initHeroSwiper() {
    if (typeof Swiper === 'undefined') return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var heroInner = document.querySelector('.hero-slider__inner');

    function fadeHeroText() {
      if (!heroInner || reduceMotion) return;
      heroInner.classList.remove('hero-slider__inner--fade');
      void heroInner.offsetWidth;
      heroInner.classList.add('hero-slider__inner--fade');
    }

    new Swiper('.hero-swiper', {
      loop: true,
      speed: 800,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      autoplay: reduceMotion
        ? false
        : {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
      preloadImages: true,
      watchSlidesProgress: true,
      pagination: {
        el: '.hero-swiper-pagination',
        clickable: true,
      },
      navigation: {
        prevEl: '.hero-swiper-prev',
        nextEl: '.hero-swiper-next',
      },
      a11y: {
        enabled: true,
      },
      on: {
        init: function () {
          fadeHeroText();
        },
        slideChangeTransitionEnd: function () {
          fadeHeroText();
        },
      },
    });
  }

  initHeroSwiper();
})();
