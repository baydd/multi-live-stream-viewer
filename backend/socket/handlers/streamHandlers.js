function registerStreamHandlers(io, socket, rooms) {
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

    callback({ success: true });
    io.to(roomCode).emit('streamsUpdated', { streams, updatedBy: user.username, channelCount });
    io.to(roomCode).emit('roomUpdate', room);
  });
}

export default registerStreamHandlers;
