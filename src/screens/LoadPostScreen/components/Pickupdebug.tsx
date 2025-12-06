import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import GetLocation from 'react-native-get-location';
import debounce from 'lodash.debounce';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';

interface PickupModalProps {
  initialRegion?: Region;
  onLocationSelected?: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  pincodeCoords?: { latitude: number; longitude: number } | null;
  selectable?: boolean;
}

export default function PickupModal({
  initialRegion = {
    latitude: 19.166784,
    longitude: 73.236794,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  onLocationSelected,
  pincodeCoords,
  selectable = true,
}: PickupModalProps) {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [centerAddress, setCenterAddress] = useState<string>(
    'Select your location',
  );
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);

  // Request permission & get current location
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          await getCurrentLocation();
        }
      } else {
        setPermissionGranted(true);
        await getCurrentLocation();
      }
    };
    requestPermission();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });
      const loc: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setCurrentLocation(loc);

      // Only set region if pincodeCoords is not provided yet
      if (!pincodeCoords) {
        setRegion(loc);
        fetchAddress(loc.latitude, loc.longitude);
      }
    } catch (err) {
      console.warn(err);
      if (!pincodeCoords) {
        setRegion(initialRegion);
        fetchAddress(initialRegion.latitude, initialRegion.longitude);
      }
    }
  };

  // Animate map when pincodeCoords arrives
  useEffect(() => {
    if (pincodeCoords) {
      const newRegion: Region = {
        latitude: pincodeCoords.latitude,
        longitude: pincodeCoords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      fetchAddress(pincodeCoords.latitude, pincodeCoords.longitude);
    }
  }, [pincodeCoords]);

  // Fetch address from lat/lng
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const json = await res.json();
      if (json.results?.length) {
        setCenterAddress(json.results[0].formatted_address);
      } else {
        setCenterAddress('Address not found');
      }
    } catch (err) {
      console.warn(err);
      setCenterAddress('Error fetching address');
    } finally {
      setLoadingAddress(false);
    }
  };

  // Debounced fetch for map moves
  const fetchAddressDebounced = useCallback(debounce(fetchAddress, 800), []);

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    fetchAddressDebounced(newRegion.latitude, newRegion.longitude);
  };

  const goToCurrentLocation = () => {
    if (!currentLocation) return;
    setRegion(currentLocation);
    mapRef.current?.animateToRegion(currentLocation, 500);
  };

  const handleSelectLocation = () => {
    if (region && centerAddress && centerAddress !== 'Select your location') {
      onLocationSelected?.({
        latitude: region.latitude,
        longitude: region.longitude,
        address: centerAddress,
      });
    }
  };

  if (!permissionGranted) {
    return (
      <View style={styles.centered}>
        <FontAwesome5 name="map-marker-alt" size={50} color="#666" />
        <Text style={styles.permissionTitle}>Location Access Required</Text>
        <Text style={styles.permissionText}>
          Please allow location permission to select your pickup location
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={
            selectable ? onRegionChangeComplete : undefined
          }
          showsUserLocation
          scrollEnabled={selectable}
          showsMyLocationButton={false}
        />
      )}

      {/* Center Pin */}
      <View pointerEvents="none" style={styles.centerMarker}>
        <FontAwesome5 name="map-pin" size={32} color="#007AFF" />
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationBtn}
        onPress={goToCurrentLocation}
      >
        <FontAwesome5 name="location-arrow" size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.addressLabel}>Selected Location</Text>
        {loadingAddress ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={{ marginLeft: 8 }}>Getting address...</Text>
          </View>
        ) : (
          <Text style={styles.addressText} numberOfLines={2}>
            {centerAddress}
          </Text>
        )}
        {selectable && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectLocation}
          >
            <Text style={styles.selectButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
  currentLocationBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  addressText: { fontSize: 16, fontWeight: '400', color: '#333' },
  selectButton: {
    backgroundColor: '#3f97f5ff',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  selectButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
