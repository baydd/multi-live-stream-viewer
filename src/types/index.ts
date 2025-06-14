export interface Stream {
  id: string;
  url: string;
  title: string;
  platform: 'youtube' | 'twitch' | 'hls' | 'dash' | 'twitter';
  category: string;
  notes: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface Settings {
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
}

export interface StreamState {
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
} 