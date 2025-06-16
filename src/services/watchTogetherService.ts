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
    onError?: (error: string) => void;
  } = {};

  // Mock server URL - in production this would be your actual WebSocket server
  private readonly SERVER_URL = 'ws://localhost:3001';

  connect() {
    if (this.socket?.connected) return;

    // For demo purposes, we'll simulate WebSocket functionality
    // In production, uncomment the line below:
    // this.socket = io(this.SERVER_URL);
    
    console.log('Watch Together service initialized (demo mode)');
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
    const roomCode = this.generateRoomCode();
    const userId = this.generateUserId();
    
    const user: WatchTogetherUser = {
      id: userId,
      username,
      isAdmin: true,
      isOwner: true,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    const room: WatchTogetherRoom = {
      id: this.generateRoomId(),
      name: roomName,
      code: roomCode,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: [user],
      streams: [],
      channelCount: 6
    };

    // Store in localStorage for demo purposes
    this.storeRoomData(room);
    
    this.currentRoom = room;
    this.currentUser = user;

    return { room, user };
  }

  async joinRoom(roomCode: string, username: string): Promise<{ room: WatchTogetherRoom; user: WatchTogetherUser }> {
    // In demo mode, try to load from localStorage
    const room = this.loadRoomData(roomCode);
    
    if (!room) {
      throw new Error('Room not found');
    }

    const userId = this.generateUserId();
    const user: WatchTogetherUser = {
      id: userId,
      username,
      isAdmin: false,
      isOwner: false,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    room.participants.push(user);
    this.storeRoomData(room);
    
    this.currentRoom = room;
    this.currentUser = user;

    // Simulate user joined event
    setTimeout(() => {
      this.callbacks.onUserJoined?.(user);
    }, 100);

    return { room, user };
  }

  async updateStreams(streams: Stream[], channelCount: number) {
    if (!this.currentRoom || !this.currentUser) return;

    this.currentRoom.streams = streams;
    this.currentRoom.channelCount = channelCount;
    this.currentRoom.lastUpdatedBy = this.currentUser.id;
    this.currentRoom.lastUpdatedAt = new Date().toISOString();

    this.storeRoomData(this.currentRoom);

    // Simulate streams update event
    setTimeout(() => {
      this.callbacks.onStreamsUpdate?.(streams, this.currentUser!.username, channelCount);
    }, 100);
  }

  async promoteToAdmin(userId: string) {
    if (!this.currentRoom || !this.currentUser?.isOwner) return;

    const participant = this.currentRoom.participants.find(p => p.id === userId);
    if (participant) {
      participant.isAdmin = true;
      this.storeRoomData(this.currentRoom);
    }
  }

  async leaveRoom() {
    if (!this.currentRoom || !this.currentUser) return;

    this.currentRoom.participants = this.currentRoom.participants.filter(
      p => p.id !== this.currentUser!.id
    );

    this.storeRoomData(this.currentRoom);
    
    this.currentRoom = null;
    this.currentUser = null;
  }

  getCurrentRoom(): WatchTogetherRoom | null {
    return this.currentRoom;
  }

  getCurrentUser(): WatchTogetherUser | null {
    return this.currentUser;
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateRoomId(): string {
    return 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private storeRoomData(room: WatchTogetherRoom) {
    const rooms = this.getAllRooms();
    rooms[room.code] = room;
    localStorage.setItem('watchTogetherRooms', JSON.stringify(rooms));
  }

  private loadRoomData(roomCode: string): WatchTogetherRoom | null {
    const rooms = this.getAllRooms();
    return rooms[roomCode] || null;
  }

  private getAllRooms(): { [code: string]: WatchTogetherRoom } {
    const stored = localStorage.getItem('watchTogetherRooms');
    return stored ? JSON.parse(stored) : {};
  }
}

export const watchTogetherService = new WatchTogetherService();