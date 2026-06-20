(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenus() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function movieCard(movie) {
        var tags = (movie.tags || "")
            .split(/[,，/、\s]+/)
            .filter(Boolean)
            .slice(0, 3)
            .map(function (tag) {
                return "<span>" + escapeHTML(tag) + "</span>";
            })
            .join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-card-link\" href=\"" + escapeHTML(movie.url) + "\" aria-label=\"" + escapeHTML(movie.title) + "\">",
            "<div class=\"movie-poster\">",
            "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-type\">" + escapeHTML(movie.type) + "</span>",
            "<span class=\"play-chip\">▶</span>",
            "</div>",
            "<div class=\"movie-card-body\">",
            "<h3>" + escapeHTML(movie.title) + "</h3>",
            "<p>" + escapeHTML(movie.oneLine) + "</p>",
            "<div class=\"movie-meta-row\"><span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.year) + "</span></div>",
            "<div class=\"movie-tags\">" + tags + "</div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var count = document.querySelector("[data-search-count]");
        var region = document.querySelector("[data-region-filter]");
        var type = document.querySelector("[data-type-filter]");
        var form = document.querySelector("[data-live-search-form]");
        var data = window.SEARCH_MOVIES || [];

        if (!input || !results || !data.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = input.value.trim().toLowerCase();
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var filtered = data.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                var queryMatch = !query || text.indexOf(query) !== -1;
                var regionMatch = !regionValue || movie.region === regionValue;
                var typeMatch = !typeValue || movie.type === typeValue;
                return queryMatch && regionMatch && typeMatch;
            });
            var visible = filtered.slice(0, 120);
            results.innerHTML = visible.map(movieCard).join("");
            if (title) {
                title.textContent = query ? "搜索结果" : "热门推荐";
            }
            if (count) {
                count.textContent = filtered.length ? "已匹配 " + filtered.length + " 部" : "未找到相关影片";
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
        }
        input.addEventListener("input", render);
        if (region) {
            region.addEventListener("change", render);
        }
        if (type) {
            type.addEventListener("change", render);
        }
        render();
    }

    ready(function () {
        initMenus();
        initForms();
        initHero();
        initSearch();
    });
}());
