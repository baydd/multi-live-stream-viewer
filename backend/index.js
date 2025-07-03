const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Watch Together odalarını ve katılımcılarını depolamak için basit bir bellek içi depolama
const rooms = {}; // { roomCode: { name, participants: [{ id, username, isAdmin, isOwner, canShare }], streams: [], channelCount } }

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
      canShare: true,
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
      canShare: false, // Yeni katılan kullanıcılar varsayılan olarak paylaşım yapamaz
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

    // Paylaşım izni kontrolü
    if (!user.canShare) {
      callback({ error: 'Paylaşım izniniz yok. Yöneticiden izin isteyiniz.' });
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

  // Yönetici izin verme sistemi
  socket.on('toggleSharePermission', ({ roomCode, targetUserId }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback({ error: 'Oda bulunamadı.' });
      return;
    }

    const admin = room.participants.find(p => p.id === socket.id);
    if (!admin || (!admin.isAdmin && !admin.isOwner)) {
      callback({ error: 'Bu işlem için yönetici yetkisi gerekli.' });
      return;
    }

    const targetUser = room.participants.find(p => p.id === targetUserId);
    if (!targetUser) {
      callback({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    // Sahip ve yöneticilerin izni değiştirilemez
    if (targetUser.isOwner || targetUser.isAdmin) {
      callback({ error: 'Yönetici ve sahip yetkilerini değiştiremezsiniz.' });
      return;
    }

    targetUser.canShare = !targetUser.canShare;
    
    console.log(`${admin.username} kullanıcısı ${targetUser.username} için paylaşım iznini ${targetUser.canShare ? 'verdi' : 'aldı'}`);
    callback({ success: true, canShare: targetUser.canShare });
    io.to(roomCode).emit('permissionChanged', { 
      targetUserId, 
      canShare: targetUser.canShare, 
      changedBy: admin.username 
    });
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Yönetici yapma sistemi
  socket.on('toggleAdminStatus', ({ roomCode, targetUserId }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback({ error: 'Oda bulunamadı.' });
      return;
    }

    const owner = room.participants.find(p => p.id === socket.id);
    if (!owner || !owner.isOwner) {
      callback({ error: 'Bu işlem için sahip yetkisi gerekli.' });
      return;
    }

    const targetUser = room.participants.find(p => p.id === targetUserId);
    if (!targetUser) {
      callback({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    if (targetUser.isOwner) {
      callback({ error: 'Sahip yetkilerini değiştiremezsiniz.' });
      return;
    }

    targetUser.isAdmin = !targetUser.isAdmin;
    if (targetUser.isAdmin) {
      targetUser.canShare = true; // Yöneticiler otomatik olarak paylaşım yapabilir
    }
    
    console.log(`${owner.username} kullanıcısı ${targetUser.username} için yönetici yetkisini ${targetUser.isAdmin ? 'verdi' : 'aldı'}`);
    callback({ success: true, isAdmin: targetUser.isAdmin });
    io.to(roomCode).emit('adminStatusChanged', { 
      targetUserId, 
      isAdmin: targetUser.isAdmin, 
      changedBy: owner.username 
    });
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Paylaşım izni isteme sistemi
  socket.on('requestSharePermission', ({ roomCode }, callback) => {
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

    // Zaten paylaşım izni varsa tekrar isteyemez
    if (user.canShare) {
      callback({ error: 'Zaten paylaşım izniniz var.' });
      return;
    }

    // Yönetici ve sahipler izin isteyemez
    if (user.isAdmin || user.isOwner) {
      callback({ error: 'Yönetici ve sahipler izin isteyemez.' });
      return;
    }

    // Odadaki tüm yönetici ve sahiplere bildirim gönder
    const admins = room.participants.filter(p => p.isAdmin || p.isOwner);
    
    console.log(`${user.username} kullanıcısı paylaşım izni istedi`);
    callback({ success: true, message: 'Paylaşım izni talebi gönderildi.' });
    
    // Yönetici ve sahiplere bildirim gönder
    admins.forEach(admin => {
      io.to(admin.id).emit('permissionRequested', {
        requestingUserId: user.id,
        requestingUsername: user.username,
        roomCode
      });
    });
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== socket.id);
    socket.leave(roomCode);

    if (room.participants.length === 0) {
      delete rooms[roomCode];
      console.log(`Oda ${roomCode} silindi (boş).`);
    } else {
      console.log(`Kullanıcı ${socket.id} odadan ayrıldı: ${roomCode}`);
      io.to(roomCode).emit('userLeft', socket.id);
      io.to(roomCode).emit('roomUpdate', room);
    }
  });

  socket.on('disconnect', () => {
    console.log('Bir istemci bağlantısı kesildi:', socket.id);
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const initialParticipantCount = room.participants.length;
      room.participants = room.participants.filter(p => p.id !== socket.id);

      if (room.participants.length < initialParticipantCount) {
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

// React build klasörünü sun
const buildPath = path.join(__dirname, '../build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateRoomId() {
  return 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}