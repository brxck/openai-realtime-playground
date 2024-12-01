import express from 'express';
import { openapiRealtimeRelay } from './relay.js';
import { WebSocketServer } from 'ws';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
      `Please set it in your .env file.`
  );
  process.exit(1);
}

// Websocket for relaying OpenAI Realtime API
const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', (socket, request) => {
  openapiRealtimeRelay(socket, request);
});

// Express server for serving the frontend when deployed
const app = express();

// Serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const rootPath = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(rootPath, '../../dist')));
}

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

const PORT = parseInt(process.env.PORT || '8081');
const server = app.listen(PORT, () => {
  console.log(`Static server listening on port ${PORT}`);
});

// Connect the websocket server to the express server
server.on('upgrade', (request, socket, head) => {
  console.log('upgrade', request.url);
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
