import { ShipmentData } from '@api/api.type';
import {
  useGetCurrentAddressQuery,
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useGetStateQuery,
} from '@api/hooks_api';
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
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
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
import { TextInput } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LocationHistoryModal from './LocationHistoryModal';

export interface DropModalRef {
  open: () => void;
  close: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DropModal = forwardRef<DropModalRef>((props, ref) => {
  const bottomModalRef = useRef<BottomModalRef>(null);
  const mapRef = useRef<MapView>(null);
  const [PincodeData] = useGetPincodeDataMutation();
  const [showMap, setShowMap] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { values, setFieldValue } = useFormikContext<ShipmentData>();
  const [fieldName, setFieldName] = useState<'origin' | 'destination' | ''>('');
  const [activeDestinationButton, setActiveDestinationButton] =
    useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: stateData } = useGetStateQuery();
  const [getDistricts] = useGetDistrictMutation();
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const { currentData } = useGetCurrentAddressQuery<any>();
  const destinationPlaces = useGooglePlacesSelect();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(INDIA_DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Handle destination select
  const handleDestinationSelect = useCallback(
    async (selected: any) => {
      const location = await destinationPlaces.getPlaceDetails(selected.key);
      if (location) {
        setFieldValue('destination', location);
        setMapRegion({
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    },
    [destinationPlaces, setFieldValue],
  );

  // Handle history location select
  const handleHistoryLocationSelect = useCallback(
    (location: any) => {
      setFieldValue('destination', {
        ...values?.destination,
        address: location,
      });
      setShowHistoryModal(false);
      setActiveDestinationButton('');
    },
    [setFieldValue],
  );

  // Handle current location press
  const handleCurrentLocationPress = useCallback(async () => {
    if (isGettingLocation) return;

    try {
      setIsGettingLocation(true);
      setActiveDestinationButton('current');

      const { latitude, longitude } = await getCurrentLocationWithFallback();
      const address = await geocodeCoordinates(latitude, longitude);

      setFieldValue('destination', address);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
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
        Alert.alert(
          'Error',
          'Could not get current location. Please check your location services and try again.',
        );
      }
    } finally {
      setIsGettingLocation(false);
      setActiveDestinationButton('');
    }
  }, [setFieldValue, isGettingLocation]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (!values.destination?.address) {
      Alert.alert('Error', 'Please select a drop-off location');
      return;
    }
    handleModalClose();
  }, [setFieldValue, values.destination]);

  // Handle map confirm
  const handleMapConfirm = useCallback(() => {
    if (selectedLocation) {
      setFieldValue('destination', selectedLocation);
      setShowMap(false);
      setActiveDestinationButton('');
    }
  }, [selectedLocation, setFieldValue]);

  // Handle state selection
  const handleState = useCallback(
    async (value: string) => {
      try {
        const response = await getDistricts({ state: value }).unwrap();
        const DistrictsList = response?.data || [];
        setAvailableDistricts(DistrictsList);
        setFieldValue('state', value);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    },
    [getDistricts, setFieldValue],
  );

  // Handle pincode change
  const handlePinchange = useCallback(
    async (value: string) => {
      setFieldValue('Pincode', value);
      if (value.length === 6) {
        try {
          const response = await PincodeData({ pincode: value }).unwrap();
          const mapped = response?.data;
          if (mapped) {
            setFieldValue('state', mapped?.State);
            setFieldValue('District', mapped?.District);
            const districtResponse = await getDistricts({
              state: mapped?.State,
            }).unwrap();
            setAvailableDistricts(
              districtResponse?.data ? districtResponse?.data : [],
            );
          }
        } catch (error) {
          console.error('Error fetching pincode data:', error);
        }
      }
    },
    [PincodeData, getDistricts, setFieldValue],
  );

  // Handle map location select
  const handleMapLocationSelect = useCallback(async (region: Region) => {
    try {
      setIsGettingLocation(true);
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
      setIsGettingLocation(false);
    }
  }, []);

  // Handle map region change
  const handleMapRegionChange = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  // Handle map press
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

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setActiveDestinationButton('');
    setIsGettingLocation(false);
    setShowMap(false);
    setShowHistoryModal(false);
    setFieldName('');
    setIsModalOpen(false);
    setSelectedLocation(null);
    bottomModalRef.current?.close();
  }, []);

  // Expose methods via ref
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

  // Handle bottom modal onClose callback
  const handleBottomModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Map Modal Component
  const MapSelectionModal = (
    <Modal
      visible={showMap}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Select Drop Location</Text>
          <TouchableOpacity
            onPress={() => {
              setShowMap(false);
              setActiveDestinationButton('');
            }}
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
              onPress={() => {
                setShowMap(false);
                setActiveDestinationButton('');
              }}
            >
              <Text style={styles.cancelMapButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mapButton,
                styles.confirmMapButton,
                !selectedLocation && styles.disabledButton,
              ]}
              onPress={handleMapConfirm}
              disabled={!selectedLocation}
            >
              <Text style={styles.confirmMapButtonText}>Select Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Drop Location Details</Text>
          </View>
          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeButton}
          >
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <ScrollView
            style={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Consignee Details */}
            <View
              style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
            >
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`w-2 h-6 bg-blue-500 mr-3 rounded-full`} />
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Consignee Details
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Consignee Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter consignee name"
                  value={values.ConsigneeName}
                  onChangeText={text => setFieldValue('ConsigneeName', text)}
                />
              </View>
            </View>

