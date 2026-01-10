// hooks/useCurrentLocation.ts
import Geolocation from '@react-native-community/geolocation';
import { useCallback, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { Region } from 'react-native-maps';

// export interface Location {
//   latitude: number;
//   longitude: number;
//   latitudeDelta?: number;
//   longitudeDelta?: number;
// }

export interface UseCurrentLocationReturn {
  currentLocation: Region;
  isLoadingLocation: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Precise Location Permission',
          message:
            'App needs access to your precise location for optimal functionality.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      // Fallback to coarse location
      const coarseLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Approximate Location Permission',
          message: 'App needs access to your approximate location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    return true; // iOS permissions handled via Info.plist
  }
  return false;
}

const useCurrentLocation = (
  initialLocation?: Region,
): UseCurrentLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<Region>(
    initialLocation || {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      const errorMsg =
        'Location permission denied. Please enable location services.';
      setError(errorMsg);
      Alert.alert(
        'Permission Denied',
        'Please enable location services in your device settings to use this feature.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Permission denied by user'),
          },
        ],
      );
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    // Try high-accuracy location first
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        const newLocation: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setCurrentLocation(newLocation);
        setIsLoadingLocation(false);
      },
      error => {
        let errorMessage = 'Unable to retrieve location. Please try again.';

        if (error.code === 1) {
          // PERMISSION_DENIED
          errorMessage =
            'Location permission was denied. Please enable it in settings.';
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          errorMessage = 'Location is unavailable. Ensure GPS is enabled.';
        } else if (error.code === 3) {
          // TIMEOUT

          // Fallback to cached or coarse location
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;

              const fallbackLocation: Region = {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };

              setCurrentLocation(fallbackLocation);
              setIsLoadingLocation(false);
            },
            fallbackError => {
              setError('Failed to retrieve location. Using default location.');
              setIsLoadingLocation(false);
            },
            {
              enableHighAccuracy: false, // Coarse location
              timeout: 10000, // 10 seconds for fallback
              maximumAge: 30000, // Accept cached location up to 30 seconds old
            },
          );
          return;
        }

        setError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 30 seconds for high-accuracy
        maximumAge: 5000, // Accept cached location up to 5 seconds old
      },
    );
  }, []);

  return {
    currentLocation,
    isLoadingLocation,
    error,
    getCurrentLocation,
    requestLocationPermission,
  };
};

export default useCurrentLocation;
