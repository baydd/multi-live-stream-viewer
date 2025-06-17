function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateRoomId() {
  return 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function registerRoomHandlers(io, socket, rooms) {
  socket.on('createRoom', ({ roomName, username }, callback) => {
    const roomCode = generateRoomCode();
    const userId = socket.id;

    const user = {
      id: userId,
      username,
      isAdmin: true,
      isOwner: true,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    const newRoom = {
      id: generateRoomId(),
      name: roomName,
      code: roomCode,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: [user],
      streams: [],
      channelCount: 6,
      lastUpdatedBy: userId,
      lastUpdatedAt: new Date().toISOString()
    };

    rooms[roomCode] = newRoom;
    socket.join(roomCode);

    callback({ room: newRoom, user });
    io.to(roomCode).emit('roomUpdate', newRoom);
  });

  socket.on('joinRoom', ({ roomCode, username }, callback) => {
    const room = rooms[roomCode.toUpperCase()];
    if (!room) {
      callback({ error: 'Oda bulunamadı.' });
      return;
    }

    const userId = socket.id;
    const user = {
      id: userId,
      username,
      isAdmin: false,
      isOwner: false,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    room.participants.push(user);
    socket.join(roomCode);

    callback({ room, user });
    io.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== socket.id);
    socket.leave(roomCode);

    if (room.participants.length === 0) {
      delete rooms[roomCode];
    } else {
      io.to(roomCode).emit('userLeft', socket.id);
      io.to(roomCode).emit('roomUpdate', room);
    }
  });
}

export default registerRoomHandlers;
