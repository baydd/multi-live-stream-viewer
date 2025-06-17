import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaCog, FaGlobe, FaUndo, FaEdit, FaUsers } from 'react-icons/fa';
import { Stream, Settings } from './types';
import StreamGrid from './components/StreamGrid';
import SettingsPanel from './components/SettingsPanel';
import WatchTogetherPanel from './components/WatchTogetherPanel';
import { darkTheme } from './themes';
import { getPreferences, savePreferences, saveStreams, saveSettings } from './utils/storage';
import './i18n';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Header = styled.header`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const defaultChannelCount = 6;

type Language = 'tr' | 'en' | 'ar' | 'es' | 'zh' | 'ru' | 'pt';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [channelCount, setChannelCount] = useState<number>(defaultChannelCount);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWatchTogetherOpen, setIsWatchTogetherOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('tr');
  const [previousStreams, setPreviousStreams] = useState<Stream[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const preferences = getPreferences();
    setStreams(preferences.settings.streams);
    setChannelCount(preferences.settings.channelCount);
    setLanguage(preferences.settings.language as Language);
    setPreviousStreams(preferences.settings.streams);
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    saveSettings({ language });
  }, [language, i18n]);

  useEffect(() => {
    localStorage.setItem('streams', JSON.stringify(streams));
  }, [streams]);

  useEffect(() => {
    localStorage.setItem('channelCount', channelCount.toString());
  }, [channelCount]);

  const handleAddStream = (stream: Stream) => {
    setPreviousStreams(streams);
    const newStreams = [...streams, stream];
    setStreams(newStreams);
  };

  const handleRemoveStream = (id: string) => {
    setPreviousStreams(streams);
    const newStreams = streams.filter(stream => stream.id !== id);
    setStreams(newStreams);
  };

  const handleUpdateStreams = (newStreams: Stream[]) => {
    setPreviousStreams(streams);
    setStreams(newStreams);
  };

  const handleUpdateChannelCount = (count: number) => {
    setChannelCount(count);
  };

  const handleUndo = () => {
    if (previousStreams.length > 0) {
      setStreams(previousStreams);
      localStorage.setItem('streams', JSON.stringify(previousStreams));
    }
  };

  const getLanguageLabel = (lang: Language) => {
    const labels: Record<Language, string> = {
      tr: 'TR',
      en: 'EN',
      ar: 'عربي',
      es: 'ES',
      zh: '中文',
      ru: 'РУС',
      pt: 'PT'
    };
    return labels[lang];
  };

  const cycleLanguage = () => {
    const languages: Language[] = ['tr', 'en', 'ar', 'es', 'zh', 'ru', 'pt'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppContainer>
        <Header>
          <IconButton onClick={() => setIsEditMode(!isEditMode)} title={i18n.t('edit_mode') as string}>
            <FaEdit />
          </IconButton>
          <IconButton onClick={() => setIsWatchTogetherOpen(true)} title={i18n.t('watch_together.title') as string}>
            <FaUsers />
          </IconButton>
          <IconButton onClick={cycleLanguage} title={i18n.t('change_language') as string}>
            <FaGlobe />
            <span style={{ fontSize: '1rem', marginLeft: 6 }}>{getLanguageLabel(language)}</span>
          </IconButton>
          <IconButton onClick={handleUndo} title={i18n.t('undo') as string}>
            <FaUndo />
          </IconButton>
          <IconButton onClick={() => setIsSettingsOpen(true)}>
            <FaCog />
          </IconButton>
        </Header>

        <StreamGrid
          streams={streams}
          onRemoveStream={handleRemoveStream}
          onUpdateStreams={handleUpdateStreams}
          channelCount={channelCount}
          isEditMode={isEditMode}
        />

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onAddStream={handleAddStream}
          channelCount={channelCount}
          setChannelCount={setChannelCount}
          streams={streams}
          onUpdateStreams={handleUpdateStreams}
          language={language}
          setLanguage={setLanguage}
        />

        <WatchTogetherPanel
          isOpen={isWatchTogetherOpen}
          onClose={() => setIsWatchTogetherOpen(false)}
          streams={streams}
          channelCount={channelCount}
          onUpdateStreams={handleUpdateStreams}
          onUpdateChannelCount={handleUpdateChannelCount}
        />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;