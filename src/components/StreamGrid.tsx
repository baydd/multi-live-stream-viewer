import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { Stream } from '../types';
import StreamCard from './StreamCard';
import { FaExpand, FaCompress, FaTrash } from 'react-icons/fa';

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
  background: #000;
  overflow: auto;
  position: relative;
  padding: 0;
  box-sizing: border-box;
`;

const GridWrapper = styled.div<{ $isEditMode: boolean; $gridCols: number; $cellHeight: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$gridCols}, 1fr);
  grid-auto-rows: ${props => props.$cellHeight}px;
  gap: ${props => props.$isEditMode ? '8px' : '0'};
  width: 100%;
  min-height: 100%;
  padding: ${props => props.$isEditMode ? '4px' : '0'};
  box-sizing: border-box;
  position: relative;
  transition: all 0.3s ease;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(${props => Math.max(1, Math.min(3, props.$gridCols))}, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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
  const [selectedStreams, setSelectedStreams] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{ id: string; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const gridRef = useRef<HTMLDivElement>(null);

  // Debounced window resize handler
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

  // Calculate grid columns based on window size
  const gridCols = useMemo(() => {
    if (windowSize.width < 480) return 1;
    if (windowSize.width < 768) return 2;
    if (windowSize.width < 1200) return Math.min(3, Math.ceil(Math.sqrt(channelCount)));
    return Math.min(4, Math.ceil(Math.sqrt(channelCount) * 1.2));
  }, [windowSize.width, channelCount]);

  // Calculate cell height based on window size and number of rows
  const cellHeight = useMemo(() => {
    const rows = Math.ceil(channelCount / gridCols);
    const headerHeight = 60; // Top bar height
    const padding = 16; // Total vertical padding
    const gap = 8 * (rows - 1); // Total gap between rows
    return Math.max(150, (windowSize.height - headerHeight - padding - gap) / rows);
  }, [channelCount, gridCols, windowSize.height]);

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

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string, index: number) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setDragItem({ id, index });
    // Add a small delay to allow the drag image to be set
    setTimeout(() => {
      const element = document.getElementById(`stream-${id}`);
      if (element) {
        element.style.opacity = '0.5';
      }
    }, 0);
  }, [isEditMode]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem && dragItem.index !== index) {
      setDragOverIndex(index);
    }
  }, [dragItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  // Handle drop for both reordering streams and adding new streams
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverIndex(null);
    
    const id = e.dataTransfer.getData('text/plain');
    
    // If we have a dragItem, this is a reorder operation
    if (dragItem && dragOverIndex !== null) {
      const newStreams = [...streams];
      const fromIndex = newStreams.findIndex(s => s.id === dragItem.id);
      const toIndex = dragOverIndex;
      
      if (fromIndex !== toIndex && fromIndex !== -1) {
        const [movedItem] = newStreams.splice(fromIndex, 1);
        newStreams.splice(toIndex, 0, movedItem);
        onUpdateStreams(newStreams);
      }
      
      // Reset drag state with a small delay
      setTimeout(() => {
        setDragItem(null);
        const element = document.getElementById(`stream-${id}`);
        if (element) {
          element.style.opacity = '1';
        }
      }, 100);
    } 
    // If we don't have a dragItem but have a URL, this is a new stream
    else if (id && id.startsWith('http')) {
      if (streams.length < channelCount) {
        // Auto-detect platform and add stream
        let platform: Stream['platform'] = 'hls';
        if (id.includes('youtube.com') || id.includes('youtu.be')) {
          platform = 'youtube';
        } else if (id.includes('twitch.tv')) {
          platform = 'twitch';
        } else if (id.includes('kick.com')) {
          platform = 'kick';
        } else if (id.includes('twitter.com') || id.includes('x.com')) {
          platform = 'twitter';
        }

        const newStream: Stream = {
          id: Date.now().toString(),
          url: id,
          title: `Stream ${streams.length + 1}`,
          platform,
          category: '',
          notes: '',
          layout: {
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          }
        };

        onUpdateStreams([...streams, newStream]);
      }
    }
    
    // Reset drag state if it's still set
    setDragItem(null);
    setDragOverIndex(null);
  }, [streams, channelCount, onUpdateStreams, dragItem, dragOverIndex]);

  // Generate grid items with proper styling
  const gridItems = useMemo(() => {
    return streams.slice(0, channelCount).map((stream, index) => {
      const isSelected = selectedStreams.has(stream.id);
      const isDragged = dragItem?.id === stream.id;
      const isDragOver = dragOverIndex === index && dragItem?.id !== stream.id;
      
      // Calculate grid position for non-edit mode
      const gridColumn = isEditMode ? 'auto' : `${(index % gridCols) + 1} / span 1`;
      const gridRow = isEditMode ? 'auto' : `${Math.floor(index / gridCols) + 1} / span 1`;
      
      return {
        ...stream,
        index,
        isSelected,
        isDragged,
        isDragOver,
        style: {
          gridColumn: gridColumn,
          gridRow: gridRow,
          opacity: isDragged ? 0.5 : 1,
          cursor: isEditMode ? 'grab' : 'default',
          transition: 'all 0.3s ease',
          transform: isDragged ? 'scale(0.98)' : isDragOver ? 'scale(0.99)' : 'scale(1)',
          zIndex: isDragged ? 10 : isDragOver ? 5 : 1,
          boxShadow: isEditMode && isSelected ? '0 0 0 2px #3b82f6' : 'none',
          borderRadius: isEditMode ? '8px' : '0',
          overflow: 'hidden',
          backgroundColor: '#000',
          position: 'relative',
          border: 'none',
          '&:hover': {
            boxShadow: isEditMode ? '0 4px 16px rgba(59, 130, 246, 0.4)' : 'none',
          },
          '&:active': {
            cursor: isEditMode ? 'grabbing' : 'default'
          }
        }
      };
    });
  }, [streams, channelCount, selectedStreams, dragItem, dragOverIndex, isEditMode]);

  // Removed react-grid-layout related code as we're using CSS Grid now

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

  // Removed handleToggleGridLock as it's not used with CSS Grid

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


  if (!channelCount) {
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
      ref={gridRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={handleDrop}
    >
      <GridWrapper 
        $isEditMode={isEditMode}
        $gridCols={gridCols}
        $cellHeight={cellHeight}
      >
        {gridItems.map((item) => (
          <div
            key={item.id}
            id={`stream-${item.id}`}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, item.id, item.index)}
            onDragOver={(e) => handleDragOver(e, item.index)}
            onDragLeave={handleDragLeave}
            style={item.style as React.CSSProperties}
            onClick={() => {
              if (isEditMode) {
                handleStreamSelect(item.id, !item.isSelected);
              }
            }}
          >
            <StreamCard
              stream={item}
              onRemove={() => onRemoveStream(item.id)}
              onToggleMute={() => {
                setIsMuted(prev => ({
                  ...prev,
                  [item.id]: !prev[item.id]
                }));
              }}
              isMuted={isMuted[item.id] ?? true}
              onToggleFullscreen={() => {
                setIsFullscreen(prev => ({
                  ...prev,
                  [item.id]: !prev[item.id]
                }));
              }}
              isFullscreen={isFullscreen[item.id] ?? false}
              isEditMode={isEditMode}
              isSelected={item.isSelected}
              onSelect={(selected) => handleStreamSelect(item.id, selected)}
              onUpdateStream={(updatedStream) => {
                const updatedStreams = streams.map(s => 
                  s.id === updatedStream.id ? updatedStream : s
                );
                onUpdateStreams(updatedStreams);
              }}
            />
          </div>
        ))}
      </GridWrapper>

      {isEditMode && selectedStreams.size > 0 && (
        <QuickActions visible={selectedStreams.size > 0}>
          <QuickActionButton
            onClick={() => {
              selectedStreams.forEach(id => onRemoveStream(id));
              setSelectedStreams(new Set());
            }}
            title="Delete selected streams"
          >
            <FaTrash />
          </QuickActionButton>
        </QuickActions>
      )}
    </GridContainer>
  );
};

export default StreamGrid;