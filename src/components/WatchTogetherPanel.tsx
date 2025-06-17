import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUsers, FaCrown, FaUserShield, FaCopy, FaSync, FaSignOutAlt, FaEye, FaEyeSlash, FaPlus, FaUserFriends } from 'react-icons/fa';
import { WatchTogetherRoom, WatchTogetherUser, Stream } from '../types';
import { watchTogetherService } from '../services/watchTogetherService';

interface WatchTogetherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  streams: Stream[];
  channelCount: number;
  onUpdateStreams: (streams: Stream[]) => void;
  onUpdateChannelCount: (count: number) => void;
}

const Panel = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-450px'};
  width: 450px;
  height: 100vh;
  background: ${props => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  box-shadow: ${props => props.theme.shadowLg};
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;
  border-left: 1px solid ${props => props.theme.border};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 3px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.primary};
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.secondary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${props => 
    props.variant === 'danger' ? props.theme.error :
    props.variant === 'secondary' ? props.theme.hover :
    props.theme.primary
  };
  color: ${props => props.variant === 'secondary' ? props.theme.text : '#ffffff'};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  width: 100%;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadow};
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RoomInfo = styled.div`
  background: ${props => props.theme.background};
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.theme.border};
`;

const RoomName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
`;

const RoomCode = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.theme.primary};
  margin: 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.theme.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.primary}30;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.primary}20;
  }
`;

const ParticipantsList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 2px;
  }
`;

const Participant = styled.div<{ hasUpdate?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: ${props => props.hasUpdate ? props.theme.primary + '15' : props.theme.background};
  border: 2px solid ${props => props.hasUpdate ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  cursor: ${props => props.hasUpdate ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.hasUpdate ? props.theme.primary + '20' : props.theme.hover};
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.theme.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const ParticipantName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const Badge = styled.span<{ type: 'owner' | 'admin' }>`
  background: ${props => props.type === 'owner' ? '#ffd700' : props.theme.primary};
  color: ${props => props.type === 'owner' ? '#000' : '#fff'};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const UpdateNotification = styled.div`
  background: ${props => props.theme.primary};
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const ModeToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: ${props => props.theme.background};
  padding: 0.25rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 0.75rem;
  border: none;
  background: ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? '#ffffff' : props.theme.text};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.hover};
  }
`;

