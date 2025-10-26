import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  FaTimes,
  FaUsers,
  FaCrown,
  FaUserShield,
  FaCopy,
  FaSync,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaUserFriends,
  FaDownload,
  FaShare,
  FaBan,
  FaUserCog,
  FaCheck,
  FaExclamationTriangle,
  FaLock,
  FaUnlock,
  FaHandPaper,
  FaUser,
  FaComments,
  FaPaperPlane,
} from 'react-icons/fa';
import { WatchTogetherRoom, WatchTogetherUser, Stream } from '../types';
import { watchTogetherService } from '../services/watchTogetherService';
import SimplePeer from 'simple-peer';
import { voiceService } from '../services/voiceService';

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
  right: ${(props) => (props.isOpen ? '0' : '-500px')};
  width: 500px;
  height: 100vh;
  background: ${(props) => props.theme.cardBackground};
  backdrop-filter: blur(20px);
  box-shadow: ${(props) => props.theme.shadowLg};
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;
  border-left: 1px solid ${(props) => props.theme.border};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 4px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${(props) => props.theme.border};
`;

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.hover};
    color: ${(props) => props.theme.primary};
    transform: scale(1.1);
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => props.theme.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${(props) => props.theme.primary}10;
  border-radius: 12px;
  border-left: 4px solid ${(props) => props.theme.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 12px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.primary}20;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${(props) => props.theme.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: ${(props) => {
    switch (props.variant) {
      case 'danger':
        return props.theme.error;
      case 'success':
        return props.theme.success;
      case 'secondary':
        return props.theme.secondary;
      default:
        return props.theme.primary;
    }
  }};
  color: ${(props) => (props.variant === 'secondary' ? props.theme.text : '#ffffff')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
  box-shadow: ${(props) => props.theme.shadow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadowLg};
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${(props) => props.theme.buttonDisabled};
    cursor: not-allowed;
    transform: none;
    filter: none;
  }
`;

const RoomInfo = styled.div`
  background: ${(props) => props.theme.background};
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 2px solid ${(props) => props.theme.border};
  box-shadow: ${(props) => props.theme.shadow};
`;

const RoomName = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoomCode = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) => props.theme.primary};
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${(props) => props.theme.primary}15;
  border-radius: 12px;
  border: 2px solid ${(props) => props.theme.primary}30;
`;

const IconButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  background: ${(props) => {
    switch (props.variant) {
      case 'danger':
        return props.theme.error;
      case 'success':
        return props.theme.success;
      case 'secondary':
        return props.theme.secondary;
      default:
        return props.theme.primary;
    }
  }};
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${(props) => props.theme.shadow};
  }
`;

const ParticipantsList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 3px;
  }
`;

const Participant = styled.div<{ hasUpdate?: boolean; isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: ${(props) => {
    if (props.isCurrentUser) return props.theme.primary + '20';
    if (props.hasUpdate) return props.theme.success + '15';
    return props.theme.background;
  }};
  border: 2px solid
    ${(props) => {
      if (props.isCurrentUser) return props.theme.primary;
      if (props.hasUpdate) return props.theme.success;
      return props.theme.border;
    }};
  border-radius: 16px;
  cursor: ${(props) => (props.hasUpdate ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  box-shadow: ${(props) => props.theme.shadow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadowLg};
    border-color: ${(props) => props.theme.primary};
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const Avatar = styled.div<{ isOwner?: boolean; isAdmin?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.isOwner) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
    if (props.isAdmin) return props.theme.primary;
    return props.theme.gradient;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.isOwner ? '#000' : 'white')};
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: ${(props) => props.theme.shadow};
`;

const ParticipantDetails = styled.div`
  flex: 1;
`;

const ParticipantName = styled.span`
  font-weight: 600;
  color: ${(props) => props.theme.text};
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.25rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ type: 'owner' | 'admin' | 'share' | 'no-share' }>`
  background: ${(props) => {
    switch (props.type) {
      case 'owner':
        return '#ffd700';
      case 'admin':
        return props.theme.primary;
      case 'share':
        return props.theme.success;
      case 'no-share':
        return props.theme.error;
      default:
        return props.theme.secondary;
    }
  }};
  color: ${(props) => (props.type === 'owner' ? '#000' : '#fff')};
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const UpdateNotification = styled.div<{ type?: 'success' | 'error' | 'warning' | 'info' }>`
  background: ${(props) => {
    switch (props.type) {
      case 'success':
        return props.theme.success;
      case 'error':
        return props.theme.error;
      case 'warning':
        return props.theme.warning;
      case 'info':
        return props.theme.info;
      default:
        return props.theme.primary;
    }
  }};
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: ${(props) => props.theme.shadow};
`;

const ModeToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: ${(props) => props.theme.background};
  padding: 0.5rem;
  border-radius: 16px;
  border: 2px solid ${(props) => props.theme.border};
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 1rem;
  border: none;
  background: ${(props) => (props.active ? props.theme.primary : 'transparent')};
  color: ${(props) => (props.active ? '#ffffff' : props.theme.text)};
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => (props.active ? props.theme.primary : props.theme.hover)};
    transform: translateY(-1px);
  }
`;

const ChatContainer = styled.div`
  background: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 2rem;
  max-height: 300px;
  overflow-y: auto;
`;
const ChatMessage = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;
const ChatUser = styled.span`
  font-weight: 700;
  color: ${(props) => props.theme.primary};
  margin-right: 0.5rem;
`;
const ChatInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;
const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${(props) => props.theme.inputBackground};
  color: ${(props) => props.theme.text};
`;
const ChatSendButton = styled.button`
  background: ${(props) => props.theme.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    background: ${(props) => props.theme.primaryDark};
  }
`;

const WatchTogetherPanel: React.FC<WatchTogetherPanelProps> = ({
  isOpen,
  onClose,
  streams,
  channelCount,
  onUpdateStreams,
  onUpdateChannelCount,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'join' | 'create' | 'room'>('join');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState<WatchTogetherRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<WatchTogetherUser | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const [permissionRequests, setPermissionRequests] = useState<
    Record<string, { userId: string; username: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [voiceJoined, setVoiceJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const userId = currentUser?.id;

  useEffect(() => {
    watchTogetherService.connect();

    watchTogetherService.setCallbacks({
      onRoomUpdate: (room) => {
        setCurrentRoom(room);
        // Update currentUser state to ensure permissions are in sync
        if (currentUser) {
          const updatedUser = room.participants.find((p) => p.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      },
      onUserJoined: (user) => {
        setSuccess(t('watch_together.user_joined', { username: user.username }) as string);
        setTimeout(() => setSuccess(''), 3000);
      },
      onUserLeft: (userId) => {
        console.log(`User ${userId} left the room`);
      },
      onStreamsUpdate: (newStreams, updatedBy, newChannelCount) => {
        if (updatedBy !== currentUser?.username) {
          setPendingUpdates((prev) => ({
            ...prev,
            [updatedBy]: {
              username: updatedBy,
              streams: newStreams,
              channelCount: newChannelCount,
              timestamp: new Date().toISOString(),
            },
          }));
        }
      },
      onPermissionChanged: (targetUserId, canShare, changedBy) => {
        console.log('Permission changed:', {
          targetUserId,
          canShare,
          changedBy,
          currentUserId: currentUser?.id,
        });
        if (targetUserId === currentUser?.id) {
          // Update currentUser state when permission changes
          setCurrentUser((prev) => {
            const updated = prev ? { ...prev, canShare } : null;
            console.log('Updated currentUser:', updated);
            return updated;
          });
          setSuccess(
            canShare
              ? (t('watch_together.permission_granted', { changedBy: changedBy }) as string)
              : (t('watch_together.permission_revoked', { changedBy: changedBy }) as string)
          );
          setTimeout(() => setSuccess(''), 3000);
        }
      },
      onAdminStatusChanged: (targetUserId, isAdmin, changedBy) => {
        if (targetUserId === currentUser?.id) {
          // Update currentUser state when admin status changes
          setCurrentUser((prev) =>
            prev ? { ...prev, isAdmin, canShare: isAdmin ? true : prev.canShare } : null
          );
          setSuccess(
            isAdmin
              ? (t('watch_together.admin_granted', { changedBy: changedBy }) as string)
              : (t('watch_together.admin_revoked', { changedBy: changedBy }) as string)
          );
          setTimeout(() => setSuccess(''), 3000);
        }
      },
      onPermissionRequested: (requestingUserId, requestingUsername) => {
        setPermissionRequests((prev) => ({
          ...prev,
          [requestingUserId]: { userId: requestingUserId, username: requestingUsername },
        }));
        setSuccess(
          t('watch_together.permission_requested', { username: requestingUsername }) as string
        );
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (error) => setError(error),
      onMessage: (msg) => setMessages((prev) => [...prev, msg]),
      onMessagesInit: (msgs) => setMessages(msgs || []),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, t]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !username.trim()) {
      setError(t('watch_together.fill_all_fields') || 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { room, user } = await watchTogetherService.createRoom(roomName, username);
      setCurrentRoom(room);
      setCurrentUser(user);
      setMode('room');
      setSuccess(t('watch_together.room_created_success') || 'Room created successfully!');
      setTimeout(() => setSuccess(''), 3000);

      await watchTogetherService.updateStreams(streams, channelCount);
    } catch (err: any) {
      setError(err.message || t('watch_together.create_room_error') || 'Error creating room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !username.trim()) {
      setError(t('watch_together.fill_all_fields') || 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { room, user } = await watchTogetherService.joinRoom(roomCode.toUpperCase(), username);
      setCurrentRoom(room);
      setCurrentUser(user);
      setMode('room');
      setSuccess(
        t('watch_together.room_joined_success') || 'You have successfully joined the room!'
      );
      setTimeout(() => setSuccess(''), 3000);

      if (room.streams.length > 0) {
        onUpdateStreams(room.streams);
        onUpdateChannelCount(room.channelCount);
      }
    } catch (err: any) {
      setError(err.message || t('watch_together.join_room_error') || 'Error joining room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    // Sesli sohbetten çık
    try {
      await voiceService.leave();
    } catch {}
    setVoiceJoined(false);
    setMicOn(false);

    await watchTogetherService.leaveRoom();
    setCurrentRoom(null);
    setCurrentUser(null);
    setPendingUpdates({});
    setPermissionRequests({});
    setMode('join');
    setSuccess(t('watch_together.room_left_success') || 'You have left the room');
    setTimeout(() => setSuccess(''), 3000);
    watchTogetherService.disconnect();
  };

  const handleShareStreams = async () => {
    try {
      console.log('Attempting to share streams. Current user:', currentUser);
      console.log('User canShare:', currentUser?.canShare);
      await watchTogetherService.updateStreams(streams, channelCount);
      setSuccess(t('watch_together.streams_shared_success') || 'Streams shared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Share streams error:', err);
      setError(err.message || t('watch_together.share_error') || 'Error sharing streams');
    }
  };

  const handleToggleSharePermission = async (userId: string) => {
    try {
      await watchTogetherService.toggleSharePermission(userId);
    } catch (err: any) {
      setError(
        err.message || t('watch_together.permission_toggle_error') || 'Permission toggle failed'
      );
    }
  };

  const handleToggleAdminStatus = async (userId: string) => {
    try {
      await watchTogetherService.toggleAdminStatus(userId);
    } catch (err: any) {
      setError(err.message || t('watch_together.admin_toggle_error') || 'Admin toggle failed');
    }
  };

  const handleRequestSharePermission = async () => {
    try {
      await watchTogetherService.requestSharePermission();
      setSuccess(t('watch_together.permission_request_sent') || 'Permission request sent');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.message || t('watch_together.permission_request_error') || 'Permission request failed'
      );
    }
  };

  const handleApplyUpdate = (userId: string) => {
    const update = pendingUpdates[userId];
    if (update) {
      onUpdateStreams(update.streams);
      onUpdateChannelCount(update.channelCount);

      setPendingUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[userId];
        return newUpdates;
      });

      setSuccess(
        t('watch_together.update_applied', { username: update.username }) ||
          `Update applied by ${update.username}`
      );
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await watchTogetherService.sendMessage(chatInput.trim());
      setChatInput('');
    } catch (err) {
      setError('Mesaj gönderilemedi');
    }
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      setSuccess(t('watch_together.room_code_copied') || 'Room code copied!');
      setTimeout(() => setSuccess(''), 2000);
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
            {t('watch_together.join_room') as string}
          </ModeButton>
          <ModeButton active={mode === 'create'} onClick={() => setMode('create')}>
            <FaPlus />
            {t('watch_together.create_room') as string}
          </ModeButton>
        </ModeToggle>

        {mode === 'join' ? (
          <>
            <Input
              type="text"
              placeholder={t('watch_together.room_code_example') as string}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <ButtonGroup>
              <Button onClick={handleJoinRoom} disabled={isLoading}>
                <FaUsers />
                {isLoading
                  ? (t('watch_together.joining') as string)
                  : (t('watch_together.join_room') as string)}
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <Input
              type="text"
              placeholder={t('watch_together.room_name_placeholder') as string}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <ButtonGroup>
              <Button onClick={handleCreateRoom} disabled={isLoading}>
                <FaUsers />
                {isLoading
                  ? (t('watch_together.creating') as string)
                  : (t('watch_together.create_room') as string)}
              </Button>
            </ButtonGroup>
          </>
        )}
      </Section>
    </>
  );

  const renderRoom = () => (
    <>
      <Section>
        <RoomInfo>
          <RoomName>
            <FaUsers />
            {currentRoom?.name}
          </RoomName>
          <RoomCode>
            {showRoomCode ? currentRoom?.code : '••••••'}
            <IconButton onClick={copyRoomCode} title={t('watch_together.copy_room_code') as string}>
              <FaCopy />
            </IconButton>
            <IconButton
              onClick={() => setShowRoomCode(!showRoomCode)}
              title={
                showRoomCode
                  ? (t('watch_together.hide_room_code') as string)
                  : (t('watch_together.show_room_code') as string)
              }
            >
              {showRoomCode ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </RoomCode>
          <div
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FaUsers />
            {
              t('watch_together.participants_count', {
                count: currentRoom?.participants.length,
              }) as string
            }
          </div>
        </RoomInfo>
      </Section>

      {Object.keys(pendingUpdates).length > 0 && (
        <Section>
          <SectionTitle>
            <FaDownload />
            {t('watch_together.available_updates') as string}
          </SectionTitle>
          {Object.entries(pendingUpdates).map(([userId, update]) => (
            <UpdateNotification key={userId} type="success">
              <FaCheck />
              <div>
                <strong>{update.username}</strong> {t('watch_together.update_available') as string}
                <Button
                  variant="secondary"
                  onClick={() => handleApplyUpdate(userId)}
                  style={{ marginTop: '0.75rem', marginBottom: 0 }}
                >
                  <FaDownload />
                  {t('watch_together.apply_update_button') as string}
                </Button>
              </div>
            </UpdateNotification>
          ))}
        </Section>
      )}

      {Object.keys(permissionRequests).length > 0 &&
        (currentUser?.isAdmin || currentUser?.isOwner) && (
          <Section>
            <SectionTitle>
              <FaHandPaper />
              {t('watch_together.permission_requests') as string}
            </SectionTitle>
            {Object.entries(permissionRequests).map(([userId, request]) => (
              <UpdateNotification key={userId} type="info">
                <FaUser />
                <div>
                  <strong>{request.username}</strong>{' '}
                  {t('watch_together.requesting_permission') as string}
                  <ButtonGroup style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    <Button
                      variant="success"
                      onClick={() => {
                        handleToggleSharePermission(userId);
                        setPermissionRequests((prev) => {
                          const newRequests = { ...prev };
                          delete newRequests[userId];
                          return newRequests;
                        });
                      }}
                    >
                      <FaCheck />
                      {t('watch_together.grant_permission') as string}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setPermissionRequests((prev) => {
                          const newRequests = { ...prev };
                          delete newRequests[userId];
                          return newRequests;
                        });
                      }}
                    >
                      <FaTimes />
                      {t('watch_together.deny_permission') as string}
                    </Button>
                  </ButtonGroup>
                </div>
              </UpdateNotification>
            ))}
          </Section>
        )}

      <Section>
        <SectionTitle>
          <FaUsers />
          {t('watch_together.participants') as string} ({currentRoom?.participants.length})
        </SectionTitle>
        <ParticipantsList>
          {currentRoom?.participants.map((participant) => (
            <Participant
              key={participant.id}
              hasUpdate={!!pendingUpdates[participant.username]}
              isCurrentUser={participant.id === currentUser?.id}
              onClick={() =>
                pendingUpdates[participant.username] && handleApplyUpdate(participant.username)
              }
            >
              <ParticipantInfo>
                <Avatar isOwner={participant.isOwner} isAdmin={participant.isAdmin}>
                  {participant.username.charAt(0).toUpperCase()}
                </Avatar>
                <ParticipantDetails>
                  <ParticipantName>
                    {participant.username}
                    {participant.id === currentUser?.id && ` ${t('watch_together.you') as string}`}
                  </ParticipantName>
                  <BadgeContainer>
                    {participant.isOwner && (
                      <Badge type="owner">
                        <FaCrown /> {t('watch_together.owner') as string}
                      </Badge>
                    )}
                    {participant.isAdmin && !participant.isOwner && (
                      <Badge type="admin">
                        <FaUserShield /> {t('watch_together.admin') as string}
                      </Badge>
                    )}
                    {participant.canShare ? (
                      <Badge type="share">
                        <FaUnlock /> {t('watch_together.can_share') as string}
                      </Badge>
                    ) : (
                      <Badge type="no-share">
                        <FaLock /> {t('watch_together.cannot_share') as string}
                      </Badge>
                    )}
                  </BadgeContainer>
                </ParticipantDetails>
              </ParticipantInfo>

              {(currentUser?.isAdmin || currentUser?.isOwner) &&
                participant.id !== currentUser?.id && (
                  <ControlButtons>
                    {!participant.isOwner && !participant.isAdmin && (
                      <IconButton
                        variant={participant.canShare ? 'danger' : 'success'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSharePermission(participant.id);
                        }}
                        title={
                          participant.canShare
                            ? (t('watch_together.toggle_share_permission') as string)
                            : (t('watch_together.grant_share_permission') as string)
                        }
                      >
                        {participant.canShare ? <FaBan /> : <FaShare />}
                      </IconButton>
                    )}
                    {currentUser?.isOwner && !participant.isOwner && (
                      <IconButton
                        variant={participant.isAdmin ? 'secondary' : 'primary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAdminStatus(participant.id);
                        }}
                        title={
                          participant.isAdmin
                            ? (t('watch_together.toggle_admin_status') as string)
                            : (t('watch_together.make_admin') as string)
                        }
                      >
                        <FaUserCog />
                      </IconButton>
                    )}
                  </ControlButtons>
                )}
            </Participant>
          ))}
        </ParticipantsList>
      </Section>

      <Section>
        <ButtonGroup>
          {currentUser?.canShare && (
            <Button onClick={handleShareStreams} variant="success">
              <FaSync />
              {t('watch_together.share_streams_button') as string}
            </Button>
          )}
          <Button variant="danger" onClick={handleLeaveRoom}>
            <FaSignOutAlt />
            {t('watch_together.leave_room_button') as string}
          </Button>
        </ButtonGroup>
        {!currentUser?.canShare && (
          <UpdateNotification type="warning">
            <FaExclamationTriangle />
            <div>
              {t('watch_together.no_share_permission') as string}
              <Button
                variant="secondary"
                onClick={handleRequestSharePermission}
                style={{ marginTop: '0.75rem', marginBottom: 0 }}
              >
                <FaHandPaper />
                {t('watch_together.request_permission') as string}
              </Button>
            </div>
          </UpdateNotification>
        )}

        <Section>
          <SectionTitle>
            <FaComments /> Sohbet
          </SectionTitle>
          <ChatContainer>
            {messages.length === 0 && <div style={{ color: '#888' }}>Henüz mesaj yok.</div>}
            {messages.map((msg) => (
              <ChatMessage key={msg.id}>
                <ChatUser>{msg.user.username}:</ChatUser>
                <span>{msg.text}</span>
                <span style={{ color: '#aaa', fontSize: '0.8em', marginLeft: 'auto' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </ChatMessage>
            ))}
          </ChatContainer>
          <ChatInputRow>
            <ChatInput
              type="text"
              placeholder="Mesaj yaz..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <ChatSendButton onClick={handleSendMessage} title="Gönder">
              <FaPaperPlane />
            </ChatSendButton>
          </ChatInputRow>
        </Section>

        <Section>
          <SectionTitle>🎤 Sesli Sohbet</SectionTitle>
          <ButtonGroup>
            {!voiceJoined ? (
              <Button
                onClick={async () => {
                  if (!currentRoom?.code) return;
                  await voiceService.join(currentRoom.code);
                  setVoiceJoined(true);
                }}
              >
                Odaya Sesli Katıl
              </Button>
            ) : (
              <>
                <Button
                  variant={micOn ? 'danger' : 'primary'}
                  onClick={async () => {
                    if (!micOn) {
                      await voiceService.enableMic();
                      setMicOn(true);
                    } else {
                      voiceService.disableMic();
                      setMicOn(false);
                    }
                  }}
                >
                  {micOn ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await voiceService.leave();
                    setVoiceJoined(false);
                    setMicOn(false);
                  }}
                >
                  Sesli Sohbetten Ayrıl
                </Button>
              </>
            )}
          </ButtonGroup>
        </Section>
      </Section>
    </>
  );

  return (
    <Panel isOpen={isOpen}>
      <Header>
        <Title>
          <FaUsers />
          {t('watch_together.title') as string}
        </Title>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </Header>

      {error && (
        <UpdateNotification type="error">
          <FaExclamationTriangle />
          {error}
        </UpdateNotification>
      )}

      {success && (
        <UpdateNotification type="success">
          <FaCheck />
          {success}
        </UpdateNotification>
      )}

      {mode === 'room' ? renderRoom() : renderJoinCreate()}
    </Panel>
  );
};

export default WatchTogetherPanel;
