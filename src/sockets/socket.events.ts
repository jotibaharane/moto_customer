import CustomDrawer from '@navigation/drawer/CustomDrawer';

export const SOCKET_EVENTS = {
  // DRIVER_LOCATION: 'driverLiveLocation',
  CREATE_CUSTOMER_LOAD: 'customer:new_load',
  DRIVER_LOCATION: 'driverLiveLocation',
  SELECT_POST: 'customer:select_post',
  JOIN: 'join',
  CUSTOMER_NEARBY_DRIVERS: 'customer:nearby_drivers',
  CUSTOMER_DRIVER_ACCEPTED: 'customer:driver_accepted',
  CUSTOMER_DRIVER_LOCATION: 'driver:live_location',
  CUSTOMER_DRIVER_UPDATE: 'customer:drivers_update',
  // DRIVER_LP_STATUS: 'driverLPStatus',
  // NEARBY_CUSTOMER_LOAD: 'nearestCustomerpost',
  // NEARBY_CUSTOMER_LOAD: 'NearbyCustomerLoadPost',
  // DRIVER_LP_FLAG: 'driverLPFlag',
};
