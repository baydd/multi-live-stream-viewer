export interface Stream {
  id: string;
  url: string;
  title?: string;
  platform: 'youtube' | 'twitch' | 'twitter' | 'kick' | 'hls' | 'dash' | 'facebook' | 'instagram' | 'dlive' | 'trovo';
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

export interface WatchTogetherRoom {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdAt: string;
  participants: WatchTogetherUser[];
  streams: Stream[];
  channelCount: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface WatchTogetherUser {
  id: string;
  username: string;
  isAdmin: boolean;
  isOwner: boolean;
  canShare: boolean; // Yeni eklenen paylaşım izni
  joinedAt: string;
  lastSeen: string;
}

export interface WatchTogetherState {
  isEnabled: boolean;
  currentRoom: WatchTogetherRoom | null;
  currentUser: WatchTogetherUser | null;
  pendingUpdates: {
    [userId: string]: {
      username: string;
      streams: Stream[];
      channelCount: number;
      timestamp: string;
    };
  };
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