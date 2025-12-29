import { useGetNearbyDriversQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { addOrUpdateDriver, setOrigin } from '@store/slices/mapSlice';
import colors from '@utils/colors';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useDispatch, useSelector } from 'react-redux';
import GetLocation from 'react-native-get-location';
import DropMarker from '../icon/DropMarker';
import OriginMarker from '../icon/OriginMarker';
import Truck from '../icon/Truck';
import { MAP_STYLE } from './helper';
import { AnimatedRegion, MarkerAnimated } from 'react-native-maps';

import { socket } from '@utils/socketUtils';
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
interface MapComponentProps {
  liveDriverLocation?: {
    latitude: number;
    longitude: number;
  };
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

const MapComponent: React.FC<MapComponentProps> = ({ liveDriverLocation }) => {
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
  console.log({
    origin,
    destination,
    drivers,
    selectedDriver,
    currentMap,
    region,
    postId,
  });
  const mapRef = useRef<MapView | null>(null);
  const lastFitCoordinatesRef = useRef<Coordinate[]>([]);
  const lastDriverUpdateRef = useRef<number>(0);
  const driverAnimatedPosition = useRef(
    new AnimatedRegion({
      latitude: selectedDriver?.latitude ?? origin?.latitude ?? 0,
      longitude: selectedDriver?.longitude ?? origin?.longitude ?? 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;

  //========socket for driver nearby alert========
  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log('📡 SOCKET EVENT:', event, args);
    });

    return () => {
      socket.offAny();
    };
  }, []);
  useEffect(() => {
    if (!CustomerID) return;

    const handleDriverLocation = (data: any) => {
      // ✅ NOW YOU WILL GET DATA
      console.log('Driver location data:', data);
    };

    const onConnect = () => {
      socket.off('driverlocation', handleDriverLocation);
      socket.on('driverlocation', handleDriverLocation);

      socket.emit('CustomerDetails', { customerId: CustomerID });
    };

    socket.on('connect', onConnect);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('driverlocation', handleDriverLocation);
    };
  }, [CustomerID]);
  //=================
  useEffect(() => {
    if (
      liveDriverLocation?.latitude == null ||
      liveDriverLocation?.longitude == null
    )
      return;

    driverAnimatedPosition
      .timing({
        toValue: {
          latitude: liveDriverLocation.latitude,
          longitude: liveDriverLocation.longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        },
        duration: 1000,
        useNativeDriver: false,
      })
      .start();
  }, [liveDriverLocation]);
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();

      console.log(data, 'ful address');
      if (data.results?.length > 0) {
        const result = data.results[0];

        return {
          address: result.formatted_address,
          components: result.address_components,
        };
      }
      return null;
    } catch (err) {
      console.log('Reverse geocode error', err);
      return null;
    }
  };
  useEffect(() => {
    // ✅ DO NOT override origin if it already exists (LoadPost location)
    if (origin?.latitude && origin?.longitude) return;

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        }

        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const geoData = await reverseGeocode(
          location.latitude,
          location.longitude,
        );

        dispatch(
          setOrigin({
            latitude: location.latitude,
            longitude: location.longitude,
            address: geoData?.address,
          }),
        );
      } catch (error) {
        console.warn('Error fetching location:', error);
      }
    };

    requestLocationPermission();
  }, [dispatch, origin]);

  // useEffect(() => {
  //   const requestLocationPermission = async () => {
  //     try {
  //       if (Platform.OS === 'android') {
  //         const granted = await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //           {
  //             title: 'Location Permission',
  //             message: 'We need your location to show nearby drivers.',
  //             buttonPositive: 'OK',
  //           },
  //         );
  //         if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
  //       }

  //       const location = await GetLocation.getCurrentPosition({
  //         enableHighAccuracy: true,
  //         timeout: 10000,
  //       });
  //       console.log(location, 'this is current position');
  //       // 🌐 Calculate map deltas for ~20 km radius view
  //       const RADIUS_KM = 20;
  //       const latitudeDelta = (RADIUS_KM * 2) / 111; // ~40 km diameter vertically
  //       const longitudeDelta =
  //         latitudeDelta / Math.cos((location.latitude * Math.PI) / 180);

  //       const currentRegion = {
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //         latitudeDelta,
  //         longitudeDelta,
  //       };

  //       // Animate to current location
  //       if (mapRef.current) {
  //         mapRef.current.animateToRegion(currentRegion, 1000);
  //       }
  //       const geoData = await reverseGeocode(
  //         location.latitude,
  //         location.longitude,
  //       );

  //       console.log(geoData, 'this is from data');
  //       // Save to Redux as origin
  //       dispatch(
  //         setOrigin({
  //           latitude: location?.latitude,
  //           longitude: location?.longitude,
  //           address: geoData?.address,
  //         }),
  //       );
  //     } catch (error) {
  //       console.warn('Error fetching location:', error);
  //     }
  //   };

  //   requestLocationPermission();
  // }, [dispatch]);

  // Clear map when currentMap changes to prevent stale markers
  useEffect(() => {
    lastFitCoordinatesRef.current = [];
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
      skip: !shouldPoll,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      // pollingInterval: shouldPoll ? 5000 : 0, // ⭐ auto update drivers every 5s
    },
  );

  useEffect(() => {
    if (!driverLocations || !Array.isArray(driverLocations)) return;

    const valid = driverLocations.filter(d => d?.latitude && d?.longitude);

    dispatch(addOrUpdateDriver(valid));
  }, [driverLocations]);

  const getMapCoordinates = useCallback((): Coordinate[] => {
    const coords: Coordinate[] = [];

    if (origin?.latitude && origin.longitude) {
      coords.push({ latitude: origin.latitude, longitude: origin.longitude });
    }

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

    if (currentMap === 'Load') {
      drivers.forEach(driver => {
        if (driver.latitude && driver.longitude) {
          coords.push({
            latitude: driver.latitude,
            longitude: driver.longitude,
          });
        }
      });
    } else if (
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

  const fitMapToCoordinates = useCallback(
    throttle((coordinates: Coordinate[]) => {
      if (mapRef.current && coordinates.length > 0) {
        const hasSignificantChange = coordinates.some((coord, index) => {
          const lastCoord = lastFitCoordinatesRef.current[index];
          if (!lastCoord) return true;

          const latDiff = Math.abs(coord.latitude - lastCoord.latitude);
          const lngDiff = Math.abs(coord.longitude - lastCoord.longitude);
          return latDiff > 0.0001 || lngDiff > 0.0001;
        });

        if (
          hasSignificantChange ||
          coordinates.length !== lastFitCoordinatesRef.current.length
        ) {
          // mapRef.current.fitToCoordinates(coordinates, {
          //   edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          //   animated: true,
          // });
          // Compute map center and show 20 km radius view
          const avgLat =
            coordinates.reduce((sum, c) => sum + c.latitude, 0) /
            coordinates.length;
          const avgLng =
            coordinates.reduce((sum, c) => sum + c.longitude, 0) /
            coordinates.length;

          // Calculate deltas for ~20 km radius (≈40 km view)
          const RADIUS_KM = 10;
          const latitudeDelta = (RADIUS_KM * 2) / 111;
          const longitudeDelta =
            latitudeDelta / Math.cos((avgLat * Math.PI) / 180);

          const regionToAnimate = {
            latitude: avgLat,
            longitude: avgLng,
            latitudeDelta,
            longitudeDelta,
          };

          mapRef.current.animateToRegion(regionToAnimate, 1000);
          lastFitCoordinatesRef.current = coordinates;

          lastFitCoordinatesRef.current = coordinates;
        }
      } else if (mapRef.current && coordinates.length === 0) {
        mapRef.current.animateToRegion(region, 1000);
      }
    }, 1000),
    [region],
  );

  useEffect(() => {
    const coordinates = getMapCoordinates();
    fitMapToCoordinates(coordinates);
  }, [getMapCoordinates, fitMapToCoordinates]);

  useEffect(() => {
    if (driverLocations?.data?.length) {
      const now = Date.now();
      if (now - lastDriverUpdateRef.current < 1500) return;

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

      if (newDrivers.length > 0) {
        dispatch(addOrUpdateDriver(newDrivers as any));
        lastDriverUpdateRef.current = now;
      }
    }
  }, [driverLocations, dispatch]);

  const renderOriginMarker = useMemo(() => {
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
          <DropMarker size={45} />
        </View>
      </Marker>
    );
  }, [destination, currentMap]);

  const renderSelectedDriverMarker = useMemo(() => {
    if (currentMap !== 'Process' && currentMap !== 'Active') return null;

    if (selectedDriver?.latitude == null || selectedDriver?.longitude == null)
      return null;

    return (
      <MarkerAnimated
        coordinate={driverAnimatedPosition}
        anchor={{ x: 0.5, y: 0.5 }}
        flat
        zIndex={999}
        tracksViewChanges={false}
      >
        <View
          style={{
            transform: [
              {
                rotate: `${selectedDriver.rotation || 0}deg`,
              },
            ],
          }}
        >
          <Truck height={90} width={90} />
        </View>
      </MarkerAnimated>
    );
  }, [currentMap, selectedDriver]);

  useEffect(() => {
    if (!liveDriverLocation || !mapRef.current) return;

    mapRef.current.animateCamera({
      center: {
        latitude: liveDriverLocation.latitude,
        longitude: liveDriverLocation.longitude,
      },
      zoom: 16,
      pitch: 45,
      heading: selectedDriver?.rotation || 0,
    });
  }, [liveDriverLocation]);

  const renderNearbyDrivers = useMemo(() => {
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
          <Truck height={100} width={100} />
        </View>
      </Marker>
    ));
  }, [drivers, currentMap]);

  const renderRoutes = useMemo(() => {
    if (currentMap === 'Active' && origin?.latitude && destination?.latitude) {
      return (
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={8}
          strokeColor={colors.primary}
        />
      );
    }

    if (
      currentMap === 'Process' &&
      selectedDriver?.latitude &&
      origin?.latitude
    ) {
      return (
        <MapViewDirections
          origin={selectedDriver}
          destination={origin}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={6}
          strokeColor="#4a90e2"
        />
      );
    }

    return null;
  }, [currentMap, origin, destination, selectedDriver]);

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
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      customMapStyle={MAP_STYLE}
      showsUserLocation={true}
      showsMyLocationButton={true}
      showsCompass={false}
      pitchEnabled={false}
      initialRegion={region}
    >
      {renderMapContent}
    </MapView>
  );
};

export default React.memo(MapComponent);
