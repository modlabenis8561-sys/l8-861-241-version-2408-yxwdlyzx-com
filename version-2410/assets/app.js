(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!panel || !grid) return;
    var input = panel.querySelector('.js-filter-input');
    var region = panel.querySelector('.js-filter-region');
    var type = panel.querySelector('.js-filter-type');
    var year = panel.querySelector('.js-filter-year');
    var category = panel.querySelector('.js-filter-category');
    var sort = panel.querySelector('.js-filter-sort');
    var empty = document.querySelector('[data-empty-state]');
    var original = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    function text(value) {
      return String(value || '').toLowerCase().trim();
    }
    function apply() {
      var query = text(input && input.value);
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      var cards = original.slice();
      var sortValue = sort ? sort.value : 'default';
      if (sortValue === 'year-desc') {
        cards.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      if (sortValue === 'title-asc') {
        cards.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = text([card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(' '));
        var ok = true;
        if (query && haystack.indexOf(query) === -1) ok = false;
        if (regionValue && card.dataset.region !== regionValue) ok = false;
        if (typeValue && card.dataset.type !== typeValue) ok = false;
        if (yearValue && card.dataset.year !== yearValue) ok = false;
        if (categoryValue && card.dataset.category !== categoryValue) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }
    [input, region, type, year, category, sort].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-stream]'));
    videos.forEach(function (video, index) {
      var source = video.getAttribute('data-stream');
      if (!source) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
      var id = video.id || 'player-' + index;
      video.id = id;
      var button = document.querySelector('[data-play-target="' + id + '"]');
      if (button) {
        button.addEventListener('click', function () {
          video.play().catch(function () {});
        });
      }
      video.addEventListener('play', function () {
        if (button) button.style.display = 'none';
      });
      video.addEventListener('pause', function () {
        if (button) button.style.display = '';
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
