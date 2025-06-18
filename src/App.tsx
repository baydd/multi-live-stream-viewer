import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaCog, FaGlobe, FaUndo, FaEdit, FaUsers, FaSun, FaMoon } from 'react-icons/fa';
import { Stream, Settings } from './types';
import StreamGrid from './components/StreamGrid';
import SettingsPanel from './components/SettingsPanel';
import WatchTogetherPanel from './components/WatchTogetherPanel';
import { darkTheme, lightTheme } from './themes';
import { getPreferences, savePreferences, saveStreams, saveSettings } from './utils/storage';
import './i18n';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
  }

  .react-grid-item {
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    transition-property: left, top, width, height;
  }

  .react-grid-item.react-grid-placeholder {
    background: ${props => props.theme.primary};
    opacity: 0.3;
    transition-duration: 100ms;
    z-index: 2;
    border-radius: 8px;
    border: 2px dashed ${props => props.theme.primary};
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    background: ${props => props.theme.primary};
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-grid-item:hover > .react-resizable-handle {
    opacity: 0.8;
  }

  .react-grid-item > .react-resizable-handle::after {
    content: "⋮⋮";
    color: white;
    font-size: 8px;
    line-height: 1;
    transform: rotate(45deg);
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  position: relative;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  position: relative;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  background: ${props => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const DevBy = styled.a`
  font-size: 0.95rem;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  margin-right: 1.5rem;
  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const IconButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? props.theme.primary : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.primary : props.theme.border};
  color: ${props => props.active ? '#ffffff' : props.theme.text};
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 48px;
  height: 48px;
  
  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.hover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    border-color: ${props => props.theme.primary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const LanguageButton = styled(IconButton)`
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  min-width: auto;
  
  span {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }
`;

const Logo = styled.div`
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  font-weight: 700;
  background: ${props => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
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
  const [previousStreams, setPreviousStreams] = useState<Stream[][]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const preferences = getPreferences();
    setStreams(preferences.settings.streams);
    setChannelCount(preferences.settings.channelCount);
    setLanguage(preferences.settings.language as Language);
    setPreviousStreams([]);
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
    setPreviousStreams(prev => [...prev, streams]);
    const newStreams = [...streams, stream];
    setStreams(newStreams);
  };

  const handleRemoveStream = (id: string) => {
    setPreviousStreams(prev => [...prev, streams]);
    const newStreams = streams.filter(stream => stream.id !== id);
    setStreams(newStreams);
  };

  const handleUpdateStreams = (newStreams: Stream[]) => {
    setPreviousStreams(prev => [...prev, streams]);
    setStreams(newStreams);
    saveStreams(newStreams);
  };

  const handleUpdateChannelCount = (count: number) => {
    setChannelCount(count);
  };

  const handleUndo = () => {
    setPreviousStreams(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStreams(last);
      localStorage.setItem('streams', JSON.stringify(last));
      return prev.slice(0, -1);
    });
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <DevBy href="https://github.com/baydd" target="_blank" rel="noopener noreferrer">
            Developed by: baydd
          </DevBy>
          <ButtonGroup>
            <IconButton 
              onClick={() => setIsEditMode(!isEditMode)} 
              title={i18n.t('edit_mode') as string}
              active={isEditMode}
            >
              <FaEdit />
            </IconButton>
            <IconButton 
              onClick={() => setIsWatchTogetherOpen(true)} 
              title={i18n.t('watch_together.title') as string}
            >
              <FaUsers />
            </IconButton>
            <LanguageButton onClick={cycleLanguage} title={i18n.t('change_language') as string}>
              <FaGlobe />
              <span>{getLanguageLabel(language)}</span>
            </LanguageButton>
            <IconButton onClick={toggleTheme} title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </IconButton>
            <IconButton onClick={toggleSettings} title="Settings">
              <FaCog />
            </IconButton>
          </ButtonGroup>
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