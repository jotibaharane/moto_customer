import { store } from '@store/index';

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
      /*
      data = {
        action: "JOIN" | "MOVE" | "LEAVE",
        DriverID,
        lat,
        lng,
        postId
      }
    */

      console.log('🚚 DRIVER UPDATE:', data);

      // 🔥 Redux (अगर mapSlice है)
      // dispatch(addOrUpdateDriver(data));
    });

    // socket.on(SOCKET_EVENTS.CUSTOMER_NEARBY_DRIVERS, loads => {
    //   // store.dispatch(setCustomerLocations(loads));
    //   console.log(
    //     '🚚 Nearby DRIVERS Received:',
    //     JSON.stringify(loads, null, 2),
    //   );
    // });
    // NEW load
    // socket.on(SOCKET_EVENTS.CUSTOMER_DRIVER_ACCEPTED, load => {
    //   console.log(
    //     '🚚 Nearby New Load Received:',
    //     JSON.stringify(load, null, 2),
    //   );
    // });
    // socket.on(SOCKET_EVENTS.CUSTOMER_DRIVER_LOCATION, load => {
    //   console.log('Driver location', load);
    // });
  };

  if (socket.connected) {
    register();
  } else {
    socket.once('connect', register);
  }
};
