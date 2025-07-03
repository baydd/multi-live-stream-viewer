import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { 
  FaVolumeUp, 
  FaVolumeMute, 
  FaRedo, 
  FaCompress, 
  FaExpand,
  FaLayerGroup,
  FaInfo
} from 'react-icons/fa';

interface GridControlsProps {
  visible: boolean;
  onMuteAll: () => void;
  onUnmuteAll: () => void;
  onResetLayout: () => void;
  onToggleCompact: () => void;
  isCompactMode: boolean;
  selectedCount: number;
  totalCount: number;
}

const ControlsContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  display: ${props => props.visible ? 'flex' : 'none'};
  gap: 12px;
  z-index: 100;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 12px;
  box-shadow: ${props => props.theme.shadowLg};
`;

const ControlButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'active' }>`
  background: ${props => {
    if (props.variant === 'active') return props.theme.primary;
    if (props.variant === 'danger') return props.theme.error;
    if (props.variant === 'secondary') return props.theme.secondary;
    return props.theme.hover;
  }};
  border: 1px solid ${props => {
    if (props.variant === 'active') return props.theme.primary;
    if (props.variant === 'danger') return props.theme.error;
    return props.theme.border;
  }};
  color: ${props => {
    if (props.variant === 'active' || props.variant === 'danger') return '#ffffff';
    return props.theme.text;
  }};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  min-height: 36px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    background: ${props => {
      if (props.variant === 'active') return props.theme.primary + 'dd';
      if (props.variant === 'danger') return props.theme.error + 'dd';
      return props.theme.primary;
    }};
    color: #ffffff;
  }

  &:active {
    transform: translateY(0);
  }
`;

const InfoBadge = styled.div`
  background: ${props => props.theme.primary}20;
  border: 1px solid ${props => props.theme.primary};
  color: ${props => props.theme.primary};
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GridControls: React.FC<GridControlsProps> = ({
  visible,
  onMuteAll,
  onUnmuteAll,
  onResetLayout,
  onToggleCompact,
  isCompactMode,
  selectedCount,
  totalCount
}) => {
  const { t } = useTranslation();

  return (
    <ControlsContainer visible={visible}>
      <InfoBadge>
        <FaInfo />
        {selectedCount > 0 ? `${selectedCount}/${totalCount} selected` : `${totalCount} streams`}
      </InfoBadge>
      
      <ControlButton onClick={onMuteAll} title={t('grid_controls.mute_all') as string}>
        <FaVolumeMute />
        Mute All
      </ControlButton>
      
      <ControlButton onClick={onUnmuteAll} title={t('grid_controls.unmute_all') as string}>
        <FaVolumeUp />
        Unmute All
      </ControlButton>
      
      <ControlButton 
        onClick={onToggleCompact} 
        variant={isCompactMode ? 'active' : 'secondary'}
        title={t('grid_controls.toggle_compact') as string}
      >
        {isCompactMode ? <FaCompress /> : <FaExpand />}
        {isCompactMode ? 'Compact' : 'Spread'}
      </ControlButton>
      
      <ControlButton onClick={onResetLayout} title={t('grid_controls.reset_layout') as string}>
        <FaRedo />
        Reset Layout
      </ControlButton>
    </ControlsContainer>
  );
};

export default GridControls;