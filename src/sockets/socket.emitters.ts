// import { SOCKET_EVENTS } from './socket.events';
// import { getSocket } from './socket.service';

// // driver location send
// export const emitDriverLocation = (payload: any) => {
//   const socket = getSocket();
//   if (!socket.connected) return;
//   socket.emit(SOCKET_EVENTS.DRIVER_LOCATION, payload);
// };

// export const emitCreateCustomerLoad = (payload: any) => {
//   const socket = getSocket();
//   if (!socket.connected) return;
//   socket.emit(SOCKET_EVENTS.CREATECUSTOMERLOAD, payload);
// };

import { SOCKET_EVENTS } from './socket.events';
import { getSocket } from './socket.service';

export interface DriverLocationPayload {
  DriverID: string;
  VendorID: string;
  VehicleID: string;
  MobileNo: string;
  lat: string;
  lng: string;
  Speed: string;
  Direction: string;
  City: string;
  District: string;
  Taluka: string;
  State: string;
  Pincode: string;
  Address: string;
  Driver_LPStatus: string;
  Status: string;
}

export const emitCreateCustomerLoad = (payload: {
  loadId: string;
  customerId: string; // ✅ FIXED
  lat: number;
  lng: number;
}) => {
  const socket = getSocket();

  const emit = () => {
    socket.emit(SOCKET_EVENTS.CREATE_CUSTOMER_LOAD, payload);
  };

  if (socket.connected) {
    emit();
  } else {
    socket.once('connect', emit);
  }
};

export const emitSelectLoad = (payload: {
  customerId: string;
  postId: string;
  pickupLat: number;
  pickupLng: number;
}) => {
  const socket = getSocket();
  console.log('_check', {
    customerId: payload.customerId,
    postId: payload?.postId,
    pickupLat: payload?.pickupLat,
    pickupLng: payload?.pickupLng,
  });
  const emit = () => {
    socket.emit(SOCKET_EVENTS.SELECT_POST, {
      customerId: payload.customerId,
      postId: payload?.postId,
      pickupLat: payload?.pickupLat,
      pickupLng: payload?.pickupLng,
    });
    socket.emit('join_post_room', {
      postId: payload.postId,
    });
  };

  if (socket.connected) {
    emit();
  } else {
    socket.once('connect', emit);
  }
};

export const emitProcessLoad = (payload: { postId: string }) => {
  const socket = getSocket();

  const emit = () => {
    socket.emit(SOCKET_EVENTS.CUSTOMER_PROCESS_LOAD, {
      loadId: payload?.postId,
    });
  };

  if (socket.connected) {
    emit();
  } else {
    socket.once('connect', emit);
  }
};
export const emitCustomerJoin = (CUSTOMER_ID: string) => {
  const socket = getSocket();

  const emit = () => {
    console.log('📤 Emitting JOIN for customer:', CUSTOMER_ID);
    socket.emit(SOCKET_EVENTS.JOIN, {
      userId: CUSTOMER_ID,
      role: 'customer',
    });
  };

  if (socket.connected) {
    emit();
  } else {
    socket.once('connect', emit);
  }
};
