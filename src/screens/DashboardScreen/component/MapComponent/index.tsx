import { useGetNearbyDriversQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { addOrUpdateDriver } from '@store/slices/mapSlice';
import { Driver } from '@store/slices/mapSliceType';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useDispatch, useSelector } from 'react-redux';
import {
  DROP_MARKER_IMG,
  FALLBACK_IMAGE,
  HEAVY_TRUCK_IMG,
  MAP_STYLE,
  MEDIUM_TRUCK_IMG,
  ORIGIN_MARKER_IMG,
  SMALL_TRUCK_IMG,
} from './helper';

interface Coordinate {
  latitude: number;
  longitude: number;
}

const ICON_SIZES = {
  origin: { width: 35, height: 35 },
  destination: { width: 35, height: 35 },
  truck: { width: 45, height: 45 },
};

// Helper function to get appropriate truck image based on vehicle type
const getTruckImage = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'small':
      return SMALL_TRUCK_IMG;
    case 'medium':
      return MEDIUM_TRUCK_IMG;
    case 'heavy':
      return HEAVY_TRUCK_IMG;
    default:
      return MEDIUM_TRUCK_IMG;
  }
};

const MapComponent: React.FC = () => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const dispatch = useDispatch();
  const {
    origin,
    destination,
    drivers,
    selectedDriver,
    currentMap,
    region,
    postId,
  } = useSelector((state: RootState) => state.map);

  const { data: driverLocations } = useGetNearbyDriversQuery(
    { CustomerID, LoadPostID: postId },
    {
      pollingInterval: 1000,
      skip: !postId && currentMap !== 'Load',
    },
  );

  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  // Track rendered markers to prevent duplicates
  const renderedDriverIds = useRef<Set<string>>(new Set());

  // Debug logging
  useEffect(() => {
    console.log('=== MAP COMPONENT DEBUG INFO ===');
    console.log('Marker images:', {
      origin: ORIGIN_MARKER_IMG,
      destination: DROP_MARKER_IMG,
      small: SMALL_TRUCK_IMG,
      medium: MEDIUM_TRUCK_IMG,
      heavy: HEAVY_TRUCK_IMG,
      fallback: FALLBACK_IMAGE,
    });
    console.log('Current map state:', {
      currentMap,
      hasOrigin: !!origin?.latitude,
      hasDestination: !!destination?.latitude,
      driversCount: drivers.length,
      hasSelectedDriver: !!selectedDriver,
      postId,
    });

    setIconsLoaded(true);
  }, []);

  // Fit map to coordinates
  useEffect(() => {
    if (mapRef.current && mapReady) {
      let coords: Coordinate[] = [];

      // Add origin and destination
      if (origin?.latitude) {
        coords.push({ latitude: origin.latitude, longitude: origin.longitude });
      }
      if (destination?.latitude) {
        coords.push({
          latitude: destination.latitude,
          longitude: destination.longitude,
        });
      }

      // Add drivers based on current map mode
      if (currentMap === 'Load') {
        drivers.forEach(driver => {
          if (driver.latitude && driver.longitude) {
            coords.push({
              latitude: driver.latitude,
              longitude: driver.longitude,
            });
          }
        });
      } else if (selectedDriver?.latitude) {
        coords.push({
          latitude: selectedDriver.latitude,
          longitude: selectedDriver.longitude,
        });
      }

      // Fit to coordinates if we have valid ones
      if (coords.length > 0) {
        console.log('Fitting map to coordinates:', coords.length);
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      } else {
        // Fallback to initial region
        mapRef.current.animateToRegion(region, 1000);
      }
    }
  }, [currentMap, origin, destination, drivers, selectedDriver, mapReady]);

  // Update drivers from API
  useEffect(() => {
    if (driverLocations?.data?.length) {
      console.log('Updating drivers from API:', driverLocations.data.length);
      const data: Driver[] = driverLocations.data
        .map(item => ({
          latitude: item?.Driver_Origin_Lat,
          longitude: item?.Driver_Origin_Lng,
          rotation: 0,
          driver: item?.DriverID,
          available: true,
          id: item?.DriverID,
          licensePlate: item?.VehicleNumber,
          type: item?.VehicleType || 'medium',
        }))
        .filter(driver => driver.latitude && driver.longitude);

      dispatch(addOrUpdateDriver(data));
    }
  }, [driverLocations, dispatch]);

  const forceMapRefresh = () => {
    if (mapRef.current && mapReady) {
      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 500);
      }, 300);
    }
  };

  // Filter out duplicate drivers and ensure selected driver is not duplicated
  const getFilteredDrivers = () => {
    const filteredDrivers: Driver[] = [];
    const seenDriverIds = new Set<string>();

    // Add selected driver first if applicable
    if (selectedDriver && selectedDriver.id && currentMap === 'Load') {
      seenDriverIds.add(selectedDriver.id);
      filteredDrivers.push(selectedDriver);
    }

    // Add other drivers, avoiding duplicates
    drivers.forEach(driver => {
      if (driver.id && !seenDriverIds.has(driver.id)) {
        seenDriverIds.add(driver.id);
        filteredDrivers.push(driver);
      }
    });

    return filteredDrivers;
  };

  if (!iconsLoaded) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  const filteredDrivers = getFilteredDrivers();

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      customMapStyle={MAP_STYLE}
      showsTraffic={false}
      showsBuildings={true}
      // showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={{
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
      followsUserLocation={false}
      loadingEnabled={true}
      loadingIndicatorColor="#666666"
      loadingBackgroundColor="#eeeeee"
      onMapReady={() => {
        console.log('Map is ready');
        setMapReady(true);
        forceMapRefresh();
      }}
      onLayout={forceMapRefresh}
    >
      {/* Origin Marker */}
      {origin?.latitude && (
        <Marker
          key="origin-marker"
          coordinate={{
            latitude: origin.latitude,
            longitude: origin.longitude,
          }}
          title="Origin"
          description="Pickup location"
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={1000}
        >
          <Image
            source={ORIGIN_MARKER_IMG}
            style={[
              ICON_SIZES.origin,
              {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
              },
            ]}
            resizeMode="contain"
          />
        </Marker>
      )}

      {/* Destination Marker */}
      {destination?.latitude && (
        <Marker
          key="destination-marker"
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="Destination"
          description="Drop-off location"
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={1000}
        >
          <Image
            source={DROP_MARKER_IMG}
            style={[
              ICON_SIZES.destination,
              {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
              },
            ]}
            resizeMode="contain"
          />
        </Marker>
      )}

      {/* Pickup Route - Driver to Origin */}
      {currentMap === 'Process' &&
        selectedDriver?.latitude &&
        origin?.latitude && (
          <MapViewDirections
            key="pickup-route"
            origin={{
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            }}
            destination={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={6}
            strokeColor="#4a90e2"
            strokeColors={['#4a90e2']}
            lineCap="round"
            lineJoin="round"
          />
        )}

      {/* Delivery Route - Origin to Destination */}
      {currentMap === 'Active' && origin?.latitude && destination?.latitude && (
        <MapViewDirections
          key="delivery-route"
          origin={{
            latitude: origin.latitude,
            longitude: origin.longitude,
          }}
          destination={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={6}
          strokeColor="#2ecc71"
          strokeColors={['#2ecc71']}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Driver to Destination Route */}
      {currentMap === 'Active' &&
        selectedDriver?.latitude &&
        destination?.latitude &&
        !origin?.latitude && (
          <MapViewDirections
            key="driver-destination-route"
            origin={{
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            }}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={6}
            strokeColor="#e74c3c"
            strokeColors={['#e74c3c']}
            lineCap="round"
            lineJoin="round"
          />
        )}

      {/* Selected Driver Marker - Only show in Process and Active modes */}
      {selectedDriver?.latitude &&
        (currentMap === 'Process' || currentMap === 'Active') && (
          <Marker
            key={`selected-driver-${selectedDriver.id}`}
            coordinate={{
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            }}
            title={selectedDriver.driver}
            description={`License: ${selectedDriver.licensePlate}`}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={900}
          >
            <Image
              source={MEDIUM_TRUCK_IMG}
              style={[
                ICON_SIZES.truck,
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  transform: [{ rotate: `${selectedDriver.rotation || 0}deg` }],
                },
              ]}
              resizeMode="contain"
            />
          </Marker>
        )}

      {/* Nearby Drivers - Only show in Load mode and exclude selected driver */}
      {currentMap === 'Load' &&
        filteredDrivers.map((driver, index) => (
          <Marker
            key={`driver-${driver.id}-${index}`}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            title={driver.driver}
            description={`License: ${driver.licensePlate}`}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={800} // Lower zIndex than selected driver
          >
            <Image
              source={MEDIUM_TRUCK_IMG}
              style={[
                ICON_SIZES.truck,
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  transform: [{ rotate: `${driver.rotation || 0}deg` }],
                },
              ]}
              resizeMode="contain"
            />
          </Marker>
        ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default MapComponent;
