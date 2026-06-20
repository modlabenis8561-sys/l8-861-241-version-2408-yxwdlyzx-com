(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
      img.removeAttribute('src');
    });
  });

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var scope = input.closest('main') || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-item]'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-category'),
          item.getAttribute('data-year'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        item.hidden = keyword && haystack.indexOf(keyword) === -1;
      });
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SiteMovieIndex) {
    var searchInput = document.getElementById('site-search-input');
    var categorySelect = document.getElementById('site-search-category');
    var yearSelect = document.getElementById('site-search-year');
    var searchButton = document.getElementById('site-search-button');
    var results = document.getElementById('search-results');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function card(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="./' + item.url + '">' +
        '<span class="poster-frame">' +
        '<img src="./' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span><span class="play-badge">▶</span></span>' +
        '<span class="movie-info"><span class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<span class="movie-desc">' + escapeHtml(item.desc) + '</span>' +
        '<span class="movie-tags">' + tags + '</span></span></a>';
    }

    function escapeHtml(text) {
      return String(text || '').replace(/[&<>"]/g, function (mark) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[mark];
      });
    }

    function render() {
      var keyword = (searchInput.value || '').trim().toLowerCase();
      var category = categorySelect.value;
      var year = yearSelect.value;
      var output = window.SiteMovieIndex.filter(function (item) {
        var text = [item.title, item.category, item.year, item.region, item.type, item.genre, item.desc, item.tags.join(' ')].join(' ').toLowerCase();
        return (!keyword || text.indexOf(keyword) !== -1) && (!category || item.category === category) && (!year || item.year === year);
      }).slice(0, 72);
      if (!output.length) {
        results.innerHTML = '<div class="text-panel"><h2>暂无匹配影片</h2><p>可以换一个关键词、分类或年份继续查找。</p></div>';
        return;
      }
      results.innerHTML = output.map(card).join('');
      results.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
          img.classList.add('is-missing');
          img.removeAttribute('src');
        });
      });
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', render);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', render);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', render);
    }
    if (searchButton) {
      searchButton.addEventListener('click', render);
    }
    render();
  }
})();
