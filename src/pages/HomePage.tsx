import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled, { css, createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import { FaTv, FaSearch, FaFilter, FaTimes, FaPlay, FaGlobe } from 'react-icons/fa';
import { loadAllChannels, Channel } from '../utils/m3uParser';
import { useTranslation } from 'react-i18next';

// ===== ANIMATIONS =====
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ===== GLOBAL STYLES (Custom Scrollbar) =====
// Eğer projende global style varsa burayı oraya taşıyabilirsin.
const ScrollStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// ===== LAYOUT =====
const Page = styled.div`
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  background: ${(p) => p.theme.background};
  color: ${(p) => p.theme.text};
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  flex-shrink: 0;
  height: 50px;
`;

const Brand = styled.h1`
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.03em;
  background: ${(p) => p.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const DevBy = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.text};
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${(p) => p.theme.background}40;
  border: 1px solid ${(p) => p.theme.border};

  &:hover {
    color: ${(p) => p.theme.primary};
    background: ${(p) => p.theme.primary}15;
    border-color: ${(p) => p.theme.primary}30;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

// Ortak Buton Stili (Glassy)
const primaryStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  background: ${(p) => `linear-gradient(135deg, ${p.theme.primary}, ${p.theme.primaryDark})`};
  color: #fff;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px ${(p) => p.theme.shadow || 'rgba(0, 0, 0, 0.15)'};
  border: 1px solid ${(p) => p.theme.border};

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px ${(p) => p.theme.shadowLg || 'rgba(0, 0, 0, 0.25)'};
  }
  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryLink = styled(Link)`
  ${primaryStyle}
`;
const PrimaryButton = styled.button`
  ${primaryStyle}
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

// Glassmorphism Card Base
const Card = styled.div`
  background: ${(p) => p.theme.cardBackground};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 20px;
  box-shadow: ${(p) => p.theme.shadowLg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

// ===== COUNTRY PANEL =====
const CountryPanel = styled(Card)`
  @media (max-width: 1000px) {
    height: 300px;
    margin-bottom: 20px;
  }
`;

const SearchWrapper = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  &:focus-within {
    border-color: #38bdf8;
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const CountryList = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CountryItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  border: 1px solid ${(p) => (p.$active ? 'rgba(56, 189, 248, 0.5)' : 'transparent')};
  border-radius: 12px;
  padding: 10px 14px;
  flex-shrink: 0;
  background: ${(p) =>
    p.$active ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15), transparent)' : 'transparent'};
  color: ${(p) => (p.$active ? '#38bdf8' : '#cbd5e1')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    padding-left: 18px; /* Hover animation */
  }
`;

const Flag = styled.img`
  width: 24px;
  height: 18px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

// ===== CHANNEL PANEL =====
const ChannelPanel = styled(Card)`
  position: relative;
`;

const PanelHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${(p) => p.theme.border};
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${(p) => p.theme.background}40;
  flex-shrink: 0;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h2`
  font-weight: 800;
  font-size: 24px;
  margin: 0;
  line-height: 1.1;
  color: ${(p) => p.theme.text};
`;

const SubTitle = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.textSecondary};
  font-weight: 500;
  margin-top: 4px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const Chip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${(p) => (p.$active ? '#38bdf8' : 'rgba(255,255,255,0.1)')};
  background: ${(p) => (p.$active ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)')};
  color: ${(p) => (p.$active ? '#38bdf8' : 'rgba(255,255,255,0.6)')};
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #38bdf8;
    color: #fff;
    background: rgba(56, 189, 248, 0.1);
  }
`;

const ChannelGrid = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ChannelCard = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  background: ${(p) => p.theme.background}10;
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  min-height: 76px;
  flex-shrink: 0;

  /* Hover Effects */
  &:hover {
    background: ${(p) => p.theme.primary}10;
    border-color: ${(p) => p.theme.primary};
    transform: translateY(-4px);
    box-shadow: ${(p) => p.theme.shadowLg};
  }

  /* Active/Focus State */
  &:active {
    transform: scale(0.98);
  }
`;

const ChannelThumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: ${(p) => p.theme.gradient};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
  text-transform: uppercase;
  box-shadow: inset 0 0 0 1px ${(p) => p.theme.border};
  position: relative;

  /* Play Icon Overlay on Hover */
  &::after {
    content: '▶';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 12px;
  }
  ${ChannelCard}:hover &::after {
    opacity: 1;
  }
`;

const ChannelInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ChannelName = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(p) => p.theme.text};
  transition: color 0.2s;
`;

const Badge = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${(p) => p.theme.success}20;
  color: ${(p) => p.theme.success};
  letter-spacing: 0.05em;
  border: 1px solid ${(p) => p.theme.success}30;
`;

