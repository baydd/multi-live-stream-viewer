export interface Stream {
  id: string;
  url: string;
  title?: string;
}

export interface Settings {
  language: 'tr' | 'en';
  theme: 'dark' | 'light';
} 