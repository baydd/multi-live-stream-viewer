# Multi-Stream Video Extractor Eklentisi

Bu klasör, Multi-Stream Video Extractor Chrome/Edge eklentisinin kaynak kodunu içerir.

Eklenti, ziyaret ettiğiniz web sitelerindeki video kaynaklarını (HLS, YouTube, <video> vs.) tespit eder ve bunları Multi-Stream panelinize kolayca göndermenizi sağlar.

## Kurulum

1. Chrome veya Edge'de "Geliştirici Modu"nu açın.
2. "Paketlenmemiş uzantı yükle" seçeneğiyle bu klasörü seçin.
3. Eklenti simgesine tıklayın, tespit edilen video kaynaklarını görebilirsiniz

## Not
- `popup.js` ve `content.js` dosyaları iletişim için Chrome messaging API'sini kullanır.
- Multi-Stream panel adresinizi `popup.js` içinde `base` değişkenine yazmalısınız. 