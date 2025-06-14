import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Stream } from '../types';

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

const DeveloperLink = styled.a`
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

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (stream: Stream) => void;
  channelCount: number;
  setChannelCount: (count: number) => void;
  streams: Stream[];
  onUpdateStreams: (streams: Stream[]) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onAddStream,
  channelCount,
  setChannelCount,
  streams,
  onUpdateStreams
}) => {
  const { t } = useTranslation();

  return (
    <Panel isOpen={isOpen}>
      <CloseButton onClick={onClose}>×</CloseButton>
      {/* Settings content will go here */}
      <DeveloperLink 
        href="https://github.com/baydd/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Developer: baydd
      </DeveloperLink>
    </Panel>
  );
};

export default SettingsPanel; 