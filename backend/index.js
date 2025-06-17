const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Geliştirme ortamında tüm origin'lere izin verin. Üretimde bunu kısıtlayın.
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Watch Together odalarını ve katılımcılarını depolamak için basit bir bellek içi depolama
const rooms = {}; // { roomCode: { name, participants: [{ id, username, isAdmin, isOwner }], streams: [], channelCount } }

io.on('connection', (socket) => {
  console.log('Yeni bir istemci bağlandı:', socket.id);

  socket.on('createRoom', ({ roomName, username }, callback) => {
    console.log(`createRoom olayı alındı. Oda adı: ${roomName}, Kullanıcı adı: ${username}`);
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

    console.log(`Oda oluşturuldu: ${roomCode} (${roomName})`);
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

    console.log(`Kullanıcı ${username} (${userId}) odaya katıldı: ${roomCode}`);
    callback({ room, user });
    io.to(roomCode).emit('userJoined', user);
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('updateStreams', ({ roomCode, streams, channelCount }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback({ error: 'Oda bulunamadı.' });
      return;
    }

    const user = room.participants.find(p => p.id === socket.id);
    if (!user) {
      callback({ error: 'Oda katılımcısı değil.' });
      return;
    }

    room.streams = streams;
    room.channelCount = channelCount;
    room.lastUpdatedBy = user.id;
    room.lastUpdatedAt = new Date().toISOString();

    console.log(`Oda ${roomCode} streamleri güncellendi.`);
    callback({ success: true });
    io.to(roomCode).emit('streamsUpdated', { streams, updatedBy: user.username, channelCount });
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== socket.id);
    socket.leave(roomCode);

    if (room.participants.length === 0) {
      delete rooms[roomCode]; // Oda boşalırsa sil
      console.log(`Oda ${roomCode} silindi (boş).`);
    } else {
      console.log(`Kullanıcı ${socket.id} odadan ayrıldı: ${roomCode}`);
      io.to(roomCode).emit('userLeft', socket.id);
      io.to(roomCode).emit('roomUpdate', room);
    }
  });

  socket.on('disconnect', () => {
    console.log('Bir istemci bağlantısı kesildi:', socket.id);
    // Bağlantısı kesilen kullanıcıyı tüm odalardan çıkar
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const initialParticipantCount = room.participants.length;
      room.participants = room.participants.filter(p => p.id !== socket.id);

      if (room.participants.length < initialParticipantCount) { // Kullanıcı bu odadaydı
        if (room.participants.length === 0) {
          delete rooms[roomCode];
          console.log(`Oda ${roomCode} silindi (boş).`);
        } else {
          io.to(roomCode).emit('userLeft', socket.id);
          io.to(roomCode).emit('roomUpdate', room);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});

// Yardımcı fonksiyonlar
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateRoomId() {
  return 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
} 