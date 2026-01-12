import { store } from '@store/index';
import { setDriverLocations } from '@store/slices/map.slice';
import { SOCKET_EVENTS } from './socket.events';
import { getSocket } from './socket.service';

let registered = false;

export const registerSocketListeners = () => {
  if (registered) return;

  const socket = getSocket();

  const register = () => {
    if (registered) return;
    registered = true;

    console.log('🟢 Socket listeners registered');

    socket.on(SOCKET_EVENTS.CUSTOMER_DRIVER_UPDATE, data => {
      console.log('🚚 DRIVER UPDATE:', data);
      store.dispatch(setDriverLocations(data));
    });
  };

  if (socket.connected) {
    register();
  } else {
    socket.once('connect', register);
  }
};
