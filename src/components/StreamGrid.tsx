import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Stream } from '../types';
import StreamCard from './StreamCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface StreamGridProps {
  streams: Stream[];
  onRemoveStream: (id: string) => void;
  onUpdateStreams: (streams: Stream[]) => void;
  channelCount: number;
  isEditMode: boolean;
}

const GridContainer = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
`;

const Info = styled.div`
  color: #888;
  text-align: center;
  margin-top: 2rem;
`;

const StreamGrid: React.FC<StreamGridProps> = ({ streams, onRemoveStream, onUpdateStreams, channelCount, isEditMode }) => {
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({});
  const [isFullscreen, setIsFullscreen] = useState<{ [key: string]: boolean }>({});
  const [gridLocks, setGridLocks] = useState<{ [key: string]: boolean }>({});

  const cols = Math.max(1, Math.ceil(Math.sqrt(channelCount)));
  const rows = Math.max(1, Math.ceil(channelCount / cols));

  useEffect(() => {
    // if (isEditMode) {
    //   const locks = streams.map(stream => stream.id).reduce((acc, id) => ({ ...acc, [id]: true }), {});
    //   setGridLocks(locks);
    // }
  }, [isEditMode, streams]);

  if (!channelCount || !cols) {
    return <Info>Kanal ekleyin veya kanal sayısını artırın.</Info>;
  }

  // Recalculate layout positions when channelCount or streams.length changes
  const orderedStreams = streams.slice(0, channelCount).map((stream, idx) => ({
    ...stream,
    layout: {
      x: idx % cols,
      y: Math.floor(idx / cols),
      w: 1,
      h: 1,
    },
  }));

  const layouts = {
    lg: orderedStreams.map((stream) => ({
      i: stream.id,
      x: stream.layout.x,
      y: stream.layout.y,
      w: stream.layout.w,
      h: stream.layout.h,
      minW: 1,
      minH: 1,
      maxW: cols,
      maxH: rows,
      static: false,
    })),
  };

  const handleLayoutChange = (layout: Layout[]) => {
    const updatedStreams = streams.map((stream: Stream) => {
      const newLayout = layout.find((l: Layout) => l.i === stream.id);
      if (newLayout && !gridLocks[stream.id]) {
        return {
          ...stream,
          layout: {
            x: newLayout.x,
            y: newLayout.y,
            w: newLayout.w,
            h: newLayout.h,
          },
        };
      }
      return stream;
    });
    onUpdateStreams(updatedStreams);
  };

  const handleToggleMute = (streamId: string) => {
    setIsMuted(prev => ({
      ...prev,
      [streamId]: !prev[streamId]
    }));
  };

  const handleToggleFullscreen = (streamId: string) => {
    setIsFullscreen(prev => ({
      ...prev,
      [streamId]: !prev[streamId]
    }));
  };

  const handleToggleGridLock = (streamId: string, locked: boolean) => {
    console.log('StreamGrid handleToggleGridLock:', { streamId, locked, currentLocks: gridLocks });
    setGridLocks(prev => ({
      ...prev,
      [streamId]: locked
    }));
  };

  return (
    <GridContainer>
      <ResponsiveGridLayout
        key={channelCount + '-' + streams.length}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: cols, md: cols, sm: cols, xs: cols, xxs: cols }}
        rowHeight={Math.floor((window.innerHeight - 60) / rows)}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
        onLayoutChange={handleLayoutChange}
        style={{ gap: isEditMode ? '0' : '-1px' }}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        resizeHandles={['se']}
        draggableHandle={isEditMode ? '.drag-handle' : undefined}
      >
        {orderedStreams.map((stream: Stream) => (
          <div key={stream.id} style={{ margin: isEditMode ? '0' : '-1px' }}>
            <StreamCard
              stream={stream}
              onRemove={() => onRemoveStream(stream.id)}
              onToggleMute={() => handleToggleMute(stream.id)}
              isMuted={isMuted[stream.id] ?? true}
              onToggleFullscreen={() => handleToggleFullscreen(stream.id)}
              isFullscreen={isFullscreen[stream.id] ?? false}
              isEditMode={isEditMode}
              onUpdateStream={(updatedStream) => {
                const updatedStreams = streams.map(s => 
                  s.id === updatedStream.id ? updatedStream : s
                );
                onUpdateStreams(updatedStreams);
              }}
              onToggleGridLock={handleToggleGridLock}
              isGridLocked={gridLocks[stream.id] || false}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </GridContainer>
  );
};

export default StreamGrid; 