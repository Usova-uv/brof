/**
 * Prev/next navigation within «Деятельность фонда» subsection lists.
 * Order matches grid order on each listing page.
 */
(function () {
  'use strict';

  var SERIES = [
    {
      listHref: 'deti.html',
      label: 'Поддержка детей',
      slugs: [
        'prazdnik-dlya-detey',
        'novogodnyaya-yolka-fonda',
        'den-zashchity-detey',
        'sbor-shkolnyh-prinadlezhnostey',
        'zimnyaya-skazka',
        'den-zashchity-detey-20230601',
        'novogodniy-utrennik',
        'den-zashchity-detey-20220601',
        'novogodnie-podarki',
        'den-zashchity-detey-20210601',
        'novogodnee-chudo',
        'den-zashchity-detey-20200601',
        'novogodniy-ogonyok',
        'den-zashchity-detey-20190601',
        'novogodniy-vecher'
      ]
    },
    {
      listHref: 'vdovy.html',
      label: 'Вдовы и матери',
      slugs: [
        'mezhdunarodnyy-zhenskiy-den',
        'den-materi',
        'vesna-v-podarok',
        'den-materi-20241124',
        'zhenskiy-den',
        'den-materi-20231126',
        's-prazdnikom-vesny',
        'den-materi-20221127',
        '8-marta',
        'den-materi-20211128',
        'zhenskiy-den-20210308',
        'den-materi-20201129',
        '8-marta-20200308',
        'den-materi-20191124',
        'zhenskiy-den-20190308'
      ]
    },
    {
      listHref: 'veterany-vov.html',
      label: 'Ветераны ВОВ',
      slugs: [
        'den-pobedy',
        '80-let-pobedy',
        'den-pobedy-20240509',
        'prazdnik-pobedy',
        '9-maya',
        'den-pobedy-20210509',
        '75-let-pobedy',
        'den-pobedy-20190509',
        'prazdnik-pobedy-20180509'
      ]
    },
    {
      listHref: 'veterany-boevyh.html',
      label: 'Ветераны боевых действий',
      slugs: [
        'den-vyvoda-voysk-iz-afganistana',
        'pamyat-voinov-internatsionalistov',
        '35-let-vyvoda-voysk-iz-afganistana',
        'den-pamyati',
        'afganistan-v-nashih-serdtsah',
        'den-vyvoda-voysk',
        'afganistan-nasha-pamyat',
        '30-let-vyvoda-voysk',
        'den-pamyati-voinov'
      ]
    },
    {
      listHref: 'sportivnye-sobytiya.html',
      label: 'Спортивные события',
      slugs: [
        'turnir-po-sambo-pamyati-geroev',
        'otkrytyy-kubok-fonda',
        'turnir-po-sambo',
        'vesenniy-kubok',
        'turnir-po-sambo-20241020',
        'kubok-fonda',
        'turnir-po-sambo-20231020',
        'vesenniy-turnir',
        'turnir-po-sambo-20221020',
        'kubok-pamyati',
        'turnir-po-sambo-20211020',
        'pervenstvo-fonda',
        'onlayn-turnir',
        'turnir-po-sambo-20200515',
        'turnir-po-sambo-20191020',
        'vesenniy-kubok-20190515',
        'turnir-po-sambo-20181020',
        'den-sporta'
      ]
    },
    {
      listHref: 'omon.html',
      label: 'Сотрудники ОМОН',
      slugs: [
        'den-sotrudnika-omon',
        'professionalnyy-prazdnik',
        'den-omon',
        'prazdnik-otryada',
        'den-sotrudnika-omon-20221110',
        'professionalnyy-prazdnik-20211110',
        'den-omon-20201110',
        'yubiley-otryada',
        'den-sotrudnika-omon-20181110'
      ]
    }
  ];

  function currentSlug() {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var lower = path.toLowerCase();
    if (lower.indexOf('/events/') === -1) return null;
    var m = path.match(/\/([^/]+)\.html$/i);
    return m ? m[1].toLowerCase() : null;
  }

  function findSeries(slug) {
    for (var s = 0; s < SERIES.length; s++) {
      var idx = SERIES[s].slugs.indexOf(slug);
      if (idx !== -1) return { series: SERIES[s], index: idx };
    }
    return null;
  }

  function run() {
    var slug = currentSlug();
    if (!slug) return;

    var found = findSeries(slug);
    if (!found) return;

    var article = document.querySelector('body.event-detail-page article.event-detail');
    if (!article || !article.parentNode) return;

    var series = found.series;
    var i = found.index;
    var slugs = series.slugs;
    var prevSlug = i > 0 ? slugs[i - 1] : null;
    var nextSlug = i < slugs.length - 1 ? slugs[i + 1] : null;

    var nav = document.createElement('nav');
    nav.className = 'event-series-nav';
    nav.setAttribute('aria-label', 'Переход к другим событиям раздела');

    var row = document.createElement('div');
    row.className = 'event-series-nav__row';

    var prevCell = document.createElement('div');
    prevCell.className = 'event-series-nav__cell event-series-nav__cell--prev';
    if (prevSlug) {
      var aPrev = document.createElement('a');
      aPrev.className = 'event-series-nav__link';
      aPrev.href = prevSlug + '.html';
      aPrev.innerHTML =
        '<span class="event-series-nav__dir">← Предыдущее</span>' +
        '<span class="event-series-nav__hint">в этом разделе</span>';
      prevCell.appendChild(aPrev);
    } else {
      var spanPrev = document.createElement('span');
      spanPrev.className = 'event-series-nav__stub';
      spanPrev.textContent = 'Начало списка';
      prevCell.appendChild(spanPrev);
    }

    var mid = document.createElement('div');
    mid.className = 'event-series-nav__cell event-series-nav__cell--mid';
    var aList = document.createElement('a');
    aList.className = 'event-series-nav__list';
    aList.href = '../' + series.listHref;
    aList.textContent = 'К списку: «' + series.label + '»';
    mid.appendChild(aList);
    var counter = document.createElement('span');
    counter.className = 'event-series-nav__counter';
    counter.textContent = i + 1 + ' из ' + slugs.length;
    mid.appendChild(counter);

    var nextCell = document.createElement('div');
    nextCell.className = 'event-series-nav__cell event-series-nav__cell--next';
    if (nextSlug) {
      var aNext = document.createElement('a');
      aNext.className = 'event-series-nav__link event-series-nav__link--next';
      aNext.href = nextSlug + '.html';
      aNext.innerHTML =
        '<span class="event-series-nav__dir">Следующее →</span>' +
        '<span class="event-series-nav__hint">в этом разделе</span>';
      nextCell.appendChild(aNext);
    } else {
      var spanNext = document.createElement('span');
      spanNext.className = 'event-series-nav__stub';
      spanNext.textContent = 'Конец списка';
      nextCell.appendChild(spanNext);
    }

    row.appendChild(prevCell);
    row.appendChild(mid);
    row.appendChild(nextCell);
    nav.appendChild(row);

    article.parentNode.insertBefore(nav, article.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
