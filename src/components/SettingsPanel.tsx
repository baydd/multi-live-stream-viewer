import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSave, FaUpload, FaDownload, FaPalette } from 'react-icons/fa';
import { Stream, Language } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (stream: Stream) => void;
  channelCount: number;
  setChannelCount: (count: number) => void;
  streams: Stream[];
  onUpdateStreams: (streams: Stream[]) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Panel = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-450px'};
  width: 450px;
  height: 100vh;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  box-shadow: ${props => props.theme.shadowLg};
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;
  border-left: 1px solid ${props => props.theme.border};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.primary}cc;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.primary};
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.secondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${props => props.variant === 'secondary' ? props.theme.hover : props.theme.primary};
  color: ${props => props.variant === 'secondary' ? props.theme.text : '#ffffff'};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    background: ${props => props.variant === 'secondary' ? props.theme.border : props.theme.primary}dd;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChannelCountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ChannelButton = styled.button<{ selected: boolean }>`
  padding: 0.75rem;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  background: ${props => props.selected ? props.theme.primary + '20' : props.theme.background};
  color: ${props => props.selected ? props.theme.primary : props.theme.text};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}10;
  }
`;

const ChannelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChannelRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 2fr;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background: ${props => props.theme.background};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    box-shadow: ${props => props.theme.shadow};
  }
`;

const SmallInput = styled(Input)`
  font-size: 0.8rem;
`;

const SmallSelect = styled(Select)`
  font-size: 0.8rem;
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LanguageButton = styled.button<{ selected: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  background: ${props => props.selected ? props.theme.primary + '20' : props.theme.background};
  color: ${props => props.selected ? props.theme.primary : props.theme.text};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}10;
  }
`;

const SaveLoadContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.secondary};
  }
`;

