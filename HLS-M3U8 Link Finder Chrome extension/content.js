// Video kaynaklarını bul ve popup'a aktar
let lastSources = [];

function extractVideoSources() {
  const sources = [];
  const add = (type, url, label) => {
    if (!url) return;
    url = url.trim();
    if (!url) return;
    if (
      url.match(/\.m3u8($|\?)/) ||
      url.match(/\.mpd($|\?)/) ||
      url.match(/\.mp4($|\?)/) ||
      url.match(/\.webm($|\?)/) ||
      url.match(/youtube\.com|youtu\.be|vimeo\.com|twitch\.tv|dailymotion\.com/)
    ) {
      sources.push({ type, url, label });
    }
  };

  // <video> ve <audio>
  document.querySelectorAll('video, audio').forEach(media => {
    add(media.tagName.toLowerCase(), media.src, media.currentSrc || undefined);
    if (media.currentSrc && media.currentSrc !== media.src) add(media.tagName.toLowerCase(), media.currentSrc);
    if (media.srcObject && media.srcObject instanceof MediaStream) {
      add('mediaStream', 'blob:' + media.srcObject.id);
    }
    media.querySelectorAll('source,track').forEach(source => {
      add('source', source.src, source.label || undefined);
    });
  });

  // <iframe>, <embed>, <object>
  document.querySelectorAll('iframe, embed, object').forEach(frame => {
    add(frame.tagName.toLowerCase(), frame.src || frame.data);
  });

  // <a> etiketleri (sadece video stream uzantılı olanlar)
  document.querySelectorAll('a').forEach(a => {
    add('a', a.href);
  });

  // <source> ve <track>
  document.querySelectorAll('source, track').forEach(el => {
    add(el.tagName.toLowerCase(), el.src, el.label || undefined);
  });

  // <object> data
  document.querySelectorAll('object').forEach(obj => {
    add('object', obj.data);
  });

  // <img> poster
  document.querySelectorAll('img').forEach(img => {
    if (img.src && img.src.match(/\.m3u8($|\?)/)) add('hls', img.src);
    if (img.src && img.src.match(/\.mpd($|\?)/)) add('dash', img.src);
  });

  // window.ytplayer, jwplayer, videojs gibi global player objeleri
  try {
    if (window.ytplayer && window.ytplayer.config && window.ytplayer.config.args && window.ytplayer.config.args.player_response) {
      const pr = JSON.parse(window.ytplayer.config.args.player_response);
      if (pr.streamingData && pr.streamingData.formats) {
        pr.streamingData.formats.forEach(f => add('youtube', f.url));
      }
    }
  } catch (e) {}
  try {
    if (window.jwplayer && typeof window.jwplayer === 'function') {
      const jw = window.jwplayer();
      if (jw && jw.getPlaylist) {
        jw.getPlaylist().forEach(item => {
          if (item.file) add('jwplayer', item.file);
        });
      }
    }
  } catch (e) {}
  try {
    if (window.videojs && typeof window.videojs === 'function') {
      const vjs = window.videojs.players;
      for (const key in vjs) {
        const player = vjs[key];
        if (player && player.currentSrc) add('videojs', player.currentSrc());
      }
    }
  } catch (e) {}

  // Benzersizleştir
  const unique = [];
  const map = new Map();
  for (const s of sources) {
    if (!s.url) continue;
    if (!map.has(s.url)) {
      map.set(s.url, true);
      unique.push(s);
    }
  }
  return unique;
}

function sendSourcesToPopup() {
  const sources = extractVideoSources();
  // Sadece değişiklik varsa gönder
  if (JSON.stringify(sources) !== JSON.stringify(lastSources)) {
    lastSources = sources;
    chrome.runtime.sendMessage({ type: 'VIDEO_SOURCES_UPDATE', sources });
  }
}

// DOM değişikliklerini izle
const observer = new MutationObserver(() => {
  sendSourcesToPopup();
});
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

// Video play event'lerini dinle
function listenMediaEvents() {
  document.querySelectorAll('video, audio').forEach(media => {
    if (!media._hasListener) {
      media.addEventListener('play', sendSourcesToPopup);
      media.addEventListener('loadeddata', sendSourcesToPopup);
      media._hasListener = true;
    }
  });
}
setInterval(listenMediaEvents, 2000); // Yeni eklenen medya için periyodik kontrol

// Popup'tan manuel istek gelirse
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === 'REQUEST_VIDEO_SOURCES') {
    sendResponse({ sources: extractVideoSources() });
  }
});

// Sayfa ilk yüklendiğinde de popup'a bildir
sendSourcesToPopup();

// Ağ trafiğinden video linki yakalama (fetch ve XHR hook)
(function() {
  const videoRegex = /\.(m3u8|mpd|mp4|webm)(\?.*)?$/i;
  function handleUrl(url) {
    if (videoRegex.test(url)) {
      // Listeye ekle ve popup'a bildir
      if (!window._networkVideoLinks) window._networkVideoLinks = new Set();
      if (!window._networkVideoLinks.has(url)) {
        window._networkVideoLinks.add(url);
        // Popup'a bildir
        chrome.runtime.sendMessage({ type: 'VIDEO_SOURCES_UPDATE', sources: [{ type: 'network', url }] });
      }
    }
  }
  // fetch hook
  const origFetch = window.fetch;
  window.fetch = function() {
    if (arguments[0] && typeof arguments[0] === 'string') handleUrl(arguments[0]);
    return origFetch.apply(this, arguments);
  };
  // XHR hook
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    handleUrl(url);
    return origOpen.apply(this, arguments);
  };
})(); 