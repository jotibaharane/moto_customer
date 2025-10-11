import AppNavigator from '@navigation/AppNavigator';
import { persistor, store } from '@store/index';
import colors from '@utils/colors';
import React, { useEffect } from 'react';
import { Appearance, StatusBar, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => Appearance.setColorScheme('light'), []);
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
