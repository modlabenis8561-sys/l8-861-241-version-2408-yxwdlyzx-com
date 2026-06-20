(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var loading = document.querySelector('[data-player-loading]');
        var button = document.querySelector('[data-player-button]');

        function hideLoading() {
            if (loading) {
                loading.classList.add('hidden');
            }
        }

        function hideButton() {
            if (button) {
                button.classList.add('hidden');
            }
        }

        function showError(message) {
            if (!loading) {
                return;
            }
            loading.classList.remove('hidden');
            loading.innerHTML = '<p>' + message + '</p><button class="secondary-button" type="button" onclick="window.location.reload()">重新加载</button>';
        }

        if (!source) {
            showError('未找到视频播放源');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError('视频加载失败，请稍后重试');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', hideLoading, { once: true });
        } else {
            showError('您的浏览器不支持 HLS 视频播放');
            return;
        }

        video.addEventListener('canplay', hideLoading, { once: true });
        video.addEventListener('play', hideButton);
        video.addEventListener('pause', function () {
            if (button) {
                button.classList.remove('hidden');
            }
        });

        if (button) {
            button.addEventListener('click', function () {
                hideButton();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            });
        }
    });
})();
