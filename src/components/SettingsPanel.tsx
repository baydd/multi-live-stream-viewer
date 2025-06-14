import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { Stream } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (stream: Stream) => void;
  channelCount: number;
  setChannelCount: (count: number) => void;
  streams: Stream[];
  onUpdateStreams: (streams: Stream[]) => void;
}

const Panel = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  z-index: 1000;
  transform: translateX(${props => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
  overflow-y: auto;
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

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onAddStream,
  channelCount,
  setChannelCount,
  streams,
  onUpdateStreams,
}) => {
  const { t } = useTranslation();
  const channelCounts = [4, 6, 9, 12, 16, 18, 21, 25];
  const [channelList, setChannelList] = useState<Stream[]>(() => streams);

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
      <h2>{t('settings.title')}</h2>
      <div style={{ margin: '1rem 0' }}>
        <div><b>{t('settings.channelCount')}</b></div>
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
      <div><b>{t('settings.channelList')}</b></div>
      <ChannelList>
        {channelList.slice(0, channelCount).map((ch, idx) => (
          <ChannelRow key={ch.id}>
            <SmallInput
              placeholder={t('settings.streamTitlePlaceholder') || ''}
              value={ch.title}
              onChange={e => handleChannelChange(idx, 'title', e.target.value)}
            />
            <SmallSelect
              value={ch.platform}
              onChange={e => handleChannelChange(idx, 'platform', e.target.value)}
            >
              {platformOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </SmallSelect>
            {ch.platform === 'twitter' ? (
              <Input
                placeholder={t('settings.twitterUsernamePlaceholder') || ''}
                value={ch.url}
                onChange={e => handleChannelChange(idx, 'url', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              />
            ) : (
              <Input
                placeholder={t('settings.streamUrlPlaceholder') || ''}
                value={ch.url}
                onChange={e => handleChannelChange(idx, 'url', e.target.value)}
              />
            )}
          </ChannelRow>
        ))}
      </ChannelList>
      <Button onClick={onClose}>{t('settings.save')}</Button>
    </Panel>
  );
};

export default SettingsPanel; 