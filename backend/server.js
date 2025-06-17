import express from 'express';
import http from 'http';
import { setupSocket } from './socket/index.js';

const app = express();
const server = http.createServer(app);

setupSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});
