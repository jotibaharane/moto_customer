import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { RadioButton, TextInput } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ShipmentData } from '@api/api.type';
import { useGetCurrentAddressQuery } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import ActionButton from '@components/common/ActionButton';
import { SelectList } from '@components/common/Select';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';
import {
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
  const scrollViewRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);

  const { values, setFieldValue } = useFormikContext<ShipmentData>();
  const { currentData } = useGetCurrentAddressQuery<any>();
  const originPlaces = useGooglePlacesSelect();

  const isOtherPickupType = useMemo(() => pickupType === 'other', [pickupType]);

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
          // Center map on selected location
          setMapRegion({
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
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
    [setFieldValue],
  );

  const handleCurrentLocationPress = useCallback(async () => {
    try {
      setActiveOriginButton('current');
      setIsLoadingLocation(true);

      const { latitude, longitude } = await getCurrentLocationWithFallback();
      const address = await geocodeCoordinates(latitude, longitude);

      if (address) {
        setFieldValue('origin', address);
        // Update map region to current location
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error: any) {
      console.error('Location error:', error);

      if (
        error.message.includes('permission') ||
        error.message.includes('disabled')
      ) {
        Alert.alert('Location Required', error.message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openLocationSettings },
        ]);
      } else {
        Alert.alert('Location Error', error.message);
      }
    } finally {
      setActiveOriginButton('');
      setIsLoadingLocation(false);
    }
  }, [setFieldValue]);

  const handleMapLocationSelect = useCallback(async (region: Region) => {
    try {
      setIsLoadingLocation(true);
      const address = await reverseGeocode(region.latitude, region.longitude);

      if (address) {
        setSelectedLocation({
          ...address,
          coordinates: {
            lat: region.latitude,
            lng: region.longitude,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get address for selected location');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

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

  const handleMapPress = useCallback(
    (event: any) => {
      const { coordinate } = event.nativeEvent;
      handleMapLocationSelect({
        ...coordinate,
        latitudeDelta: mapRegion.latitudeDelta,
        longitudeDelta: mapRegion.longitudeDelta,
      });
    },
    [mapRegion, handleMapLocationSelect],
  );

  const handleModalClose = useCallback(() => {
    setActiveOriginButton('');
    setShowHistoryModal(false);
    setShowMapModal(false);
    setIsModalOpen(false);
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
    [activeOriginButton, handleCurrentLocationPress, isLoadingLocation],
  );

  // Map Modal Component
  const MapSelectionModal = useMemo(
    () => (
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Select Location on Map</Text>
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              style={styles.mapCloseButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            onRegionChangeComplete={handleMapRegionChange}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.coordinates.lat,
                  longitude: selectedLocation.coordinates.lng,
                }}
                title="Selected Location"
                description={selectedLocation.address}
              />
            )}
          </MapView>

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
                  Tap on the map to select a location
                </Text>
              )}
            </View>

            <View style={styles.mapActions}>
              <TouchableOpacity
                style={[styles.mapButton, styles.cancelMapButton]}
                onPress={() => setShowMapModal(false)}
              >
                <Text style={styles.cancelMapButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mapButton,
                  styles.confirmMapButton,
                  !selectedLocation && styles.disabledButton,
                ]}
                onPress={handleConfirmMapLocation}
                disabled={!selectedLocation}
              >
                <Text style={styles.confirmMapButtonText}>Select Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [
      showMapModal,
      mapRegion,
      selectedLocation,
      handleMapRegionChange,
      handleMapPress,
      handleConfirmMapLocation,
    ],
  );
  console.log({ currentData });
  return (
    <BottomModal
      ref={bottomModalRef}
      customHeight="80%"
      backdropOpacity={0.8}
      animationDuration={400}
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
            {/* Pickup Type Selection */}
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

            {/* Location Selection */}
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
                    loading={button.loading}
                  />
                ))}
              </View>
            </View>

            {/* Address Details */}
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

            {/* Contact Details */}
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
            >
              <Text style={[styles.cancelButtonText, tw`text-gray-700`]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, tw`bg-blue-600`]}
              onPress={handleConfirm}
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
  // Map Modal Styles
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
  map: {
    flex: 1,
    width: screenWidth,
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
});

export default PickupModal;
