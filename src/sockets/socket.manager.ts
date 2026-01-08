import { createSocket } from './socket.instance';

export const initSocket = (CUSTOMER_ID: string) => {
  const socket = createSocket();
  socket.auth = { CUSTOMER_ID };
  if (!socket.connected) {
    socket.connect();
  }

  // 🔴 VERY IMPORTANT
  socket.once('connect', () => {
    console.log('🧾 Registering customer:', CUSTOMER_ID);
    socket.emit('registerCustomer', CUSTOMER_ID);
  });
};

export const disconnectSocket = () => {
  const socket = createSocket();
  socket.disconnect();
};
