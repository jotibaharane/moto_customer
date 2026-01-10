import { createSocket } from './socket.instance';

export const initSocket = (CUSTOMER_ID: string) => {
  const socket = createSocket();

  if (!socket.connected) socket.connect();

  socket.once('connect', () => {
    console.log('🟢 Customer joined socket:', CUSTOMER_ID);

    socket.emit('join', {
      userId: CUSTOMER_ID,
      role: 'customer',
    });
  });
};

export const disconnectSocket = () => {
  const socket = createSocket();
  socket.disconnect();
};
