import React from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';

const SplashScreen = () => {
  const loadingProgress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(loadingProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Company Logo */}
        <Image
          source={require('@assets/moto_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* App Name */}
        <Text variant="headlineLarge" style={styles.appName}>
          TRUCK TRANSPORT
        </Text>

        {/* Tagline */}
        <Text variant="bodyLarge" style={styles.tagline}>
          Delivering Excellence On Wheels
        </Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[styles.loadingProgress, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

export default SplashScreen;
