// navigation/drawer/DrawerNavigator.tsx
import TabNavigator from '@navigation/tabs/TabNavigator';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '@screens/SplashScreen';
import { routeName } from '@utils/navigationHelpers';
import React from 'react';
import CustomDrawer from './CustomDrawer';

export type DrawerParamList = {
  [routeName.HOMESTACK]: undefined;
  Settings: undefined;
  [routeName.MPIN_LOGIN]: undefined;
  [routeName.LOAD_POST]: undefined;
  PROFILE: undefined;
  VEHICLE_MANAGEMENT: undefined;
  DRIVER_MANAGEMENT: undefined;
  TRIP_MANAGEMENT: undefined;
  MY_LOADS: undefined;
  [routeName.SET_MPIN]: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawer {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        width: 340,
      },
      drawerType: 'front',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      swipeEnabled: true,
    }}
  >
    <Drawer.Screen
      name={routeName.HOMESTACK}
      component={TabNavigator}
      options={{
        title: 'Dashboard',
      }}
    />

    <Drawer.Screen
      name={routeName.LOAD_POST}
      component={SplashScreen}
      options={{
        title: 'Load Post',
      }}
    />

    <Drawer.Screen
      name="MY_LOADS"
      component={SplashScreen}
      options={{
        title: 'My Loads',
      }}
    />

    <Drawer.Screen
      name="TRIP_MANAGEMENT"
      component={SplashScreen}
      options={{
        title: 'Trip Management',
      }}
    />

    <Drawer.Screen
      name="DRIVER_MANAGEMENT"
      component={SplashScreen}
      options={{
        title: 'Driver Management',
      }}
    />

    <Drawer.Screen
      name="VEHICLE_MANAGEMENT"
      component={SplashScreen}
      options={{
        title: 'Vehicle Management',
      }}
    />

    <Drawer.Screen
      name="PROFILE"
      component={SplashScreen}
      options={{
        title: 'Profile',
      }}
    />

    <Drawer.Screen
      name={routeName.SET_MPIN}
      component={SplashScreen}
      options={{
        title: 'MPIN Settings',
      }}
    />

    <Drawer.Screen
      name="Settings"
      component={SplashScreen}
      options={{
        title: 'Settings',
      }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;
