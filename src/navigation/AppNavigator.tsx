import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnterMPINScreen from '@screens/EnterMPIN';
import LoadPostForm from '@screens/LoadPostScreen';
import OtpLoginScreen from '@screens/LoginScreen';
import RegistrationScreen from '@screens/RegistrationScreen';
import SetMPINScreen from '@screens/SetMPINScreen';
import SplashScreen from '@screens/SplashScreen';
import { RootStackParamList, routeName } from '@utils/navigationHelpers';
import DrawerNavigator from './drawer/DrawerNavigator';
import Notification from '@screens/DashboardScreen/Notification';
import EditCustomerScreen from '@screens/RegistrationScreen/ProfileEditscreen';
import Employee from '@screens/RegistrationScreen/Employee';
import Component from 'react-native-paper/lib/typescript/components/List/ListItem';
import Individual from '@screens/VerificationScreens/Individual';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useEffect } from 'react';
import {
  disconnectSocket,
  initSocket,
  registerSocketListeners,
} from '../sockets';
// import MultiStepForm from 'src/forms/Multistepform/MultiStepForm';

const RootStack = createNativeStackNavigator<any>();

const AppNavigator = () => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID,
  );
  console.log({ CustomerID });
  useEffect(() => {
    if (!CustomerID) return;

    initSocket(CustomerID);
    registerSocketListeners();

    return () => {
      disconnectSocket();
    };
  }, [CustomerID]);
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={routeName.SPLASH}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name={routeName.SPLASH} component={SplashScreen} />
        <RootStack.Screen name={routeName.LOGIN} component={OtpLoginScreen} />
        <RootStack.Screen
          name={routeName.DASHBOARD}
          component={DrawerNavigator}
        />
        <RootStack.Screen
          name={routeName.REGISTRATION}
          component={RegistrationScreen}
        />

        <RootStack.Screen
          name={routeName.MPIN_LOGIN}
          component={EnterMPINScreen}
        />

        {/* <RootStack.Screen
          name={routeName.MULTISTEPFORM}
          component={MultiStepForm}
        /> */}
        <RootStack.Screen name={routeName.SET_MPIN} component={SetMPINScreen} />
        <RootStack.Screen
          name={routeName.LOAD_POST}
          options={{
            headerShown: true,
            title: 'VEHICLE SEARCH',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
          component={LoadPostForm}
        />
        <RootStack.Screen
          name={routeName.EDIT_CUSTOMER}
          component={EditCustomerScreen}
        />
        <RootStack.Screen
          name={routeName.NOTIFICATION}
          component={Notification}
        />
        <RootStack.Screen name={routeName.ADD_EMPLOYEE} component={Employee} />
        <RootStack.Screen name={routeName.INDIVIDUAL} component={Individual} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
