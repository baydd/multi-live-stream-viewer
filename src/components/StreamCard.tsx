import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExpand, FaVolumeMute, FaVolumeUp, FaCompress, FaPlay, FaPause, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
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
  onUpdateStream?: (updatedStream: Stream) => void;
  onToggleGridLock?: (streamId: string, locked: boolean) => void;
  isGridLocked?: boolean;
}

const DragHandle = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 20px;
  height: 20px;
  background: ${props => props.theme.primary};
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  z-index: 5;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const Card = styled.div<{ isEditMode: boolean }>`
  background: ${props => props.theme.cardBackground};
  border: ${props => props.isEditMode ? `2px solid ${props.theme.border}` : 'none'};
  border-radius: ${props => props.isEditMode ? '16px' : '0'};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: ${props => props.isEditMode ? '4px' : '-1px'};
  box-shadow: ${props => props.isEditMode ? props.theme.shadow : 'none'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    box-shadow: ${props => props.isEditMode ? props.theme.shadowLg : 'none'};
    transform: ${props => props.isEditMode ? 'translateY(-2px)' : 'none'};
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

const Controls = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 0.25rem;
  z-index: 10;
  box-shadow: ${props => props.theme.shadow};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ControlButton = styled.button<{ variant?: 'danger' }>`
  background: ${props => props.variant === 'danger' ? props.theme.error : props.theme.hover};
  border: 1px solid ${props => props.variant === 'danger' ? props.theme.error : props.theme.border};
  color: ${props => props.variant === 'danger' ? '#ffffff' : props.theme.text};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 28px;
  height: 28px;

  &:hover {
    background: ${props => props.variant === 'danger' ? props.theme.error + 'dd' : props.theme.primary};
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
  }

  &:active {
    transform: translateY(0);
  }
`;

const InfoArea = styled.div`
  padding: 0.5rem;
  background: ${props => props.theme.cardBackground};
  border-top: 1px solid ${props => props.theme.border};
  font-size: 0.75rem;
`;

const Title = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.text};
`;

const Notes = styled.div`
  color: ${props => props.theme.secondary};
  line-height: 1.3;
  font-size: 0.7rem;
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
`;

const PlatformBadge = styled.div<{ platform: string }>`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: ${props => {
    switch (props.platform) {
      case 'youtube': return '#ff0000';
      case 'twitch': return '#9146ff';
      case 'kick': return '#53fc18';
      case 'twitter': return '#1da1f2';
      default: return props.theme.primary;
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 5;
  opacity: 0.9;
`;

const HLSPlayer: React.FC<{ url: string; isMuted: boolean }> = ({ url, isMuted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls;

    setIsLoading(true);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(error => {
          console.error('Error playing video:', error);
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(error => {
          console.error('Error playing video:', error);
        });
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <>
      {isLoading && <LoadingOverlay>Loading stream...</LoadingOverlay>}
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 1.25rem;
  max-width: 380px;
  width: 90%;
  box-shadow: ${props => props.theme.shadowLg};
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: ${props => props.theme.text};
  font-size: 1rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  color: ${props => props.theme.text};
  font-weight: 500;
  font-size: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.75rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.75rem;
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

const StreamCard: React.FC<StreamCardProps> = ({ 
  stream, 
  onRemove, 
  onToggleMute, 
  isMuted, 
  onToggleFullscreen, 
  isFullscreen,
  isEditMode,
  onUpdateStream,
  onToggleGridLock,
  isGridLocked
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    url: stream.url,
    title: stream.title,
    notes: stream.notes,
    platform: stream.platform
  });
  const [youtubeEmbedError, setYoutubeEmbedError] = useState(false);

  // Update edit form when stream changes
  useEffect(() => {
    setEditForm({
      url: stream.url,
      title: stream.title,
      notes: stream.notes,
      platform: stream.platform
    });
  }, [stream]);

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

  const getYouTubeEmbedUrl = (url: string) => {
    // Her türlü YouTube linkini embed formatına çevir
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}` : url;
  };

  const getTwitchEmbedUrl = (url: string) => {
    const channelName = url.match(/twitch\.tv\/([^\/\?]+)/)?.[1];
    if (!channelName) return url;
    return `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&muted=${isMuted}`;
  };

  const getKickEmbedUrl = (url: string, isMuted: boolean) => {
    const channelName = url.match(/kick\.com\/([^\/\?]+)/)?.[1];
    if (!channelName) return url;
    return `https://player.kick.com/${channelName}?autoplay=true&muted=${isMuted}`;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    if (stream.platform === 'youtube' || stream.platform === 'twitch' || stream.platform === 'kick') {
      return;
    }

    if (stream.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream.url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream.url;
      }
    } else {
      video.src = stream.url;
    }

    return () => {
      if (video.src) {
        video.pause();
        video.src = '';
      }
    };
  }, [stream.url, isMuted, playbackRate, stream.platform]);

  useEffect(() => {
    if (stream.platform === 'twitter') {
      if ((window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load();
      } else if (!document.getElementById('twitter-wjs')) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [stream.platform, stream.url]);

  const renderStream = () => {
    switch (stream.platform) {
      case 'youtube':
        if (youtubeEmbedError) {
          // Fallback: YouTube'da izle butonu
          const videoId = stream.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
          const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : stream.url;
          return (
            <div style={{color:'#fff',padding:'1rem',textAlign:'center'}}>
              <div style={{marginBottom:'0.5rem'}}>Bu video gömülü oynatılamıyor.</div>
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" style={{color:'#3b82f6',fontWeight:600}}>YouTube'da izle</a>
            </div>
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
          />
        );
      case 'kick':
        return (
          <KickIframe
            src={getKickEmbedUrl(stream.url, isMuted)}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        );
      case 'hls':
        return (
          <HLSPlayer url={stream.url} isMuted={isMuted} />
        );
      case 'dash':
        return (
          <div>DASH Player not implemented</div>
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
        return <div>Unsupported platform</div>;
    }
  };

  // Fullscreen handler
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <Card isEditMode={isEditMode}>
      <VideoContainer ref={containerRef}>
        {renderStream()}
      </VideoContainer>

      {isEditMode && (
        <InfoArea>
          <Title>{stream.title || stream.url}</Title>
          {stream.notes && <Notes>{stream.notes}</Notes>}
        </InfoArea>
      )}

      {isEditMode && (
        <Controls onClick={(e) => e.stopPropagation()}>
          <ButtonGroup>
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
                onRemove();
              }} 
              title="Remove" 
              variant="danger"
            >
              <FaTimes />
            </ControlButton>
            <ControlButton 
              onClick={(e) => {
                e.stopPropagation();
                onToggleGridLock && onToggleGridLock(stream.id, !isGridLocked);
              }} 
              title={isGridLocked ? (t('unlock_grid') as string) : (t('lock_grid') as string)}
            >
              {isGridLocked ? <FaUnlock /> : <FaLock />}
            </ControlButton>
          </ButtonGroup>
        </Controls>
      )}

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