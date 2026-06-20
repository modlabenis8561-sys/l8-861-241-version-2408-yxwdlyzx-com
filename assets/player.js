(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var frame = document.querySelector(".player-frame[data-stream]");
        if (!frame) {
            return;
        }
        var video = frame.querySelector("video");
        var button = frame.querySelector(".play-overlay");
        var stream = frame.getAttribute("data-stream");
        var hls = null;
        var loaded = false;

        function attachStream() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1600);
                });
            }
            video.src = stream;
            return Promise.resolve();
        }

        function playVideo() {
            frame.classList.add("is-playing");
            attachStream().then(function () {
                var task = video.play();
                if (task && task.catch) {
                    task.catch(function () {
                        frame.classList.remove("is-playing");
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
        frame.addEventListener("click", function (event) {
            if (event.target === frame) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });
        video.addEventListener("ended", function () {
            frame.classList.remove("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
