export interface Stream {
  id: string;
  url: string;
  title?: string;
  platform: 'youtube' | 'twitch' | 'twitter' | 'kick' | 'hls' | 'dash';
  category?: string;
  notes?: string;
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export type Language = 'tr' | 'en' | 'ar' | 'es' | 'zh' | 'ru' | 'pt';

export interface Settings {
  language: Language;
  theme: 'dark' | 'light';
  channelCount: number;
  layout: {
    columns: number;
    rows: number;
  };
  streams: Stream[];
}

export interface UserPreferences {
  settings: Settings;
  lastVisited: string;
  version: string;
}

declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
      };
    };
  }
} 