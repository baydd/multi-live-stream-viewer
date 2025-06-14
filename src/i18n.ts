import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      settings: {
        title: 'Settings',
        channelCount: 'Channel count',
        channelList: 'Channel List',
        streamUrl: 'Stream URL',
        streamUrlPlaceholder: 'URL or ID',
        streamTitle: 'Stream Title',
        streamTitlePlaceholder: 'Title',
        category: 'Category',
        selectCategory: 'Select a category',
        notes: 'Notes',
        notesPlaceholder: 'Add notes about this stream',
        addStream: 'Add Stream',
        appearance: 'Appearance',
        lightTheme: 'Light Theme',
        darkTheme: 'Dark Theme',
        twitterUsernamePlaceholder: 'Twitter username (e.g. trthaber)',
        save: 'Save Settings',
      },
      categories: {
        sports: 'Sports',
        news: 'News',
        entertainment: 'Entertainment',
        gaming: 'Gaming',
      },
    },
  },
  tr: {
    translation: {
      settings: {
        title: 'Ayarlar',
        channelCount: 'Kanal sayısı',
        channelList: 'Kanal Listesi',
        streamUrl: 'Yayın URL',
        streamUrlPlaceholder: 'URL veya ID',
        streamTitle: 'Yayın Başlığı',
        streamTitlePlaceholder: 'Başlık',
        category: 'Kategori',
        selectCategory: 'Kategori seçin',
        notes: 'Notlar',
        notesPlaceholder: 'Bu yayın hakkında notlar ekleyin',
        addStream: 'Yayın Ekle',
        appearance: 'Görünüm',
        lightTheme: 'Açık Tema',
        darkTheme: 'Koyu Tema',
        twitterUsernamePlaceholder: 'Twitter kullanıcı adı (ör: trthaber)',
        save: 'Ayarları Kaydet',
      },
      categories: {
        sports: 'Spor',
        news: 'Haber',
        entertainment: 'Eğlence',
        gaming: 'Oyun',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 