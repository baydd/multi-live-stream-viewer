import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useHotkeys } from 'react-hotkeys-hook';
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
  width: 100vw;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
  position: relative;
`;

const GridWrapper = styled.div<{ isEditMode: boolean }>`
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  padding: ${props => props.isEditMode ? '8px' : '0'};
  box-sizing: border-box;
`;

const Info = styled.div`
  color: #888;
  text-align: center;
  margin: 2rem;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  
  h3 {
    margin-bottom: 1rem;
    color: ${props => props.theme.text};
  }
  
  p {
    margin-bottom: 0.5rem;
    opacity: 0.8;
  }
`;

const GridOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed ${props => props.theme.primary};
  border-radius: 8px;
  display: ${props => props.visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  
  &::after {
    content: 'Drop here to add stream';
    color: ${props => props.theme.primary};
    font-weight: 600;
    font-size: 1.2rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
`;

const QuickActions = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: ${props => props.visible ? 'flex' : 'none'};
  gap: 12px;
  z-index: 100;
`;

const QuickActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'danger': return props.theme.error;
      case 'secondary': return props.theme.secondary;
      default: return props.theme.primary;
    }
  }};
  border: none;
  color: white;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadowLg};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadowLg};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StreamGrid: React.FC<StreamGridProps> = ({ 
  streams, 
  onRemoveStream, 
  onUpdateStreams, 
  channelCount, 
  isEditMode 
}) => {
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({});
  const [isFullscreen, setIsFullscreen] = useState<{ [key: string]: boolean }>({});
  const [gridLocks, setGridLocks] = useState<{ [key: string]: boolean }>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState<Set<string>>(new Set());

  // Window size state with debounced updates
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Keyboard shortcuts
  useHotkeys('ctrl+a', (e) => {
    e.preventDefault();
    if (isEditMode) {
      setSelectedStreams(new Set(streams.map(s => s.id)));
    }
  }, [isEditMode, streams]);

  useHotkeys('delete', () => {
    if (isEditMode && selectedStreams.size > 0) {
      selectedStreams.forEach(id => onRemoveStream(id));
      setSelectedStreams(new Set());
    }
  }, [isEditMode, selectedStreams, onRemoveStream]);

  useHotkeys('escape', () => {
    setSelectedStreams(new Set());
  }, []);

  // Optimized grid calculation with proper bounds
  const gridConfig = useMemo(() => {
    const gridWidth = windowSize.width - (isEditMode ? 16 : 0);
    const gridHeight = windowSize.height - 60 - (isEditMode ? 16 : 0);
    const screenAspect = gridWidth / gridHeight;
    const boxAspect = 16 / 9;
    
    let bestCols = 1;
    let bestRows = channelCount;
    let minDiff = Infinity;

    // Find optimal grid layout
    for (let cols = 1; cols <= Math.min(channelCount, 6); cols++) {
      const rows = Math.ceil(channelCount / cols);
      const gridAspect = (cols * boxAspect) / rows;
      const diff = Math.abs(gridAspect - screenAspect);
      
      if (diff < minDiff) {
        minDiff = diff;
        bestCols = cols;
        bestRows = rows;
      }
    }

    const cols = bestCols;
    const rows = bestRows;
    const gridAspect = (cols * boxAspect) / rows;
    
    let width, height;
    if (gridWidth / gridHeight > gridAspect) {
      height = gridHeight;
      width = height * gridAspect;
    } else {
      width = gridWidth;
      height = width / gridAspect;
    }

    // Ensure grid doesn't exceed viewport with safety margins
    const maxWidth = gridWidth * 0.95;
    const maxHeight = gridHeight * 0.95;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / gridAspect;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * gridAspect;
    }

    return {
      cols,
      rows,
      width: Math.max(width, 400),
      height: Math.max(height, 300),
      rowHeight: Math.max(height / rows, 150)
    };
  }, [windowSize, channelCount, isEditMode]);

  // Generate ordered streams with proper layout
  const orderedStreams = useMemo(() => {
    return streams.slice(0, channelCount).map((stream, idx) => {
      const col = idx % gridConfig.cols;
      const row = Math.floor(idx / gridConfig.cols);
      
      return {
        ...stream,
        layout: {
          x: col,
          y: row,
          w: 1,
          h: 1,
        },
      };
    });
  }, [streams, channelCount, gridConfig.cols]);

  // Generate layouts for react-grid-layout with bounds checking
  const layouts = useMemo(() => ({
    lg: orderedStreams.map((stream) => ({
      i: stream.id,
      x: Math.min(stream.layout.x, gridConfig.cols - 1),
      y: Math.max(0, stream.layout.y),
      w: Math.min(stream.layout.w, gridConfig.cols),
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: gridConfig.cols,
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    })),
  }), [orderedStreams, gridConfig, gridLocks]);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    if (!isEditMode) return;
    
    const updatedStreams = streams.map((stream: Stream) => {
      const newLayout = layout.find((l: Layout) => l.i === stream.id);
      if (newLayout && !gridLocks[stream.id]) {
        // Strict bounds checking to prevent grid items from going off-screen
        const boundedX = Math.max(0, Math.min(newLayout.x, gridConfig.cols - newLayout.w));
        const boundedY = Math.max(0, newLayout.y);
        const boundedW = Math.max(1, Math.min(newLayout.w, gridConfig.cols - boundedX));
        const boundedH = Math.max(1, newLayout.h);
        
        return {
          ...stream,
          layout: {
            x: boundedX,
            y: boundedY,
            w: boundedW,
            h: boundedH,
          },
        };
      }
      return stream;
    });
    onUpdateStreams(updatedStreams);
  }, [streams, isEditMode, gridLocks, gridConfig, onUpdateStreams]);

  const handleToggleMute = useCallback((streamId: string) => {
    setIsMuted(prev => ({
      ...prev,
      [streamId]: !prev[streamId]
    }));
  }, []);

  const handleToggleFullscreen = useCallback((streamId: string) => {
    setIsFullscreen(prev => ({
      ...prev,
      [streamId]: !prev[streamId]
    }));
  }, []);

  const handleToggleGridLock = useCallback((streamId: string, locked: boolean) => {
    setGridLocks(prev => ({
      ...prev,
      [streamId]: locked
    }));
  }, []);

  const handleStreamSelect = useCallback((streamId: string, selected: boolean) => {
    setSelectedStreams(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(streamId);
      } else {
        newSet.delete(streamId);
      }
      return newSet;
    });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const url = e.dataTransfer.getData('text/plain');
    if (url && streams.length < channelCount) {
      // Auto-detect platform and add stream
      let platform: Stream['platform'] = 'hls';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube';
      } else if (url.includes('twitch.tv')) {
        platform = 'twitch';
      } else if (url.includes('kick.com')) {
        platform = 'kick';
      } else if (url.includes('twitter.com') || url.includes('x.com')) {
        platform = 'twitter';
      }

      const newStream: Stream = {
        id: Date.now().toString(),
        url,
        title: `Stream ${streams.length + 1}`,
        platform,
        category: '',
        notes: '',
        layout: {
          x: streams.length % gridConfig.cols,
          y: Math.floor(streams.length / gridConfig.cols),
          w: 1,
          h: 1,
        }
      };

      onUpdateStreams([...streams, newStream]);
    }
  }, [streams, channelCount, gridConfig.cols, onUpdateStreams]);

  if (!channelCount || !gridConfig.cols) {
    return (
      <GridContainer>
        <Info>
          <h3>Welcome to StreamDash</h3>
          <p>Add channels or increase channel count to get started.</p>
          <p>Use the settings panel to configure your streams.</p>
        </Info>
      </GridContainer>
    );
  }

  return (
    <GridContainer
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <GridOverlay visible={isDragOver} />

      <GridWrapper isEditMode={isEditMode}>
        <div style={{ 
          width: gridConfig.width, 
          height: gridConfig.height,
          margin: '0 auto',
          position: 'relative'
        }}>
          <ResponsiveGridLayout
            key={`${channelCount}-${streams.length}-${gridConfig.cols}`}
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ 
              lg: gridConfig.cols, 
              md: gridConfig.cols, 
              sm: Math.max(1, gridConfig.cols - 1), 
              xs: Math.max(1, gridConfig.cols - 2), 
              xxs: 1 
            }}
            rowHeight={gridConfig.rowHeight}
            margin={isEditMode ? [4, 4] : [0, 0]}
            containerPadding={[0, 0]}
            compactType="vertical"
            preventCollision={false}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            resizeHandles={['se']}
            draggableHandle={isEditMode ? '.drag-handle' : undefined}
            isBounded={true}
            useCSSTransforms={true}
            transformScale={1}
            style={{ width: '100%', height: '100%' }}
          >
            {orderedStreams.map((stream: Stream) => (
              <div
                key={stream.id}
                style={{
                  background: '#000',
                  borderRadius: isEditMode ? '8px' : '0',
                  overflow: 'hidden',
                  border: selectedStreams.has(stream.id) ? `2px solid ${isEditMode ? '#3b82f6' : 'transparent'}` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <StreamCard
                  stream={stream}
                  onRemove={() => onRemoveStream(stream.id)}
                  onToggleMute={() => handleToggleMute(stream.id)}
                  isMuted={isMuted[stream.id] ?? true}
                  onToggleFullscreen={() => handleToggleFullscreen(stream.id)}
                  isFullscreen={isFullscreen[stream.id] ?? false}
                  isEditMode={isEditMode}
                  isSelected={selectedStreams.has(stream.id)}
                  onSelect={(selected) => handleStreamSelect(stream.id, selected)}
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
        </div>
      </GridWrapper>

      <QuickActions visible={isEditMode && selectedStreams.size > 0}>
        <QuickActionButton
          variant="danger"
          onClick={() => {
            selectedStreams.forEach(id => onRemoveStream(id));
            setSelectedStreams(new Set());
          }}
          title="Delete selected streams"
        >
          🗑️
        </QuickActionButton>
      </QuickActions>
    </GridContainer>
  );
};

export default StreamGrid;