import { Location } from '@api/api.type';
import Geolocation from '@react-native-community/geolocation';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { Region } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from './env';
export interface RouteData {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  distance: number; // in kilometers
  duration: number; // in minutes
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface RouteStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  polyline: { points: string };
  html_instructions: string;
  travel_mode: string;
}

export interface RouteLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  steps: RouteStep[];
}

export interface RouteResponse {
  routes: Array<{
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    legs: RouteLeg[];
    overview_polyline: { points: string };
  }>;
  status: string;
}

export const defaultRegion: Location = {
  address: '',
  components: {
    dist: '',
    pincode: '',
    place: '',
    state: '',
    tal: '',
  },
  coordinates: {
    lat: 0,
    lng: 0,
  },
};

// Check if location services are enabled
export const checkLocationServices = async (): Promise<boolean> => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 },
    );
  });
};

// Request location permission for Android
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'This app needs access to your location to set pickup locations',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

// Open device location settings
export const openLocationSettings = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const geocodeCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<Location> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Geocoding API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No address found for these coordinates');
    }

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    return formatLocationData(data);
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error(
      'Location permission denied. Please enable location permissions in settings.',
    );
  }

  const isLocationEnabled = await checkLocationServices();
  if (!isLocationEnabled) {
    throw new Error(
      'Location services are disabled. Please enable GPS and try again.',
    );
  }

  return new Promise((resolve, reject) => {
    // Set a timeout for the entire location request
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          'Location request timeout. Please check your GPS signal and try again.',
        ),
      );
    }, 20000); // 20 seconds total timeout

    Geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;

        // Validate coordinates
        if (isValidCoordinate(latitude, longitude)) {
          resolve({ latitude, longitude });
        } else {
          reject(new Error('Invalid coordinates received from device'));
        }
      },
      error => {
        clearTimeout(timeoutId);
        let errorMessage = 'Failed to get current location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please enable location permissions in settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              'Location information unavailable. Please check your GPS signal and try again.';
            break;
          case error.TIMEOUT:
            errorMessage =
              'Location request timed out. Please check your GPS signal and try again.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds for GPS
        maximumAge: 30000, // 30 seconds cache
      },
    );
  });
};

// Alternative method with faster timeout for poor signal areas
export const getCurrentLocationWithFallback = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  try {
    return await getCurrentLocation();
  } catch (error) {
    // If high accuracy fails, try with lower accuracy
    console.log('High accuracy failed, trying with lower accuracy...');
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            'Location request timeout. Please move to an area with better GPS signal.',
          ),
        );
      }, 15000);

      Geolocation.getCurrentPosition(
        position => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          if (isValidCoordinate(latitude, longitude)) {
            resolve({ latitude, longitude });
          } else {
            reject(new Error('Invalid coordinates received'));
          }
        },
        error => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: false, // Lower accuracy for faster response
          timeout: 10000, // Shorter timeout
          maximumAge: 60000, // Accept older locations
        },
      );
    });
  }
};

const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    lat !== 0 &&
    lng !== 0
  );
};

const formatLocationData = (apiResponse: any): Location => {
  const defaultLocation: Location = {
    address: '',
    components: {
      dist: '',
      pincode: '',
      place: '',
      state: '',
      tal: '',
    },
    coordinates: {
      lat: 0,
      lng: 0,
    },
  };

  try {
    if (
      !apiResponse ||
      !apiResponse.results ||
      apiResponse.results.length === 0
    ) {
      return defaultLocation;
    }

    const firstResult = apiResponse.results[0];
    const { lat, lng } = firstResult.geometry?.location || {};
    const formattedAddress = firstResult.formatted_address || '';

    return {
      address: formattedAddress,
      coordinates: {
        lat: lat || 0,
        lng: lng || 0,
      },
      components: extractAddressComponents(
        firstResult.address_components || [],
      ),
    };
  } catch (error) {
    console.error('Error formatting location data:', error);
    return defaultLocation;
  }
};

