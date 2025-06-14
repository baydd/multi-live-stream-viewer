import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
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
  right: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background-color: ${props => props.theme.background};
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  transition: right 0.3s ease-in-out;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.5rem;
  cursor: pointer;
`;

const Developed = styled.a`
  margin-top: auto;
  color: ${props => props.theme.text};
  text-decoration: none;
  text-align: center;
  padding: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const Input = styled.input.attrs({ type: 'text' })`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  background: ${props => props.theme.primary};
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
`;

const ChannelCountSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const ChannelButton = styled.button<{ selected: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  background: ${props => props.selected ? props.theme.primary : props.theme.cardBackground};
  color: ${props => props.selected ? '#fff' : props.theme.text};
  cursor: pointer;
  font-weight: bold;
`;

const ChannelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChannelRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SmallInput = styled(Input)`
  width: 80px;
`;

const SmallSelect = styled(Select)`
  width: 90px;
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const LanguageButton = styled.button<{ selected: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid ${props => props.selected ? props.theme.primary : props.theme.border};
  background: ${props => props.selected ? props.theme.primary : props.theme.cardBackground};
  color: ${props => props.selected ? '#fff' : props.theme.text};
  cursor: pointer;
  font-weight: bold;
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

  const languages: { value: Language; label: string }[] = [
    { value: 'tr', label: 'Türkçe' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
    { value: 'es', label: 'Español' },
    { value: 'zh', label: '中文' },
    { value: 'ru', label: 'Русский' },
    { value: 'pt', label: 'Português' }
  ];

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
  ];

  return (
    <Panel isOpen={isOpen}>
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
      
      <div style={{ margin: '1rem 0' }}>
        <LanguageSelector>
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
        </LanguageSelector>
      </div>

      <div style={{ margin: '1rem 0' }}>
        <div><b>{t('settings.channel_count')}</b></div>
        <ChannelCountSelector>
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
        </ChannelCountSelector>
      </div>

      <div><b>{t('settings.stream_platform')}</b></div>
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
              <Input
                placeholder="@username"
                value={ch.url}
                onChange={e => handleChannelChange(idx, 'url', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              />
            ) : (
              <Input
                placeholder={t('settings.stream_url_placeholder') as string}
                value={ch.url}
                onChange={e => handleChannelChange(idx, 'url', e.target.value)}
              />
            )}
          </ChannelRow>
        ))}
      </ChannelList>
      <Button onClick={onClose}>{t('settings.close')}</Button>
      <Developed 
        href="https://github.com/baydd/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Developed: baydd
      </Developed>
    </Panel>
  );
};

export default SettingsPanel; 