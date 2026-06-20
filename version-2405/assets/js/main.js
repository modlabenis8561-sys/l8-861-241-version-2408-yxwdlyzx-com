(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const scope = panel.closest('section') || document;
    const input = panel.querySelector('[data-search-input]');
    const chips = Array.from(panel.querySelectorAll('[data-filter-chip]'));
    const list = scope.parentElement ? scope.parentElement.querySelector('[data-movie-list]') : document.querySelector('[data-movie-list]');
    const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];
    let chipValue = '';

    function applyFilter() {
      const query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = ((card.dataset.title || '') + ' ' + (card.dataset.meta || '')).toLowerCase();
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedChip = !chipValue || chipValue === '全部' || text.indexOf(chipValue.toLowerCase()) !== -1;
        card.classList.toggle('hidden', !(matchedQuery && matchedChip));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const active = chip.classList.contains('active');
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        if (active) {
          chipValue = '';
        } else {
          chip.classList.add('active');
          chipValue = chip.dataset.filterChip || '';
        }
        applyFilter();
      });
    });
  });
})();
