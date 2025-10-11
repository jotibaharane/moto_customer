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

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={routeName.SPLASH}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name={routeName.SPLASH} component={SplashScreen} />
        <RootStack.Screen name={routeName.LOGIN} component={OtpLoginScreen} />
        <RootStack.Screen
          name={routeName.REGISTRATION}
          component={RegistrationScreen}
        />
        <RootStack.Screen
          name={routeName.MPIN_LOGIN}
          component={EnterMPINScreen}
        />
        <RootStack.Screen
          name={routeName.DASHBOARD}
          component={DrawerNavigator}
        />
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
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
