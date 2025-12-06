import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Button,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import GetLocation from 'react-native-get-location';
import debounce from 'lodash.debounce';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';

interface DraggableMapPickerProps {
  initialRegion?: Region;
  onLocationSelected?: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export const DraggableMapPicker: React.FC<DraggableMapPickerProps> = ({
  initialRegion = {
    latitude: 19.166784,
    longitude: 73.236794,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  onLocationSelected,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [centerAddress, setCenterAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } else {
      setPermissionGranted(true);
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 60000 })
      .then(location => {
        const loc = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        setCurrentLocation(loc);
        setSelectedLocation(loc);
        mapRef.current?.animateToRegion({
          ...loc,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      })
      .catch(err => console.warn(err.code, err.message));
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`,
      );
      const json = await res.json();
      if (json.results?.length) {
        setCenterAddress(json.results[0].formatted_address);
        setSelectedLocation({ latitude: lat, longitude: lng });
      } else {
        setCenterAddress('Address not found');
        setSelectedLocation({ latitude: lat, longitude: lng });
      }
    } catch (error) {
      console.warn(error);
      setCenterAddress('Error fetching address');
      setSelectedLocation({ latitude: lat, longitude: lng });
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchAddressDebounced = useCallback(debounce(fetchAddress, 800), []);

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    fetchAddressDebounced(newRegion.latitude, newRegion.longitude);
  };

  const goToCurrentLocation = () => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion({
      ...currentLocation,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const handleSelectLocation = () => {
    if (selectedLocation && centerAddress) {
      onLocationSelected?.({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: centerAddress,
      });
    }
  };

  if (!permissionGranted) {
    return (
      <View style={styles.centered}>
        <Text>Please allow location permission</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Fixed Center Marker */}
      <View pointerEvents="none" style={styles.centerMarker}>
        <FontAwesome5 name="map-marker-alt" size={40} color="#E53935" />
      </View>

      {/* Address Box */}
      <View style={styles.addressBox}>
        {loadingAddress ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text
            style={styles.addressText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {centerAddress || 'Move the map to select location'}
          </Text>
        )}
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationBtn}
        onPress={goToCurrentLocation}
      >
        <FontAwesome5 name="location-arrow" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Select Location Button */}
      <View style={styles.selectButtonContainer}>
        <Button title="Select This Location" onPress={handleSelectLocation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  addressBox: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    width: '90%',
    zIndex: 2,
  },
  addressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  currentLocationBtn: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
