import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
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
  FaTimes, 
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
import { getPreferences, saveStreams, saveSettings } from './utils/storage';
import './i18n';

// =========================================================
// YENİ TASARIM STİLLERİ (GELİŞTİRİLDİ)
// =========================================================

// Animasyonlar
const neonGlow = keyframes`
  from {
    box-shadow: 0 0 5px rgba(56, 189, 248, 0.4), 0 0 10px rgba(56, 189, 248, 0.2);
  }
  to {
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.6), 0 0 15px rgba(56, 189, 248, 0.4);
  }
`;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
    user-select: none;
    transition: background 0.3s ease, color 0.3s ease;
  }

  .react-grid-item {
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    transition-property: left, top, width, height;
    border-radius: 12px; 
    overflow: hidden; 
  }

  .react-grid-item.react-grid-placeholder {
    background: ${(props) => `${props.theme.primary}50`};
    opacity: 0.6;
    transition-duration: 150ms;
    z-index: 2;
    border-radius: 12px;
    border: 2px dashed ${(props) => props.theme.primary};
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    bottom: -8px;
    right: -8px;
    cursor: se-resize;
    background: ${(props) => props.theme.primary};
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 0 10px ${(props) => `${props.theme.primary}50`};
  }

  .react-grid-item:hover > .react-resizable-handle {
    opacity: 1;
    transform: scale(1.1);
  }

  .react-grid-item > .react-resizable-handle::after {
    content: "◢";
    color: white;
    font-size: 10px;
    line-height: 1;
    transform: rotate(0deg);
    font-weight: bold;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => `${props.theme.background}00`};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.border};
    border-radius: 4px;
    border: 2px solid ${(props) => props.theme.background};
    transition: background 0.2s ease;
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
  padding-top: 72px;
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    padding-top: 64px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: ${(props) => `${props.theme.cardBackground}c0`}; 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${(props) => `${props.theme.border}40`};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 72px;
  transition: all 0.3s ease;

  /* Neon alt çizgi efekti */
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${(props) => `${props.theme.primary}80`}, transparent);
    box-shadow: 0 0 10px ${(props) => `${props.theme.primary}50`}; 
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    height: 64px;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 900;
  /* Geliştirme: Tema objesindeki birincil ve ikincil renkleri kullanarak daha dinamik bir degrade */
  background: ${(props) =>
    `linear-gradient(135deg, ${props.theme.primary}, ${props.theme.secondary || '#38bdf8'})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.05em;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
  position: relative;
  text-shadow: 0 0 8px ${(props) => `${props.theme.primary}50`}; 

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const DevBy = styled.a`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => `${props.theme.text}c0`};
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-right: 2rem;
  opacity: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: ${(props) => `${props.theme.background}20`};
  border: 1px solid ${(props) => `${props.theme.border}50`};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    color: ${(props) => props.theme.primary};
    background: ${(props) => `${props.theme.primary}10`};
    border-color: ${(props) => props.theme.primary};
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px ${(props) => `${props.theme.primary}30`};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.375rem;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0.375rem;
  background: ${(props) => `${props.theme.cardBackground}80`};
  border-radius: 16px;
  border: 1px solid ${(props) => `${props.theme.border}40`};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: ${neonGlow} 3s ease-in-out infinite alternate;

  @media (max-width: 768px) {
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: 12px;
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
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 40px;
  height: 40px;
  box-shadow: ${(props) => (props.active ? `0 0 15px ${props.theme.primary}80` : 'none')};
  opacity: ${(props) => (props.disabled ? '0.5' : '1')};
  font-weight: 500;

  /* GELİŞTİRME: Daha zarif bir hover/focus efekti ve erişilebilirlik eklendi */
  &:hover:not([disabled]), &:focus-visible:not([disabled]) {
    background: ${(props) => {
      if (props.active) return props.theme.primary;
      if (props.variant === 'success') return props.theme.success;
      return `${props.theme.background}50`; // Opaklık biraz artırıldı
    }};
    transform: scale(1.08); /* Hafif, zarif büyüme */
    box-shadow: 0 0 12px ${(props) => (props.active ? props.theme.primary : props.theme.primary)}50; /* Odak/Hover için hafif parlama */
    color: ${(props) =>
      props.active || props.variant === 'success' ? '#ffffff' : props.theme.primary};
    outline: none; /* Kendi focus stilimizi kullanıyoruz */
  }

  &:active:not([disabled]) {
    transform: scale(0.95); /* Tıklama hissi */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    padding: 0.5rem;
    font-size: 1rem;
  }
`;

const LanguageButton = styled(IconButton)`
  /* IconButton'dan miras alınan temel stiller burada. */
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  min-width: auto;
  font-weight: 600;
  
  /* Temel Stillerin Üzerine Yazılması (Öncelik için !important kaldırıldı) */
  background: ${(props) => `${props.theme.background}40`};
  border: 1px solid ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};

  /* GELİŞTİRME: IconButton'ın hover stilini override ediyoruz */
  &:hover:not([disabled]), &:focus-visible:not([disabled]) {
    /* IconButton'daki transform ve box-shadow'u sıfırlıyoruz */
    transform: none; 
    box-shadow: none;

    /* Kendi hover stili */
    background: ${(props) => `${props.theme.primary}15`};
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
  
  &:active:not([disabled]) {
    transform: scale(0.95);
  }

  span {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
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
  background: ${(props) => `${props.theme.cardBackground}f0`};
  backdrop-filter: blur(20px);
  border: 2px solid ${(props) => `${props.theme.primary}40`};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${(props) => `${props.theme.primary}30`};
  display: ${(props) => (props.visible ? 'block' : 'none')};
  z-index: 2000;
  max-width: 500px;
  width: 90%;
  animation: ${keyframes`from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); }`} 0.3s ease-out;
  position: relative; /* Kapatma butonu için */
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed ${(props) => `${props.theme.border}80`};
  font-size: 1rem;

  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutKey = styled.kbd`
  background: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.primary};
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-family: 'SF Mono', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.primary};
  font-weight: 700;
  box-shadow: 0 0 5px ${(props) => `${props.theme.primary}30`};
`;

// =========================================================
// MEVCUT REACT YAPISI
// =========================================================

const defaultChannelCount = 6;

type Language = 'tr' | 'en' | 'ar' | 'es' | 'zh' | 'ru' | 'pt';

const AppContent: React.FC = () => {
  const history = useHistory();
  const { i18n, t } = useTranslation();
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
      if (!(e.ctrlKey && e.key.toLowerCase() === 'v')) return;

      try {
        if (!('clipboard' in navigator) || !('readText' in navigator.clipboard)) {
          console.warn('Clipboard API not supported or permissions denied.');
          return; 
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
          // TS2322 HATASI ÇÖZÜMÜ: t() dönüşünü kesin olarak string tipinde zorluyoruz.
          title: t('Stream {{index}}', { index: targetIndex + 1 }) as string, 
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
  }, [streams, channelCount, t]);

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
      saveStreams(last); // Geri alma sonrası kaydetme
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

  // Klavye kısayollarını dinleme
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'e':
                    e.preventDefault();
                    setIsEditMode(prev => !prev);
                    break;
                case 's':
                    e.preventDefault();
                    setIsSettingsOpen(prev => !prev);
                    break;
                case 'p':
                    e.preventDefault();
                    setIsPresetsOpen(prev => !prev);
                    break;
                case 't':
                    e.preventDefault();
                    toggleTheme();
                    break;
                case 'm':
                    e.preventDefault();
                    setShowPerformanceMonitor(prev => !prev);
                    break;
                case '/': // Ctrl + / için
                    e.preventDefault();
                    setIsShortcutsOpen(prev => !prev);
                    break;
                case 'z': // Ctrl + Z ile geri alma eklenebilir.
                    e.preventDefault();
                    handleUndo();
                    break;
                default:
                    break;
            }
        }
        if (e.key === 'Escape') {
            if (isSettingsOpen) setIsSettingsOpen(false);
            else if (isWatchTogetherOpen) setIsWatchTogetherOpen(false);
            else if (isPresetsOpen) setIsPresetsOpen(false);
            else if (isShortcutsOpen) setIsShortcutsOpen(false);
        }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSettingsOpen, isWatchTogetherOpen, isPresetsOpen, isShortcutsOpen, toggleTheme, handleUndo]);

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
                <IconButton onClick={() => history.push('/')} title="Home" aria-label="Home">
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
                  onClick={handleUndo}
                  title="Undo Last Action (Ctrl+Z)"
                  aria-label="Undo Last Action (Ctrl+Z)"
                  disabled={previousStreams.length === 0}
                >
                  <span style={{ fontSize: '1.5rem', lineHeight: '0.8', fontWeight: 'bold' }}>&#x21BA;</span>
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
                  active={isSettingsOpen}
                >
                  <FaCog />
                </IconButton>

                {/* Kısayol Butonu */}
                <IconButton
                  onClick={() => setIsShortcutsOpen(true)}
                  title="Shortcuts (Ctrl+/)"
                  aria-label="View keyboard shortcuts"
                  active={isShortcutsOpen}
                >
                  <FaKeyboard />
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
              {/* GELİŞTİRME: Kapatma butonu eklendi */}
              <IconButton 
                onClick={() => setIsShortcutsOpen(false)}
                title="Close Shortcuts"
                aria-label="Close keyboard shortcuts"
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
              >
                <FaTimes />
              </IconButton>
              
              <h3
                id="kb-title"
                style={{
                  marginBottom: '1rem',
                  color: 'inherit',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  borderBottom: `2px solid ${isDarkMode ? darkTheme.primary : lightTheme.primary}`,
                  paddingBottom: '0.5rem',
                }}
              >
                Keyboard Shortcuts
              </h3>
              <ShortcutItem>
                <span>Toggle Edit Mode</span>
                <ShortcutKey>Ctrl + E</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Undo Last Action</span>
                <ShortcutKey>Ctrl + Z</ShortcutKey>
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
                <span>Paste Stream URL (Paste into first empty slot or expand grid)</span>
                <ShortcutKey>Ctrl + V</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Toggle Shortcuts Panel</span>
                <ShortcutKey>Ctrl + /</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Close All Panels</span>
                <ShortcutKey>Escape</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Select All (Edit Mode)</span>
                <ShortcutKey>Ctrl + A</ShortcutKey>
              </ShortcutItem>
              <ShortcutItem>
                <span>Delete Selected</span>
                <ShortcutKey>Delete</ShortcutKey>
              </ShortcutItem>
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                {/* GELİŞTİRME: Ana Kapatma butonu IconButton stili ile güncellendi */}
                <IconButton
                  onClick={() => setIsShortcutsOpen(false)}
                  autoFocus
                  variant="primary"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    height: 'auto', 
                    minWidth: '100px',
                    // Özel hover efektini korumak için transform'u devre dışı bırak
                    transform: 'none', 
                    boxShadow: isDarkMode ? `0 0 10px ${darkTheme.primary}40` : 'none',
                  }}
                  title="Close"
                  aria-label="Close keyboard shortcuts"
                >
                  Close
                </IconButton>
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