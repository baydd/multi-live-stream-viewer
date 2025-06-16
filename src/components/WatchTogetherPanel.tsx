import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUsers, FaCrown, FaUserShield, FaCopy, FaSync, FaSignOutAlt } from 'react-icons/fa';
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
  left: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background-color: ${props => props.theme.background};
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  transition: left 0.3s ease-in-out;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.cardBackground};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 4px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.5rem;
  cursor: pointer;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: none;
  background: ${props => 
    props.variant === 'danger' ? '#dc3545' :
    props.variant === 'secondary' ? props.theme.cardBackground :
    props.theme.primary
  };
  color: ${props => props.variant === 'secondary' ? props.theme.text : '#fff'};
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RoomInfo = styled.div`
  background: ${props => props.theme.cardBackground};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const RoomCode = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.primary};
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ParticipantsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const Participant = styled.div<{ hasUpdate?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: ${props => props.hasUpdate ? props.theme.primary + '20' : props.theme.cardBackground};
  border: ${props => props.hasUpdate ? `2px solid ${props.theme.primary}` : '1px solid ' + props.theme.border};
  border-radius: 4px;
  cursor: ${props => props.hasUpdate ? 'pointer' : 'default'};
  transition: all 0.2s;

  &:hover {
    opacity: ${props => props.hasUpdate ? 0.8 : 1};
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ParticipantName = styled.span`
  font-weight: bold;
`;

const Badge = styled.span<{ type: 'owner' | 'admin' }>`
  background: ${props => props.type === 'owner' ? '#ffd700' : props.theme.primary};
  color: ${props => props.type === 'owner' ? '#000' : '#fff'};
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const UpdateNotification = styled.div`
  background: ${props => props.theme.primary};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
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

    return () => {
      watchTogetherService.disconnect();
    };
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
      
      // Share current streams with the room
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
      
      // Load room streams
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
  };

  const handleShareStreams = async () => {
    if (!currentUser?.isAdmin) return;
    
    await watchTogetherService.updateStreams(streams, channelCount);
  };

  const handleApplyUpdate = (userId: string) => {
    const update = pendingUpdates[userId];
    if (update) {
      onUpdateStreams(update.streams);
      onUpdateChannelCount(update.channelCount);
      
      // Remove the update notification
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

      {mode === 'join' ? (
        <Section>
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
          <Button variant="secondary" onClick={() => setMode('create')}>
            {t('watch_together.create_room_instead')}
          </Button>
        </Section>
      ) : (
        <Section>
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
          <Button variant="secondary" onClick={() => setMode('join')}>
            {t('watch_together.join_room_instead')}
          </Button>
        </Section>
      )}
    </>
  );

  const renderRoom = () => (
    <>
      <Section>
        <RoomInfo>
          <div><strong>{currentRoom?.name}</strong></div>
          <RoomCode>
            {currentRoom?.code}
            <FaCopy 
              onClick={copyRoomCode} 
              style={{ cursor: 'pointer', fontSize: '1rem' }}
              title={t('watch_together.copy_code') as string}
            />
          </RoomCode>
          <div>{t('watch_together.participants')}: {currentRoom?.participants.length}</div>
        </RoomInfo>
      </Section>

      {Object.keys(pendingUpdates).length > 0 && (
        <Section>
          <SectionTitle>{t('watch_together.pending_updates')}</SectionTitle>
          {Object.entries(pendingUpdates).map(([userId, update]) => (
            <UpdateNotification key={userId}>
              <div>{t('watch_together.update_available_from', { username: update.username })}</div>
              <Button 
                variant="secondary" 
                onClick={() => handleApplyUpdate(userId)}
                style={{ marginTop: '0.5rem' }}
              >
                <FaSync />
                {t('watch_together.apply_update')}
              </Button>
            </UpdateNotification>
          ))}
        </Section>
      )}

      <Section>
        <SectionTitle>{t('watch_together.participants')}</SectionTitle>
        <ParticipantsList>
          {currentRoom?.participants.map((participant) => (
            <Participant 
              key={participant.id}
              hasUpdate={!!pendingUpdates[participant.username]}
              onClick={() => pendingUpdates[participant.username] && handleApplyUpdate(participant.username)}
            >
              <ParticipantInfo>
                <ParticipantName>{participant.username}</ParticipantName>
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
              </ParticipantInfo>
            </Participant>
          ))}
        </ParticipantsList>
      </Section>

      {currentUser?.isAdmin && (
        <Section>
          <Button onClick={handleShareStreams}>
            <FaSync />
            {t('watch_together.share_streams')}
          </Button>
        </Section>
      )}

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
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
      
      <Title>
        <FaUsers />
        {t('watch_together.title')}
      </Title>

      {error && (
        <UpdateNotification style={{ background: '#dc3545' }}>
          {error}
        </UpdateNotification>
      )}

      {mode === 'room' && currentRoom ? renderRoom() : renderJoinCreate()}
    </Panel>
  );
};

export default WatchTogetherPanel;