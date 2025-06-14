import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExpand, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import Hls from 'hls.js';
import { Stream } from '../types';

interface StreamCardProps {
  stream: Stream;
  onRemove: () => void;
}

const Card = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
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

const TwitterEmbedContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
`;

const Controls = styled.div`
  padding: 0.25rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.background};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  border-radius: 4px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.theme.hover};
    opacity: 0.8;
  }
`;

const Title = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Notes = styled.div`
  font-size: 0.8rem;
  padding: 0 0.5rem;
  color: ${props => props.theme.secondary};
`;

const StreamCard = ({ stream, onRemove }: StreamCardProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}` : url;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    if (stream.platform === 'youtube') {
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  return (
    <Card>
      <Title>{stream.title}</Title>
      <VideoContainer>
        {stream.platform === 'youtube' ? (
          <YouTubeIframe
            src={getYouTubeEmbedUrl(stream.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : stream.platform === 'twitter' ? (
          <TwitterEmbedContainer>
            <a
              className="twitter-timeline"
              data-theme="light"
              href={`https://twitter.com/${stream.url.replace('@','')}`}
            >
              Tweets by {stream.url.replace('@','')}
            </a>
          </TwitterEmbedContainer>
        ) : (
          <Video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
          />
        )}
      </VideoContainer>
      <Controls>
        <ButtonGroup>
          {stream.platform !== 'youtube' && stream.platform !== 'twitter' && (
            <>
              <Button onClick={toggleMute} title="Ses Aç/Kapat">
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </Button>
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                style={{ fontSize: '0.9rem', padding: '0.1rem 0.2rem', borderRadius: 4, marginLeft: 2 }}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </>
          )}
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={toggleFullscreen} title="Tam Ekran">
            <FaExpand />
          </Button>
          <Button onClick={onRemove} title="Kapat">
            <FaTimes />
          </Button>
        </ButtonGroup>
      </Controls>
      {stream.notes && <Notes>{stream.notes}</Notes>}
    </Card>
  );
};

export default StreamCard; 