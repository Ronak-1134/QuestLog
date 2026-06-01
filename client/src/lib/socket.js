import { io } from 'socket.io-client';

// In production use the Render server, locally use localhost
const SERVER = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const socket = io(SERVER, {
  transports:           ['websocket', 'polling'],
  autoConnect:          false,
  reconnection:         true,
  reconnectionAttempts: 3,
  reconnectionDelay:    3000,
  timeout:              5000,
});

socket.on('connect',       () => console.debug('[WS] connected'));
socket.on('disconnect',    () => console.debug('[WS] disconnected'));
socket.on('connect_error', () => {
  // silent in production
});

export const connectSocket = (uid) => {
  if (!socket.connected) socket.connect();
  socket.emit('join:user', uid);
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;