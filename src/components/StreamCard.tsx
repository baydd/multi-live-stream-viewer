import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExpand, FaVolumeMute, FaVolumeUp, FaCompress, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Hls from 'hls.js';
import { Stream } from '../types';

interface StreamCardProps {
  stream: Stream;
  onRemove: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isEditMode: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onUpdateStream?: (updatedStream: Stream) => void;
  onToggleGridLock?: (streamId: string, locked: boolean) => void;
  isGridLocked?: boolean;
}

const Card = styled.div<{ isEditMode: boolean; isSelected: boolean }>`
  background: ${props => props.theme.cardBackground};
  border: ${props => props.isEditMode ? `2px solid ${props.theme.border}` : 'none'};
  border-radius: ${props => props.isEditMode ? '12px' : '0'};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: ${props => props.isEditMode ? '2px' : '-1px'};
  box-shadow: ${props => props.isEditMode ? props.theme.shadow : 'none'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: ${props => props.isEditMode ? 'pointer' : 'default'};

  &:hover {
    box-shadow: ${props => props.isEditMode ? props.theme.shadowLg : 'none'};
    transform: ${props => props.isEditMode ? 'translateY(-2px)' : 'none'};
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: ${props => props.theme.primary};
  border-radius: 6px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &::after {
    content: "⋮⋮";
    transform: rotate(90deg);
    font-weight: bold;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
`;

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

const YouTubeIframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const TwitchIframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const KickIframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const TwitterEmbedContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #15202b;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Controls = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  display: ${props => props.visible ? 'flex' : 'none'};
  gap: 4px;
  background: ${props => props.theme.cardBackground}ee;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 4px;
  z-index: 10;
  box-shadow: ${props => props.theme.shadow};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button<{ variant?: 'danger' | 'success' | 'primary' }>`
  background: ${props => {
    switch (props.variant) {
      case 'danger': return props.theme.error;
      case 'success': return props.theme.success;
      case 'primary': return props.theme.primary;
      default: return props.theme.hover;
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'danger': return props.theme.error;
      case 'success': return props.theme.success;
      case 'primary': return props.theme.primary;
      default: return props.theme.border;
    }
  }};
  color: ${props => props.variant ? '#ffffff' : props.theme.text};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 28px;
  height: 28px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    background: ${props => {
      switch (props.variant) {
        case 'danger': return props.theme.error + 'dd';
        case 'success': return props.theme.success + 'dd';
        case 'primary': return props.theme.primary + 'dd';
        default: return props.theme.primary;
      }
    }};
    color: #ffffff;
  }

  &:active {
    transform: translateY(0);
  }
`;

const InfoArea = styled.div<{ visible: boolean }>`
  padding: ${props => props.visible ? '8px 12px' : '0'};
  background: ${props => props.visible ? props.theme.cardBackground : 'transparent'};
  border-top: ${props => props.visible ? `1px solid ${props.theme.border}` : 'none'};
  font-size: ${props => props.visible ? '0.75rem' : '0'};
  min-height: ${props => props.visible ? '40px' : '0'};
  max-height: ${props => props.visible ? '40px' : '0'};
  display: ${props => props.visible ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s ease;
  overflow: hidden;
`;

const Title = styled.div`
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.text};
`;

const Notes = styled.div`
  color: ${props => props.theme.secondary};
  line-height: 1.2;
  font-size: 0.65rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${props => props.theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  z-index: 10;
  
  &::after {
    content: "";
    width: 20px;
    height: 20px;
    border: 2px solid ${props => props.theme.border};
    border-top: 2px solid ${props => props.theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${props => props.theme.error}20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.error};
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
  z-index: 10;
  
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
    opacity: 0.8;
  }
  
  button {
    background: ${props => props.theme.error};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    
    &:hover {
      background: ${props => props.theme.error}dd;
    }
  }
`;

const Modal = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  pointer-events: all;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
  box-shadow: ${props => props.theme.shadowLg};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 0.85rem;
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.text};
  font-size: 0.95rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.15rem;
  color: ${props => props.theme.text};
  font-weight: 500;
  font-size: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.8rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primary}20;
  }

  option {
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    font-size: 0.8rem;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.primary : props.theme.border};
  border-radius: 4px;
  background: ${props => props.variant === 'primary' ? props.theme.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#ffffff' : props.theme.text};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? props.theme.primary + 'dd' : props.theme.hover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
  }

  &:active {
    transform: translateY(0);
  }
