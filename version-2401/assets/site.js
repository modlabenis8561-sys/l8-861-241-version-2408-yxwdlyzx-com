import { H as Hls } from './hls-vendor-dru42stk.js';

const state = {
  searchIndexPromise: null
};

function getBasePath() {
  return document.body?.dataset.base || '';
}

function resolveSitePath(path) {
  return `${getBasePath()}${path}`;
}

function setupImageFallbacks(root = document) {
  const images = root.querySelectorAll('img');
  images.forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
      image.removeAttribute('srcset');
    }, { once: true });
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    document.body.classList.toggle('menu-open', panel.classList.contains('open'));
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prevButton = hero.querySelector('[data-hero-prev]');
  const nextButton = hero.querySelector('[data-hero-next]');

  if (slides.length < 2) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => activate(activeIndex + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prevButton?.addEventListener('click', () => {
    activate(activeIndex - 1);
    start();
  });

  nextButton?.addEventListener('click', () => {
    activate(activeIndex + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      activate(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupFilters() {
  const filterList = document.querySelector('[data-filter-list]');

  if (!filterList) {
    return;
  }

  const cards = Array.from(filterList.querySelectorAll('[data-movie-card]'));
  const searchInput = document.querySelector('[data-filter-search]');
  const regionSelect = document.querySelector('[data-filter-region]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const sortSelect = document.querySelector('[data-filter-sort]');
  const countTarget = document.querySelector('[data-filter-count]');
  const emptyTarget = document.querySelector('[data-filter-empty]');

  const getNumber = (card, key) => Number(card.dataset[key] || 0);
  const getText = (card, key) => String(card.dataset[key] || '');

  const applyFilters = () => {
    const keyword = String(searchInput?.value || '').trim().toLowerCase();
    const region = String(regionSelect?.value || '');
    const type = String(typeSelect?.value || '');
    const year = String(yearSelect?.value || '');
    const sort = String(sortSelect?.value || 'default');

    const sortedCards = [...cards].sort((a, b) => {
      if (sort === 'heat') {
        return getNumber(b, 'heat') - getNumber(a, 'heat');
      }

      if (sort === 'year') {
        return getNumber(b, 'year') - getNumber(a, 'year');
      }

      if (sort === 'title') {
        return getText(a, 'title').localeCompare(getText(b, 'title'), 'zh-Hans-CN');
      }

      return 0;
    });

    sortedCards.forEach((card) => filterList.appendChild(card));

    let visibleCount = 0;

    sortedCards.forEach((card) => {
      const terms = getText(card, 'terms').toLowerCase();
      const matchesKeyword = !keyword || terms.includes(keyword);
      const matchesRegion = !region || getText(card, 'region') === region;
      const matchesType = !type || getText(card, 'type') === type;
      const matchesYear = !year || String(getNumber(card, 'year')) === year;
      const visible = matchesKeyword && matchesRegion && matchesType && matchesYear;

      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (countTarget) {
      countTarget.textContent = `${visibleCount}`;
    }

    if (emptyTarget) {
      emptyTarget.hidden = visibleCount !== 0;
    }
  };

  [searchInput, regionSelect, typeSelect, yearSelect, sortSelect]
    .filter(Boolean)
    .forEach((control) => {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

  applyFilters();
}

function loadSearchIndex() {
  if (!state.searchIndexPromise) {
    state.searchIndexPromise = import('./search-index.js').then((module) => module.moviesIndex || []);
  }

  return state.searchIndexPromise;
}

function createSuggestionItem(movie) {
  const link = document.createElement('a');
  link.className = 'suggestion-item';
  link.href = resolveSitePath(`detail/${movie.id}.html`);
  link.innerHTML = `
    <img src="${resolveSitePath(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span>
      <strong>${escapeHtml(movie.title)}</strong>
      <small>${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.genre)}</small>
    </span>
  `;
  setupImageFallbacks(link);
  return link;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function scoreMovie(movie, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const title = String(movie.title || '').toLowerCase();
  const terms = String(movie.terms || '').toLowerCase();

  if (title === lowerKeyword) {
    return 100;
  }

  if (title.includes(lowerKeyword)) {
    return 80;
  }

  if (terms.includes(lowerKeyword)) {
    return 40;
  }

  return 0;
}

function findMatches(index, keyword, limit = 12) {
  const value = String(keyword || '').trim();

  if (!value) {
    return [];
  }

  return index
    .map((movie) => ({ movie, score: scoreMovie(movie, value) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.movie.heat || 0) - Number(a.movie.heat || 0))
    .slice(0, limit)
    .map((item) => item.movie);
}

function setupGlobalSearch() {
  const forms = Array.from(document.querySelectorAll('.global-search-form'));

  forms.forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    const suggestions = form.querySelector('[data-search-suggestions]');

    if (!input || !suggestions) {
      return;
    }

    let latestQuery = '';

    input.addEventListener('input', async () => {
      const query = input.value.trim();
      latestQuery = query;

      if (query.length < 2) {
        suggestions.classList.remove('open');
        suggestions.innerHTML = '';
        return;
      }

      const index = await loadSearchIndex();

      if (latestQuery !== query) {
        return;
      }

      const matches = findMatches(index, query, 8);
      suggestions.innerHTML = '';

      if (!matches.length) {
        suggestions.innerHTML = '<div class="suggestion-item"><span><strong>未找到匹配影片</strong><small>可尝试地区、年份或题材关键词</small></span></div>';
      } else {
        matches.forEach((movie) => suggestions.appendChild(createSuggestionItem(movie)));
      }

      suggestions.classList.add('open');
    });

    input.addEventListener('blur', () => {
      window.setTimeout(() => suggestions.classList.remove('open'), 180);
    });
  });
}

function renderMovieCard(movie) {
  const article = document.createElement('article');
  article.className = 'movie-card';
  article.innerHTML = `
    <a class="movie-poster-link" href="detail/${movie.id}.html" aria-label="观看 ${escapeHtml(movie.title)}">
      <span class="poster-frame">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-shade"></span>
        <span class="poster-play" aria-hidden="true">▶</span>
        <span class="poster-badge">${escapeHtml(movie.category)}</span>
      </span>
    </a>
    <div class="movie-card-body">
      <h3><a href="detail/${movie.id}.html">${escapeHtml(movie.title)}</a></h3>
      <p class="movie-card-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
      <p class="movie-card-desc">${escapeHtml(movie.oneLine)}</p>
      <div class="movie-card-tags">
        ${movie.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
  `;
  setupImageFallbacks(article);
  return article;
}

function setupSearchPage() {
  const page = document.querySelector('[data-search-page]');

  if (!page) {
    return;
  }

  const form = document.querySelector('[data-search-page-form]');
  const input = form?.querySelector('input[name="q"]');
  const results = page.querySelector('[data-search-results]');
  const title = page.querySelector('[data-search-title]');
  const summary = page.querySelector('[data-search-summary]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  const runSearch = async (query) => {
    if (!results) {
      return;
    }

    const trimmed = String(query || '').trim();

    if (!trimmed) {
      return;
    }

    const index = await loadSearchIndex();
    const matches = findMatches(index, trimmed, 120);

    results.innerHTML = '';
    matches.forEach((movie) => results.appendChild(renderMovieCard(movie)));

    if (title) {
      title.textContent = `“${trimmed}” 的搜索结果`;
    }

    if (summary) {
      summary.textContent = matches.length ? `找到 ${matches.length} 部相关影片。` : '没有找到匹配影片，请更换关键词。';
    }
  };

  if (input && initialQuery) {
    input.value = initialQuery;
    runSearch(initialQuery);
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input?.value || '';
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
    runSearch(query);
  });
}

function setupPlayers() {
  const playerCards = Array.from(document.querySelectorAll('.player-card'));

  playerCards.forEach((card) => {
    const video = card.querySelector('video[data-video-src]');
    const cover = card.querySelector('[data-player-cover]');
    const playButton = card.querySelector('[data-player-play]');
    const message = card.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    const loadVideo = () => {
      if (video.dataset.loaded === 'true') {
        return;
      }

      const source = video.dataset.videoSrc;

      if (!source) {
        if (message) {
          message.textContent = '当前影片暂未配置播放源。';
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.loaded = 'true';
        return;
      }

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal && message) {
            message.textContent = '播放源加载失败，请刷新页面或稍后重试。';
          }
        });

        video.dataset.loaded = 'true';
        return;
      }

      if (message) {
        message.textContent = '当前浏览器不支持 HLS 播放，请更换现代浏览器。';
      }
    };

    const startPlayback = () => {
      loadVideo();
      cover?.classList.add('hidden');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (message) {
            message.textContent = '浏览器已阻止自动播放，请点击视频控件继续播放。';
          }
        });
      }
    };

    playButton?.addEventListener('click', startPlayback);
    video.addEventListener('play', loadVideo, { once: true });
  });
}

setupImageFallbacks();
setupMobileMenu();
setupHeroCarousel();
setupFilters();
setupGlobalSearch();
setupSearchPage();
setupPlayers();