const Empty = styled.div`
  padding: 60px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

// ===== MODAL =====
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeOverlay 0.3s ease-out;
  @keyframes fadeOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  width: min(960px, 100%);
  background: #0f172a;
  color: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 50px 100px -20px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  animation: scaleModal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  @keyframes scaleModal {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #f87171;
  }
`;

const VideoShell = styled.div`
  position: relative;
  background: #000;
  width: 100%;
  aspect-ratio: 16/9;
  video {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: ${(p) => p.theme.background}20;
  border-top: 1px solid ${(p) => p.theme.border};
`;

// ===== Utils & Logic =====
const num = (v: number) => v.toLocaleString('tr-TR');
const flag24 = (cc: string) => `https://flagcdn.com/48x36/${cc.toLowerCase()}.png`;

const getInitials = (name: string) => {
  if (!name) return 'TV';
  const clean = name.replace(/[^\w\s]/gi, '').trim();
  if (!clean) return 'TV';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TV';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
};

const useHls = (url: string | null, media: HTMLVideoElement | null) => {
  useEffect(() => {
    if (!media || !url) return;
    let hls: Hls | null = null;
    const tryPlay = () => media.play().catch(() => undefined);

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(media);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!hls) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              hls = null;
              break;
          }
        }
      });
      tryPlay();
      return () => {
        hls?.destroy();
        hls = null;
        try {
          media.pause();
          media.removeAttribute('src');
          media.load();
        } catch {}
      };
    }
    if (media.canPlayType('application/vnd.apple.mpegurl')) {
      media.src = url;
      tryPlay();
      return () => {
        try {
          media.pause();
          media.removeAttribute('src');
          media.load();
        } catch {}
      };
    }
  }, [url, media]);
};

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [countryQuery, setCountryQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [channelQuery, setChannelQuery] = useState('');
  const [onlyHls, setOnlyHls] = useState(false);

  const [preview, setPreview] = useState<Channel | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  useHls(preview?.url ?? null, videoEl);

  const getLanguageLabel = useCallback((lang: string) => {
    const labels: Record<string, string> = {
      tr: 'TR',
      en: 'EN',
      ar: 'عربي',
      es: 'ES',
      zh: '中文',
      ru: 'РУС',
      pt: 'PT',
    };
    return labels[lang] || lang.toUpperCase();
  }, []);

  const cycleLanguage = useCallback(() => {
    const languages: string[] = ['tr', 'en', 'ar', 'es', 'zh', 'ru', 'pt'];
    const currentIndex = languages.indexOf(i18n.language as string);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  }, [i18n]);

  useEffect(() => {
    document.title = 'multiple.live';
    (async () => {
      try {
        setLoading(true);
        const list = await loadAllChannels();
        setChannels(list);
      } catch (e) {
        console.error(e);
        setError(t('home.loading_error') as string);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const countryMap = useMemo(() => {
    const map: Record<string, { cc: string; name: string; count: number }> = {};
    for (const c of channels) {
      if (!map[c.countryCode])
        map[c.countryCode] = { cc: c.countryCode, name: c.country, count: 0 };
      map[c.countryCode].count++;
    }
    return map;
  }, [channels]);

  const countries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    return Object.values(countryMap)
      .filter((c) =>
        q ? c.name.toLowerCase().includes(q) || c.cc.toLowerCase().includes(q) : true
      )
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [countryMap, countryQuery]);

  const channelsForCountry = useMemo(() => {
    const q = channelQuery.trim().toLowerCase();
    let list = channels.filter((c) => (selectedCountry ? c.countryCode === selectedCountry : true));
    if (onlyHls) list = list.filter((c) => /m3u8/i.test(c.url));
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, selectedCountry, channelQuery, onlyHls]);

  return (
    <>
      <ScrollStyle />
      <Page>
        <TopBar>
          <Brand>
            <FaTv size={26} />
            multiple.live
          </Brand>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <DevBy href="https://github.com/baydd" target="_blank" rel="noopener noreferrer">
              <FaGlobe size={14} />
              <span>by baydd</span>
            </DevBy>
            <PrimaryLink to="/updates">
              {t('home.updates') as string}
            </PrimaryLink>
            <PrimaryButton onClick={cycleLanguage} title={t('change_language') as string}>
              {getLanguageLabel(i18n.language as string)}
            </PrimaryButton>
            <PrimaryLink to="/app" style={{ fontSize: 15, padding: '12px 22px' }}>
              <FaTv /> {t('home.multi_tv_cta') as string}
            </PrimaryLink>
          </div>
        </TopBar>

        <Shell>
          {/* Countries Panel */}
          <CountryPanel>
            <SearchWrapper>
              <SearchBox>
                <FaSearch color="rgba(255,255,255,0.4)" />
                <SearchInput
                  value={countryQuery}
                  onChange={(e) => setCountryQuery(e.target.value)}
                  placeholder={t('home.search_country') as string}
                />
                {countryQuery && (
                  <button
                    onClick={() => setCountryQuery('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <FaTimes />
                  </button>
                )}
              </SearchBox>
            </SearchWrapper>

            <CountryList>
              {loading ? (
                <Empty>
                  <div style={{ fontSize: 14 }}>{t('home.loading') as string}</div>
                </Empty>
              ) : error ? (
                <Empty>{error}</Empty>
              ) : countries.length === 0 ? (
                <Empty>{t('home.no_country') as string}</Empty>
              ) : (
                countries.map((c) => (
                  <CountryItem
                    key={c.cc}
                    $active={selectedCountry === c.cc}
                    onClick={() => setSelectedCountry(selectedCountry === c.cc ? '' : c.cc)}
                  >
                    <Flag
                      loading="lazy"
                      src={flag24(c.cc)}
                      alt={c.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 600 }}>
                      {num(c.count)}
                    </div>
                  </CountryItem>
                ))
              )}
            </CountryList>
          </CountryPanel>

          {/* Channels Panel */}
          <ChannelPanel>
            <PanelHeader>
              <HeaderTop>
                <div>
                  <Title>
                    {selectedCountry
                      ? countryMap[selectedCountry]?.name || selectedCountry.toUpperCase()
                      : (t('home.discover') as string)}
                  </Title>
                  <SubTitle>
                    {selectedCountry
                      ? (t('home.selected_country') as string)
                      : (t('home.select_country_hint') as string)}
                    {' • '}
                    {num(channelsForCountry.length)} Kanal
                  </SubTitle>
                </div>
              </HeaderTop>

              <div style={{ display: 'flex', gap: 12 }}>
                <SearchBox style={{ flex: 1 }}>
                  <FaSearch color="rgba(255,255,255,0.4)" />
                  <SearchInput
                    value={channelQuery}
                    onChange={(e) => setChannelQuery(e.target.value)}
                    placeholder={t('home.search_channel') as string}
                  />
                  {channelQuery && (
                    <button
                      onClick={() => setChannelQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </SearchBox>

                <ChipRow>
                  <Chip $active={onlyHls} onClick={() => setOnlyHls((v) => !v)}>
                    <FaFilter size={10} /> HD (HLS)
                  </Chip>
                  {selectedCountry && (
                    <Chip onClick={() => setSelectedCountry('')}>
                      <FaTimes size={10} /> {t('home.clear') as string}
                    </Chip>
                  )}
                </ChipRow>
              </div>
            </PanelHeader>

            <ChannelGrid>
              {loading ? (
                <Empty>{t('home.loading_channels') as string}</Empty>
              ) : error ? (
                <Empty>
                  {error}
                  <div style={{ marginTop: 10 }}>
                    <PrimaryButton onClick={() => window.location.reload()}>
                      {t('home.retry') as string}
                    </PrimaryButton>
                  </div>
                </Empty>
              ) : channelsForCountry.length === 0 ? (
                <Empty>
                  <FaTv size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                  {selectedCountry
                    ? (t('home.no_channels') as string)
                    : (t('home.start_hint') as string)}
                </Empty>
              ) : (
                channelsForCountry.map((ch) => (
                  <ChannelCard
                    key={ch.id}
                    onClick={() => setPreview(ch)}
                    title={`${ch.name} • ${ch.country}`}
                  >
                    <ChannelThumb>{getInitials(ch.name)}</ChannelThumb>
                    <ChannelInfo>
                      <ChannelName>{ch.name}</ChannelName>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <Badge>{/m3u8/i.test(ch.url) ? 'LIVE' : 'VOD'}</Badge>
                        <span>{ch.country}</span>
                      </div>
                    </ChannelInfo>
                    <div style={{ color: '#38bdf8', opacity: 0.8 }}>
                      <FaPlay size={12} />
                    </div>
                  </ChannelCard>
                ))
              )}
            </ChannelGrid>
          </ChannelPanel>
        </Shell>

        {/* Video Preview Modal */}
        {preview && (
          <Overlay onClick={() => setPreview(null)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      background: '#22c55e',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      boxShadow: '0 0 10px #22c55e',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{preview.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>{preview.country} Yayını</div>
                  </div>
                </div>
                <CloseBtn onClick={() => setPreview(null)} title={t('cancel') as string}>
                  <FaTimes size={16} />
                </CloseBtn>
              </ModalHeader>

              <VideoShell>
                <video ref={setVideoEl} controls playsInline muted autoPlay />
              </VideoShell>

              <ModalFooter>
                <button
                  onClick={() => window.open(preview.url, '_blank')?.focus()}
                  style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {t('home.source_link') as string}
                </button>
                <PrimaryLink to="/app" style={{ padding: '8px 20px', fontSize: 13 }}>
                  <FaTv /> {t('home.multi_tv_add') as string}
                </PrimaryLink>
              </ModalFooter>
            </Modal>
          </Overlay>
        )}
      </Page>
    </>
  );
};

export default HomePage;
