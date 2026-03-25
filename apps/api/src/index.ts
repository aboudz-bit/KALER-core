import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './socket';

const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`KALER API running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`WebSocket: enabled`);
});
