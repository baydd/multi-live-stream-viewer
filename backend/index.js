const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args)); // Kick API'ye istek atmak için
const cors = require('cors'); // CORS middleware

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
      lastUpdatedAt: new Date().toISOString(),
      messages: [] // Oda içi mesajlar
    };

    rooms[roomCode] = newRoom;
    socket.join(roomCode);

    console.log(`Oda oluşturuldu: ${roomCode} (${roomName})`);
    callback({ room: newRoom, user });
    io.to(roomCode).emit('roomUpdate', newRoom);
  });

  // Anket başlatma (sadece admin/owner) -- KALDIRILDI
  // Oylama -- KALDIRILDI
  // Anketi bitirme (sadece admin/owner) -- KALDIRILDI

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
    callback({ room, user, messages: room.messages || [] }); // poll kaldırıldı
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

  // Oda içi sohbet mesajı gönderme
  socket.on('sendMessage', ({ roomCode, message }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback && callback({ error: 'Oda bulunamadı.' });
      return;
    }
    const user = room.participants.find(p => p.id === socket.id);
    if (!user) {
      callback && callback({ error: 'Oda katılımcısı değil.' });
      return;
    }
    const msgObj = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
      user: { id: user.id, username: user.username },
      text: message,
      timestamp: new Date().toISOString()
    };
    room.messages = room.messages || [];
    room.messages.push(msgObj);
    // Son 100 mesajı tut (isteğe bağlı)
    if (room.messages.length > 100) room.messages = room.messages.slice(-100);
    io.to(roomCode).emit('message', msgObj);
    callback && callback({ success: true });
  });

  // WebRTC signaling mesajı iletimi
  socket.on('signal', ({ roomCode, to, data }) => {
    // Belirli kullanıcıya signaling mesajı ilet
    io.to(to).emit('signal', { from: socket.id, data });
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

// Kick API proxy endpoint
app.get('/api/kick/:channel/livestream', async (req, res) => {
  const { channel } = req.params;
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${channel}/livestream`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Kick API' });
  }
});

// Genel proxy endpoint (herhangi bir URL için)
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'Geçersiz veya eksik url parametresi.' });
  }
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy isteği başarısız.' });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateRoomId() {
  return 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

app.use(cors()); // Tüm endpointler için CORS'u aktif et