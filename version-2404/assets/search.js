(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var data = window.MOVIE_SEARCH_INDEX || [];
        var input = document.getElementById('global-search-input');
        var regionFilter = document.getElementById('global-region-filter');
        var typeFilter = document.getElementById('global-type-filter');
        var yearFilter = document.getElementById('global-year-filter');
        var results = document.getElementById('search-results');
        var summary = document.getElementById('search-summary');

        if (!input || !results || !summary) {
            return;
        }

        fillSelect(regionFilter, uniqueValues('region'));
        fillSelect(typeFilter, uniqueValues('type'));
        fillSelect(yearFilter, uniqueValues('year').sort(function (a, b) {
            return String(b).localeCompare(String(a));
        }));

        function uniqueValues(key) {
            var seen = {};
            var values = [];
            data.forEach(function (item) {
                var value = item[key];
                if (value && !seen[value]) {
                    seen[value] = true;
                    values.push(value);
                }
            });
            return values.sort(function (a, b) {
                return String(a).localeCompare(String(b), 'zh-Hans-CN');
            });
        }

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matches(item, keyword, region, type, year) {
            var text = normalize([
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' '));
            return (!keyword || text.indexOf(keyword) !== -1)
                && (!region || item.region === region)
                && (!type || item.type === type)
                && (!year || item.year === year);
        }

        function render() {
            var keyword = normalize(input.value);
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var filtered = data.filter(function (item) {
                return matches(item, keyword, region, type, year);
            }).slice(0, 120);

            summary.textContent = '找到 ' + filtered.length + ' 条结果，最多显示前 120 条。';
            results.innerHTML = filtered.map(renderCard).join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderCard(item) {
            var tag = item.tags && item.tags.length ? item.tags[0] : item.type;
            return [
                '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
                '  <span class="poster-wrap">',
                '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '    <span class="poster-gradient"></span>',
                '    <span class="play-hover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7 4 19 12 7 20 7 4"></polygon></svg></span>',
                '    <span class="tag-badge">' + escapeHtml(tag) + '</span>',
                '    <span class="hover-desc">' + escapeHtml(item.oneLine) + '</span>',
                '  </span>',
                '  <span class="movie-card-body">',
                '    <strong>' + escapeHtml(item.title) + '</strong>',
                '    <span class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></span>',
                '  </span>',
                '</a>'
            ].join('');
        }

        [input, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        render();
    });
})();
