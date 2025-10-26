import { Stream, Settings, UserPreferences } from '../types';

const VERSION = '1.0.0';

export const getPreferences = (): UserPreferences => {
  const savedStreams = localStorage.getItem('streams');
  const savedChannelCount = localStorage.getItem('channelCount');
  const savedLanguage = localStorage.getItem('language');
  const savedSettings = localStorage.getItem('settings');

  const defaultSettings: Settings = {
    language: 'tr',
    theme: 'dark',
    channelCount: 6,
    layout: {
      columns: 3,
      rows: 2,
    },
    streams: [],
  };

  const settings: Settings = savedSettings
    ? { ...defaultSettings, ...JSON.parse(savedSettings) }
    : defaultSettings;

  if (savedStreams) {
    settings.streams = JSON.parse(savedStreams);
  }
  if (savedChannelCount) {
    settings.channelCount = Number(savedChannelCount);
  }
  if (savedLanguage) {
    settings.language = savedLanguage as Settings['language'];
  }

  return {
    settings,
    lastVisited: new Date().toISOString(),
    version: VERSION,
  };
};

export const savePreferences = (preferences: UserPreferences) => {
  localStorage.setItem('settings', JSON.stringify(preferences.settings));
  localStorage.setItem('streams', JSON.stringify(preferences.settings.streams));
  localStorage.setItem('channelCount', preferences.settings.channelCount.toString());
  localStorage.setItem('language', preferences.settings.language);
};

export const saveStreams = (streams: Stream[]) => {
  localStorage.setItem('streams', JSON.stringify(streams));
};

export const saveSettings = (settings: Partial<Settings>) => {
  const currentSettings = getPreferences().settings;
  const newSettings = { ...currentSettings, ...settings };
  localStorage.setItem('settings', JSON.stringify(newSettings));
};
