// components/LogisticsMap.tsx
import { getDirections } from '@utils/googleApiUtils';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, {
  LatLng,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { DropPin, PickupPin, TruckMarker } from './MapIcons';

// Define TypeScript interfaces
export interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
}

export interface Truck {
  id: string;
  latitude: number;
  longitude: number;
  heading?: number;
}

export interface LogisticsMapProps {
  origin: Location;
  destination?: Location;
  nearbyTrucks?: Truck[];
  showTruckRoute?: boolean;
  showOriginToDestinationRoute?: boolean;
}

// Calculate distance between two points (Haversine formula) - MOVED TO TOP LEVEL
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const LogisticsMap: React.FC<LogisticsMapProps> = ({
  origin,
  destination,
  nearbyTrucks = [],
  showTruckRoute = false,
  showOriginToDestinationRoute = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [truckToOriginRoute, setTruckToOriginRoute] = useState<LatLng[]>([]);
  const [originToDestinationRoute, setOriginToDestinationRoute] = useState<
    LatLng[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Find the nearest truck
  const nearestTruck =
    nearbyTrucks.length > 0
      ? nearbyTrucks.reduce((nearest, truck) => {
          const nearestDistance = calculateDistance(
            nearest.latitude,
            nearest.longitude,
            origin.latitude,
            origin.longitude,
          );
          const truckDistance = calculateDistance(
            truck.latitude,
            truck.longitude,
            origin.latitude,
            origin.longitude,
          );
          return truckDistance < nearestDistance ? truck : nearest;
        })
      : null;

  // Fetch routes when dependencies change
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch truck to origin route if needed
        if (showTruckRoute && nearestTruck) {
          const truckRoute = await getDirections(
            {
              latitude: nearestTruck.latitude,
              longitude: nearestTruck.longitude,
            },
            origin,
          );
          setTruckToOriginRoute(truckRoute);
        }

        // Fetch origin to destination route if needed
        if (showOriginToDestinationRoute && destination) {
          const destinationRoute = await getDirections(origin, destination);
          setOriginToDestinationRoute(destinationRoute);
        }
      } catch (err) {
        setError('Failed to fetch routes. Please try again.');
        console.error('Error fetching routes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [
    origin,
    destination,
    showTruckRoute,
    showOriginToDestinationRoute,
    nearestTruck,
  ]);

  // Fit map to show all markers and routes
  useEffect(() => {
    if (mapRef.current) {
      const coordinates: LatLng[] = [origin];

      if (destination) coordinates.push(destination);
      if (nearbyTrucks) nearbyTrucks.forEach(truck => coordinates.push(truck));
      if (truckToOriginRoute.length > 0)
        coordinates.push(...truckToOriginRoute);
      if (originToDestinationRoute.length > 0)
        coordinates.push(...originToDestinationRoute);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [
    origin,
    destination,
    nearbyTrucks,
    truckToOriginRoute,
    originToDestinationRoute,
  ]);

  // Custom map style (Uber-like style)
  const mapStyle = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#bdbdbd' }],
    },
    {
      featureType: 'administrative.neighborhood',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#dadada' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9c9c9' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Origin Marker */}
        <Marker coordinate={origin} anchor={{ x: 0.5, y: 1 }}>
          <PickupPin size={50} />
        </Marker>

        {/* Destination Marker */}
        {destination && (
          <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
            <DropPin size={50} />
          </Marker>
        )}

        {/* Nearby Trucks Markers */}
        {nearbyTrucks.map(truck => (
          <Marker
            key={truck.id}
            coordinate={{
              latitude: truck.latitude,
              longitude: truck.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={truck.heading || 0}
          >
            <TruckMarker size={50} />
          </Marker>
        ))}

        {/* Truck to Origin Route */}
        {showTruckRoute && truckToOriginRoute.length > 0 && (
          <Polyline
            coordinates={truckToOriginRoute}
            strokeColor="#3498db"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Origin to Destination Route */}
        {showOriginToDestinationRoute &&
          originToDestinationRoute.length > 0 && (
            <Polyline
              coordinates={originToDestinationRoute}
              strokeColor="#2ecc71"
              strokeWidth={5}
            />
          )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  originMarker: {
    width: 40,
    height: 50,
  },
  destinationMarker: {
    width: 40,
    height: 50,
  },
  truckMarker: {
    width: 30,
    height: 30,
  },
});

export default LogisticsMap;
