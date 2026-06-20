(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-hero-panel]'));
  var active = 0;
  var timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
    panels.forEach(function (panel, i) {
      panel.hidden = i !== active;
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showHero(active + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showHero(index);
      startHero();
    });
  });

  showHero(0);
  startHero();

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInput && searchInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (category && category !== 'all' && cardCategory.indexOf(category) === -1) {
        matched = false;
      }
      if (type && type !== 'all' && cardType.indexOf(type) === -1) {
        matched = false;
      }
      if (year && year !== 'all' && cardYear !== year) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });

  runFilter();
})();
