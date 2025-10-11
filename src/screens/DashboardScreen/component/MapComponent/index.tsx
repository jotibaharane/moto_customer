import { useGetNearbyDriversQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { addOrUpdateDriver } from '@store/slices/mapSlice';
import colors from '@utils/colors';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useDispatch, useSelector } from 'react-redux';
import DropMarker from '../icon/DropMarker';
import OriginMarker from '../icon/OriginMarker';
import Truck from '../icon/Truck';
import { MAP_STYLE } from './helper';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Driver {
  id: string;
  latitude: number;
  longitude: number;
  rotation: number;
  driver: string;
  available: boolean;
  licensePlate: string;
  type: string;
}

const ICON_SIZES = {
  origin: { width: 35, height: 35 },
  destination: { width: 35, height: 35 },
  truck: { width: 45, height: 45 },
};

// Throttle function to limit function calls
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
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

  const mapRef = useRef<MapView | null>(null);
  const lastFitCoordinatesRef = useRef<Coordinate[]>([]);
  const lastDriverUpdateRef = useRef<number>(0);

  // Clear map when currentMap changes to prevent stale markers
  useEffect(() => {
    // Reset fit coordinates when map type changes
    lastFitCoordinatesRef.current = [];

    // Force map refresh by animating to current region
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 350);
    }
  }, [currentMap, region]);

  // Optimized driver query with conditional polling
  const shouldPoll = useMemo(
    () => postId && currentMap === 'Load',
    [postId, currentMap],
  );

  const { data: driverLocations } = useGetNearbyDriversQuery(
    { CustomerID, LoadPostID: postId },
    {
      pollingInterval: shouldPoll ? 2000 : 0,
      skip: !shouldPoll,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  // Memoized coordinates calculation
  const getMapCoordinates = useCallback((): Coordinate[] => {
    const coords: Coordinate[] = [];

    if (origin?.latitude && origin.longitude) {
      coords.push({ latitude: origin.latitude, longitude: origin.longitude });
    }

    // Only include destination coordinates for Active map
    if (
      currentMap === 'Active' &&
      destination?.latitude &&
      destination.longitude
    ) {
      coords.push({
        latitude: destination.latitude,
        longitude: destination.longitude,
      });
    }

    // Only include drivers for Load map
    if (currentMap === 'Load') {
      drivers.forEach(driver => {
        if (driver.latitude && driver.longitude) {
          coords.push({
            latitude: driver.latitude,
            longitude: driver.longitude,
          });
        }
      });
    }
    // Include selected driver for Active and Process maps
    else if (
      (currentMap === 'Active' || currentMap === 'Process') &&
      selectedDriver?.latitude &&
      selectedDriver.longitude
    ) {
      coords.push({
        latitude: selectedDriver.latitude,
        longitude: selectedDriver.longitude,
      });
    }

    return coords;
  }, [currentMap, origin, destination, drivers, selectedDriver]);

  // Throttled map fitting function
  const fitMapToCoordinates = useCallback(
    throttle((coordinates: Coordinate[]) => {
      if (mapRef.current && coordinates.length > 0) {
        // Check if coordinates have significantly changed
        const hasSignificantChange = coordinates.some((coord, index) => {
          const lastCoord = lastFitCoordinatesRef.current[index];
          if (!lastCoord) return true;

          const latDiff = Math.abs(coord.latitude - lastCoord.latitude);
          const lngDiff = Math.abs(coord.longitude - lastCoord.longitude);
          return latDiff > 0.0001 || lngDiff > 0.0001; // ~11 meters precision
        });

        if (
          hasSignificantChange ||
          coordinates.length !== lastFitCoordinatesRef.current.length
        ) {
          console.log('Fitting map to coordinates:', coordinates.length);
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
          lastFitCoordinatesRef.current = coordinates;
        }
      } else if (mapRef.current && coordinates.length === 0) {
        // Fallback to initial region
        mapRef.current.animateToRegion(region, 1000);
      }
    }, 1000),
    [region],
  );

  // Optimized map fitting effect
  useEffect(() => {
    const coordinates = getMapCoordinates();
    fitMapToCoordinates(coordinates);
  }, [getMapCoordinates, fitMapToCoordinates]);

  // Optimized driver updates with deduplication
  useEffect(() => {
    if (driverLocations?.data?.length) {
      const now = Date.now();
      // Throttle driver updates to prevent excessive re-renders
      if (now - lastDriverUpdateRef.current < 1500) {
        return;
      }

      const newDrivers: Driver[] = driverLocations.data
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
        .filter(
          (driver): driver is Driver => !!driver.latitude && !!driver.longitude,
        );

      // Only dispatch if drivers have actually changed
      if (newDrivers.length > 0) {
        dispatch(addOrUpdateDriver(newDrivers as any));
        lastDriverUpdateRef.current = now;
      }
    }
  }, [driverLocations, dispatch]);

  // Memoized marker components with conditional rendering based on currentMap
  const renderOriginMarker = useMemo(() => {
    // Show origin marker for all map types
    if (!origin?.latitude) return null;

    return (
      <Marker
        key={`origin-${origin.latitude}-${origin.longitude}-${currentMap}`}
        coordinate={origin}
        flat
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={700}
        tracksViewChanges={false}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <OriginMarker size={45} />
        </View>
      </Marker>
    );
  }, [origin, currentMap]);

  const renderDestinationMarker = useMemo(() => {
    // Only show destination marker for Active map
    if (currentMap !== 'Active' || !destination?.latitude) return null;

    return (
      <Marker
        key={`destination-${destination.latitude}-${destination.longitude}-${currentMap}`}
        coordinate={destination}
        flat
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={800}
        tracksViewChanges={false}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <DropMarker
            size={45}
            style={[
              ICON_SIZES.origin,
              {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
              },
            ]}
          />
        </View>
      </Marker>
    );
  }, [destination, currentMap]);

  const renderSelectedDriverMarker = useMemo(() => {
    // Show selected driver for Active and Process maps only
    if (
      !selectedDriver?.latitude ||
      !(currentMap === 'Process' || currentMap === 'Active')
    ) {
      return null;
    }

    return (
      <Marker
        key={`selected-driver-${selectedDriver.id}-${currentMap}`}
        coordinate={{
          latitude: selectedDriver.latitude,
          longitude: selectedDriver.longitude,
        }}
        title={selectedDriver.driver}
        description={`License: ${selectedDriver.licensePlate}`}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={900}
        tracksViewChanges={false}
      >
        <View style={{ transform: [{ rotate: `${180}deg` }] }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Truck height={100} width={100} />
          </View>
        </View>
      </Marker>
    );
  }, [selectedDriver, currentMap]);

  const renderNearbyDrivers = useMemo(() => {
    // Only show nearby drivers for Load map
    if (currentMap !== 'Load') return null;

    return drivers.map(driver => (
      <Marker
        key={`driver-${driver.id}-${currentMap}`}
        coordinate={{
          latitude: driver.latitude,
          longitude: driver.longitude,
        }}
        title={driver.driver}
        description={`License: ${driver.licensePlate}`}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={800}
        tracksViewChanges={false}
      >
        <View style={{ transform: [{ rotate: `${180}deg` }] }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Truck height={100} width={100} />
          </View>
        </View>
      </Marker>
    ));
  }, [drivers, currentMap]);

  const renderRoutes = useMemo(() => {
    // Show origin to destination route for Active map
    if (currentMap === 'Active' && origin?.latitude && destination?.latitude) {
      return (
        <MapViewDirections
          key={`delivery-route-${currentMap}-${origin.latitude}-${destination.latitude}`}
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={8}
          strokeColor={colors.primary}
          strokeColors={[colors.primary]}
          lineCap="round"
          lineJoin="round"
          precision="high"
          onReady={() => {
            // Force map refresh after route is drawn
            setTimeout(() => {
              const coordinates = getMapCoordinates();
              if (coordinates.length > 0 && mapRef.current) {
                mapRef.current.fitToCoordinates(coordinates, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              }
            }, 100);
          }}
        />
      );
    }

    // Show selected driver to origin route for Process map
    if (
      currentMap === 'Process' &&
      selectedDriver?.latitude &&
      origin?.latitude
    ) {
      return (
        <MapViewDirections
          key={`pickup-route-${currentMap}-${selectedDriver.latitude}-${origin.latitude}`}
          origin={selectedDriver}
          destination={origin}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={6}
          strokeColor="#4a90e2"
          strokeColors={['#4a90e2']}
          lineCap="round"
          lineJoin="round"
          precision="high"
          onReady={() => {
            // Force map refresh after route is drawn
            setTimeout(() => {
              const coordinates = getMapCoordinates();
              if (coordinates.length > 0 && mapRef.current) {
                mapRef.current.fitToCoordinates(coordinates, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              }
            }, 100);
          }}
        />
      );
    }

    return null;
  }, [currentMap, origin, destination, selectedDriver, getMapCoordinates]);

  // Main render function with proper conditional rendering
  const renderMapContent = useMemo(() => {
    switch (currentMap) {
      case 'Load':
        return (
          <>
            {renderOriginMarker}
            {renderNearbyDrivers}
          </>
        );

      case 'Active':
        return (
          <>
            {renderOriginMarker}
            {renderDestinationMarker}
            {renderSelectedDriverMarker}
            {renderRoutes}
          </>
        );

      case 'Process':
        return (
          <>
            {renderOriginMarker}
            {renderSelectedDriverMarker}
            {renderRoutes}
          </>
        );

      default:
        return null;
    }
  }, [
    currentMap,
    renderOriginMarker,
    renderNearbyDrivers,
    renderDestinationMarker,
    renderSelectedDriverMarker,
    renderRoutes,
  ]);

  return (
    <MapView
      ref={mapRef}
      maxZoomLevel={18}
      minZoomLevel={5}
      pitchEnabled={false}
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      showsMyLocationButton={false}
      showsCompass={false}
      showsIndoors={false}
      showsIndoorLevelPicker={false}
      showsTraffic={false}
      showsScale={false}
      showsBuildings={false}
      showsPointsOfInterests={false}
      customMapStyle={MAP_STYLE}
      showsUserLocation={false}
      initialRegion={region}
      moveOnMarkerPress={false}
      toolbarEnabled={false}
      onMapReady={() => {
        // Force initial map refresh
        setTimeout(() => {
          const coordinates = getMapCoordinates();
          if (coordinates.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          }
        }, 500);
      }}
    >
      {renderMapContent}
    </MapView>
  );
};

export default React.memo(MapComponent);
