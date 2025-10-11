import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  LatLng,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { RadioButton, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ShipmentData } from '@api/api.type';
import { useGetCurrentAddressQuery } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import ActionButton from '@components/common/ActionButton';
import { SelectList } from '@components/common/Select';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';
import {
  calculateRoute,
  geocodeCoordinates,
  getCurrentLocationWithFallback,
  INDIA_DEFAULT_REGION,
  openLocationSettings,
  reverseGeocode,
} from '@utils/locationUtils';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';

import LocationHistoryModal from './LocationHistoryModal';

export interface PickupModalRef {
  open: () => void;
  close: () => void;
}

interface LocationSuggestion {
  key: string;
  value: string;
}

interface RouteData {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  distance: number;
  duration: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PickupModal = forwardRef<PickupModalRef>((props, ref) => {
  const bottomModalRef = useRef<BottomModalRef>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeOriginButton, setActiveOriginButton] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupType, setPickupType] = useState<'self' | 'other'>('self');
  const [mapRegion, setMapRegion] = useState<Region>(INDIA_DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [centerPinCoordinate, setCenterPinCoordinate] = useState<LatLng | null>(
    null,
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);
  const pinAnimation = useRef(new Animated.Value(0)).current;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { values, setFieldValue } = useFormikContext<ShipmentData>();
  const { currentData } = useGetCurrentAddressQuery<any>();
  const originPlaces = useGooglePlacesSelect();

  const isOtherPickupType = useMemo(() => pickupType === 'other', [pickupType]);

  // Custom debounce function without lodash
  const debounce = useCallback(
    (func: (...args: any[]) => void, wait: number) => {
      return (...args: any[]) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          func(...args);
        }, wait);
      };
    },
    [],
  );

  // Animate the center pin
  const animatePin = useCallback(
    (toValue: number) => {
      Animated.spring(pinAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
        overshootClamping: false,
      }).start();
    },
    [pinAnimation],
  );

  const handleConfirm = useCallback(() => {
    if (!values.origin?.address) {
      Alert.alert('Error', 'Please select a pickup location');
      return;
    }

    if (isOtherPickupType) {
      if (!values.ContactPerson?.trim()) {
        Alert.alert('Error', 'Please enter contact person name');
        return;
      }
      if (!values.ContactNumber?.trim()) {
        Alert.alert('Error', 'Please enter contact number');
        return;
      }
    }

    handleModalClose();
  }, [pickupType, values, isOtherPickupType]);

  const handleOriginSelect = useCallback(
    async (selected: LocationSuggestion) => {
      try {
        const location = await originPlaces.getPlaceDetails(selected.key);
        if (location) {
          setFieldValue('origin', location);
          const newRegion = {
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setMapRegion(newRegion);
          setCenterPinCoordinate({
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
          });
          setSelectedLocation(location);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces, setFieldValue],
  );

  const handleHistoryLocationSelect = useCallback(
    (location: any) => {
      setFieldValue('origin', {
        ...values.origin,
        address: location,
      });
      setShowHistoryModal(false);
    },
    [setFieldValue, values.origin],
  );

  const handleCurrentLocationPress = useCallback(async () => {
    try {
      setActiveOriginButton('current');
      setIsLoadingLocation(true);

      const { latitude, longitude } = await getCurrentLocationWithFallback();
      const address = await geocodeCoordinates(latitude, longitude);

      if (address) {
        setFieldValue('origin', address);
        setUserLocation({ latitude, longitude });

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(newRegion);
        setCenterPinCoordinate({ latitude, longitude });
        setSelectedLocation(address);

        if (selectedLocation) {
          await calculateRouteBetweenPoints(
            { latitude, longitude },
            {
              latitude: selectedLocation.coordinates.lat,
              longitude: selectedLocation.coordinates.lng,
            },
          );
        }
      } else {
        Alert.alert(
          'Location Unavailable',
          'Could not fetch address. Please select a location manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Select Manually', onPress: () => setShowMapModal(true) },
          ],
        );
      }
    } catch (error: any) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        error.message.includes('permission') ||
          error.message.includes('disabled')
          ? 'Location services are disabled. Please enable them or select a location manually.'
          : 'Failed to fetch location. Please try again or select manually.',
        [
          { text: 'Cancel', style: 'cancel' },
          error.message.includes('permission') ||
          error.message.includes('disabled')
            ? { text: 'Open Settings', onPress: openLocationSettings }
            : { text: 'Select Manually', onPress: () => setShowMapModal(true) },
        ],
      );
    } finally {
      setActiveOriginButton('');
      setIsLoadingLocation(false);
    }
  }, [setFieldValue, selectedLocation]);

  const calculateRouteBetweenPoints = useCallback(
    async (
      origin: { latitude: number; longitude: number },
      destination: { latitude: number; longitude: number },
    ) => {
      try {
        setIsCalculatingRoute(true);
        const route = await calculateRoute(origin, destination);
        setRouteData(route);
        setShowRouteInfo(true);

        if (mapRef.current && route.coordinates.length > 0) {
          mapRef.current.fitToCoordinates(route.coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error('Route calculation error:', error);
        Alert.alert('Error', 'Could not calculate route');
      } finally {
        setIsCalculatingRoute(false);
      }
    },
    [],
  );

  const handleMapLocationSelect = useCallback(
    async (coordinate: LatLng) => {
      try {
        setIsLoadingLocation(true);
        const address = await reverseGeocode(
          coordinate.latitude,
          coordinate.longitude,
        );

        if (address) {
          const newLocation = {
            ...address,
            coordinates: {
              lat: coordinate.latitude,
              lng: coordinate.longitude,
            },
          };
          setSelectedLocation(newLocation);

          if (userLocation) {
            await calculateRouteBetweenPoints(userLocation, coordinate);
          }
        } else {
          Alert.alert(
            'Error',
            'Could not fetch address. Please try another location.',
            [
              { text: 'OK', style: 'cancel' },
              { text: 'Select Manually', onPress: () => setShowMapModal(true) },
            ],
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to get address for selected location');
      } finally {
        setIsLoadingLocation(false);
      }
    },
    [userLocation, calculateRouteBetweenPoints],
  );

  const debouncedHandleMapLocationSelect = useCallback(
    debounce(handleMapLocationSelect, 500),
    [handleMapLocationSelect],
  );

  const handleMapRegionChangeComplete = useCallback(
    async (region: Region) => {
      setMapRegion(region);

      const centerCoord = {
        latitude: region.latitude,
        longitude: region.longitude,
      };

      setCenterPinCoordinate(centerCoord);

      if (isMapDragging) {
        setIsMapDragging(false);
        await debouncedHandleMapLocationSelect(centerCoord);
      }
    },
    [isMapDragging, debouncedHandleMapLocationSelect],
  );

  const handleMapDragStart = useCallback(() => {
    setIsMapDragging(true);
    animatePin(-20);
  }, [animatePin]);

  const handleMapDragEnd = useCallback(() => {
    animatePin(0);
  }, [animatePin]);

  const handleConfirmMapLocation = useCallback(() => {
    if (selectedLocation) {
      setFieldValue('origin', selectedLocation);
      setShowMapModal(false);
      setActiveOriginButton('');
    }
  }, [selectedLocation, setFieldValue]);

  const handleMapRegionChange = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  const handleRecenterMap = useCallback(() => {
    if (userLocation && mapRef.current) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      setCenterPinCoordinate(userLocation);
    }
  }, [userLocation]);

  const handleToggleMapType = useCallback(() => {
    setMapType(current => {
      const newType = current === 'standard' ? 'satellite' : 'standard';
      Toast.show({
        type: 'info',
        text1: `Switched to ${newType} view`,
        visibilityTime: 2000,
      });
      return newType;
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveOriginButton('');
    setShowHistoryModal(false);
    setShowMapModal(false);
    setIsModalOpen(false);
    setRouteData(null);
    setShowRouteInfo(false);
    setCenterPinCoordinate(null);
    setIsMapDragging(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    bottomModalRef.current?.close();
  }, []);

  const handleBottomModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (isModalOpen) {
        bottomModalRef.current?.close();
        setTimeout(() => {
          setIsModalOpen(true);
          bottomModalRef.current?.open();
        }, 100);
      } else {
        setIsModalOpen(true);
        bottomModalRef.current?.open();
      }
    },
    close: handleModalClose,
  }));

  const initializeCenterPin = useCallback(() => {
    if (showMapModal && !centerPinCoordinate) {
      setCenterPinCoordinate({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });

      if (selectedLocation) {
        setCenterPinCoordinate({
          latitude: selectedLocation.coordinates.lat,
          longitude: selectedLocation.coordinates.lng,
        });
      }
    }
  }, [showMapModal, centerPinCoordinate, mapRegion, selectedLocation]);

  const CenterSelectionPin = useMemo(() => {
    if (!centerPinCoordinate) return null;

    return (
      <View style={styles.centerPinContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.centerPin,
            {
              transform: [
                {
                  translateY: pinAnimation.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons name="map-marker" size={40} color="#EF4444" />
          <View style={styles.pinPulse} />
        </Animated.View>
        <View style={styles.centerPinBase} />
      </View>
    );
  }, [centerPinCoordinate, pinAnimation]);

  const actionButtons = useMemo(
    () => [
      {
        key: 'current',
        icon: (
          <Icon
            name="my-location"
            size={18}
            color={
              activeOriginButton === 'current' ? '#fff' : tw.color('blue-600')
            }
          />
        ),
        text: 'Current',
        onPress: handleCurrentLocationPress,
        color:
          activeOriginButton === 'current'
            ? tw.color('blue-600')
            : 'transparent',
        borderColor: 'blue-600',
        loading: isLoadingLocation && activeOriginButton === 'current',
      },
      {
        key: 'map',
        icon: (
          <Entypo
            name="map"
            size={18}
            color={
              activeOriginButton === 'map' ? '#fff' : tw.color('purple-600')
            }
          />
        ),
        text: 'Map',
        onPress: () => {
          setActiveOriginButton('map');
          setShowMapModal(true);
          initializeCenterPin();
        },
        color:
          activeOriginButton === 'map' ? tw.color('purple-600') : 'transparent',
        borderColor: 'purple-600',
      },
      {
        key: 'history',
        icon: (
          <FontAwesome
            name="history"
            size={18}
            color={
              activeOriginButton === 'history' ? '#fff' : tw.color('gray-600')
            }
          />
        ),
        text: 'History',
        onPress: () => {
          setActiveOriginButton('history');
          setShowHistoryModal(true);
        },
        color:
          activeOriginButton === 'history'
            ? tw.color('gray-600')
            : 'transparent',
        borderColor: 'gray-600',
      },
    ],
    [
      activeOriginButton,
      handleCurrentLocationPress,
      isLoadingLocation,
      initializeCenterPin,
    ],
  );

  const MapSelectionModal = useMemo(
    () => (
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowMapModal(false);
          setIsLoadingLocation(false);
          setIsCalculatingRoute(false);
          setActiveOriginButton('');
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
        }}
        onShow={initializeCenterPin}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Select Location on Map</Text>
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              style={styles.mapCloseButton}
              accessibilityLabel="Close map modal"
              accessibilityHint="Closes the map selection modal"
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onRegionChange={handleMapRegionChange}
              onRegionChangeComplete={handleMapRegionChangeComplete}
              onPanDrag={handleMapDragStart}
              onResponderRelease={handleMapDragEnd}
              mapType={mapType}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={true}
              showsTraffic={false}
              zoomControlEnabled={true}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
              liteMode={Platform.OS === 'android' && !showMapModal}
              accessible={true}
              accessibilityLabel="Map for selecting pickup location"
            >
              {routeData && routeData.coordinates.length > 0 && (
                <Polyline
                  coordinates={routeData.coordinates}
                  strokeWidth={4}
                  strokeColor="#3B82F6"
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.coordinates.lat,
                    longitude: selectedLocation.coordinates.lng,
                  }}
                  title="Selected Location"
                  description={selectedLocation.address}
                >
                  <View style={styles.selectedMarker}>
                    <MaterialCommunityIcons
                      name="map-marker-check"
                      size={32}
                      color="#10B981"
                    />
                  </View>
                </Marker>
              )}

              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  pinColor="#3B82F6"
                />
              )}
            </MapView>

            {CenterSelectionPin}

            {(isLoadingLocation || isCalculatingRoute) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>
                  {isLoadingLocation
                    ? 'Fetching location...'
                    : 'Calculating route...'}
                </Text>
              </View>
            )}

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Drag map to move selection pin
              </Text>
            </View>
          </View>

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleRecenterMap}
              accessibilityLabel="Recenter map to your location"
              accessibilityHint="Moves the map view to your current location"
            >
              <Icon name="my-location" size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleToggleMapType}
              accessibilityLabel={`Switch to ${
                mapType === 'standard' ? 'satellite' : 'standard'
              } view`}
              accessibilityHint="Toggles between standard and satellite map views"
            >
              <MaterialCommunityIcons
                name={mapType === 'standard' ? 'satellite-variant' : 'map'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.nudgeControls}>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => {
                if (centerPinCoordinate) {
                  const newCoord = {
                    ...centerPinCoordinate,
                    latitude: centerPinCoordinate.latitude + 0.0001,
                  };
                  setCenterPinCoordinate(newCoord);
                  debouncedHandleMapLocationSelect(newCoord);
                }
              }}
              accessibilityLabel="Move pin up"
              accessibilityHint="Adjusts the pin location slightly upward"
            >
              <Icon name="arrow-upward" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => {
                if (centerPinCoordinate) {
                  const newCoord = {
                    ...centerPinCoordinate,
                    longitude: centerPinCoordinate.longitude - 0.0001,
                  };
                  setCenterPinCoordinate(newCoord);
                  debouncedHandleMapLocationSelect(newCoord);
                }
              }}
              accessibilityLabel="Move pin left"
              accessibilityHint="Adjusts the pin location slightly to the left"
            >
              <Icon name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => {
                if (centerPinCoordinate) {
                  const newCoord = {
                    ...centerPinCoordinate,
                    longitude: centerPinCoordinate.longitude + 0.0001,
                  };
                  setCenterPinCoordinate(newCoord);
                  debouncedHandleMapLocationSelect(newCoord);
                }
              }}
              accessibilityLabel="Move pin right"
              accessibilityHint="Adjusts the pin location slightly to the right"
            >
              <Icon name="arrow-forward" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => {
                if (centerPinCoordinate) {
                  const newCoord = {
                    ...centerPinCoordinate,
                    latitude: centerPinCoordinate.latitude - 0.0001,
                  };
                  setCenterPinCoordinate(newCoord);
                  debouncedHandleMapLocationSelect(newCoord);
                }
              }}
              accessibilityLabel="Move pin down"
              accessibilityHint="Adjusts the pin location slightly downward"
            >
              <Icon name="arrow-downward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {showRouteInfo && routeData && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfo}>
                <View style={styles.routeInfoItem}>
                  <MaterialCommunityIcons
                    name="road-variant"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.routeInfoText}>
                    {routeData.distance} km
                  </Text>
                </View>
                <View style={styles.routeInfoItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.routeInfoText}>
                    {routeData.duration} min
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.mapFooter}>
            <View style={styles.selectedLocationInfo}>
              {selectedLocation ? (
                <>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {selectedLocation.address}
                  </Text>
                  <Text style={styles.locationCoordinates}>
                    {selectedLocation.coordinates.lat.toFixed(6)},{' '}
                    {selectedLocation.coordinates.lng.toFixed(6)}
                  </Text>
                </>
              ) : (
                <Text style={styles.noLocationText}>
                  Drag the map to select a location
                </Text>
              )}
            </View>

            <View style={styles.mapActions}>
              <TouchableOpacity
                style={[styles.mapButton, styles.cancelMapButton]}
                onPress={() => setShowMapModal(false)}
                accessibilityLabel="Cancel map selection"
                accessibilityHint="Closes the map without saving the selected location"
              >
                <Text style={styles.cancelMapButtonText}>Cancel</Text>
              </TouchableOpacity>
              {!isMapDragging && (
                <TouchableOpacity
                  style={[
                    styles.mapButton,
                    styles.confirmMapButton,
                    (!selectedLocation || isCalculatingRoute) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleConfirmMapLocation}
                  disabled={!selectedLocation || isCalculatingRoute}
                  accessibilityLabel="Confirm selected location"
                  accessibilityHint="Saves the currently selected location and closes the map"
                >
                  {isCalculatingRoute ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmMapButtonText}>
                      Select Location
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    ),
    [
      showMapModal,
      mapRegion,
      selectedLocation,
      userLocation,
      mapType,
      routeData,
      showRouteInfo,
      isCalculatingRoute,
      isMapDragging,
      handleMapRegionChange,
      handleMapRegionChangeComplete,
      handleMapDragStart,
      handleMapDragEnd,
      handleRecenterMap,
      handleToggleMapType,
      handleConfirmMapLocation,
      CenterSelectionPin,
      initializeCenterPin,
    ],
  );

  return (
    <BottomModal
      ref={bottomModalRef}
      customHeight="80%"
      backdropOpacity={0.8}
      animationDuration={500}
      swipeThreshold={50}
      onClose={handleBottomModalClose}
      disableSwipe
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Pickup Location</Text>
          </View>
          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeButton}
            accessibilityLabel="Close pickup modal"
            accessibilityHint="Closes the pickup location selection modal"
          >
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={false}
          >
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={tw`w-2 h-6 bg-blue-500 mr-3 rounded-full`} />
                <Text style={styles.sectionTitle}>Pickup For</Text>
              </View>

              <View style={tw`flex-row items-center`}>
                <View style={tw`flex-row items-center mr-6`}>
                  <RadioButton
                    value="self"
                    status={pickupType === 'self' ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setPickupType('self');
                      setFieldValue('ContactPerson', '');
                      setFieldValue('ContactNumber', '');
                    }}
                    color={tw.color('blue-500')}
                  />
                  <Text style={styles.radioLabel}>Self</Text>
                </View>

                <View style={tw`flex-row items-center`}>
                  <RadioButton
                    value="other"
                    status={pickupType === 'other' ? 'checked' : 'unchecked'}
                    onPress={() => setPickupType('other')}
                    color={tw.color('blue-500')}
                  />
                  <Text style={styles.radioLabel}>Other</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={tw`w-2 h-6 bg-blue-500 mr-3 rounded-full`} />
                <Text style={styles.sectionTitle}>Pickup Location</Text>
              </View>

              <SelectList
                data={originPlaces?.suggestions}
                displayKey="value"
                value={values?.origin?.address}
                save="object"
                setSelected={handleOriginSelect}
                placeholder="Search pickup location..."
                search={true}
                onSearchChange={originPlaces.handleInputChange}
                searchValue={originPlaces.inputValue}
                onClear={() => {
                  setFieldValue('origin', {
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
                  });
                }}
                inputStyles={tw`border-gray-200`}
              />

              <View style={styles.actionButtonsContainer}>
                {actionButtons.map(button => (
                  <ActionButton
                    key={button.key}
                    icon={button.icon}
                    text={button.text}
                    onPress={button.onPress}
                    color={button.color || ''}
                    style={[
                      styles.actionButton,
                      tw`border border-${button.borderColor}`,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={tw`w-2 h-6 bg-green-500 mr-3 rounded-full`} />
                <Text style={styles.sectionTitle}>Address Details</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Plot No/ Unit No/ Building / Flat / Company
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter plot/unit number"
                  value={values.Origin_1}
                  onChangeText={text => setFieldValue('Origin_1', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Area/Street/Sector/Village</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter area details"
                  value={values.Origin_2}
                  onChangeText={text => setFieldValue('Origin_2', text)}
                />
              </View>
            </View>

            {isOtherPickupType && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={tw`w-2 h-6 bg-orange-500 mr-3 rounded-full`} />
                  <Text style={styles.sectionTitle}>Contact Details *</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Person *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={values.ContactPerson}
                    onChangeText={text => setFieldValue('ContactPerson', text)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter contact number"
                    value={values.ContactNumber}
                    onChangeText={text => setFieldValue('ContactNumber', text)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, tw`border border-gray-300`]}
              onPress={handleModalClose}
              accessibilityLabel="Cancel pickup selection"
              accessibilityHint="Closes the modal without saving changes"
            >
              <Text style={[styles.cancelButtonText, tw`text-gray-700`]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, tw`bg-blue-600`]}
              onPress={handleConfirm}
              accessibilityLabel="Confirm pickup location"
              accessibilityHint="Saves the selected pickup location and closes the modal"
            >
              <Text style={[styles.confirmButtonText, tw`text-white`]}>
                Confirm Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <LocationHistoryModal
        visible={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setActiveOriginButton('');
        }}
        onSelectLocation={handleHistoryLocationSelect}
        locations={currentData?.Address || []}
      />

      {MapSelectionModal}
    </BottomModal>
  );
});

PickupModal.displayName = 'PickupModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  radioLabel: {
    marginLeft: 8,
    color: '#374151',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#374151',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapCloseButton: {
    padding: 4,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: screenWidth,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  centerPin: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  centerPinBase: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    opacity: 0.2,
    position: 'absolute',
    top: 10,
  },
  pinPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
  },
  instructionsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 999,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapControlButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nudgeControls: {
    position: 'absolute',
    top: 160,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'column',
  },
  nudgeButton: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  mapFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedLocationInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#6b7280',
  },
  noLocationText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelMapButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmMapButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  cancelMapButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmMapButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

export default PickupModal;
