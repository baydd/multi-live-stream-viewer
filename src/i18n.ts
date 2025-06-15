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
        streamTitlePlaceholder: 'Stream Title',
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
        load: 'Load Settings',
        save_load_placeholder: 'Paste your saved settings here',
        load_error: 'Error loading settings. Please check the format.',
        channel_count: 'Channel count',
        stream_platform: 'Stream platform',
        close: 'Close',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        stream_title_placeholder: 'Stream Title',
        stream_url_placeholder: 'URL or ID',
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
        streamTitlePlaceholder: 'Stream Title',
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
        load: 'Ayarları Yükle',
        save_load_placeholder: 'Kaydedilmiş ayarlarınızı buraya yapıştırın',
        load_error: 'Ayarlar yüklenirken hata oluştu. Lütfen formatı kontrol edin.',
        channel_count: 'Kanal sayısı',
        stream_platform: 'Yayın platformu',
        close: 'Kapat',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        stream_title_placeholder: 'Stream Title',
        stream_url_placeholder: 'URL or ID',
      },
      categories: {
        sports: 'Spor',
        news: 'Haber',
        entertainment: 'Eğlence',
        gaming: 'Oyun',
      },
    },
  },
  ar: {
    translation: {
      settings: {
        add_stream: 'إضافة بث',
        remove_stream: 'إزالة البث',
        channel_count: 'عدد القنوات',
        title: 'الإعدادات',
        close: 'إغلاق',
        stream_url: 'رابط البث',
        stream_title: 'عنوان البث',
        stream_notes: 'ملاحظات',
        stream_platform: 'المنصة',
        platforms: {
          youtube: 'يوتيوب',
          twitch: 'تويتش',
          twitter: 'تويتر',
          kick: 'كيك',
          hls: 'اتش ال اس',
          dash: 'داش'
        },
        edit_mode: 'وضع التحرير',
        mute: 'كتم الصوت',
        unmute: 'تشغيل الصوت',
        fullscreen: 'ملء الشاشة',
        exit_fullscreen: 'الخروج من ملء الشاشة',
        remove: 'إزالة',
        undo: 'تراجع',
        change_language: 'تغيير اللغة',
        save: 'حفظ الإعدادات',
        load: 'تحميل الإعدادات',
        save_load_placeholder: 'الصق الإعدادات المحفوظة هنا',
        load_error: 'خطأ في تحميل الإعدادات. يرجى التحقق من التنسيق.'
      }
    }
  },
  es: {
    translation: {
      settings: {
        add_stream: 'Añadir Stream',
        remove_stream: 'Eliminar Stream',
        channel_count: 'Número de Canales',
        title: 'Configuración',
        close: 'Cerrar',
        stream_url: 'URL del Stream',
        stream_title: 'Título del Stream',
        stream_notes: 'Notas',
        stream_platform: 'Plataforma',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        edit_mode: 'Modo Edición',
        mute: 'Silenciar',
        unmute: 'Activar Sonido',
        fullscreen: 'Pantalla Completa',
        exit_fullscreen: 'Salir de Pantalla Completa',
        remove: 'Eliminar',
        undo: 'Deshacer',
        change_language: 'Cambiar Idioma',
        save: 'Guardar Configuración',
        load: 'Cargar Configuración',
        save_load_placeholder: 'Pega tu configuración guardada aquí',
        load_error: 'Error al cargar la configuración. Por favor, verifica el formato.'
      }
    }
  },
  zh: {
    translation: {
      settings: {
        add_stream: '添加流',
        remove_stream: '移除流',
        channel_count: '频道数量',
        title: '设置',
        close: '关闭',
        stream_url: '流地址',
        stream_title: '流标题',
        stream_notes: '备注',
        stream_platform: '平台',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        edit_mode: '编辑模式',
        mute: '静音',
        unmute: '取消静音',
        fullscreen: '全屏',
        exit_fullscreen: '退出全屏',
        remove: '移除',
        undo: '撤销',
        change_language: '更改语言',
        save: '保存设置',
        load: '加载设置',
        save_load_placeholder: '在此处粘贴保存的设置',
        load_error: '加载设置时出错。请检查格式。'
      }
    }
  },
  ru: {
    translation: {
      settings: {
        add_stream: 'Добавить стрим',
        remove_stream: 'Удалить стрим',
        channel_count: 'Количество каналов',
        title: 'Настройки',
        close: 'Закрыть',
        stream_url: 'URL стрима',
        stream_title: 'Название стрима',
        stream_notes: 'Заметки',
        stream_platform: 'Платформа',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        edit_mode: 'Режим редактирования',
        mute: 'Отключить звук',
        unmute: 'Включить звук',
        fullscreen: 'Полный экран',
        exit_fullscreen: 'Выйти из полноэкранного режима',
        remove: 'Удалить',
        undo: 'Отменить',
        change_language: 'Изменить язык',
        save: 'Сохранить настройки',
        load: 'Загрузить настройки',
        save_load_placeholder: 'Вставьте сохраненные настройки сюда',
        load_error: 'Ошибка загрузки настроек. Пожалуйста, проверьте формат.'
      }
    }
  },
  pt: {
    translation: {
      settings: {
        add_stream: 'Adicionar Stream',
        remove_stream: 'Remover Stream',
        channel_count: 'Número de Canais',
        title: 'Configurações',
        close: 'Fechar',
        stream_url: 'URL do Stream',
        stream_title: 'Título do Stream',
        stream_notes: 'Notas',
        stream_platform: 'Plataforma',
        platforms: {
          youtube: 'YouTube',
          twitch: 'Twitch',
          twitter: 'Twitter',
          kick: 'Kick',
          hls: 'HLS',
          dash: 'DASH'
        },
        edit_mode: 'Modo de Edição',
        mute: 'Mutar',
        unmute: 'Ativar Som',
        fullscreen: 'Tela Cheia',
        exit_fullscreen: 'Sair da Tela Cheia',
        remove: 'Remover',
        undo: 'Desfazer',
        change_language: 'Mudar Idioma',
        save: 'Salvar Configurações',
        load: 'Carregar Configurações',
        save_load_placeholder: 'Cole suas configurações salvas aqui',
        load_error: 'Erro ao carregar configurações. Por favor, verifique o formato.'
      }
    }
  }
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