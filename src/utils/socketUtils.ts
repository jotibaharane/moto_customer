// import { io } from 'socket.io-client';

// export const socket = io('https://motohelpindia.com', {
//   transports: ['websocket'], // Force WebSocket transport
//   reconnection: true, // Auto-reconnect
// });

// // ✅ When connected
// socket.on('connect', () => {
//   console.log('✅ Socket connected successfully:', socket.id);
// });

// // ⚠️ When disconnected
// socket.on('disconnect', reason => {
//   console.log('⚠️ Socket disconnected:', reason);
// });

// // 🔁 When trying to reconnect
// socket.on('reconnect_attempt', attempt => {
//   console.log('🔁 Reconnecting... Attempt:', attempt);
// });

// // ❌ If connection fails
// socket.on('connect_error', error => {
//   console.log('❌ Connection error:', error.message);
// });