`;

const HLSPlayer: React.FC<{ url: string; isMuted: boolean; onError: (error: string) => void }> = ({ 
  url, 
  isMuted, 
  onError 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(error => {
          console.error('Error playing video:', error);
          onError('Failed to play video');
        });
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          onError(`HLS Error: ${data.details}`);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(error => {
          console.error('Error playing video:', error);
          onError('Failed to play video');
        });
      });
      
      video.addEventListener('error', () => {
        onError('Video playback error');
      });
    } else {
      onError('HLS not supported in this browser');
    }

    return cleanup;
  }, [url, onError]);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        playsInline
        controls
      />
    </>
  );
};

const StreamCard: React.FC<StreamCardProps> = ({ 
  stream, 
  onRemove, 
  onToggleMute, 
  isMuted, 
  onToggleFullscreen, 
  isFullscreen,
  isEditMode,
  isSelected = false,
  onSelect,
  onUpdateStream,
  onToggleGridLock,
  isGridLocked
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [youtubeEmbedError, setYoutubeEmbedError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    url: stream.url,
    title: stream.title,
    notes: stream.notes,
    platform: stream.platform
  });

  // Update edit form when stream changes
  useEffect(() => {
    setEditForm({
      url: stream.url,
      title: stream.title,
      notes: stream.notes,
      platform: stream.platform
    });
  }, [stream]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (isEditMode && onSelect) {
      e.stopPropagation();
      onSelect(!isSelected);
    }
  }, [isEditMode, isSelected, onSelect]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setYoutubeEmbedError(false);
  }, []);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (onUpdateStream) {
      const updatedStream = {
        ...stream,
        url: editForm.url,
        title: editForm.title,
        notes: editForm.notes,
        platform: editForm.platform as 'youtube' | 'twitch' | 'hls' | 'dash' | 'twitter' | 'kick'
      };
      onUpdateStream(updatedStream);
    }
    setIsEditModalOpen(false);
  };

  const handleEditCancel = () => {
    setEditForm({
      url: stream.url,
      title: stream.title,
      notes: stream.notes,
      platform: stream.platform
    });
    setIsEditModalOpen(false);
  };

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1` : url;
  }, [isMuted]);

  const getTwitchEmbedUrl = useCallback((url: string) => {
    const channelName = url.match(/twitch\.tv\/([^\/\?]+)/)?.[1];
    if (!channelName) return url;
    return `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&muted=${isMuted}`;
  }, [isMuted]);

  const getKickEmbedUrl = useCallback((url: string) => {
    const channelName = url.match(/kick\.com\/([^\/\?]+)/)?.[1];
    if (!channelName) return url;
    return `https://player.kick.com/${channelName}?autoplay=true&muted=${isMuted}`;
  }, [isMuted]);

  const renderStream = useCallback(() => {
    if (error) {
      return (
        <ErrorOverlay>
          <h4>Stream Error</h4>
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </ErrorOverlay>
      );
    }

    switch (stream.platform) {
      case 'youtube':
        if (youtubeEmbedError) {
          const videoId = stream.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
          const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : stream.url;
          return (
            <ErrorOverlay>
              <h4>Embed Restricted</h4>
              <p>This video cannot be embedded.</p>
              <button onClick={() => window.open(watchUrl, '_blank')}>
                Watch on YouTube
              </button>
            </ErrorOverlay>
          );
        }
        return (
          <YouTubeIframe
            src={getYouTubeEmbedUrl(stream.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setYoutubeEmbedError(true)}
          />
        );
      case 'twitch':
        return (
          <TwitchIframe
            src={getTwitchEmbedUrl(stream.url)}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => handleError('Failed to load Twitch stream')}
          />
        );
      case 'kick':
        return (
          <KickIframe
            src={getKickEmbedUrl(stream.url)}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => handleError('Failed to load Kick stream')}
          />
        );
      case 'hls':
        return (
          <HLSPlayer 
            url={stream.url} 
            isMuted={isMuted} 
            onError={handleError}
          />
        );
      case 'dash':
        return (
          <ErrorOverlay>
            <h4>DASH Player</h4>
            <p>DASH streaming not yet implemented</p>
          </ErrorOverlay>
        );
      case 'twitter':
        return (
          <TwitterEmbedContainer>
            <a
              className="twitter-timeline"
              data-theme="dark"
              href={`https://twitter.com/${stream.url.replace('@','')}`}
            >
              Tweets by {stream.url.replace('@','')}
            </a>
          </TwitterEmbedContainer>
        );
      default:
        return (
          <ErrorOverlay>
            <h4>Unsupported Platform</h4>
            <p>Platform "{stream.platform}" is not supported</p>
          </ErrorOverlay>
        );
    }
  }, [stream, isMuted, error, youtubeEmbedError, getYouTubeEmbedUrl, getTwitchEmbedUrl, getKickEmbedUrl, handleError, handleRetry]);

  const handleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    if (stream.platform === 'twitter') {
      const loadTwitterWidget = () => {
        if ((window as any).twttr && (window as any).twttr.widgets) {
          (window as any).twttr.widgets.load();
        } else if (!document.getElementById('twitter-wjs')) {
          const script = document.createElement('script');
          script.id = 'twitter-wjs';
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          document.body.appendChild(script);
        }
      };
      
      const timeoutId = setTimeout(loadTwitterWidget, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [stream.platform, stream.url]);

  return (
    <Card 
      isEditMode={isEditMode} 
      isSelected={isSelected}
      onClick={handleCardClick}
      ref={containerRef}
    >
      {isEditMode && (
        <DragHandle className="drag-handle" />
      )}

      <VideoContainer>
        {isLoading && !error && <LoadingOverlay />}
        {renderStream()}
      </VideoContainer>

      {/* Info area sadece edit modunda görünür */}
      <InfoArea visible={isEditMode}>
        <Title>{stream.title || stream.url}</Title>
        {stream.notes && <Notes>{stream.notes}</Notes>}
      </InfoArea>

      <Controls visible={isEditMode}>
        <ControlButton 
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick();
          }} 
          title={t('edit_source') as string}
        >
          <FaEdit />
        </ControlButton>
        
        <ControlButton 
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }} 
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </ControlButton>
        
        <ControlButton 
          onClick={handleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </ControlButton>
        
        <ControlButton 
          onClick={(e) => {
            e.stopPropagation();
            onToggleGridLock && onToggleGridLock(stream.id, !isGridLocked);
          }} 
          title={isGridLocked ? "Unlock Grid" : "Lock Grid"}
          variant={isGridLocked ? 'success' : 'primary'}
        >
          {isGridLocked ? <FaUnlock /> : <FaLock />}
        </ControlButton>
        
        <ControlButton 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }} 
          title="Remove" 
          variant="danger"
        >
          <FaTimes />
        </ControlButton>
      </Controls>

      {isEditModalOpen && (
        <Modal onClick={handleEditCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <ModalTitle>{t('edit_stream')}</ModalTitle>
            <FormGroup>
              <Label>{t('url')}</Label>
              <Input
                type="text"
                value={editForm.url}
                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder={t('enter_stream_url') as string}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('title')}</Label>
              <Input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder={t('enter_stream_title') as string}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('platform')}</Label>
              <Select
                value={editForm.platform}
                onChange={(e) => setEditForm(prev => ({ ...prev, platform: e.target.value as 'youtube' | 'twitch' | 'hls' | 'dash' | 'twitter' | 'kick' }))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value="youtube">{t('settings.platforms.youtube')}</option>
                <option value="twitch">{t('settings.platforms.twitch')}</option>
                <option value="kick">{t('settings.platforms.kick')}</option>
                <option value="hls">{t('settings.platforms.hls')}</option>
                <option value="twitter">{t('settings.platforms.twitter')}</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>{t('notes')}</Label>
              <Input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder={t('enter_stream_notes') as string}
              />
            </FormGroup>
            <ModalButtonGroup>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCancel();
                }}
              >
                {t('cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSubmit();
                }}
              >
                {t('save_changes')}
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
};

export default StreamCard;