import { H as Hls } from './hls-vendor-dru42stk.js';

function bindPlayer(video) {
  var src = video.getAttribute('data-video-src');
  if (!src) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else {
    video.src = src;
  }
}

function setup() {
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-video-src]'));
  videos.forEach(function (video) {
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('[data-play-button]') : null;
    bindPlayer(video);

    if (button) {
      button.addEventListener('click', function () {
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        button.classList.remove('is-hidden');
      });
      video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}
