import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExpand, FaVolumeMute, FaVolumeUp, FaCompress, FaPlay, FaPause } from 'react-icons/fa';
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
}

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
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(10px);
  border-top: 1px solid ${props => props.theme.border};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button<{ variant?: 'danger' }>`
  background: ${props => props.variant === 'danger' ? props.theme.error : props.theme.hover};
  border: 1px solid ${props => props.variant === 'danger' ? props.theme.error : props.theme.border};
  color: ${props => props.variant === 'danger' ? '#ffffff' : props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 36px;
  height: 36px;

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

const Title = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  padding: 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.text};
`;

const Notes = styled.div`
  font-size: 0.75rem;
  padding: 0 0.5rem;
  color: ${props => props.theme.secondary};
  line-height: 1.4;
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

const StreamCard: React.FC<StreamCardProps> = ({ 
  stream, 
  onRemove, 
  onToggleMute, 
  isMuted, 
  onToggleFullscreen, 
  isFullscreen,
  isEditMode 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const getYouTubeEmbedUrl = (url: string) => {
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
        return (
          <YouTubeIframe
            src={getYouTubeEmbedUrl(stream.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
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

  return (
    <Card isEditMode={isEditMode}>
      <VideoContainer>
        {renderStream()}
      </VideoContainer>
      {isEditMode && (
        <>
          <Controls>
            <div>
              <Title>{stream.title || stream.url}</Title>
              {stream.notes && <Notes>{stream.notes}</Notes>}
            </div>
            <ButtonGroup>
              <ControlButton onClick={onToggleMute} title={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </ControlButton>
              <ControlButton onClick={onToggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </ControlButton>
              <ControlButton onClick={onRemove} title="Remove" variant="danger">
                <FaTimes />
              </ControlButton>
            </ButtonGroup>
          </Controls>
        </>
      )}
    </Card>
  );
};

export default StreamCard;