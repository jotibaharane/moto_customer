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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RadioButton, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ShipmentData } from '@api/api.type';
import { useGetCurrentAddressQuery } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import ActionButton from '@components/common/ActionButton';
import { SelectList } from '@components/common/Select';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';

import LocationHistoryModal from './LocationHistoryModal';
import PickupModaldebug from './Pickupdebug';
import { useCustomerhistoryQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';

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
  const GoogleAddress = useSelector(
    (state: RootState) => state.auth?.RegisteredAddress,
  );
  const currentlocation = useSelector((state: RootState) => state?.map?.origin);

  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );

  // hook that provides getCurrentLocation (your implementation)
  const {
    getCurrentLocation,
    selectedLocation,
    handleInputChange,
    suggestions,
  } = useGooglePlacesSelect();

  const bottomModalRef = useRef<BottomModalRef>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeOriginButton, setActiveOriginButton] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // generic map loading if needed
  const [userLocation, setUserLocation] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);

  const { data, isLoading, error } = useCustomerhistoryQuery({
    CustomerID: CustomerID,
  });

  console.log(data);

  const scrollViewRef = useRef<ScrollView>(null);

  const { values, setFieldValue } = useFormikContext<ShipmentData>();
  const { currentData } = useGetCurrentAddressQuery<any>();
  const originPlaces = useGooglePlacesSelect();

  const isOtherPickupType = useMemo(
    () => values.PickupType === 'other',
    [values.PickupType],
  );
  const isRegisteredPickupType = useMemo(
    () => values.PickupType === 'Registered',
    [values.PickupType],
  );
  const isselfPickupType = useMemo(
    () => values.PickupType === 'self',
    [values.PickupType],
  );

  // show manual fields for self and other
  const showManualAddressFields = useMemo(
    () => values.PickupType === 'self' || values.PickupType === 'other',
    [values.PickupType],
  );

  const handleConfirm = useCallback(() => {
    const errors: any = {};

    if (!values.origin?.address) {
      errors.origin = 'Please select a pickup location';
    }

    if (isOtherPickupType) {
      if (!values.ContactPerson?.trim()) {
        errors.ContactPerson = 'Please enter contact person name';
      }
      if (!values.ContactNumber?.trim()) {
        errors.ContactNumber = 'Please enter contact number';
      } else if (values.ContactNumber.length !== 10) {
        errors.ContactNumber = 'Please enter a valid 10-digit number';
      }
    }

    // Address validation for manual fields when visible
    if (!values.Origin_1?.trim()) {
      errors.Origin_1 = 'Please enter plot/unit/building details';
    }
    if (!values.Origin_2?.trim()) {
      errors.Origin_2 = 'Please enter area/street details';
    }

    // If errors exist, store them and stop submission
    // if (Object.keys(errors).length > 0) {
    //   setFieldErrors(errors);
    //   return;
    // }

    // No errors → proceed
    setFieldErrors({});
    handleModalClose();
  }, [values, isOtherPickupType]);

  const handleLocationSelected = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      const selectedLocation = {
        address: location.address,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
        },
        components: {
          dist: '',
          pincode: '',
          place: '',
          state: '',
          tal: '',
        },
      };

      setFieldValue('origin', selectedLocation);
      setShowMapModal(false);
      setActiveOriginButton('');

      Toast.show({
        type: 'success',
        text1: 'Location selected',
        text2: 'Pickup location has been set',
      });
    },
    [setFieldValue],
  );

  const handleOriginSelect = useCallback(
    async (selected: LocationSuggestion) => {
      try {
        const location = await originPlaces.getPlaceDetails(selected.key);
        if (location) {
          setFieldValue('origin', location);
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces, setFieldValue],
  );

  const handleHistoryLocationSelect = useCallback(
    item => {
      setFieldValue('PickupType', 'other');

      setFieldValue('origin', {
        address: item?.Origin || '',
        coordinates: {},
        components: {},
      });

      setFieldValue('Origin_1', item.Origin_1);
      setFieldValue('Origin_2', item.Origin_2);
      setFieldValue('State', item.State);
      setFieldValue('ContactPerson', item.ContactPerson);
      setFieldValue('ContactNumber', item.ContactNumber);

      setShowHistoryModal(false);
    },
    [setFieldValue],
  );

  const handleModalClose = useCallback(() => {
    setActiveOriginButton('');
    setShowHistoryModal(false);
    setShowMapModal(false);
    setIsModalOpen(false);
    bottomModalRef.current?.close();
  }, []);

  // fetch once and memoize

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
    ],
    [activeOriginButton, isLoadingLocation],
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
          setActiveOriginButton('');
        }}
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

          <PickupModaldebug
            onLocationSelected={handleLocationSelected}
            initialRegion={
              userLocation
                ? {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }
                : undefined
            }
          />
        </View>
      </Modal>
    ),
    [showMapModal, handleLocationSelected, userLocation],
  );

  return (
    <BottomModal
      ref={bottomModalRef}
      customHeight="85%"
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

        <View style={styles.sectionContainer}>
          {/* Pickup Type Section */}
          <View style={tw`flex-row items-center`}>
            {/* Registered */}
            <View style={tw`flex-row items-center mr-4`}>
              <RadioButton
                value="Registered"
                status={
                  values.PickupType == 'Registered' ? 'checked' : 'unchecked'
                }
                onPress={() => {
                  setFieldValue('PickupType', 'Registered');

                  if (GoogleAddress) {
                    setFieldValue('origin', {
                      address: GoogleAddress?.fullAddress || '',
                      coordinates: {
                        lat: GoogleAddress?.latitude || 0,
                        lng: GoogleAddress?.longitude || 0,
                      },
                      components: GoogleAddress?.addressComponents || {},
                    });
                  }

                  // Clear manual fields
                  setFieldValue('Origin_1', '');
                  setFieldValue('Origin_2', '');
                }}
                color={tw.color('blue-500')}
              />
              <Text style={styles.radioLabel}>Registered</Text>
            </View>

            {/* Current / Self */}
            <View style={tw`flex-row items-center mr-6`}>
              <RadioButton
                value="self"
                status={values.PickupType === 'self' ? 'checked' : 'unchecked'}
                onPress={() => {
                  setFieldValue('PickupType', 'self');

                  // Clear unwanted fields
                  setFieldValue('ContactPerson', '');
                  setFieldValue('ContactNumber', '');
                  setFieldValue('Origin_1', '');
                  setFieldValue('Origin_2', '');

                  // 👉 Set current location from Redux (NOT GPS)
                  if (currentlocation) {
                    setFieldValue('origin', {
                      address: currentlocation?.address,
                      coordinates: {
                        lat: currentlocation?.latitude,
                        lng: currentlocation?.longitude,
                      },
                      components: currentlocation?.components ?? {}, // optional
                    });
                  }
                }}
                color={tw.color('blue-500')}
              />

              <Text style={styles.radioLabel}>Current</Text>
            </View>

            {/* Other */}
            <View style={tw`flex-row items-center`}>
              <RadioButton
                value="other"
                status={values.PickupType == 'other' ? 'checked' : 'unchecked'}
                onPress={() => {
                  setFieldValue('PickupType', 'other');

                  // Clear previous origin data (keep as empty object shape)
                  setFieldValue('origin', {
                    address: '',
                    coordinates: { lat: 0, lng: 0 },
                    components: {},
                  });

                  // keep Origin_1/Origin_2 visible for manual typing
                }}
                color={tw.color('blue-500')}
              />
              <Text style={styles.radioLabel}>Other</Text>

              {values.PickupType == 'other' && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveOriginButton('history');
                    setShowHistoryModal(true);
                  }}
                  style={tw`ml-3 flex-row items-center bg-gray-100 px-3 py-1 rounded-full border border-gray-300`}
                >
                  <FontAwesome
                    name="history"
                    size={16}
                    color={tw.color('gray-700')}
                  />
                  <Text style={tw`ml-1 text-gray-700 text-sm font-medium`}>
                    History
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          {/* Registered -> show registered pickup address (editable) */}
          {isRegisteredPickupType && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registered Pickup Address *</Text>

              <TextInput
                style={[
                  styles.input,
                  fieldErrors.origin && { borderColor: 'red', borderWidth: 1 },
                ]}
                placeholder="Enter registered pickup address"
                value={values?.origin?.address || ''}
                textTransform="capitalize"
                onChangeText={text => {
                  setFieldValue('origin', {
                    ...values.origin,
                    address: text,
                  });

                  if (fieldErrors.origin) {
                    setFieldErrors(prev => ({ ...prev, origin: '' }));
                  }
                }}
              />

              {fieldErrors.origin && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.origin}
                </Text>
              )}
            </View>
          )}

          {/* Self -> show read-only current address + manual Origin_1/Origin_2 */}
          {isselfPickupType && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Location (fetched)</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Current location"
                value={values?.origin?.address || ''}
                editable={false}
              />

              {/* Manual fields visible for self */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                Plot / Unit / Building *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.Origin_1 && {
                    borderColor: 'red',
                    borderWidth: 1,
                  },
                ]}
                placeholder="Enter plot/unit number"
                value={values.Origin_1}
                onChangeText={text => setFieldValue('Origin_1', text)}
              />

              <Text style={styles.label}>Area / Street / Sector *</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.Origin_2 && {
                    borderColor: 'red',
                    borderWidth: 1,
                  },
                ]}
                placeholder="Enter area details"
                value={values.Origin_2}
                onChangeText={text => setFieldValue('Origin_2', text)}
              />
            </View>
          )}

          {/* Other -> contact + manual fields + google search */}
          {isOtherPickupType && (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Person *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.ContactPerson && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact person name"
                  value={values.ContactPerson}
                  textTransform="capitalize"
                  onChangeText={text => {
                    setFieldValue('ContactPerson', text);
                    if (fieldErrors.ContactPerson) {
                      setFieldErrors(prev => ({ ...prev, ContactPerson: '' }));
                    }
                  }}
                />
                {fieldErrors.ContactPerson && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.ContactPerson}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.ContactNumber && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact number"
                  value={values.ContactNumber}
                  maxLength={10}
                  onChangeText={text => {
                    setFieldValue('ContactNumber', text);
                    if (fieldErrors.ContactNumber) {
                      setFieldErrors(prev => ({ ...prev, ContactNumber: '' }));
                    }
                  }}
                  keyboardType="phone-pad"
                />
                {fieldErrors.ContactNumber && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.ContactNumber}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Plot / Unit / Building *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.Origin_1 && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter plot/unit number"
                  value={values.Origin_1}
                  onChangeText={text => setFieldValue('Origin_1', text)}
                />

                <Text style={styles.label}>Area / Street / Sector *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.Origin_2 && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter area details"
                  value={values.Origin_2}
                  onChangeText={text => setFieldValue('Origin_2', text)}
                />
              </View>

              {/* Google Search */}
              <SelectList
                data={originPlaces?.suggestions}
                displayKey="value"
                value={originPlaces.inputValue || values?.origin?.address || ''}
                save="object"
                setSelected={handleOriginSelect}
                placeholder="Search pickup location..."
                search={true}
                onSearchChange={originPlaces.handleInputChange}
                searchValue={originPlaces.inputValue}
                inputStyles={[
                  tw`border-gray-200`,
                  fieldErrors.origin && { borderColor: 'red', borderWidth: 1 },
                ]}
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
                      { borderColor: button.borderColor },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

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
      </View>

      <LocationHistoryModal
        visible={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setActiveOriginButton('');
        }}
        onSelectLocation={handleHistoryLocationSelect}
        locations={currentData?.Address || []}
        type="origin"
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
    marginTop: 5,
    marginBottom: 0,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  radioLabel: {
    marginLeft: 8,
    color: '#374151',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,
  },
  actionButton: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#374151',
    fontSize: 14,
  },
  input: {
    height: 45,
    color: 'black',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
    paddingHorizontal: 10,
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
});

export default PickupModal;