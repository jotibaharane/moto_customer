import { createSocket } from './socket.instance';

export const initSocket = (CustomerID: string) => {
  const socket = createSocket();
  socket.auth = { CustomerID };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  const socket = createSocket();
  socket.disconnect();
};
