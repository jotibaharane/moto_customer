import { SOCKET_EVENTS } from './socket.events';
import { getSocket } from './socket.service';

// driver location send
export const emitDriverLocation = (payload: any) => {
  const socket = getSocket();
  if (!socket.connected) return;
  socket.emit(SOCKET_EVENTS.DRIVER_LOCATION, payload);
};

export const emitCreateCustomerLoad = (payload: any) => {
  const socket = getSocket();
  if (!socket.connected) return;
  console.log('LOAD POST PAYLOAD', { payload });
  socket.emit(SOCKET_EVENTS.CREATECUSTOMERLOAD, payload);
};
