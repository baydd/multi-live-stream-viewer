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

export interface Settings {
  language: 'tr' | 'en';
  theme: 'dark' | 'light';
} 