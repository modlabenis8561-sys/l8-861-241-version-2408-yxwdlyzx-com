(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setHero(root, index) {
        var slides = root.querySelectorAll('[data-hero-slide]');
        var dots = root.querySelectorAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var next = (index + slides.length) % slides.length;
        root.dataset.heroIndex = String(next);
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === next);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === next);
        });
    }

    function bindHero() {
        document.querySelectorAll('[data-hero]').forEach(function (root) {
            root.dataset.heroIndex = '0';
            var slides = root.querySelectorAll('[data-hero-slide]');
            if (slides.length < 2) {
                return;
            }
            var timer = window.setInterval(function () {
                setHero(root, Number(root.dataset.heroIndex || 0) + 1);
            }, 5000);
            var next = root.querySelector('[data-hero-next]');
            var prev = root.querySelector('[data-hero-prev]');
            if (next) {
                next.addEventListener('click', function () {
                    window.clearInterval(timer);
                    setHero(root, Number(root.dataset.heroIndex || 0) + 1);
                });
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    window.clearInterval(timer);
                    setHero(root, Number(root.dataset.heroIndex || 0) - 1);
                });
            }
            root.querySelectorAll('[data-hero-dot]').forEach(function (dot) {
                dot.addEventListener('click', function () {
                    window.clearInterval(timer);
                    setHero(root, Number(dot.getAttribute('data-hero-dot') || 0));
                });
            });
        });
    }

    function bindSearch() {
        document.querySelectorAll('[data-card-search]').forEach(function (input) {
            var scope = input.closest('main') || document;
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                scope.querySelectorAll('[data-movie-card]').forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.classList.toggle('is-hidden', value.length > 0 && text.indexOf(value) === -1);
                });
            });
        });
    }

    function bindMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function attachStream(video, stream) {
        if (!video || !stream || video.dataset.ready === '1') {
            return;
        }
        video.dataset.ready = '1';
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        }
    }

    function playBox(box) {
        var video = box.querySelector('video[data-stream]');
        var overlay = box.querySelector('[data-player-start]');
        if (!video) {
            return;
        }
        attachStream(video, video.getAttribute('data-stream'));
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function bindPlayers() {
        document.querySelectorAll('[data-player-box]').forEach(function (box) {
            var overlay = box.querySelector('[data-player-start]');
            var video = box.querySelector('video[data-stream]');
            if (overlay) {
                overlay.addEventListener('click', function () {
                    playBox(box);
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playBox(box);
                    }
                });
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                });
            }
        });
    }

    ready(function () {
        bindHero();
        bindSearch();
        bindMobileNav();
        bindPlayers();
    });
})();
