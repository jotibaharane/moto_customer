import { store } from '@store/index';
import { setdriverLocation, setDriverLocations } from '@store/slices/map.slice';
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
    socket.on(SOCKET_EVENTS.LOAD_ACCEPT_STATUS, data => {
      console.log('🚚 DRIVER ACCEPT:', data);
    });
    socket.on(SOCKET_EVENTS.SINGLE_DRIVER_LOCATION, data => {
      console.log('🚚 DRIVER SINGLE:', data);
      store.dispatch(
        setdriverLocation({
          latitude: Number(data?.lat),
          longitude: Number(data?.lng),
          rotation: 0,
        }),
      );
    });
    socket.on(SOCKET_EVENTS.NEARBY_DRIVER_REACH, data => {
      console.log('🚚 DRIVER REACH:', data);
    });
  };

  if (socket.connected) {
    register();
  } else {
    socket.once('connect', register);
  }
};
