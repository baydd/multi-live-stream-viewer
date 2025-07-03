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
  overflow: hidden;
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
  const [isGridFrozen, setIsGridFrozen] = useState(false);

  // Window size state with debounced updates (freeze kontrolü)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    if (isGridFrozen) return; // Freeze iken resize dinleme
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
  }, [isGridFrozen]);

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

  // Optimized grid calculation with proper responsive behavior
  const gridConfig = useMemo(() => {
    const padding = isEditMode ? 16 : 0;
    const gridWidth = Math.max(windowSize.width - padding, 320);
    const gridHeight = Math.max(windowSize.height - 60 - padding, 240);
    
    // Calculate optimal grid layout based on screen size and channel count
    let cols = 1;
    let rows = channelCount;
    
    if (channelCount <= 1) {
      cols = 1;
      rows = 1;
    } else if (channelCount <= 4) {
      cols = Math.min(2, channelCount);
      rows = Math.ceil(channelCount / cols);
    } else if (channelCount <= 9) {
      cols = Math.min(3, Math.ceil(Math.sqrt(channelCount)));
      rows = Math.ceil(channelCount / cols);
    } else if (channelCount <= 16) {
      cols = Math.min(4, Math.ceil(Math.sqrt(channelCount)));
      rows = Math.ceil(channelCount / cols);
    } else {
      cols = Math.min(5, Math.ceil(Math.sqrt(channelCount)));
      rows = Math.ceil(channelCount / cols);
    }

    // Responsive breakpoints
    if (gridWidth < 768) {
      // Mobile: Force single column or max 2 columns
      cols = Math.min(cols, gridWidth < 480 ? 1 : 2);
      rows = Math.ceil(channelCount / cols);
    } else if (gridWidth < 1024) {
      // Tablet: Max 3 columns
      cols = Math.min(cols, 3);
      rows = Math.ceil(channelCount / cols);
    }

    // Calculate cell dimensions
    const cellWidth = Math.floor(gridWidth / cols);
    const cellHeight = Math.floor(gridHeight / rows);
    
    // Ensure minimum cell size
    const minCellWidth = 200;
    const minCellHeight = 150;
    
    if (cellWidth < minCellWidth || cellHeight < minCellHeight) {
      // Recalculate with minimum constraints
      const maxColsByWidth = Math.floor(gridWidth / minCellWidth);
      const maxRowsByHeight = Math.floor(gridHeight / minCellHeight);
      
      cols = Math.min(cols, maxColsByWidth);
      rows = Math.min(rows, maxRowsByHeight);
      
      // Ensure we can fit all channels
      if (cols * rows < channelCount) {
        if (maxColsByWidth * maxRowsByHeight >= channelCount) {
          // Redistribute
          cols = Math.min(maxColsByWidth, Math.ceil(Math.sqrt(channelCount)));
          rows = Math.ceil(channelCount / cols);
        } else {
          // Use maximum possible
          cols = maxColsByWidth;
          rows = maxRowsByHeight;
        }
      }
    }

    const finalCellWidth = Math.floor(gridWidth / cols);
    const finalCellHeight = Math.floor(gridHeight / rows);

    return {
      cols: Math.max(1, cols),
      rows: Math.max(1, rows),
      width: gridWidth,
      height: gridHeight,
      cellWidth: Math.max(minCellWidth, finalCellWidth),
      cellHeight: Math.max(minCellHeight, finalCellHeight),
      rowHeight: Math.max(minCellHeight, finalCellHeight)
    };
  }, [windowSize, channelCount, isEditMode]);

  // Generate ordered streams with proper layout and bounds checking
  const orderedStreams = useMemo(() => {
    return streams.slice(0, channelCount).map((stream, idx) => {
      const col = idx % gridConfig.cols;
      const row = Math.floor(idx / gridConfig.cols);
      
      // Ensure the stream fits within grid bounds
      const maxRow = Math.max(0, gridConfig.rows - 1);
      const boundedRow = Math.min(row, maxRow);
      
      return {
        ...stream,
        layout: {
          x: col,
          y: boundedRow,
          w: 1,
          h: 1,
        },
      };
    });
  }, [streams, channelCount, gridConfig]);

  // Generate layouts for react-grid-layout with strict bounds checking
  const layouts = useMemo(() => ({
    lg: orderedStreams.map((stream) => ({
      i: stream.id,
      x: Math.max(0, Math.min(stream.layout.x, gridConfig.cols - 1)),
      y: Math.max(0, stream.layout.y),
      w: Math.max(1, Math.min(stream.layout.w, gridConfig.cols)),
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: gridConfig.cols,
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    })),
    md: orderedStreams.map((stream) => ({
      i: stream.id,
      x: Math.max(0, Math.min(stream.layout.x, Math.max(1, gridConfig.cols - 1))),
      y: Math.max(0, stream.layout.y),
      w: Math.max(1, Math.min(stream.layout.w, Math.max(1, gridConfig.cols - 1))),
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: Math.max(1, gridConfig.cols - 1),
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    })),
    sm: orderedStreams.map((stream) => ({
      i: stream.id,
      x: Math.max(0, Math.min(stream.layout.x, 1)),
      y: Math.max(0, stream.layout.y),
      w: 1,
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: 2,
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    })),
    xs: orderedStreams.map((stream) => ({
      i: stream.id,
      x: 0,
      y: Math.max(0, stream.layout.y),
      w: 1,
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: 1,
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    })),
    xxs: orderedStreams.map((stream) => ({
      i: stream.id,
      x: 0,
      y: Math.max(0, stream.layout.y),
      w: 1,
      h: Math.max(1, stream.layout.h),
      minW: 1,
      minH: 1,
      maxW: 1,
      maxH: gridConfig.rows,
      static: gridLocks[stream.id] || false,
    }))
  }), [orderedStreams, gridConfig, gridLocks]);

  // Freeze grid callback
  const freezeGrid = useCallback((freeze: boolean) => {
    setIsGridFrozen(freeze);
  }, []);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    if (isGridFrozen || !isEditMode) return;
    
    const updatedStreams = streams.map((stream: Stream) => {
      const newLayout = layout.find((l: Layout) => l.i === stream.id);
      if (newLayout && !gridLocks[stream.id]) {
        // Strict bounds checking to prevent grid items from going off-screen
        const maxX = Math.max(0, gridConfig.cols - newLayout.w);
        const maxY = Math.max(0, gridConfig.rows - newLayout.h);
        
        const boundedX = Math.max(0, Math.min(newLayout.x, maxX));
        const boundedY = Math.max(0, Math.min(newLayout.y, maxY));
        const boundedW = Math.max(1, Math.min(newLayout.w, gridConfig.cols - boundedX));
        const boundedH = Math.max(1, Math.min(newLayout.h, gridConfig.rows - boundedY));
        
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
  }, [streams, isEditMode, gridLocks, gridConfig, onUpdateStreams, isGridFrozen]);

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
    if (isGridFrozen) return;
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
  }, [streams, channelCount, gridConfig.cols, onUpdateStreams, isGridFrozen]);

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
          width: '100%', 
          height: '100%',
          maxWidth: gridConfig.width,
          maxHeight: gridConfig.height,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isGridFrozen && (
            <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', background: '#222', color: '#fff', zIndex: 99999, textAlign: 'center', padding: 8, fontSize: 16}}>
              Tam ekran modunda grid düzeni donduruldu. Çıkınca devam edecek.
            </div>
          )}
          <ResponsiveGridLayout
            key={`${channelCount}-${streams.length}-${gridConfig.cols}-${windowSize.width}-${windowSize.height}`}
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ 
              lg: gridConfig.cols, 
              md: Math.max(1, gridConfig.cols - 1), 
              sm: Math.min(2, gridConfig.cols), 
              xs: 1, 
              xxs: 1 
            }}
            rowHeight={gridConfig.rowHeight}
            width={gridConfig.width}
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
            autoSize={false}
            verticalCompact={true}
            style={{ 
              width: '100%', 
              height: '100%',
              overflow: 'hidden'
            }}
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
                  position: 'relative',
                  width: '100%',
                  height: '100%'
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
                  freezeGrid={freezeGrid}
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