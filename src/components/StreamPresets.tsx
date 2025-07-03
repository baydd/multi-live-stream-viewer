import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaPlay, FaSave, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { Stream } from '../types';

interface StreamPreset {
  id: string;
  name: string;
  description: string;
  streams: Stream[];
  channelCount: number;
  createdAt: string;
}

interface StreamPresetsProps {
  visible: boolean;
  onClose: () => void;
  onLoadPreset: (streams: Stream[], channelCount: number) => void;
  currentStreams: Stream[];
  currentChannelCount: number;
}

const PresetsContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-height: 80vh;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  box-shadow: ${props => props.theme.shadowLg};
  display: ${props => props.visible ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h2 {
    margin: 0;
    color: ${props => props.theme.text};
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const PresetCard = styled.div`
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const PresetName = styled.h3`
  margin: 0 0 8px 0;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
`;

const PresetDescription = styled.p`
  margin: 0 0 12px 0;
  color: ${props => props.theme.secondary};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const PresetMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${props => props.theme.secondary};
  margin-bottom: 12px;
`;

const PresetActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  background: ${props => props.variant === 'danger' ? props.theme.error : props.theme.primary};
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const CreatePresetForm = styled.div`
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  color: ${props => props.theme.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? props.theme.secondary : props.theme.primary};
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const StreamPresets: React.FC<StreamPresetsProps> = ({
  visible,
  onClose,
  onLoadPreset,
  currentStreams,
  currentChannelCount
}) => {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<StreamPreset[]>(() => {
    const saved = localStorage.getItem('streamPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  const savePresets = (updatedPresets: StreamPreset[]) => {
    setPresets(updatedPresets);
    localStorage.setItem('streamPresets', JSON.stringify(updatedPresets));
  };

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: StreamPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      description: newPresetDescription,
      streams: currentStreams,
      channelCount: currentChannelCount,
      createdAt: new Date().toISOString()
    };

    savePresets([...presets, newPreset]);
    setNewPresetName('');
    setNewPresetDescription('');
  };

  const handleLoadPreset = (preset: StreamPreset) => {
    onLoadPreset(preset.streams, preset.channelCount);
    onClose();
  };

  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    savePresets(updatedPresets);
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stream-presets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedPresets)) {
          savePresets([...presets, ...importedPresets]);
        }
      } catch (error) {
        alert('Invalid preset file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <PresetsContainer visible={visible}>
      <Header>
        <h2>{t('presets.title')}</h2>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      
      <Content>
        <CreatePresetForm>
          <h3 style={{ marginTop: 0, color: 'inherit' }}>{t('presets.create_new')}</h3>
          <FormGroup>
            <Label>{t('presets.preset_name')}</Label>
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder={t('presets.preset_name') as string}
            />
          </FormGroup>
          <FormGroup>
            <Label>{t('presets.description')}</Label>
            <TextArea
              value={newPresetDescription}
              onChange={(e) => setNewPresetDescription(e.target.value)}
              placeholder={t('presets.description') as string}
            />
          </FormGroup>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={handleCreatePreset}>
              <FaSave />
              {t('presets.save_current')}
            </Button>
            <Button variant="secondary" onClick={handleExportPresets}>
              <FaDownload />
              {t('presets.export_all')}
            </Button>
            <Button variant="secondary" as="label">
              <FaUpload />
              {t('presets.import')}
              <input
                type="file"
                accept=".json"
                onChange={handleImportPresets}
                style={{ display: 'none' }}
              />
            </Button>
          </div>
        </CreatePresetForm>

        <PresetGrid>
          {presets.map((preset) => (
            <PresetCard key={preset.id} onClick={() => handleLoadPreset(preset)}>
              <PresetName>{preset.name}</PresetName>
              <PresetDescription>{preset.description}</PresetDescription>
              <PresetMeta>
                <span>{t('presets.streams_count', { count: preset.streams.length })}</span>
                <span>{t('presets.created_on', { date: new Date(preset.createdAt).toLocaleDateString() })}</span>
              </PresetMeta>
              <PresetActions>
                <ActionButton onClick={(e) => {
                  e.stopPropagation();
                  handleLoadPreset(preset);
                }}>
                  <FaPlay />
                  {t('presets.load')}
                </ActionButton>
                <ActionButton 
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id);
                  }}
                >
                  <FaTrash />
                  {t('presets.delete')}
                </ActionButton>
              </PresetActions>
            </PresetCard>
          ))}
        </PresetGrid>
      </Content>
    </PresetsContainer>
  );
};

export default StreamPresets;