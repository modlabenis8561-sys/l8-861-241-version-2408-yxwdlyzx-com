(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupImageFallbacks() {
    document.querySelectorAll('.image-shell img').forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.image-shell');
        if (shell) {
          shell.classList.add('is-missing');
        }
        image.removeAttribute('src');
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter-input]');
    var typeSelect = document.querySelector('[data-page-filter-type]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!list || (!input && !typeSelect)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value.trim() : '';
      var visibleCount = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var visible = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          visible = false;
        }
        if (typeValue && type.indexOf(typeValue) === -1) {
          visible = false;
        }
        card.toggleAttribute('hidden', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var meta = document.querySelector('[data-search-meta]');
    if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>'"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char];
      });
    }

    function render(items, query) {
      if (!query) {
        results.innerHTML = '';
        meta.textContent = '输入关键词后显示结果。';
        return;
      }
      var limited = items.slice(0, 120);
      meta.textContent = '找到 ' + items.length + ' 条结果，当前展示前 ' + limited.length + ' 条。';
      results.innerHTML = limited.map(function (movie) {
        var terms = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ');
        return '' +
          '<article class="movie-card" data-search="' + escapeHtml(terms) + '">' +
            '<a class="card-cover" href="' + escapeHtml(movie.href) + '">' +
              '<span class="image-shell poster-shell" data-title="' + escapeHtml(movie.title) + '">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '</span>' +
              '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
              '<span class="play-float">▶</span>' +
            '</a>' +
            '<div class="card-body">' +
              '<a class="card-title" href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a>' +
              '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</p>' +
              '<p class="card-desc">' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>' +
            '</div>' +
          '</article>';
      }).join('');
      setupImageFallbacks();
    }

    function runSearch() {
      var query = input.value.trim().toLowerCase();
      var keywords = query.split(/\s+/).filter(Boolean);
      var data = window.MOVIE_SEARCH_INDEX || [];
      var items = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ').toLowerCase();
        return keywords.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });
      render(items, query);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
    });

    input.addEventListener('input', runSearch);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      runSearch();
    }
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var trigger = player.querySelector('[data-player-trigger]');
      var video = player.querySelector('video');
      var message = player.querySelector('[data-player-message]');
      var source = player.getAttribute('data-m3u8');
      var hlsInstance = null;

      function writeMessage(text, isError) {
        if (!message) {
          return;
        }
        message.textContent = text || '';
        message.classList.toggle('is-error', Boolean(isError));
      }

      function startPlayback() {
        if (!video || !source) {
          writeMessage('当前影片缺少播放源。', true);
          return;
        }
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        writeMessage('正在加载播放源…', false);

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().then(function () {
            writeMessage('', false);
          }).catch(function () {
            writeMessage('浏览器已阻止自动播放，请再次点击视频播放。', false);
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              writeMessage('', false);
            }).catch(function () {
              writeMessage('播放源已就绪，请点击视频开始播放。', false);
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
              writeMessage('播放源加载失败，请刷新页面或更换浏览器后重试。', true);
            }
          });
          return;
        }

        video.src = source;
        video.play().catch(function () {
          writeMessage('当前浏览器不支持 HLS 播放，请使用 Safari、Edge、Chrome 或支持 HLS 的浏览器。', true);
        });
      }

      if (trigger) {
        trigger.addEventListener('click', startPlayback);
      }
    });
  }

  ready(function () {
    setupImageFallbacks();
    setupMobileMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
