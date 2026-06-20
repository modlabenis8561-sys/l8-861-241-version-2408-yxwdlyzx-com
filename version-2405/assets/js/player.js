(function () {
  function initializeMoviePlayer(videoId, overlayId, sourceUrl) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    let hls = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== sourceUrl) {
          video.src = sourceUrl;
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        }
        return;
      }

      if (video.src !== sourceUrl) {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      overlay.classList.add('is-hidden');
      attachSource();
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.initializeMoviePlayer = initializeMoviePlayer;
})();