const Developed = styled.a`
  margin-top: auto;
  color: ${props => props.theme.secondary};
  text-decoration: none;
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
  transition: all 0.2s ease;
  border-radius: 12px;

  &:hover {
    opacity: 1;
    color: ${props => props.theme.primary};
    background: ${props => props.theme.hover};
  }
`;

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onAddStream,
  channelCount,
  setChannelCount,
  streams,
  onUpdateStreams,
  language,
  setLanguage,
}) => {
  const { t } = useTranslation();
  const channelCounts = [4, 6, 9, 12, 16, 18, 21, 25];
  const [channelList, setChannelList] = useState<Stream[]>(() => streams);
  const [saveLoadText, setSaveLoadText] = useState('');

  const languages: { value: Language; label: string }[] = [
    { value: 'tr', label: 'Türkçe' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
    { value: 'es', label: 'Español' },
    { value: 'zh', label: '中文' },
    { value: 'ru', label: 'Русский' },
    { value: 'pt', label: 'Português' }
  ];

  useEffect(() => {
    setChannelList(streams);
  }, [streams]);

  const handleChannelCountChange = (count: number) => {
    setChannelCount(count);
    let newList = [...channelList];
    if (count > newList.length) {
      for (let i = newList.length; i < count; i++) {
        newList.push({
          id: Date.now().toString() + i,
          url: '',
          title: '',
          platform: 'youtube',
          category: '',
          notes: '',
          layout: { x: 0, y: 0, w: 4, h: 3 },
        });
      }
    } else {
      newList = newList.slice(0, count);
    }
    setChannelList(newList);
    onUpdateStreams(newList);
  };

  const handleChannelChange = (idx: number, field: keyof Stream, value: string) => {
    const updated = channelList.map((ch: Stream, i: number) => i === idx ? { ...ch, [field]: value } : ch);
    setChannelList(updated);
    onUpdateStreams(updated);
  };

  const platformOptions = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitch', label: 'Twitch' },
    { value: 'kick', label: 'Kick' },
    { value: 'hls', label: 'HLS' },
    { value: 'dash', label: 'DASH' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook Live' },
    { value: 'instagram', label: 'Instagram Live' },
    { value: 'dlive', label: 'DLive' },
    { value: 'trovo', label: 'Trovo' },
  ];

  const handleSave = () => {
    const saveData = {
      channelCount,
      streams: channelList,
      language,
      timestamp: new Date().toISOString()
    };
    const saveString = btoa(JSON.stringify(saveData));
    setSaveLoadText(saveString);
  };

  const handleLoad = () => {
    try {
      const loadedData = JSON.parse(atob(saveLoadText));
      if (loadedData.channelCount) {
        setChannelCount(loadedData.channelCount);
      }
      if (loadedData.streams) {
        setChannelList(loadedData.streams);
        onUpdateStreams(loadedData.streams);
      }
      if (loadedData.language) {
        setLanguage(loadedData.language);
      }
    } catch (error) {
      alert(t('settings.load_error'));
    }
  };

  return (
    <Panel isOpen={isOpen}>
      <Header>
        <Title>
          <FaPalette />
          {t('settings.title')}
        </Title>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </Header>
      
      <Section>
        <SectionTitle>🌐 {t('change_language')}</SectionTitle>
        <LanguageGrid>
          {languages.map(lang => (
            <LanguageButton
              key={lang.value}
              selected={language === lang.value}
              onClick={() => setLanguage(lang.value)}
              type="button"
            >
              {lang.label}
            </LanguageButton>
          ))}
        </LanguageGrid>
      </Section>

      <Section>
        <SectionTitle>💾 {t('settings.save')} & {t('settings.load')}</SectionTitle>
        <SaveLoadContainer>
          <Button onClick={handleSave} variant="secondary">
            <FaSave />
            {t('settings.save')}
          </Button>
          <Button onClick={handleLoad} variant="secondary">
            <FaUpload />
            {t('settings.load')}
          </Button>
        </SaveLoadContainer>
        <TextArea
          value={saveLoadText}
          onChange={(e) => setSaveLoadText(e.target.value)}
          placeholder={t('settings.save_load_placeholder') || ''}
        />
      </Section>

      <Section>
        <SectionTitle>📺 {t('settings.channel_count')}</SectionTitle>
        <ChannelCountGrid>
          {channelCounts.map(count => (
            <ChannelButton
              key={count}
              selected={channelCount === count}
              onClick={() => handleChannelCountChange(count)}
              type="button"
            >
              {count}
            </ChannelButton>
          ))}
        </ChannelCountGrid>
      </Section>

      <Section>
        <SectionTitle>🎬 {t('settings.stream_platform')}</SectionTitle>
        <ChannelList>
          {channelList.slice(0, channelCount).map((ch, idx) => (
            <ChannelRow key={ch.id}>
              <SmallInput
                placeholder={t('settings.stream_title_placeholder') as string}
                value={ch.title}
                onChange={e => handleChannelChange(idx, 'title', e.target.value)}
              />
              <SmallSelect
                value={ch.platform}
                onChange={e => handleChannelChange(idx, 'platform', e.target.value)}
              >
                {platformOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{t('settings.platforms.' + opt.value)}</option>
                ))}
              </SmallSelect>
              {ch.platform === 'twitter' ? (
                <SmallInput
                  placeholder="@username"
                  value={ch.url}
                  onChange={e => handleChannelChange(idx, 'url', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                />
              ) : (
                <SmallInput
                  placeholder={t('settings.stream_url_placeholder') as string}
                  value={ch.url}
                  onChange={e => handleChannelChange(idx, 'url', e.target.value)}
                />
              )}
            </ChannelRow>
          ))}
        </ChannelList>
      </Section>

      <Button onClick={onClose}>{t('settings.close')}</Button>
      
      <Developed 
        href="https://github.com/baydd/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        💻 Developed by baydd
      </Developed>
    </Panel>
  );
};

export default SettingsPanel;