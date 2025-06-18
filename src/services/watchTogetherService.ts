import { io, Socket } from 'socket.io-client';
import { WatchTogetherRoom, WatchTogetherUser, Stream } from '../types';

class WatchTogetherService {
  private socket: Socket | null = null;
  private currentRoom: WatchTogetherRoom | null = null;
  private currentUser: WatchTogetherUser | null = null;
  private callbacks: {
    onRoomUpdate?: (room: WatchTogetherRoom) => void;
    onUserJoined?: (user: WatchTogetherUser) => void;
    onUserLeft?: (userId: string) => void;
    onStreamsUpdate?: (streams: Stream[], updatedBy: string, channelCount: number) => void;
    onPermissionChanged?: (targetUserId: string, canShare: boolean, changedBy: string) => void;
    onAdminStatusChanged?: (targetUserId: string, isAdmin: boolean, changedBy: string) => void;
    onPermissionRequested?: (requestingUserId: string, requestingUsername: string) => void;
    onError?: (error: string) => void;
  } = {};

  private readonly SERVER_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_BACKEND_URL || ''
    : 'http://localhost:3001';

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.SERVER_URL);

    this.socket.on('connect', () => {
      console.log('WebSocket sunucusuna bağlandı');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket sunucusu bağlantısı kesildi');
    });

    this.socket.on('error', (error: string) => {
      console.error('WebSocket hatası:', error);
      this.callbacks.onError?.(error);
    });

    this.socket.on('roomCreated', ({ room, user }) => {
      this.currentRoom = room;
      this.currentUser = user;
      this.callbacks.onRoomUpdate?.(room);
    });

    this.socket.on('roomJoined', ({ room, user }) => {
      this.currentRoom = room;
      this.currentUser = user;
      this.callbacks.onRoomUpdate?.(room);
    });

    this.socket.on('roomUpdate', (room: WatchTogetherRoom) => {
      this.currentRoom = room;
      this.callbacks.onRoomUpdate?.(room);
    });

    this.socket.on('userJoined', (user: WatchTogetherUser) => {
      this.callbacks.onUserJoined?.(user);
    });

    this.socket.on('userLeft', (userId: string) => {
      this.callbacks.onUserLeft?.(userId);
    });

    this.socket.on('streamsUpdated', ({ streams, updatedBy, channelCount }) => {
      this.callbacks.onStreamsUpdate?.(streams, updatedBy, channelCount);
    });

    this.socket.on('permissionChanged', ({ targetUserId, canShare, changedBy }) => {
      this.callbacks.onPermissionChanged?.(targetUserId, canShare, changedBy);
    });

    this.socket.on('adminStatusChanged', ({ targetUserId, isAdmin, changedBy }) => {
      this.callbacks.onAdminStatusChanged?.(targetUserId, isAdmin, changedBy);
    });

    this.socket.on('permissionRequested', ({ requestingUserId, requestingUsername }) => {
      this.callbacks.onPermissionRequested?.(requestingUserId, requestingUsername);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoom = null;
    this.currentUser = null;
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async createRoom(roomName: string, username: string): Promise<{ room: WatchTogetherRoom; user: WatchTogetherUser }> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket bağlantısı yok');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('createRoom', { roomName, username }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentRoom = response.room;
          this.currentUser = response.user;
          resolve(response);
        }
      });
    });
  }

  async joinRoom(roomCode: string, username: string): Promise<{ room: WatchTogetherRoom; user: WatchTogetherUser }> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket bağlantısı yok');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('joinRoom', { roomCode, username }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentRoom = response.room;
          this.currentUser = response.user;
          resolve(response);
        }
      });
    });
  }

  async updateStreams(streams: Stream[], channelCount: number) {
    if (!this.socket?.connected || !this.currentRoom || !this.currentUser) {
      throw new Error('WebSocket bağlantısı yok veya oda/kullanıcı bilgisi eksik');
    }

    const roomCode = this.currentRoom.code;
    if (!roomCode) {
      throw new Error('Oda kodu bulunamadı');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('updateStreams', {
        roomCode,
        streams,
        channelCount
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async toggleSharePermission(targetUserId: string) {
    if (!this.socket?.connected || !this.currentRoom) {
      throw new Error('WebSocket bağlantısı yok veya oda bilgisi eksik');
    }

    const roomCode = this.currentRoom.code;
    if (!roomCode) {
      throw new Error('Oda kodu bulunamadı');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('toggleSharePermission', {
        roomCode,
        targetUserId
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async toggleAdminStatus(targetUserId: string) {
    if (!this.socket?.connected || !this.currentRoom) {
      throw new Error('WebSocket bağlantısı yok veya oda bilgisi eksik');
    }

    const roomCode = this.currentRoom.code;
    if (!roomCode) {
      throw new Error('Oda kodu bulunamadı');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('toggleAdminStatus', {
        roomCode,
        targetUserId
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async requestSharePermission() {
    if (!this.socket?.connected || !this.currentRoom) {
      throw new Error('WebSocket bağlantısı yok veya oda bilgisi eksik');
    }

    const roomCode = this.currentRoom.code;
    if (!roomCode) {
      throw new Error('Oda kodu bulunamadı');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('requestSharePermission', {
        roomCode
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async leaveRoom() {
    if (!this.socket?.connected || !this.currentRoom) {
      return;
    }

    this.socket.emit('leaveRoom', { roomCode: this.currentRoom.code });
    this.currentRoom = null;
    this.currentUser = null;
  }

  getCurrentRoom(): WatchTogetherRoom | null {
    return this.currentRoom;
  }

  getCurrentUser(): WatchTogetherUser | null {
    return this.currentUser;
  }
}

export const watchTogetherService = new WatchTogetherService();