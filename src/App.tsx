import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaCog, FaGlobe } from 'react-icons/fa';
import { Stream } from './types';
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

  useEffect(() => {
    const savedStreams = localStorage.getItem('streams');
    if (savedStreams) {
      setStreams(JSON.parse(savedStreams));
    }
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    localStorage.setItem('streams', JSON.stringify(streams));
  }, [streams]);

  const handleAddStream = (stream: Stream) => {
    const newStreams = [...streams, stream];
    setStreams(newStreams);
    localStorage.setItem('streams', JSON.stringify(newStreams));
  };

  const handleRemoveStream = (id: string) => {
    const newStreams = streams.filter(stream => stream.id !== id);
    setStreams(newStreams);
    localStorage.setItem('streams', JSON.stringify(newStreams));
  };

  const handleUpdateStreams = (newStreams: Stream[]) => {
    setStreams(newStreams);
    localStorage.setItem('streams', JSON.stringify(newStreams));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppContainer>
        <Header>
          <IconButton onClick={() => setLanguage(prev => prev === 'tr' ? 'en' : 'tr')} title="Dil Değiştir / Change Language">
            <FaGlobe />
            <span style={{ fontSize: '1rem', marginLeft: 6 }}>{language === 'tr' ? 'TR' : 'EN'}</span>
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