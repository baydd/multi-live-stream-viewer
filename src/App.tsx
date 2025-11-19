import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  FaCog,
  FaGlobe,
  FaEdit,
  FaUsers,
  FaSun,
  FaMoon,
  FaBookmark,
  FaChartLine,
  FaKeyboard,
  FaLink,
  FaTv,
  FaBell,
  FaArrowLeft,
} from 'react-icons/fa';
import ChannelList from './components/ChannelList';
import UpdatesPage from './pages/UpdatesPage';
import HomePage from './pages/HomePage';
import { Stream, Settings } from './types';
import StreamGrid from './components/StreamGrid';
import SettingsPanel from './components/SettingsPanel';
import WatchTogetherPanel from './components/WatchTogetherPanel';
import StreamPresets from './components/StreamPresets';
import PerformanceMonitor from './components/PerformanceMonitor';
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
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
    user-select: none;
  }

  .react-grid-item {
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    transition-property: left, top, width, height;
  }

  .react-grid-item.react-grid-placeholder {
    background: ${(props) => props.theme.primary}30;
    opacity: 0.4;
    transition-duration: 100ms;
    z-index: 2;
    border-radius: 6px;
    border: 1px dashed ${(props) => props.theme.primary};
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 2px;
    right: 2px;
    cursor: se-resize;
    background: ${(props) => props.theme.primary};
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-grid-item:hover > .react-resizable-handle {
    opacity: 0.7;
  }

  .react-grid-item > .react-resizable-handle::after {
    content: "⋮⋮";
    color: white;
    font-size: 6px;
    line-height: 1;
    transform: rotate(45deg);
    font-weight: bold;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.scrollbar.track};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbar.thumb};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.primary};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  position: relative;
  padding-top: 64px; /* Match header height */

  @media (max-width: 768px) {
    padding-top: 56px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background: ${(props) => props.theme.cardBackground};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid ${(props) => props.theme.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${(props) => props.theme.cardBackground};
    opacity: 0.9;
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    height: 56px;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  background: ${(props) =>
    props.theme.gradient ||
    `linear-gradient(135deg, ${props.theme.primary}, ${props.theme.secondary})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${(props) => props.theme.primary}20;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const DevBy = styled.a`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-right: 1.5rem;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  background: ${(props) => props.theme.background}40;
  border: 1px solid ${(props) => props.theme.border};

  &:hover {
    color: ${(props) => props.theme.primary};
    background: ${(props) => props.theme.primary}15;
    border-color: ${(props) => props.theme.primary}30;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0.25rem;
  background: ${(props) => props.theme.background}20;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    gap: 0.375rem;
    padding: 0.125rem;
    border-radius: 10px;
  }
`;

const IconButton = styled.button<{
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
}>`
  background: ${(props) => {
    if (props.active) return props.theme.primary;
    if (props.variant === 'success') return props.theme.success;
    return 'transparent';
  }};
  border: none;
  color: ${(props) => {
    if (props.active || props.variant === 'success') return '#ffffff';
    return props.theme.text;
  }};
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 36px;
  height: 36px;
  box-shadow: none;
  opacity: ${(props) => (props.disabled ? '0.5' : '1')};

  &:hover {
    background: ${(props) => {
      if (props.active) return props.theme.primary;
      if (props.variant === 'success') return props.theme.success;
      return props.theme.background;
    }};
    transform: translateY(-1px);
    box-shadow: 0 2px 12px ${(props) => props.theme.shadow || 'rgba(0, 0, 0, 0.1)'};
    color: ${(props) =>
      props.active || props.variant === 'success' ? '#ffffff' : props.theme.primary};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 32px;
    height: 32px;
    padding: 0.375rem;
    font-size: 0.875rem;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LanguageButton = styled(IconButton)`
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  min-width: auto;
  font-weight: 500;
  background: ${(props) => props.theme.background}40 !important;
  border: 1px solid ${(props) => props.theme.border} !important;

  &:hover {
    background: ${(props) => props.theme.primary}15 !important;
    border-color: ${(props) => props.theme.primary}30 !important;
  }

  span {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  @media (max-width: 768px) {
    padding: 0.375rem 0.5rem;

    span {
      display: none;
    }
  }
`;

const KeyboardShortcuts = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${(props) => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${(props) => props.theme.shadowLg};
  display: ${(props) => (props.visible ? 'block' : 'none')};
  z-index: 1000;
  max-width: 450px;
  width: 90%;
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${(props) => props.theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutKey = styled.kbd`
  background: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: ${(props) => props.theme.primary};
  font-weight: 500;
`;

const defaultChannelCount = 6;

type Language = 'tr' | 'en' | 'ar' | 'es' | 'zh' | 'ru' | 'pt';

const AppContent: React.FC = () => {
  const history = useHistory();
  const { i18n } = useTranslation();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [channelCount, setChannelCount] = useState<number>(defaultChannelCount);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWatchTogetherOpen, setIsWatchTogetherOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('tr');
  const [previousStreams, setPreviousStreams] = useState<Stream[][]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const preferences = getPreferences();
    setStreams(preferences.settings.streams);
    setChannelCount(preferences.settings.channelCount);
    setLanguage(preferences.settings.language as Language);
    setIsDarkMode(preferences.settings.theme === 'dark');
    setPreviousStreams([]);
  }, []);

  // Save language changes
  useEffect(() => {
    i18n.changeLanguage(language);
    saveSettings({ language });
  }, [language, i18n]);

  // Save theme changes
  useEffect(() => {
    saveSettings({ theme: isDarkMode ? 'dark' : 'light' });
  }, [isDarkMode]);

  // Auto-save streams and channel count (storage utils ile tek noktadan)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveStreams(streams);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [streams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSettings({ channelCount });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [channelCount]);

  // Ctrl+V paste handler for adding streams
  // URL -> platform tespit yardımcı fonksiyonu
  const detectPlatform = (url: string): Stream['platform'] => {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('twitch.tv')) return 'twitch';
    if (u.includes('kick.com')) return 'kick';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
    return 'hls';
  };

  // Ctrl+V ile pano yapıştırma ve stream ekleme (izin/güvenli bağlam kontrolü)
  useEffect(() => {
    const handlePaste = async (e: KeyboardEvent) => {
      if (!(e.ctrlKey && e.key === 'v')) return;

      try {
        if (!('clipboard' in navigator) || !('readText' in navigator.clipboard)) {
          return; // Destek yoksa sessizce geç
        }
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText || !(clipboardText.startsWith('http') || clipboardText.includes('.')))
          return;

        let targetIndex = streams.findIndex((stream) => !stream.url || stream.url.trim() === '');
        if (targetIndex === -1) {
          if (streams.length < channelCount) {
            targetIndex = streams.length;
          } else {
            setChannelCount((prev) => prev + 1);
            targetIndex = streams.length;
          }
        }

        const newStream: Stream = {
          id: Date.now().toString(),
          url: clipboardText,
          title: `Stream ${targetIndex + 1}`,
          platform: detectPlatform(clipboardText),
          category: '',
          notes: '',
          layout: {
            x: targetIndex % 3,
            y: Math.floor(targetIndex / 3),
            w: 1,
            h: 1,
          },
        };

        if (targetIndex < streams.length) {
          const updatedStreams = [...streams];
          updatedStreams[targetIndex] = newStream;
          setStreams(updatedStreams);
        } else {
          setStreams((prev) => [...prev, newStream]);
        }
      } catch (error) {
        console.error('Clipboard okunamadı:', error);
      }
    };

    document.addEventListener('keydown', handlePaste);
    return () => document.removeEventListener('keydown', handlePaste);
  }, [streams, channelCount]);

  const handleAddStream = useCallback(
    (stream: Stream) => {
      setPreviousStreams((prev) => [...prev, streams]);
      const newStream = {
        ...stream,
        id: stream.id || `stream-${Date.now()}`,
        layout: {
          x: streams.length % 3,
          y: Math.floor(streams.length / 3),
          w: 1,
          h: 1,
        },
      };
      const newStreams = [...streams, newStream];
      setStreams(newStreams);

      // Auto-expand grid if needed
      if (streams.length >= channelCount) {
        setChannelCount((prev) => prev + 1);
      }
    },
    [streams, channelCount]
  );

  const handleRemoveStream = useCallback(
    (id: string) => {
      setPreviousStreams((prev) => [...prev, streams]);
      const newStreams = streams.filter((stream) => stream.id !== id);
      setStreams(newStreams);
    },
    [streams]
  );

  const handleUpdateStreams = useCallback(
    (newStreams: Stream[]) => {
      setPreviousStreams((prev) => [...prev, streams]);
      setStreams(newStreams);
      saveStreams(newStreams);
    },
    [streams]
  );

  const handleUpdateChannelCount = useCallback((count: number) => {
    setChannelCount(count);
  }, []);

  const handleUndo = useCallback(() => {
    setPreviousStreams((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStreams(last);
      localStorage.setItem('streams', JSON.stringify(last));
      return prev.slice(0, -1);
    });
  }, []);

  const getLanguageLabel = (lang: Language) => {
    const labels: Record<Language, string> = {
      tr: 'TR',
      en: 'EN',
      ar: 'عربي',
      es: 'ES',
      zh: '中文',
      ru: 'РУС',
      pt: 'PT',
    };
    return labels[lang];
  };

  const cycleLanguage = useCallback(() => {
    const languages: Language[] = ['tr', 'en', 'ar', 'es', 'zh', 'ru', 'pt'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  const handleLoadPreset = useCallback(
    (presetStreams: Stream[], presetChannelCount: number) => {
      setPreviousStreams((prev) => [...prev, streams]);
      setStreams(presetStreams);
      setChannelCount(presetChannelCount);
    },
    [streams]
  );

  const handleBack = useCallback(() => {
    history.push('/');
  }, [history]);

  // Add Updates button to the header
  const navigateToUpdates = useCallback(() => {
    history.push('/updates');
  }, [history]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Switch>
        <Route path="/app">
          <AppContainer>
            <Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Title>
                  <FaTv />
                  <span>multiple.live</span>
                </Title>
                <DevBy href="https://github.com/baydd" target="_blank" rel="noopener noreferrer">
                  <FaGlobe size={14} />
                  <span>by baydd</span>
                </DevBy>
              </div>

              <div style={{ flex: 1, maxWidth: '600px', margin: '0 1.5rem' }}>
                <ChannelList onSelectChannel={handleAddStream} />
              </div>

              <ButtonGroup>
                <IconButton
                  onClick={() => history.push('/')}
                  title="Home"
                  aria-label="Home"
                >
                  <FaArrowLeft />
                </IconButton>
                <IconButton
                  as="a"
                  href="https://github.com/baydd/multi-live-stream-viewer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="HLS Link Extension (GitHub)"
                  aria-label="HLS Link Extension (GitHub)"
                >
                  <FaLink />
                  <span
                    style={{ marginLeft: '0.25rem', display: 'inline-block', minWidth: '60px' }}
                  >
                    Extension
                  </span>
                </IconButton>

                <IconButton
                  onClick={() => setIsEditMode(!isEditMode)}
                  title="Edit Mode (Ctrl+E)"
                  aria-label="Edit Mode (Ctrl+E)"
                  active={isEditMode}
                >
                  <FaEdit />
                </IconButton>

                <IconButton
                  onClick={() => setIsPresetsOpen(true)}
                  title="Stream Presets (Ctrl+P)"
                  aria-label="Stream Presets (Ctrl+P)"
                >
                  <FaBookmark />
                </IconButton>

                <IconButton
                  onClick={() => setIsWatchTogetherOpen(true)}
                  title="Watch Together"
                  aria-label="Watch Together"
                >
                  <FaUsers />
                </IconButton>

                <IconButton
                  onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                  title="Performance Monitor (Ctrl+M)"
                  aria-label="Performance Monitor (Ctrl+M)"
                  active={showPerformanceMonitor}
                >
                  <FaChartLine />
                </IconButton>

                <LanguageButton
                  onClick={cycleLanguage}
                  title={`Change Language (${getLanguageLabel(language)})`}
                  aria-label={`Change Language (${getLanguageLabel(language)})`}
                >
                  <FaGlobe />
                  <span>{getLanguageLabel(language)}</span>
                </LanguageButton>

                <IconButton
                  onClick={navigateToUpdates}
                  title="Updates & News"
                  aria-label="Check for updates and news"
                >
                  <FaBell />
                </IconButton>

                <IconButton
                  onClick={toggleTheme}
                  title={`${isDarkMode ? 'Light' : 'Dark'} Mode (Ctrl+T)`}
                  aria-label={`${isDarkMode ? 'Light' : 'Dark'} Mode (Ctrl+T)`}
                >
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </IconButton>

                <IconButton
                  onClick={toggleSettings}
                  title="Settings (Ctrl+S)"
                  aria-label="Settings (Ctrl+S)"
                  style={{
                    background: isSettingsOpen ? `${darkTheme.primary}20` : 'transparent',
                    border: isSettingsOpen ? `1px solid ${darkTheme.primary}40` : 'none',
                  }}
                >
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

            <StreamPresets
              visible={isPresetsOpen}
              onClose={() => setIsPresetsOpen(false)}
              onLoadPreset={handleLoadPreset}
              currentStreams={streams}
              currentChannelCount={channelCount}
            />

            <PerformanceMonitor visible={showPerformanceMonitor} />

            <KeyboardShortcuts
              visible={isShortcutsOpen}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kb-title"
            >
              <h3
                id="kb-title"
                style={{
                  marginBottom: '1rem',
                  color: 'inherit',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}
              >
                Keyboard Shortcuts
              </h3>
              <ShortcutItem>
                <span>Toggle Edit Mode</span>
                <ShortcutKey>Ctrl + E</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Open Settings</span>
                <ShortcutKey>Ctrl + S</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Open Presets</span>
                <ShortcutKey>Ctrl + P</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Toggle Theme</span>
                <ShortcutKey>Ctrl + T</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Performance Monitor</span>
                <ShortcutKey>Ctrl + M</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Paste Stream URL</span>
                <ShortcutKey>Ctrl + V</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Select All (Edit Mode)</span>
                <ShortcutKey>Ctrl + A</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Delete Selected</span>
                <ShortcutKey>Delete</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Close Panels</span>
                <ShortcutKey>Escape</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Show Shortcuts</span>
                <ShortcutKey>Ctrl + /</ShortcutKey>
              </ShortcutItem>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => setIsShortcutsOpen(false)}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: '1px solid currentColor',
                    color: 'inherit',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Close
                </button>
              </div>
            </KeyboardShortcuts>
          </AppContainer>
        </Route>
        <Route path="/updates">
          <UpdatesPage onBack={handleBack} />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
