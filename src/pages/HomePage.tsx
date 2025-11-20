import React, { useEffect, useMemo, useState, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { FaTv, FaSearch, FaTimes, FaPlay, FaGlobe, FaChevronLeft, FaBell } from 'react-icons/fa';
import { loadAllChannels, Channel } from '../utils/m3uParser';
import { useTranslation } from 'react-i18next';
import ChannelList from '../components/ChannelList';
import { Stream, Language } from '../types';
import { saveSettings } from '../utils/storage';

// ===== GLOBAL STYLES & ANIMATIONS =====
const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const ScrollStyle = createGlobalStyle`
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
`;

// ===== LAYOUT COMPONENTS =====
const Page = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #020617; /* Çok koyu lacivert/siyah */
  color: #fff;
  font-family: 'Inter', sans-serif;
  position: relative;
`;

const GlobeContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

// Üst Bar (Overlay)
const OverlayTopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.9) 0%, transparent 100%);
  pointer-events: none; /* Tıklamalar arkadaki küreye geçsin diye */

  & > * {
    pointer-events: auto; /* İçindeki butonlar tıklanabilir olsun */
  }
`;

const Brand = styled.h1`
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #fff;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const StatBadge = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TopButton = styled(StatBadge)`
  cursor: pointer;
  text-decoration: none;
  color: #fff;
`;

const LanguageButton = styled(StatBadge)`
  cursor: pointer;
  gap: 8px;
`;

// Sağ Panel (Kanal Listesi)
const SidePanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: rgba(15, 23, 42, 0.85); /* Glassy Dark Blue */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 20;
  transform: translateX(${(p) => (p.$isOpen ? '0' : '100%')});
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 0, 0, 0.2);
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 0;
  margin-bottom: 8px;
  font-weight: 600;
  transition: color 0.2s;
  &:hover {
    color: #38bdf8;
  }
`;

const ChannelGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChannelCard = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ChannelThumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 16px;
  padding-left: 40px;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
  &:focus {
    border-color: #38bdf8;
    background: rgba(0, 0, 0, 0.5);
  }
`;

// ===== MODAL & VIDEO =====
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

const Modal = styled.div`
  width: min(900px, 100%);
  background: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
`;

const VideoShell = styled.div`
  aspect-ratio: 16/9;
  background: #000;
  video {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

// ===== UTILS & HOOKS =====
const getInitials = (name: string) => {
  if (!name) return 'TV';
  // İsimdeki ilk iki kelimenin baş harflerini al (Türkçe karakterleri dönüştürmeden)
  return name
    .split(/\s+/) // Boşluklara göre ayır
    .filter(Boolean) // Boş stringleri filtrele
    .slice(0, 2) // İlk iki kelimeyi al
    .map(word => word.charAt(0)) // Baş harflerini al
    .join('')
    .toUpperCase()
    || 'TV';
};

const useHls = (url: string | null, media: HTMLVideoElement | null) => {
  useEffect(() => {
    if (!media || !url) return;
    let hls: Hls | null = null;

    const playVideo = () => {
      // Oynatma denemesi
      media.play().catch((err) => console.warn('Autoplay blocked:', err));
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(media);
      hls.on(Hls.Events.MANIFEST_PARSED, () => playVideo());
    } else if (media.canPlayType('application/vnd.apple.mpegurl')) {
      media.src = url;
      media.addEventListener('loadedmetadata', () => playVideo(), { once: true });
    }

    return () => {
      if (hls) hls.destroy();
      media.removeAttribute('src');
      // Media elementi tekrar kullanılacağı için src'yi sıfırlamak iyi bir uygulamadır.
    };
  }, [url, media]);
};

// ===== MAIN PAGE COMPONENT =====
const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const globeEl = useRef<GlobeMethods | undefined>(undefined);

  // --- STATE ---
  const [channels, setChannels] = useState<Channel[]>([]);
  const [geoJson, setGeoJson] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [preview, setPreview] = useState<Channel | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

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

  const cycleLanguage = () => {
    const languages: Language[] = ['tr', 'en', 'ar', 'es', 'zh', 'ru', 'pt'];
    const current = (i18n.language as Language) || 'tr';
    const idx = languages.indexOf(current);
    const next = languages[(idx + 1) % languages.length];
    i18n.changeLanguage(next);
    saveSettings({ language: next });
  };

  // Hook: HLS Player Logic
  useHls(preview?.url ?? null, videoEl);

  // --- EFFECT: Load Data ---
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Kanalları yükle
        const list = await loadAllChannels();
        setChannels(list);

        // 2. Dünya Haritası Verisi (GeoJSON)
        const res = await fetch(
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
        );
        if (!res.ok) throw new Error('GeoJSON fetch failed');
        const data = await res.json();
        setGeoJson(data);
      } catch (e) {
        console.error('Data load error', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- MEMO: Country Statistics ---
  const countryStats = useMemo(() => {
    const stats: Record<string, { count: number; name: string }> = {};
    channels.forEach((c) => {
      if (!c.countryCode) return;
      const cc = c.countryCode.toUpperCase();
      // Ülke adı mevcutsa onu kullan, yoksa kodu kullan.
      const countryName = c.country || c.countryCode || cc; 
      if (!stats[cc]) stats[cc] = { count: 0, name: countryName };
      stats[cc].count++;
      // GeoJSON'dan gelen ülke adı daha doğru olabilir, ancak m3u'dan gelen veriyi kullanıyoruz.
    });
    return stats;
  }, [channels]);

  // --- MEMO: Active Channels for Side Panel ---
  const activeChannels = useMemo(() => {
    if (!selectedCountry) return [];
    const q = searchQuery.toLowerCase();
    return channels
      .filter((c) => c.countryCode?.toUpperCase() === selectedCountry)
      .filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, selectedCountry, searchQuery]);

  // --- HANDLERS ---
  const handlePolygonClick = (polygon: any) => {
    const cc = polygon.properties?.ISO_A2;
    if (cc && countryStats[cc]) {
      setSelectedCountry(cc);
      setSearchQuery(''); // Reset search on new country

      // Opsiyonel: Tıklanan ülkeye zoom yap
      if (globeEl.current) {
        // Şu anki versiyonumuzda zoom kodunu basitleştirdik, ancak bu kısım re-globe.gl ile daha da geliştirilebilir.
        // İstenirse pointOfView ayarlanabilir.
      }
    } else {
      // Kanalı olmayan bir ülkeye tıklanırsa paneli kapat.
      setSelectedCountry(null);
    }
  };

  const getPolygonLabel = (d: any) => {
    const cc = d.properties?.ISO_A2;
    const stat = countryStats[cc];
    if (stat) {
      // Tooltip HTML String
      return `
        <div style="
          background: rgba(15, 23, 42, 0.9); 
          color: white; 
          padding: 8px 12px; 
          border-radius: 6px; 
          font-family: sans-serif; 
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          text-align: center;
        ">
          <div style="font-weight: 700; margin-bottom: 2px;">${stat.name}</div>
          <div style="font-size: 12px; color: #38bdf8;">${stat.count} Channels</div>
        </div>
      `;
    }
    return ''; // String döndürmek önemli (null hata verebilir)
  };

  return (
    <>
      <ScrollStyle />
      <Page>
        {/* --- TOP BAR --- */}
        <OverlayTopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Brand>
              <FaGlobe color="#38bdf8" /> multiple.live
            </Brand>
            {/* GitHub Butonu */}
            <a
              href="https://github.com/baydd"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <TopButton>
                <FaGlobe /> by baydd
              </TopButton>
            </a>
            {/* Hinekst Butonu (İstenen Eklenti) */}
            <a
              href="https://hinekst.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <TopButton>
                <FaGlobe /> Hinekst
              </TopButton>
            </a>
            {/* Botkurtz Butonu (İstenen Eklenti) */}
            <a
              href="https://botkurtz.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <TopButton>
                <FaGlobe /> Botkurtz
              </TopButton>
            </a>
          </div>

          <div style={{ flex: 1, maxWidth: 560, margin: '0 12px' }}>
            <ChannelList
              onSelectChannel={(stream: Stream) => {
                const found = channels.find((c) => c.id === stream.id);
                if (found) {
                  setSelectedCountry(found.countryCode?.toUpperCase() ?? null);
                  setPreview(found);
                } else {
                  // Kanal listesinde bulunmayan m3u linkleri için geçici önizleme
                  const fallback: Channel = {
                    id: stream.id,
                    name: stream.title || 'External Stream',
                    url: stream.url,
                    country: '',
                    countryCode: '',
                  };
                  setSelectedCountry(null); // Harita panelini kapat
                  setPreview(fallback);
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <StatBadge>
              <FaTv color="#22c55e" /> {channels.length.toLocaleString()}
            </StatBadge>
            <Link to="/updates" style={{ textDecoration: 'none' }}>
              <TopButton>
                <FaBell /> {t('home.updates') || 'Updates'}
              </TopButton>
            </Link>
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <TopButton style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8' }}>
                {t('home.multi_tv_cta') || 'Open Multi TV Player'}
              </TopButton>
            </Link>
            <LanguageButton onClick={cycleLanguage}>
              <FaGlobe /> {getLanguageLabel((i18n.language as Language) || 'tr')}
            </LanguageButton>
          </div>
        </OverlayTopBar>

        {/* --- 3D GLOBE --- */}
        <GlobeContainer>
          {geoJson && (
            <Globe
              ref={globeEl}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              lineHoverPrecision={0}
              polygonsData={geoJson.features.filter((d: any) => d.properties.ISO_A2 !== 'AQ')} // Antarktika hariç
              // Appearance Logic
              polygonAltitude={(d: any) =>
                d === hoveredCountry || d.properties.ISO_A2 === selectedCountry ? 0.08 : 0.01
              }
              polygonCapColor={(d: any) => {
                const cc = d.properties.ISO_A2;
                // 1. Seçili Ülke (Parlak Neon Mavi)
                if (cc === selectedCountry) return '#0ea5e9';

                // 2. Kanalı Olan Ülkeler (Miktar bazlı opaklık)
                const stat = countryStats[cc];
                if (stat) {
                  // Basit normalizasyon: Max 50 kanal gibi düşünerek opaklık ayarla (0.2 ile 0.9 arası)
                  const intensity = Math.min(stat.count / 30, 1);
                  return `rgba(14, 165, 233, ${0.2 + intensity * 0.6})`;
                }

                // 3. Kanalı Olmayan Ülkeler (Çok silik)
                return 'rgba(255,255,255,0.04)';
              }}
              polygonSideColor={() => 'rgba(0,0,0,0.3)'}
              polygonStrokeColor={(d: any) => {
                const cc = d.properties.ISO_A2;
                // Kanalı olanların sınırları belli olsun
                return countryStats[cc] ? 'rgba(14, 165, 233, 0.4)' : 'rgba(255,255,255,0.05)';
              }}
              // Interaction
              polygonLabel={getPolygonLabel}
              onPolygonHover={setHoveredCountry}
              onPolygonClick={handlePolygonClick}
              // Atmosphere Effect
              atmosphereColor="#0ea5e9"
              atmosphereAltitude={0.15}
            />
          )}
        </GlobeContainer>

        {/* --- SIDE PANEL --- */}
        <SidePanel $isOpen={!!selectedCountry}>
          <PanelHeader>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <BackButton onClick={() => setSelectedCountry(null)}>
                <FaChevronLeft /> {t('home.discover') || 'Back to Map'}
              </BackButton>
              <div
                style={{
                  color: '#38bdf8',
                  fontWeight: '800',
                  fontSize: 40,
                  lineHeight: 1,
                  opacity: 0.2,
                }}
              >
                {selectedCountry}
              </div>
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                {selectedCountry && countryStats[selectedCountry]?.name}
              </h2>
              <div style={{ opacity: 0.6, fontSize: 14, marginTop: 4 }}>
                {activeChannels.length} Active Broadcasters
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <FaSearch
                style={{
                  position: 'absolute',
                  left: 14,
                  top: 14,
                  color: 'rgba(255,255,255,0.4)',
                  pointerEvents: 'none',
                }}
              />
              <SearchInput
                placeholder={t('home.search_channel') || 'Search channels...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={!!selectedCountry}
              />
            </div>
          </PanelHeader>

          <ChannelGrid>
            {activeChannels.map((ch) => (
              <ChannelCard key={ch.id} onClick={() => setPreview(ch)}>
                <ChannelThumb>{getInitials(ch.name)}</ChannelThumb>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#fff',
                    }}
                  >
                    {ch.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.5,
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}
                    ></span>
                    Live Signal
                  </div>
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <FaPlay size={10} style={{ marginLeft: 2 }} />
                </div>
              </ChannelCard>
            ))}

            {activeChannels.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  opacity: 0.4,
                  marginTop: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <FaSearch size={24} />
                <span>{t('home.no_channels') || 'No channels match the criteria.'}</span>
              </div>
            )}
          </ChannelGrid>
        </SidePanel>

        {/* --- PREVIEW MODAL --- */}
        {preview && (
          <Overlay onClick={() => setPreview(null)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      background: '#22c55e',
                      borderRadius: '50%',
                      boxShadow: '0 0 8px #22c55e',
                    }}
                  ></div>
                  <strong style={{ fontSize: 18 }}>{preview.name}</strong>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaTimes size={16} />
                </button>
              </ModalHeader>

              <VideoShell>
                <video
                  ref={setVideoEl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%' }}
                  // Sadece URL güncellendiğinde yeniden oynatmayı tetiklemek için key kullanılabilir
                  key={preview.url} 
                />
              </VideoShell>

              <div
                style={{
                  padding: 20,
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <button
                  onClick={() => window.open(preview.url, '_blank')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {t('home.source_link') || 'Source Link'}
                </button>
                <Link
                  to="/app"
                  style={{
                    background: '#0ea5e9',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {t('home.multi_tv_add') || 'Add to Multi TV'}
                </Link>
              </div>
            </Modal>
          </Overlay>
        )}
      </Page>
    </>
  );
};

export default HomePage;