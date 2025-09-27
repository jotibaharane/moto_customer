// components/MapComponent.tsx
import { useGetNearbyDriversQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { addOrUpdateDriver } from '@store/slices/mapSlice';
import { Driver } from '@store/slices/mapSliceType';
import { socket } from '@utils/socketUtils';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import {
  DROP_MARKER_IMG,
  fetchRoute,
  getTruckImage,
  MAP_STYLE,
  ORIGIN_MARKER_IMG,
} from './helper';

interface Coordinate {
  latitude: number;
  longitude: number;
}

// Standard icon sizes
const ICON_SIZES = {
  origin: { width: 30, height: 30 },
  destination: { width: 30, height: 30 },
  truck: { width: 40, height: 40 }, // Slightly larger for trucks
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

  const [pickupRoute, setPickupRoute] = useState<Coordinate[]>([]);
  const [deliveryRoute, setDeliveryRoute] = useState<Coordinate[]>([]);
  const [iconImages, setIconImages] = useState({
    origin: null as any,
    destination: null as any,
    truckSmall: null as any,
    truckMedium: null as any,
    truckLarge: null as any,
  });
  const mapRef = useRef<MapView | null>(null);

  // Preload and resize icons
  useEffect(() => {
    const loadIcons = async () => {
      try {
        // Load origin marker with consistent size
        const originIcon = Image.resolveAssetSource(ORIGIN_MARKER_IMG);
        const destinationIcon = Image.resolveAssetSource(DROP_MARKER_IMG);
        const truckSmallIcon = Image.resolveAssetSource(getTruckImage('small'));
        const truckMediumIcon = Image.resolveAssetSource(
          getTruckImage('medium'),
        );
        const truckLargeIcon = Image.resolveAssetSource(getTruckImage('large'));

        setIconImages({
          origin: {
            uri: originIcon.uri,
            width: ICON_SIZES.origin.width,
            height: ICON_SIZES.origin.height,
          },
          destination: {
            uri: destinationIcon.uri,
            width: ICON_SIZES.destination.width,
            height: ICON_SIZES.destination.height,
          },
          truckSmall: {
            uri: truckSmallIcon.uri,
            width: ICON_SIZES.truck.width,
            height: ICON_SIZES.truck.height,
          },
          truckMedium: {
            uri: truckMediumIcon.uri,
            width: ICON_SIZES.truck.width,
            height: ICON_SIZES.truck.height,
          },
          truckLarge: {
            uri: truckLargeIcon.uri,
            width: ICON_SIZES.truck.width,
            height: ICON_SIZES.truck.height,
          },
        });
      } catch (error) {
        console.error('Error loading icons:', error);
      }
    };

    loadIcons();
  }, []);

  // Get consistent truck icon based on type
  const getConsistentTruckImage = (type: string) => {
    switch (type) {
      case 'small':
        return iconImages.truckSmall;
      case 'large':
        return iconImages.truckLarge;
      case 'medium':
      default:
        return iconImages.truckMedium;
    }
  };

  // Update routes based on currentMap mode
  useEffect(() => {
    const updateRoutes = async () => {
      // Reset routes when mode changes
      setPickupRoute([]);
      setDeliveryRoute([]);

      if (currentMap === 'Load') {
        // In Load mode, we don't need to show routes
        return;
      }

      if (currentMap === 'Process' && selectedDriver && origin) {
        // Show route from driver to origin
        const pickup = await fetchRoute(
          {
            latitude: selectedDriver.latitude,
            longitude: selectedDriver.longitude,
          },
          { latitude: origin.latitude, longitude: origin.longitude },
        );
        setPickupRoute(pickup);
      }

      if (currentMap === 'Active' && origin && destination) {
        // Show route from origin to destination
        const delivery = await fetchRoute(
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        );
        setDeliveryRoute(delivery);

        // If there's a selected driver, also show their route to destination
        if (selectedDriver) {
          const driverToDestination = await fetchRoute(
            {
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            },
            {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          );
          setPickupRoute(driverToDestination);
        }
      }
    };

    updateRoutes();
  }, [selectedDriver, origin, destination, currentMap]);

  // Auto-fit map to show relevant markers and routes
  useEffect(() => {
    if (mapRef.current) {
      let coords: Coordinate[] = [];

      // Always include origin and destination if available
      if (origin?.latitude) {
        coords.push({
          latitude: origin.latitude,
          longitude: origin.longitude,
        });
      }

      if (destination?.latitude) {
        coords.push({
          latitude: destination.latitude,
          longitude: destination.longitude,
        });
      }

      // Include driver locations based on current mode
      if (currentMap === 'Load') {
        // Show all drivers in Load mode
        drivers.forEach(driver => {
          coords.push({
            latitude: driver.latitude,
            longitude: driver.longitude,
          });
        });
      } else if (selectedDriver) {
        // Show selected driver in Process and Active modes
        coords.push({
          latitude: selectedDriver.latitude,
          longitude: selectedDriver.longitude,
        });
      }

      // Include route coordinates
      if (pickupRoute.length > 0) coords = [...coords, ...pickupRoute];
      if (deliveryRoute.length > 0) coords = [...coords, ...deliveryRoute];

      if (coords.length > 0) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    }
  }, [
    pickupRoute,
    deliveryRoute,
    currentMap,
    origin,
    destination,
    drivers,
    selectedDriver,
  ]);

  useEffect(() => {
    if (driverLocations?.data?.length) {
      const data: Driver[] = driverLocations?.data?.map(item => {
        return {
          latitude: item?.Driver_Origin_Lat,
          longitude: item?.Driver_Origin_Lng,
          rotation: 0,
          driver: item?.DriverID,
          available: true,
          id: item?.DriverID,
          licensePlate: item?.VehicleNumber,
          type: 'medium',
        };
      });
      dispatch(addOrUpdateDriver(data));
    }
  }, [driverLocations, dispatch]);

  useEffect(() => {
    socket.connect();

    // Type the response parameter
    socket.on('driverLocationUpdate', res => {
      console.log({ res });
    });

    return () => {
      socket.off('driverLocationUpdate');
    };
  }, []);

  // Don't render map until icons are loaded
  if (
    !iconImages.origin ||
    !iconImages.destination ||
    !iconImages.truckMedium
  ) {
    return null; // Or return a loading indicator
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      customMapStyle={MAP_STYLE}
      showsTraffic={false}
      showsBuildings
      initialRegion={region}
    >
      {/* Origin Marker - show in all modes if available */}
      {origin?.latitude && (
        <Marker
          coordinate={{
            latitude: origin.latitude,
            longitude: origin.longitude,
          }}
          title="Origin"
          description="Pickup location"
          anchor={{ x: 0.5, y: 1 }} // Add anchor to correctly point to location
        >
          <Image
            source={ORIGIN_MARKER_IMG} // Use the direct asset require
            style={ICON_SIZES.origin}
            resizeMode="contain"
          />
        </Marker>
      )}

      {/* Destination Marker - show in all modes if available */}
      {destination?.latitude && (
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="Destination"
          description="Drop-off location"
          anchor={{ x: 0.5, y: 1 }} // Add anchor to correctly point to location
        >
          <Image
            source={DROP_MARKER_IMG} // Use the direct asset require
            style={ICON_SIZES.destination}
            resizeMode="contain"
          />
        </Marker>
      )}

      {/* Pickup Route (Driver -> Origin) - show in Process mode */}
      {currentMap === 'Process' &&
        pickupRoute.length > 0 &&
        origin?.latitude && (
          <>
            <Polyline
              coordinates={pickupRoute}
              strokeColor="#00000088"
              strokeWidth={10}
            />
            <Polyline
              coordinates={pickupRoute}
              strokeColor="#4a90e2"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

      {/* Delivery Route (Origin -> Destination) - show in Active mode */}
      {currentMap === 'Active' &&
        deliveryRoute.length > 0 &&
        origin?.latitude && (
          <>
            <Polyline
              coordinates={deliveryRoute}
              strokeColor="#00000088"
              strokeWidth={10}
            />
            <Polyline
              coordinates={deliveryRoute}
              strokeColor="#2ecc71"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

      {/* Driver to Destination Route - show in Active mode with selected driver */}
      {currentMap === 'Active' &&
        pickupRoute.length > 0 &&
        deliveryRoute.length === 0 &&
        origin?.latitude && (
          <>
            <Polyline
              coordinates={pickupRoute}
              strokeColor="#00000088"
              strokeWidth={10}
            />
            <Polyline
              coordinates={pickupRoute}
              strokeColor="#e74c3c"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

      {/* Selected Driver Marker - show in Process and Active modes */}
      {selectedDriver?.latitude &&
        (currentMap === 'Process' || currentMap === 'Active') && (
          <Marker
            key={selectedDriver.id}
            coordinate={{
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            }}
            title={selectedDriver.driver}
            description={`License: ${selectedDriver.licensePlate}`}
            image={getConsistentTruckImage(selectedDriver.type)}
          />
        )}

      {/* Nearby Drivers - show only in Load mode */}
      {currentMap === 'Load' &&
        drivers?.map(driver => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            title={driver.driver}
            description={`License: ${driver.licensePlate}`}
            anchor={{ x: 0.5, y: 0.5 }} // Trucks typically use a center anchor
          >
            <Image
              source={getConsistentTruckImage(driver.type)} // Use the direct asset require function
              style={ICON_SIZES.truck}
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
});

export default MapComponent;
