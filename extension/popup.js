// Aktif sekmede content script'e mesaj gönder ve video kaynaklarını al
function requestSources() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'REQUEST_VIDEO_SOURCES' }, function(response) {
      if (response && response.sources) {
        renderSources(response.sources);
      } else {
        renderSources([]);
      }
    });
  });
}

function openMultiStream(url, type) {
  const base = 'https://multi-live-stream-viewer.onrender.com/';
  window.open(`${base}?add=${encodeURIComponent(url)}`, '_blank');
}

function renderSources(sources) {
  const ul = document.getElementById('sources');
  ul.innerHTML = '';
  if (sources.length === 0) {
    ul.innerHTML = '<li>No video sources found.</li>';
  } else {
    sources.forEach(src => {
      const li = document.createElement('li');
      li.textContent = src.url;
      if (src.url.startsWith('blob:')) {
        const warn = document.createElement('div');
        warn.style.color = 'red';
        warn.style.fontSize = '12px';
        warn.textContent = 'Uyarı: Bu bir blob URL. Multi-Stream panelinde çalışmayabilir.';
        li.appendChild(document.createElement('br'));
        li.appendChild(warn);
      }
      // Sadece Kopyala butonu
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => navigator.clipboard.writeText(src.url);
      li.appendChild(document.createElement('br'));
      li.appendChild(copyBtn);
      ul.appendChild(li);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({ type: 'GET_VIDEO_LINKS' }, function(response) {
    if (response && response.sources) {
      renderSources(response.sources);
    }
  });
}); 