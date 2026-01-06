import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const createSocket = (): Socket => {
  if (!socket) {
    socket = io('https://motohelpindia.com', {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', err => {
      console.log('⚠️ Socket error:', err.message);
    });
  }

  return socket;
};
