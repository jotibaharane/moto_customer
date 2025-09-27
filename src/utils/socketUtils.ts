import { io } from 'socket.io-client';

export const socket = io('http://neotechnet.com:9090', {
  transports: ['websocket'], // force WebSocket
  reconnection: true,
});
