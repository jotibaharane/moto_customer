import Geolocation from '@react-native-community/geolocation';
import { Location } from '@store/slices/mapSliceType';
import {
  debounce,
  INDIA_DEFAULT_REGION,
  isLocationInIndia,
} from '@utils/locationUtils';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Icon } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

// Props
interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: Location) => void;
  mapLocation: Location | null;
  disabled?: boolean;
}

const MapModal: React.FC<MapModalProps> = ({
  visible,
  onClose,
  onConfirm,
  mapLocation,
  disabled = false,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    mapLocation,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isMapIdle, setIsMapIdle] = useState(true);
  const mapRef = useRef<MapView>(null);
  const markerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  // Get current device location
  const getCurrentLocation = () => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        if (!isLocationInIndia(latitude, longitude)) {
          Toast.show({
            type: 'error',
            text1: 'Location Error',
            text2: 'Current location is outside India.',
          });
          setIsLoading(false);
          return;
        }

        const location: Location = {
          address: '',
          coordinates: { lat: latitude, lng: longitude },
          components: { place: '', dist: '', tal: '', state: '', pincode: '' },
        };
        setCurrentLocation(location);
        setSelectedLocation(location);

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setMapRegion(newRegion);

        reverseGeocode(latitude, longitude);
        setIsLoading(false);
      },
      error => {
        console.error('Location error:', error);
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: 'Unable to fetch current location.',
        });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  // Reverse geocoding
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=in`,
        { headers: { 'User-Agent': 'moto_customer_services/0.0.1' } },
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        setSelectedLocation(prev => ({
          ...prev!,
          address: data.display_name,
          coordinates: { lat: latitude, lng: longitude },
          components: {
            place: data.address?.village || data.address?.city || '',
            dist: data.address?.county || '',
            tal: data.address?.suburb || '',
            state: data.address?.state || '',
            pincode: data.address?.postcode || '',
          },
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search location
  const searchLocation = debounce(async (query: string) => {
    if (!query || query.trim().length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim(),
        )}&countrycodes=in`,
        { headers: { 'User-Agent': 'moto_customer_services/0.0.1' } },
      );
      const data = await response.json();
      if (data[0]) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (!isLocationInIndia(latitude, longitude)) return;

        const newLocation: Location = {
          address: display_name,
          coordinates: { lat: latitude, lng: longitude },
          components: { place: '', dist: '', tal: '', state: '', pincode: '' },
        };
        setSelectedLocation(newLocation);
        setAddress(display_name);

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setMapRegion(newRegion);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  // Handle map region change complete
  const handleRegionChangeComplete = async (region: Region) => {
    if (!isMapIdle) return;

    setIsMapIdle(false);
    setMapRegion(region);

    // Animate the marker to indicate selection
    Animated.sequence([
      Animated.timing(markerScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(markerScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if the location is within India
    if (!isLocationInIndia(region.latitude, region.longitude)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Location',
        text2: 'Please select a location within India.',
      });
      setIsMapIdle(true);
      return;
    }

    // Update the selected location
    const newLocation: Location = {
      address: '',
      coordinates: { lat: region.latitude, lng: region.longitude },
      components: { place: '', dist: '', tal: '', state: '', pincode: '' },
    };
    setSelectedLocation(newLocation);

    // Reverse geocode the new location
    await reverseGeocode(region.latitude, region.longitude);
    setIsMapIdle(true);
  };

  // Convert Location to Region
  const locationToRegion = (location: Location | null): Region =>
    location &&
    isLocationInIndia(location.coordinates.lat, location.coordinates.lng)
      ? {
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : INDIA_DEFAULT_REGION;

  // Confirm
  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 bg-white`}>
          {/* Search Bar */}
          <View style={tw`p-4 bg-white shadow-md`}>
            <View style={tw`flex-row items-center bg-gray-100 rounded-lg p-2`}>
              <Icon source="search" size={20} color="gray" />
              <TextInput
                style={tw`flex-1 ml-2 text-base`}
                placeholder="Search location in India..."
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  searchLocation(text);
                }}
              />
              {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
            </View>
            {address && (
              <Text style={tw`mt-2 text-sm text-gray-600`} numberOfLines={1}>
                {address}
              </Text>
            )}
          </View>

          {/* Map Container with fixed center marker */}
          <View style={tw`flex-1 relative`}>
            <MapView
              ref={mapRef}
              style={tw`flex-1`}
              initialRegion={INDIA_DEFAULT_REGION}
              region={
                mapRegion ||
                locationToRegion(selectedLocation || currentLocation)
              }
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation
              showsMyLocationButton
              mapType="standard"
              zoomControlEnabled
            />

            {/* Fixed center marker */}
            <View style={[styles.markerFixed, tw`items-center justify-center`]}>
              <Animated.View
                style={[styles.marker, { transform: [{ scale: markerScale }] }]}
              >
                <Icon source="location-pin" size={40} color="#3b82f6" />
              </Animated.View>
            </View>

            {/* Loading overlay when geocoding */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={tw`mt-2 text-white`}>Getting address...</Text>
              </View>
            )}
          </View>

          {/* Floating button - recenter */}
          <TouchableOpacity
            style={tw`absolute bottom-28 right-4 bg-white p-3 rounded-full shadow`}
            onPress={getCurrentLocation}
          >
            <Icon source="my-location" size={24} color="blue" />
          </TouchableOpacity>

          {/* Buttons */}
          <View
            style={tw`absolute bottom-8 left-0 right-0 px-4 flex-row gap-2`}
          >
            <TouchableOpacity
              style={[
                tw`py-3 flex-1 rounded-lg items-center`,
                !selectedLocation ? tw`bg-blue-300` : tw`bg-blue-500`,
              ]}
              onPress={handleConfirm}
              disabled={!selectedLocation}
            >
              <Text style={tw`text-white font-semibold text-base`}>
                Confirm Location
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-gray-500 py-3 flex-1 rounded-lg items-center`}
              onPress={onClose}
            >
              <Text style={tw`text-white font-semibold text-base`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  markerFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  marker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(MapModal);
