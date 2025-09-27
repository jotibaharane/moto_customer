import AppNavigator from '@navigation/AppNavigator';
import SplashScreen from '@screens/SplashScreen';
import { persistor, store } from '@store/index';
import colors from '@utils/colors';
import React, { useEffect, useState } from 'react';
import { Appearance, StatusBar, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [appIsReady, setAppIsReady] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Initialize app
  useEffect(() => {
    Appearance.setColorScheme('light');
    const prepareApp = async () => {
      try {
        // Request permissions
        // await requestPermissions();

        // Load any other resources here (fonts, API data, etc.)

        // Artificially delay for splash screen (remove in production if not needed)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!appIsReady) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? colors.backgroundDark : colors.surface}
        />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <SafeAreaProvider>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={
                isDarkMode ? colors.backgroundDark : colors.surface
              }
            />
            <AppNavigator />
            <Toast />
          </SafeAreaProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
