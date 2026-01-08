// import { setTripStatus } from '@store/slices/authSlice';
// import { setDriverLpList } from '@store/slices/driverLp.slice';
import { SOCKET_EVENTS } from './socket.events';
import { getSocket } from './socket.service';

let registered = false;

export const registerSocketListeners = () => {
  if (registered) return;
  registered = true;
  const socket = getSocket();
  socket.on(SOCKET_EVENTS.DRIVER_LOCATION, status => {
    console.log('🟢 Driver LIVE  Status:', status);
    // store.dispatch(setTripStatus(status?.driverData?.[0]?.Driver_LPStatus));
  });
};