            {/* Address Information */}
            <View
              style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
            >
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`w-2 h-6 bg-green-500 mr-3 rounded-full`} />
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Address Information
                </Text>
              </View>

              <View style={tw`gap-3 mb-4`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Pincode"
                    value={values.Pincode}
                    onChangeText={handlePinchange}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>State *</Text>
                  <SelectList
                    data={stateData?.data || []}
                    displayKey="state"
                    save="state"
                    value={values.state}
                    setSelected={handleState}
                    placeholder="Select State"
                    onClear={() => setFieldValue('state', '')}
                    inputStyles={tw`border-gray-200`}
                  />
                </View>
              </View>

              <View style={tw`gap-3 mb-4`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>District / City *</Text>
                  <SelectList
                    data={availableDistricts}
                    displayKey="region"
                    save="region"
                    value={values.District}
                    setSelected={(val: any) => setFieldValue('District', val)}
                    placeholder="Select District"
                    onClear={() => setFieldValue('District', '')}
                    disabled={!values.state}
                    inputStyles={tw`border-gray-200`}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>Taluka</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Taluka"
                    value={values.Taluka}
                    onChangeText={text => setFieldValue('Taluka', text)}
                  />
                </View>
              </View>
            </View>

            {/* Delivery Location */}
            <View
              style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
            >
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`w-2 h-6 bg-red-500 mr-3 rounded-full`} />
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Google Location
                </Text>
              </View>

              <SelectList
                data={destinationPlaces.suggestions}
                displayKey="value"
                value={values.destination?.address}
                save="object"
                setSelected={handleDestinationSelect}
                placeholder="Search delivery location..."
                search={true}
                onSearchChange={destinationPlaces.handleInputChange}
                searchValue={destinationPlaces.inputValue}
                onClear={() => {
                  setFieldValue('destination', {
                    address: '',
                    components: {
                      dist: '',
                      Pincode: '',
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

              <View style={tw`flex-row justify-between mt-4 gap-3`}>
                <ActionButton
                  icon={
                    <Icon
                      name="my-location"
                      size={18}
                      color={
                        activeDestinationButton === 'current'
                          ? '#fff'
                          : tw.color('blue-600')
                      }
                    />
                  }
                  text={isGettingLocation ? 'Locating...' : 'Current'}
                  onPress={handleCurrentLocationPress}
                  color={
                    activeDestinationButton === 'current'
                      ? tw.color('blue-600') || ''
                      : 'transparent'
                  }
                  style={tw`border border-blue-600 ${
                    isGettingLocation ? 'opacity-70' : ''
                  }`}
                />
                <ActionButton
                  icon={
                    <Entypo
                      name="map"
                      size={18}
                      color={
                        activeDestinationButton === 'map'
                          ? '#fff'
                          : tw.color('purple-600')
                      }
                    />
                  }
                  text="Map"
                  onPress={() => {
                    setFieldName('destination');
                    setActiveDestinationButton('map');
                    setShowMap(true);
                  }}
                  color={
                    activeDestinationButton === 'map'
                      ? tw.color('purple-600') || ''
                      : 'transparent'
                  }
                  style={tw`border border-purple-600 `}
                />
                <ActionButton
                  icon={
                    <FontAwesome
                      name="history"
                      size={18}
                      color={
                        activeDestinationButton === 'history'
                          ? '#fff'
                          : tw.color('gray-600')
                      }
                    />
                  }
                  text="History"
                  onPress={() => {
                    setActiveDestinationButton('history');
                    setShowHistoryModal(true);
                  }}
                  color={
                    activeDestinationButton === 'history'
                      ? tw.color('gray-600') || ''
                      : 'transparent'
                  }
                  style={tw`border border-gray-600`}
                />
              </View>
            </View>

            {/* Address Details */}
            <View
              style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
            >
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`w-2 h-6 bg-orange-500 mr-3 rounded-full`} />
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Address Details
                </Text>
              </View>

              <View style={tw`gap-3 mb-4`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>
                    Plot No/ Unit No/ Building / Flat / Company
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter plot/unit number"
                    value={values.Destination_1}
                    onChangeText={text => setFieldValue('Destination_1', text)}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={styles.label}>Area/Street/Sector/Village</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter area details"
                    value={values.Destination_2}
                    onChangeText={text => setFieldValue('Destination_2', text)}
                  />
                </View>
              </View>
            </View>
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
                Confirm Drop
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Map Modal */}
      {MapSelectionModal}

      {/* History Modal */}
      <LocationHistoryModal
        visible={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setActiveDestinationButton('');
        }}
        onSelectLocation={handleHistoryLocationSelect}
        locations={currentData?.Address || []}
      />
    </BottomModal>
  );
});

DropModal.displayName = 'DropModal';

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
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalBody: {
    flex: 1,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
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

export default DropModal;
