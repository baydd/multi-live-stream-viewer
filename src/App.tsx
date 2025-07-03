import React, { useState, useEffect, useCallback } from 'react';
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
  FaLink
} from 'react-icons/fa';
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
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    user-select: none;
  }

  .react-grid-item {
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    transition-property: left, top, width, height;
  }

  .react-grid-item.react-grid-placeholder {
    background: ${props => props.theme.primary}30;
    opacity: 0.4;
    transition-duration: 100ms;
    z-index: 2;
    border-radius: 6px;
    border: 1px dashed ${props => props.theme.primary};
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 2px;
    right: 2px;
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
    background: ${props => props.theme.scrollbar.track};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.scrollbar.thumb};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.primary};
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
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  position: relative;
  z-index: 100;
  height: 60px;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  background: ${props => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.025em;
`;

const DevBy = styled.a`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.secondary};
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  margin-right: 1rem;
  opacity: 0.8;
  
  &:hover {
    color: ${props => props.theme.primary};
    opacity: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.375rem;
  align-items: center;
`;

const IconButton = styled.button<{ active?: boolean; variant?: 'primary' | 'secondary' | 'success' }>`
  background: ${props => {
    if (props.active) return props.theme.primary;
    if (props.variant === 'success') return props.theme.success;
    return 'transparent';
  }};
  border: 1px solid ${props => {
    if (props.active) return props.theme.primary;
    if (props.variant === 'success') return props.theme.success;
    return props.theme.border;
  }};
  color: ${props => {
    if (props.active || props.variant === 'success') return '#ffffff';
    return props.theme.text;
  }};
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  min-width: 40px;
  height: 40px;
  
  &:hover {
    background: ${props => {
      if (props.active) return props.theme.primary;
      if (props.variant === 'success') return props.theme.success;
      return props.theme.hover;
    }};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    border-color: ${props => props.theme.primary};
    color: ${props => props.active || props.variant === 'success' ? '#ffffff' : props.theme.primary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const LanguageButton = styled(IconButton)`
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  min-width: auto;
  
  span {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }
`;

const KeyboardShortcuts = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadowLg};
  display: ${props => props.visible ? 'block' : 'none'};
  z-index: 1000;
  max-width: 450px;
  width: 90%;
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${props => props.theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutKey = styled.kbd`
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: ${props => props.theme.primary};
  font-weight: 500;
`;

const defaultChannelCount = 6;

type Language = 'tr' | 'en' | 'ar' | 'es' | 'zh' | 'ru' | 'pt';

const App: React.FC = () => {
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

  // Auto-save streams and channel count
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('streams', JSON.stringify(streams));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [streams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('channelCount', channelCount.toString());
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [channelCount]);

  // Ctrl+V paste handler for adding streams
  useEffect(() => {
    const handlePaste = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'v') {
        try {
          const clipboardText = await navigator.clipboard.readText();
          
          // Check if it's a valid URL
          if (clipboardText && (clipboardText.startsWith('http') || clipboardText.includes('.'))) {
            // Find first empty slot or add new one
            let targetIndex = streams.findIndex(stream => !stream.url || stream.url.trim() === '');
            
            if (targetIndex === -1) {
              // No empty slot found, add new stream if under channel count
              if (streams.length < channelCount) {
                targetIndex = streams.length;
              } else {
                // Increase channel count and add new stream
                setChannelCount(prev => prev + 1);
                targetIndex = streams.length;
              }
            }

            // Auto-detect platform
            let platform: Stream['platform'] = 'hls';
            if (clipboardText.includes('youtube.com') || clipboardText.includes('youtu.be')) {
              platform = 'youtube';
            } else if (clipboardText.includes('twitch.tv')) {
              platform = 'twitch';
            } else if (clipboardText.includes('kick.com')) {
              platform = 'kick';
            } else if (clipboardText.includes('twitter.com') || clipboardText.includes('x.com')) {
              platform = 'twitter';
            }

            const newStream: Stream = {
              id: Date.now().toString(),
              url: clipboardText,
              title: `Stream ${targetIndex + 1}`,
              platform,
              category: '',
              notes: '',
              layout: {
                x: targetIndex % 3,
                y: Math.floor(targetIndex / 3),
                w: 1,
                h: 1,
              }
            };

            if (targetIndex < streams.length) {
              // Replace existing empty stream
              const updatedStreams = [...streams];
              updatedStreams[targetIndex] = newStream;
              setStreams(updatedStreams);
            } else {
              // Add new stream
              setStreams(prev => [...prev, newStream]);
            }
          }
        } catch (error) {
          console.error('Failed to read clipboard:', error);
        }
      }
    };

    document.addEventListener('keydown', handlePaste);
    return () => document.removeEventListener('keydown', handlePaste);
  }, [streams, channelCount]);

  const handleAddStream = useCallback((stream: Stream) => {
    setPreviousStreams(prev => [...prev, streams]);
    const newStreams = [...streams, stream];
    setStreams(newStreams);
  }, [streams]);

  const handleRemoveStream = useCallback((id: string) => {
    setPreviousStreams(prev => [...prev, streams]);
    const newStreams = streams.filter(stream => stream.id !== id);
    setStreams(newStreams);
  }, [streams]);

  const handleUpdateStreams = useCallback((newStreams: Stream[]) => {
    setPreviousStreams(prev => [...prev, streams]);
    setStreams(newStreams);
    saveStreams(newStreams);
  }, [streams]);

  const handleUpdateChannelCount = useCallback((count: number) => {
    setChannelCount(count);
  }, []);

  const handleUndo = useCallback(() => {
    setPreviousStreams(prev => {
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
      pt: 'PT'
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

  const handleLoadPreset = useCallback((presetStreams: Stream[], presetChannelCount: number) => {
    setPreviousStreams(prev => [...prev, streams]);
    setStreams(presetStreams);
    setChannelCount(presetChannelCount);
  }, [streams]);

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
              as="a"
              href="https://github.com/baydd/multi-live-stream-viewer/"
              target="_blank"
              rel="noopener noreferrer"
              title="HLS Link Extension (GitHub)"
              style={{ textDecoration: 'none' }}
            >
              <FaLink style={{ marginRight: 6 }} />
              Extension
            </IconButton>
            <IconButton 
              onClick={() => setIsEditMode(!isEditMode)} 
              title="Edit Mode (Ctrl+E)"
              active={isEditMode}
            >
              <FaEdit />
            </IconButton>
            <IconButton 
              onClick={() => setIsPresetsOpen(true)} 
              title="Stream Presets (Ctrl+P)"
            >
              <FaBookmark />
            </IconButton>
            <IconButton 
              onClick={() => setIsWatchTogetherOpen(true)} 
              title="Watch Together"
            >
              <FaUsers />
            </IconButton>
            <IconButton 
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)} 
              title="Performance Monitor (Ctrl+M)"
              active={showPerformanceMonitor}
            >
              <FaChartLine />
            </IconButton>
            <LanguageButton onClick={cycleLanguage} title="Change Language">
              <FaGlobe />
              <span>{getLanguageLabel(language)}</span>
            </LanguageButton>
            <IconButton onClick={toggleTheme} title={`${isDarkMode ? "Light" : "Dark"} Mode (Ctrl+T)`}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </IconButton>
            <IconButton onClick={toggleSettings} title="Settings (Ctrl+S)">
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

        <KeyboardShortcuts visible={isShortcutsOpen}>
          <h3 style={{ marginBottom: '1rem', color: 'inherit', fontSize: '1.1rem', fontWeight: '600' }}>Keyboard Shortcuts</h3>
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
              style={{
                background: 'transparent',
                border: '1px solid currentColor',
                color: 'inherit',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
            >
              Close
            </button>
          </div>
        </KeyboardShortcuts>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;