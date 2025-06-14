import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaCog, FaGlobe, FaUndo } from 'react-icons/fa';
import { Stream, Settings } from './types';
import StreamGrid from './components/StreamGrid';
import SettingsPanel from './components/SettingsPanel';
import { darkTheme } from './themes';
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

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [channelCount, setChannelCount] = useState<number>(defaultChannelCount);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [previousStreams, setPreviousStreams] = useState<Stream[]>([]);

  useEffect(() => {
    const savedStreams = localStorage.getItem('streams');
    const savedChannelCount = localStorage.getItem('channelCount');
    const savedLanguage = localStorage.getItem('language');
    const savedSettings = localStorage.getItem('settings');

    if (savedStreams) {
      const parsedStreams = JSON.parse(savedStreams);
      setStreams(parsedStreams);
      setPreviousStreams(parsedStreams);
    }
    if (savedChannelCount) {
      setChannelCount(Number(savedChannelCount));
    }
    if (savedLanguage) {
      setLanguage(savedLanguage as 'tr' | 'en');
    }
    if (savedSettings) {
      const settings = JSON.parse(savedSettings) as Settings;
      setLanguage(settings.language);
    }
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    const settings: Settings = {
      language,
      theme: 'dark'
    };
    localStorage.setItem('settings', JSON.stringify(settings));
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

  const handleUndo = () => {
    if (previousStreams.length > 0) {
      setStreams(previousStreams);
      localStorage.setItem('streams', JSON.stringify(previousStreams));
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppContainer>
        <Header>
          <IconButton onClick={() => setLanguage(prev => prev === 'tr' ? 'en' : 'tr')} title="Dil Değiştir / Change Language">
            <FaGlobe />
            <span style={{ fontSize: '1rem', marginLeft: 6 }}>{language === 'tr' ? 'TR' : 'EN'}</span>
          </IconButton>
          <IconButton onClick={handleUndo} title="Geri Al / Undo">
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
        />

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onAddStream={handleAddStream}
          channelCount={channelCount}
          setChannelCount={setChannelCount}
          streams={streams}
          onUpdateStreams={handleUpdateStreams}
        />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 