const WatchTogetherPanel: React.FC<WatchTogetherPanelProps> = ({
  isOpen,
  onClose,
  streams,
  channelCount,
  onUpdateStreams,
  onUpdateChannelCount
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'join' | 'create' | 'room'>('join');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState<WatchTogetherRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<WatchTogetherUser | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<{[userId: string]: any}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomCode, setShowRoomCode] = useState(false);

  useEffect(() => {
    watchTogetherService.connect();
    
    watchTogetherService.setCallbacks({
      onRoomUpdate: (room) => setCurrentRoom(room),
      onUserJoined: (user) => {
        console.log(`${user.username} joined the room`);
      },
      onUserLeft: (userId) => {
        console.log(`User ${userId} left the room`);
      },
      onStreamsUpdate: (newStreams, updatedBy, newChannelCount) => {
        if (updatedBy !== currentUser?.username) {
          setPendingUpdates(prev => ({
            ...prev,
            [updatedBy]: {
              username: updatedBy,
              streams: newStreams,
              channelCount: newChannelCount,
              timestamp: new Date().toISOString()
            }
          }));
        }
      },
      onError: (error) => setError(error)
    });
  }, [currentUser?.username]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !username.trim()) {
      setError(t('watch_together.fill_all_fields') as string);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { room, user } = await watchTogetherService.createRoom(roomName, username);
      setCurrentRoom(room);
      setCurrentUser(user);
      setMode('room');
      
      await watchTogetherService.updateStreams(streams, channelCount);
    } catch (err) {
      setError(t('watch_together.create_room_error') as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !username.trim()) {
      setError(t('watch_together.fill_all_fields') as string);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { room, user } = await watchTogetherService.joinRoom(roomCode.toUpperCase(), username);
      setCurrentRoom(room);
      setCurrentUser(user);
      setMode('room');
      
      if (room.streams.length > 0) {
        onUpdateStreams(room.streams);
        onUpdateChannelCount(room.channelCount);
      }
    } catch (err) {
      setError(t('watch_together.join_room_error') as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    await watchTogetherService.leaveRoom();
    setCurrentRoom(null);
    setCurrentUser(null);
    setPendingUpdates({});
    setMode('join');
    watchTogetherService.disconnect();
  };

  const handleShareStreams = async () => {
    await watchTogetherService.updateStreams(streams, channelCount);
  };

  const handleApplyUpdate = (userId: string) => {
    const update = pendingUpdates[userId];
    if (update) {
      onUpdateStreams(update.streams);
      onUpdateChannelCount(update.channelCount);
      
      setPendingUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[userId];
        return newUpdates;
      });
    }
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
    }
  };

  const renderJoinCreate = () => (
    <>
      <Section>
        <Input
          type="text"
          placeholder={t('watch_together.username_placeholder') as string}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Section>

      <Section>
        <ModeToggle>
          <ModeButton active={mode === 'join'} onClick={() => setMode('join')}>
            <FaUserFriends />
            Join Room
          </ModeButton>
          <ModeButton active={mode === 'create'} onClick={() => setMode('create')}>
            <FaPlus />
            Create Room
          </ModeButton>
        </ModeToggle>

        {mode === 'join' ? (
          <>
            <Input
              type="text"
              placeholder={t('watch_together.room_code_placeholder') as string}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <Button onClick={handleJoinRoom} disabled={isLoading}>
              <FaUsers />
              {t('watch_together.join_room')}
            </Button>
          </>
        ) : (
          <>
            <Input
              type="text"
              placeholder={t('watch_together.room_name_placeholder') as string}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <Button onClick={handleCreateRoom} disabled={isLoading}>
              <FaUsers />
              {t('watch_together.create_room')}
            </Button>
          </>
        )}
      </Section>
    </>
  );

  const renderRoom = () => (
    <>
      <Section>
        <RoomInfo>
          <RoomName>{currentRoom?.name}</RoomName>
          <RoomCode>
            {showRoomCode ? currentRoom?.code : '••••••'}
            <IconButton onClick={copyRoomCode} title={t('watch_together.copy_code') as string}>
              <FaCopy />
            </IconButton>
            <IconButton 
              onClick={() => setShowRoomCode(!showRoomCode)}
              title={showRoomCode ? t('watch_together.hide_code') as string : t('watch_together.show_code') as string}
            >
              {showRoomCode ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </RoomCode>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {t('watch_together.participants')}: {currentRoom?.participants.length}
          </div>
        </RoomInfo>
      </Section>

      {Object.keys(pendingUpdates).length > 0 && (
        <Section>
          <SectionTitle>🔄 {t('watch_together.pending_updates')}</SectionTitle>
          {Object.entries(pendingUpdates).map(([userId, update]) => (
            <UpdateNotification key={userId}>
              <div>{t('watch_together.update_available_from', { username: update.username })}</div>
              <Button 
                variant="secondary" 
                onClick={() => handleApplyUpdate(userId)}
                style={{ marginTop: '0.75rem', marginBottom: 0 }}
              >
                <FaSync />
                {t('watch_together.apply_update')}
              </Button>
            </UpdateNotification>
          ))}
        </Section>
      )}

      <Section>
        <SectionTitle>👥 {t('watch_together.participants')}</SectionTitle>
        <ParticipantsList>
          {currentRoom?.participants.map((participant) => (
            <Participant 
              key={participant.id}
              hasUpdate={!!pendingUpdates[participant.username]}
              onClick={() => pendingUpdates[participant.username] && handleApplyUpdate(participant.username)}
            >
              <ParticipantInfo>
                <Avatar>
                  {participant.username.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <ParticipantName>{participant.username}</ParticipantName>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {participant.isOwner && (
                      <Badge type="owner">
                        <FaCrown /> {t('watch_together.owner')}
                      </Badge>
                    )}
                    {participant.isAdmin && !participant.isOwner && (
                      <Badge type="admin">
                        <FaUserShield /> {t('watch_together.admin')}
                      </Badge>
                    )}
                  </div>
                </div>
              </ParticipantInfo>
            </Participant>
          ))}
        </ParticipantsList>
      </Section>

      <Section>
        <Button onClick={handleShareStreams}>
          <FaSync />
          {t('watch_together.share_streams')}
        </Button>
      </Section>

      <Section>
        <Button variant="danger" onClick={handleLeaveRoom}>
          <FaSignOutAlt />
          {t('watch_together.leave_room')}
        </Button>
      </Section>
    </>
  );

  return (
    <Panel isOpen={isOpen}>
      <Header>
        <Title>
          <FaUsers />
          {t('watch_together.title')}
        </Title>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </Header>

      {error && (
        <UpdateNotification style={{ background: '#ef4444' }}>
          {error}
        </UpdateNotification>
      )}

      {mode === 'room' && currentRoom ? renderRoom() : renderJoinCreate()}
    </Panel>
  );
};

export default WatchTogetherPanel;