const extractAddressComponents = (addressComponents: any[]): any => {
  const components: any = {
    dist: '',
    pincode: '',
    state: '',
    place: '',
    tal: '',
  };

  if (!addressComponents) return components;

  addressComponents.forEach(component => {
    if (component.types.includes('postal_code')) {
      components.pincode = component.long_name;
    } else if (component.types.includes('administrative_area_level_1')) {
      components.state = component.long_name;
    } else if (
      component.types.includes('locality') ||
      component.types.includes('sublocality_level_1')
    ) {
      components.place = component.long_name;
    } else if (component.types.includes('administrative_area_level_2')) {
      components.dist = component.long_name;
    } else if (
      component.types.includes('sublocality_level_2') ||
      component.types.includes('sublocality_level_3')
    ) {
      components.tal = component.long_name;
    }
  });

  return components;
};

// Reverse geocode for map selection
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<Location> => {
  return geocodeCoordinates(latitude, longitude);
};

// Calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// India's geographical bounds
export const INDIA_BOUNDS = {
  minLat: 6.7,
  maxLat: 35.5,
  minLng: 68.7,
  maxLng: 97.4,
};

// Default region centered on India
export const INDIA_DEFAULT_REGION: Region = {
  latitude: 22.0,
  longitude: 82.0,
  latitudeDelta: 29.0,
  longitudeDelta: 29.0,
};

// Validate if coordinates are within India's bounds
export const isLocationInIndia = (lat: number, lng: number): boolean => {
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
};

// Simple debounce implementation
export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const calculateRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
): Promise<RouteData> => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}&alternatives=false&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Directions API request failed with status ${response.status}`,
      );
    }

    const data: RouteResponse = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No route found between the selected locations');
    }

    if (data.status !== 'OK') {
      throw new Error(`Directions API failed: ${data.status}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes available');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Decode the overview polyline to get coordinates
    const coordinates = decodePolyline(route.overview_polyline.points);

    return {
      coordinates,
      distance: leg.distance.value / 1000, // Convert meters to kilometers
      duration: Math.ceil(leg.duration.value / 60), // Convert seconds to minutes
      bounds: route.bounds,
    };
  } catch (error) {
    console.error('Route calculation error:', error);

    // Fallback: create a straight line route with estimated distance/time
    if (error instanceof Error && error.message.includes('No route found')) {
      return getFallbackRoute(origin, destination, mode);
    }

    throw error;
  }
};

const decodePolyline = (
  encoded: string,
): Array<{ latitude: number; longitude: number }> => {
  let points: Array<{ latitude: number; longitude: number }> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }

  return points;
};

const getFallbackRoute = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: string = 'driving',
): RouteData => {
  const distance = calculateDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  // Estimate duration based on mode and distance
  let averageSpeed = 40; // km/h for driving
  if (mode === 'walking') averageSpeed = 5;
  if (mode === 'bicycling') averageSpeed = 15;

  const duration = Math.ceil((distance / averageSpeed) * 60); // Convert to minutes

  // Create a simple straight line with a few intermediate points
  const coordinates = createStraightLinePath(origin, destination, 10);

  return {
    coordinates,
    distance,
    duration,
    bounds: {
      northeast: {
        lat: Math.max(origin.latitude, destination.latitude),
        lng: Math.max(origin.longitude, destination.longitude),
      },
      southwest: {
        lat: Math.min(origin.latitude, destination.latitude),
        lng: Math.min(origin.longitude, destination.longitude),
      },
    },
  };
};
const createStraightLinePath = (
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  numPoints: number = 10,
): Array<{ latitude: number; longitude: number }> => {
  const coordinates = [];

  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const lat = start.latitude + (end.latitude - start.latitude) * ratio;
    const lng = start.longitude + (end.longitude - start.longitude) * ratio;

    coordinates.push({ latitude: lat, longitude: lng });
  }

  return coordinates;
};
