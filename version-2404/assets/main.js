(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initCardFilters();
    });

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (slides.length > 1) {
            restart();
        }
    }

    function initCardFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var list = document.querySelector('[data-card-list]');
        if (!scope || !list) {
            return;
        }

        var searchInput = scope.querySelector('[data-card-search]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !year || normalize(card.dataset.year) === year;
                var matchedType = !type || normalize(card.dataset.type) === type;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }
})();
