import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExpand, FaVolumeMute, FaVolumeUp, FaCompress } from 'react-icons/fa';
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
  background-color: ${props => props.theme.cardBackground};
  border: ${props => props.isEditMode ? `0.5px solid ${props.theme.border}` : 'none'};
  border-radius: ${props => props.isEditMode ? '4px' : '0'};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: ${props => props.isEditMode ? '0' : '-1px'};
`;

const VideoContainer = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  frameborder: "0";
  scrolling: "no";
  allowfullscreen: "true";
`;

const TwitterEmbedContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
`;

const Controls = styled.div`
  padding: 0.1rem 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.background};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.1rem;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  padding: 0.1rem 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border-radius: 2px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.theme.hover};
    opacity: 0.8;
  }
`;

const Title = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  padding: 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Notes = styled.div`
  font-size: 0.7rem;
  padding: 0 0.25rem;
  color: ${props => props.theme.secondary};
`;

const HLSPlayer: React.FC<{ url: string; isMuted: boolean }> = ({ url, isMuted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(error => {
          console.error('Error playing video:', error);
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
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
    <Video
      ref={videoRef}
      autoPlay
      muted={isMuted}
      playsInline
      controls
    />
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

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const renderStream = () => {
    switch (stream.platform) {
      case 'youtube':
        return (
          <YouTubeIframe
            src={getYouTubeEmbedUrl(stream.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      case 'twitch':
        return (
          <TwitchIframe
            src={getTwitchEmbedUrl(stream.url)}
            allowFullScreen
          />
        );
      case 'kick':
        return (
          <KickIframe
            src={getKickEmbedUrl(stream.url, isMuted)}
            allowFullScreen
          />
        );
      case 'hls':
        return <HLSPlayer url={stream.url} isMuted={isMuted} />;
      case 'dash':
        return <div>DASHPlayer not implemented</div>;
      case 'twitter':
        return (
          <TwitterEmbedContainer>
            <a
              className="twitter-timeline"
              data-theme="light"
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
            <Title>{stream.title || stream.url}</Title>
            <ButtonGroup>
              <Button onClick={onToggleMute} title={isMuted ? "Sesi Aç" : "Sesi Kapat"}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </Button>
              <Button onClick={onToggleFullscreen} title={isFullscreen ? "Küçült" : "Tam Ekran"}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </Button>
              <Button onClick={onRemove} title="Kaldır">
                <FaTimes />
              </Button>
            </ButtonGroup>
          </Controls>
          {stream.notes && <Notes>{stream.notes}</Notes>}
        </>
      )}
    </Card>
  );
};

export default StreamCard; 