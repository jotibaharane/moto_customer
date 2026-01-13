import { store } from '@store/index';
import { setdriverLocation, setDriverLocations } from '@store/slices/map.slice';
import { SOCKET_EVENTS } from './socket.events';
import { getSocket } from './socket.service';
import { Alert } from 'react-native';
import { getBearing } from '@screens/DashboardScreen/component/MapComponent/helper';

let registered = false;
const ICON_FIX = 180;
 let prevLocation:any={latitude:0, longitude:0}
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
      Alert.alert(`${data?.DriverID} driver acepted load ${data?.loadId}`)
    });
    socket.on(SOCKET_EVENTS.SINGLE_DRIVER_LOCATION, data => {
      console.log('🚚 DRIVER SINGLE:', data);
   
                let direction = 0;
                if (prevLocation) {
                  direction = getBearing(
                    prevLocation.latitude,
                    prevLocation.longitude,
                    Number(data?.lat),
                    Number(data?.lng),
                  );
                }

                prevLocation = {  latitude:Number(data?.lat),
                    longitude:Number(data?.lng)};

             
      store.dispatch(
        setdriverLocation({
          latitude: Number(data?.lat),
          longitude: Number(data?.lng),
          rotation: (direction + ICON_FIX) % 360,
        }),
      );
    });
    socket.on(SOCKET_EVENTS.NEARBY_DRIVER_REACH, data => {
      console.log('🚚 DRIVER REACH:', data);
      Alert.alert(`${data?.DriverID} driver reach ${data?.distance} for load ${data?.loadId}`)
    });
  };

  if (socket.connected) {
    register();
  } else {
    socket.once('connect', register);
  }
};
