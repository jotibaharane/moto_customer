import Icon from '@react-native-vector-icons/material-design-icons';
import { MapMarker } from '@screens/DashboardScreen/types';
import colors from '@utils/colors';
import { customMapStyle } from '@utils/CustomMap';
import {
  fetchRouteFromGoogle,
  getRouteCoordinates,
} from '@utils/googleApiUtils';
import { wp } from '@utils/responsive';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, {
  LatLng,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

interface MapComponentProps {
  markers: MapMarker[] | undefined;
  initialRegion: Region;
  postOrigin?: {
    latitude: number;
    longitude: number;
  };
  postDestination?: {
    latitude: number;
    longitude: number;
  };
  driver?: {
    id: string;
    latitude: number;
    longitude: number;
    available: boolean;
    heading?: number;
  };
  onMapReady?: () => void;
  showDriverRoute?: boolean;
}

const MapComponent = React.forwardRef<MapView, MapComponentProps>(
  (
    {
      markers,
      initialRegion,
      onMapReady,
      postOrigin,
      postDestination,
      driver,
      showDriverRoute = false,
    },
    ref,
  ) => {
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
    const [driverRouteCoordinates, setDriverRouteCoordinates] = useState<
      LatLng[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [driverLoading, setDriverLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (postOrigin && ref && 'current' in ref && ref.current) {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
          ref.current?.animateToRegion(
            {
              ...postOrigin,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }, 100);
      }

      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }, [postOrigin, ref]);

    // Fetch route when origin and destination change
    useEffect(() => {
      const fetchRoute = async () => {
        if (!postOrigin || !postDestination) {
          setRouteCoordinates([]);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const routeData = await fetchRouteFromGoogle(
            postOrigin,
            postDestination,
          );
          const coordinates = getRouteCoordinates(routeData);
          setRouteCoordinates(coordinates);

          // Fit map to show the entire route
          if (
            coordinates.length > 0 &&
            ref &&
            'current' in ref &&
            ref.current
          ) {
            ref.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        } catch (err: any) {
          setError(err?.message || 'Failed to load route');
          console.error('Route fetching error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchRoute();
    }, [postOrigin, postDestination, ref]);

    // Fetch driver route when driver location and destination change
    useEffect(() => {
      const fetchDriverRoute = async () => {
        if (!showDriverRoute || !driver || !postDestination) {
          setDriverRouteCoordinates([]);
          return;
        }

        setDriverLoading(true);

        try {
          const driverLocation = {
            latitude: driver.latitude,
            longitude: driver.longitude,
          };

          const routeData = await fetchRouteFromGoogle(
            driverLocation,
            postDestination,
          );
          const coordinates = getRouteCoordinates(routeData);
          setDriverRouteCoordinates(coordinates);
        } catch (err: any) {
          console.error('Driver route fetching error:', err);
        } finally {
          setDriverLoading(false);
        }
      };

      fetchDriverRoute();
    }, [driver, postDestination, showDriverRoute]);

    // Validate markers array
    const validMarkers = useMemo(
      () =>
        Array.isArray(markers)
          ? markers?.filter(
              marker =>
                marker &&
                typeof marker?.latitude === 'number' &&
                typeof marker?.longitude === 'number' &&
                !isNaN(marker?.latitude) &&
                !isNaN(marker?.longitude),
            )
          : [],
      [markers],
    );

    // Driver marker rotation style
    const getDriverMarkerRotation = () => {
      if (driver?.heading !== undefined) {
        return { transform: [{ rotate: `${driver.heading}deg` }] };
      }
      return {};
    };

    return (
      <View style={styles.mapContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading route...</Text>
          </View>
        )}

        <MapView
          ref={ref}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
          onMapReady={onMapReady}
          customMapStyle={customMapStyle}
        >
          {/* Main Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Driver Route Polyline (if enabled) */}
          {showDriverRoute && driverRouteCoordinates.length > 0 && (
            <Polyline
              coordinates={driverRouteCoordinates}
              strokeColor={colors.info}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Driver Markers */}
          {validMarkers?.map((marker, index) => (
            <Marker
              key={marker?.id || `driver-${index}`}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker?.title}
              description={marker.id ? 'Available' : 'Busy'}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerPin,
                    {
                      backgroundColor: marker.id
                        ? colors.primary
                        : colors.error,
                    },
                  ]}
                >
                  <Icon
                    name="bus-marker"
                    size={wp(16)}
                    color={colors.textOnPrimary}
                  />
                </View>
                <View
                  style={[
                    styles.markerPointer,
                    {
                      borderTopColor: marker.id ? colors.success : colors.error,
                    },
                  ]}
                />
              </View>
            </Marker>
          ))}

          {/* Current Driver Marker (if provided) */}
          {driver && (
            <Marker
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
              title="Your Driver"
              description={driver.available ? 'Available' : 'On the way'}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
            >
              <View style={[styles.driverMarker, getDriverMarkerRotation()]}>
                <View
                  style={[
                    styles.driverPin,
                    {
                      backgroundColor: driver.available
                        ? colors.success
                        : colors.primary,
                    },
                  ]}
                >
                  <Icon name="car" size={wp(20)} color={colors.textOnPrimary} />
                </View>
                {!driver.available && <View style={styles.activeDriverPulse} />}
              </View>
            </Marker>
          )}

          {/* Post Origin Marker */}
          {postOrigin?.latitude && postOrigin?.longitude && (
            <Marker
              coordinate={{
                latitude: postOrigin.latitude,
                longitude: postOrigin.longitude,
              }}
              title="Pickup Location"
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerPin,
                    { backgroundColor: colors.success },
                  ]}
                >
                  <Icon
                    name="map-marker-radius"
                    size={wp(16)}
                    color={colors.textOnPrimary}
                  />
                </View>
                <View
                  style={[
                    styles.markerPointer,
                    { borderTopColor: colors.success },
                  ]}
                />
              </View>
            </Marker>
          )}

          {/* Post Destination Marker */}
          {postDestination?.latitude && postDestination?.longitude && (
            <Marker
              coordinate={{
                latitude: postDestination.latitude,
                longitude: postDestination.longitude,
              }}
              title="Destination"
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerPin,
                    { backgroundColor: colors.warning },
                  ]}
                >
                  <Icon
                    name="flag"
                    size={wp(16)}
                    color={colors.textOnPrimary}
                  />
                </View>
                <View
                  style={[
                    styles.markerPointer,
                    { borderTopColor: colors.warning },
                  ]}
                />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Driver status indicator */}
        {driver && (
          <View style={styles.driverStatusContainer}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: driver.available
                    ? colors.success
                    : colors.primary,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {driver.available ? 'Driver available' : 'Driver on the way'}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: wp(8),
    borderRightWidth: wp(8),
    borderBottomWidth: wp(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    marginTop: -wp(2),
  },
  driverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPin: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    zIndex: 10,
  },
  activeDriverPulse: {
    ...StyleSheet.absoluteFillObject,
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    zIndex: 1,
  },
  driverStatusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    color: colors.primary,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
  },
});

export default MapComponent;
