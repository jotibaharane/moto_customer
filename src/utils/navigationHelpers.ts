import { RootState } from '@store/index';
import { useSelector } from 'react-redux';

export const useAuthStatus = () => {
  const { isOnboarded, token, mpinSet } = useSelector(
    (state: RootState) => state.auth,
  );

  return {
    isOnboarded: isOnboarded,
    mpinSet: mpinSet,
    token: token,
  };
};

export enum routeName {
  SPLASH = 'Splash',
  LOGIN = 'login',
  REGISTRATION = 'registration',
  SET_MPIN = 'set-mpin',
  LOAD_POST = 'my-post',
  EDIT_CUSTOMER = 'edit-customer',
  MPIN_LOGIN = 'mpin-login',
  DASHBOARD = 'dashboard',
  HOMESTACK = 'HomeStack',
  HOME = 'home',
  CUSTOMER_POSTS = 'customer-posts',
  POST_CREATE = 'post-create',
  NOTIFICATION = 'notification',
  ADD_EMPLOYEE = 'addEmployee',
  MULTISTEPFORM = 'multistep',
  INDIVIDUAL = 'individual',

  // old

  MAIN_TABS = 'MainTabs',

  PROFILE = 'profile',
  MASTER = 'master',
  SETTINGS = 'settings',
  ONBOARDING = 'onboarding',
  ROUTES = 'Routes',
  EXPENSES = 'Expenses',
  VENDOR_ONBOARDING = 'vender-onboarding',
  TEMPORARY_DASHBOARD = 'temprory-dashboard',
  LOCATIONS = 'locations',
  // employee
  EMPLOYEES = 'employees',
  EMPLOYEE_DETAILS = 'employee-details',

  // driver
  DRIVER_MODULE = 'driver-module',
  DRIVER_REGISTER = 'driver-register',
  DRIVER_MIS = 'driver-mis',
  DRIVER_OPERATIONS = 'driver-operation',
  DRIVER_VALET = 'driver-valet',
  DRIVER_DETAILS = 'driver-details',

  // vehicles
  VEHICLES = 'vehicles',
  VEHICLE_REGISTER = 'vehicle-register',
  VEHICLE_DETAILS = 'vehicle-DETAILS',
  ACTIVE_TRIPS = 'active-trips',
  CUSTOM_LOADS = 'custom-loads',
  GENERATED_POSTS = 'generated-posts',
  POST_GENERATE = 'post-generate',
  POST_UPDATE = 'post-update',
  CUSTOMER_ORDERS = 'customer-orders',

  VEHICLES_ALERT = 'VEHICLES_ALERT',
  MODAL_ALERT = 'MODAL_ALERT',

  // dashboard
  BID_DETAILS = 'BidDetails',
  CUSTOM_REQUIREMENT = 'cutomer-requirement',
  BID_CUSTOMER_LIST = 'bid-customer-list',
  ACCEPTED_DEALS = 'accepted-deals',
  VEHICLE_POSTS = 'vehicle-posts',
}

export type RootStackParamList = {
  [routeName.LOGIN]: undefined;
  [routeName.REGISTRATION]: undefined;
  [routeName.EDIT_CUSTOMER]: undefined;
  [routeName.SET_MPIN]: undefined;
  [routeName.DASHBOARD]: undefined;
  [routeName.MPIN_LOGIN]: undefined;
  [routeName.LOAD_POST]: undefined;
  ['Splash']: undefined;
};
