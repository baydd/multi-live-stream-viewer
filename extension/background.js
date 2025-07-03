const videoRegex = /\.(m3u8|mpd|mp4|webm)(\?.*)?$/i;
let foundVideoLinks = [];

chrome.webRequest.onCompleted.addListener(
  function(details) {
    if (videoRegex.test(details.url)) {
      if (!foundVideoLinks.includes(details.url)) {
        foundVideoLinks.push(details.url);
      }
    }
  },
  {urls: ["<all_urls>"]}
);

// Popup açılınca video linklerini döndür
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'GET_VIDEO_LINKS') {
    sendResponse({ sources: foundVideoLinks.map(url => ({ type: 'network', url })) });
  }
}); 