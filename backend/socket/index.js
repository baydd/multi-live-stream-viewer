import { Server } from 'socket.io';
import registerRoomHandlers from './handlers/roomHandlers.js';
import registerStreamHandlers from './handlers/streamHandlers.js';

const rooms = {};

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Yeni istemci bağlandı:', socket.id);

    registerRoomHandlers(io, socket, rooms);
    registerStreamHandlers(io, socket, rooms);

    socket.on('disconnect', () => {
      console.log('Bağlantı kesildi:', socket.id);

      for (const roomCode in rooms) {
        const room = rooms[roomCode];
        const beforeCount = room.participants.length;
        room.participants = room.participants.filter(p => p.id !== socket.id);

        if (room.participants.length < beforeCount) {
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
}

export { setupSocket };
