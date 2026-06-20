(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function playVideo(box) {
    var video = box.querySelector('video');
    var source = box.getAttribute('data-video');
    if (!video || !source) {
      return;
    }

    function start() {
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {});
      }
    }

    box.classList.add('is-loading');

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      box.classList.add('is-playing');
      start();
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (!box._hlsInstance) {
          box._hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          box._hlsInstance.loadSource(source);
          box._hlsInstance.attachMedia(video);
          box._hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            box.classList.add('is-playing');
            start();
          });
          box._hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              box._hlsInstance.destroy();
              box._hlsInstance = null;
              video.setAttribute('src', source);
              box.classList.add('is-playing');
              start();
            }
          });
        } else {
          box.classList.add('is-playing');
          start();
        }
      } else {
        video.setAttribute('src', source);
        box.classList.add('is-playing');
        start();
      }
    }).catch(function () {
      video.setAttribute('src', source);
      box.classList.add('is-playing');
      start();
    });
  }

  document.querySelectorAll('.player-box').forEach(function (box) {
    var cover = box.querySelector('.player-cover');
    var video = box.querySelector('video');
    if (cover) {
      cover.addEventListener('click', function () {
        playVideo(box);
      });
    }
    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(box);
        }
      });
    }
  });
})();
