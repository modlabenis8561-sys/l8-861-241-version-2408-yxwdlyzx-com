(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';

      if (!query) {
        event.preventDefault();
        return;
      }
    });
  });

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

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAuto();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startAuto();
      });
    });

    startAuto();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var localSearch = filterPanel.querySelector('[data-local-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeRegion = '';
    var activeType = '';
    var emptyBox = document.createElement('div');
    emptyBox.className = 'filter-empty';
    emptyBox.textContent = '没有找到匹配的影片';

    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }

    function applyFilter() {
      var query = localSearch ? normalize(localSearch.value.trim()) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var region = card.getAttribute('data-region') || '';
        var type = card.querySelector('.card-meta span:nth-child(3), .meta-row span:nth-child(2)');
        var typeText = type ? type.textContent.trim() : '';
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedRegion = !activeRegion || region === activeRegion;
        var matchedType = !activeType || typeText === activeType;
        var matched = matchedQuery && matchedRegion && matchedType;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      var grid = document.querySelector('.filter-grid');

      if (grid) {
        if (!visible && !emptyBox.parentNode) {
          grid.appendChild(emptyBox);
        }

        if (visible && emptyBox.parentNode) {
          emptyBox.parentNode.removeChild(emptyBox);
        }
      }
    }

    function setActiveButton(button, selector) {
      filterPanel.querySelectorAll(selector).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
    }

    filterPanel.querySelectorAll('[data-filter-region]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-filter-region') || '';
        setActiveButton(button, '[data-filter-region]');
        applyFilter();
      });
    });

    filterPanel.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        setActiveButton(button, '[data-filter-type]');
        applyFilter();
      });
    });

    if (localSearch) {
      var params = new URLSearchParams(window.location.search);
      var queryParam = params.get('q');

      if (queryParam) {
        localSearch.value = queryParam;
      }

      localSearch.addEventListener('input', applyFilter);
    }

    applyFilter();
  }

  var hlsLoader = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-src') : '';
    var attached = false;

    function attachSource() {
      if (!video || !source || attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          box.hls = hls;
        } else {
          video.src = source;
        }
      }).catch(function () {
        video.src = source;
      });
    }

    function playVideo() {
      attachSource().then(function () {
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    }

    if (button && video) {
      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('playing');
      });
    }
  });
})();
