import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import { RadioButton, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

interface LocalPickupData {
  pickupType: 'Registered' | 'self' | 'other';
  origin: any;
  contactName: string;
  contactNumber: string;
  plotOrBuilding: string;
  streetArea: string;
  state: string;
  district: string;
  taluka: string;
  pincode: string;
  companyName: string;
  addressType: 'Office' | 'Factory' | 'Warehouse' | 'Personal' | 'Other' | null;
}

const ADDRESS_TYPES = [
  { label: 'Office', value: 'Office' },
  { label: 'Factory', value: 'Factory' },
  { label: 'Warehouse', value: 'Warehouse' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Other', value: 'Other' },
];

const PickupModal = forwardRef<PickupModalRef>((props, ref) => {
  const GoogleAddress = useSelector(
    (state: RootState) => state.auth?.RegisteredAddress,
  );
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const CustomerDetail = useSelector(
    (state: RootState) => state?.auth?.customerDetails,
  );
  const currentlocation = useSelector(
    (state: RootState) => state?.map?.currentlocation,
  );

  console.log('current location', { currentlocation });
  const {
    getCurrentLocation,
    selectedLocation,
    handleInputChange,
    suggestions,
  } = useGooglePlacesSelect();

  const bottomModalRef = useRef<BottomModalRef>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [activeOriginButton, setActiveOriginButton] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const { data: stateData } = useGetStateQuery();
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [PincodeData] = useGetPincodeDataMutation();
  const [getDistricts] = useGetDistrictMutation();
  const { data, isLoading, error } = useCustomerhistoryQuery({
    CustomerID: CustomerID,
  });
  const [pincodeCoords, setPincodeCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<ShipmentData>();
  const { currentData } = useGetCurrentAddressQuery<any>();
  const originPlaces = useGooglePlacesSelect();

  // Local state for form values
  const [localValues, setLocalValues] = useState<LocalPickupData>({
    pickupType: 'self',
    origin: null,
    contactName: '',
    contactNumber: '',
    plotOrBuilding: '',
    streetArea: '',
    state: '',
    district: '',
    taluka: '',
    pincode: '',
    companyName: '',
    addressType: null,
  });

  // Initialize local values when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setLocalValues({
        pickupType: values.pickup.pickupType || 'self',
        origin: values.pickup.origin || null,
        contactName: values.pickup.contactName || '',
        contactNumber: values.pickup.contactNumber || '',
        plotOrBuilding: values.pickup.plotOrBuilding || '',
        streetArea: values.pickup.streetArea || '',
        state: values.pickup.state || '',
        district: values.pickup.district || '',
        taluka: values.pickup.taluka || '',
        pincode: values.pickup.pincode || '',
        companyName: values.pickup.companyName || '',
        addressType: values.pickup.addressType || null,
      });
    }
  }, [isModalOpen, values]);

  const isOtherPickupType = useMemo(
    () => localValues.pickupType === 'other',
    [localValues.pickupType],
  );
  const isRegisteredPickupType = useMemo(
    () => localValues.pickupType === 'Registered',
    [localValues.pickupType],
  );
  const isselfPickupType = useMemo(
    () => localValues.pickupType === 'self',
    [localValues.pickupType],
  );

  const handleState = useCallback(
    async (value: string) => {
      try {
        const response = await getDistricts({ state: value }).unwrap();
        const DistrictsList = response?.data || [];
        setAvailableDistricts(DistrictsList);
        setLocalValues(prev => ({ ...prev, state: value, district: '' }));
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    },
    [getDistricts],
  );

  const handlePinchange = useCallback(
    async (value: string) => {
      setLocalValues(prev => ({ ...prev, pincode: value }));
      if (value.length === 6) {
        try {
          const response = await PincodeData({ pincode: value }).unwrap();
          const mapped = response?.data;
          if (mapped) {
            setLocalValues(prev => ({
              ...prev,
              state: mapped?.State || '',
              district: mapped?.District || '',
            }));

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
    [PincodeData, getDistricts],
  );

  const handleConfirm = useCallback(() => {
    const errors: any = {};

    if (!localValues.origin?.address) {
      errors.origin = 'Please select a pickup location';
    }

    if (isOtherPickupType) {
      if (!localValues.contactName?.trim()) {
        errors.contactName = 'Please enter contact person name';
      }
      if (!localValues.contactNumber?.trim()) {
        errors.contactNumber = 'Please enter contact number';
      } else if (localValues.contactNumber.length !== 10) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
      }
      if (!localValues.addressType) {
        errors.addressType = 'Please select address type';
      }
    }

    if (localValues.pickupType !== 'Registered') {
      if (!localValues.plotOrBuilding?.trim()) {
        errors.plotOrBuilding = 'Please enter plot/unit/building details';
      }
      if (!localValues.streetArea?.trim()) {
        errors.streetArea = 'Please enter area/street details';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // ✅ Set all values to Formik at once
    setFieldValue('pickup.pickupType', localValues.pickupType);
    setFieldValue('pickup.origin', localValues.origin);
    setFieldValue('pickup.contactName', localValues.contactName);
    setFieldValue('pickup.contactNumber', localValues.contactNumber);
    setFieldValue('pickup.plotOrBuilding', localValues.plotOrBuilding);
    setFieldValue('pickup.streetArea', localValues.streetArea);
    setFieldValue('pickup.state', localValues.state);
    setFieldValue('pickup.district', localValues.district);
    setFieldValue('pickup.taluka', localValues.taluka);
    setFieldValue('pickup.pincode', localValues.pincode);
    setFieldValue('pickup.companyName', localValues.companyName);
    setFieldValue('pickup.addressType', localValues.addressType);

    setFieldErrors({});
    handleModalClose();
  }, [localValues, isOtherPickupType, setFieldValue, handleModalClose]);

  const handleLocationSelected = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      console.log('Selected Location:', location);

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
      console.log(selectedLocation);
      setLocalValues(prev => ({ ...prev, origin: selectedLocation }));
      setShowMapModal(false);
      setActiveOriginButton('');

      Toast.show({
        type: 'success',
        text1: 'Location selected',
        text2: 'Pickup location has been set',
      });
    },
    [],
  );

  const handleOriginSelect = useCallback(
    async (selected: LocationSuggestion) => {
      try {
        const location = await originPlaces.getPlaceDetails(selected.key);
        if (location) {
          setLocalValues(prev => ({ ...prev, origin: location }));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces],
  );

  // Handle pickup type changes
  useEffect(() => {
    if (localValues.pickupType === 'Registered' && GoogleAddress) {
      setLocalValues(prev => ({
        ...prev,
        origin: {
          address: GoogleAddress.fullAddress,
          coordinates: {
            lat: GoogleAddress.latitude,
            lng: GoogleAddress.longitude,
          },
          components: GoogleAddress.addressComponents,
        },
        contactName: CustomerDetail?.CompanyName || '',
        contactNumber: CustomerDetail?.ContactNo || '',
        plotOrBuilding: '',
        streetArea: '',
        addressType: null,
      }));
    } else if (localValues.pickupType === 'self' && currentlocation) {
      setLocalValues(prev => ({
        ...prev,
        origin: {
          address: currentlocation?.address,
          coordinates: {
            lat: currentlocation?.latitude,
            lng: currentlocation?.longitude,
          },
          components: currentlocation?.components ?? {},
        },
        contactName: CustomerDetail?.CompanyName || '',
        contactNumber: CustomerDetail?.ContactNo || '',
        addressType: null,
      }));
    } else if (localValues.pickupType === 'other') {
      // Clear fields for other type
      setLocalValues(prev => ({
        ...prev,
        origin: null,
        contactName: '',
        contactNumber: '',
        plotOrBuilding: '',
        streetArea: '',
        addressType: null,
      }));
      // Show address type modal for other pickup type
      setShowAddressTypeModal(true);
    }
  }, [localValues.pickupType, GoogleAddress, CustomerDetail, currentlocation]);

  const handleHistoryLocationSelect = useCallback(item => {
    setLocalValues(prev => ({
      ...prev,
      pickupType: 'other',
      origin: {
        address: item?.Origin,
        coordinates: {},
        components: {},
      },
      plotOrBuilding: item.plotOrBuilding,
      streetArea: item.streetArea,
      state: item.State,
      contactName: item.contactName,
      contactNumber: item.contactNumber,
      addressType: item.addressType || null,
    }));

    setShowHistoryModal(false);
  }, []);

  const handleAddressTypeSelect = useCallback(
    (type: LocalPickupData['addressType']) => {
      setLocalValues(prev => ({ ...prev, addressType: type }));
      setShowAddressTypeModal(false);

      // Auto-fill company name based on address type
      if (type === 'Personal') {
        setLocalValues(prev => ({
          ...prev,
          companyName: '',
          contactName: CustomerDetail?.FullName || '',
          contactNumber: CustomerDetail?.ContactNo || '',
        }));
      } else if (
        type === 'Office' ||
        type === 'Factory' ||
        type === 'Warehouse'
      ) {
        setLocalValues(prev => ({
          ...prev,
          companyName: CustomerDetail?.CompanyName || '',
          contactName: CustomerDetail?.FullName || '',
          contactNumber: CustomerDetail?.ContactNo || '',
        }));
      }
    },
    [CustomerDetail],
  );

  const handleModalClose = useCallback(() => {
    setActiveOriginButton('');
    setShowHistoryModal(false);
    setShowMapModal(false);
    setShowAddressTypeModal(false);
    setIsModalOpen(false);
    bottomModalRef.current?.close();
  }, []);

  const handleBottomModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsModalOpen(true);
      bottomModalRef.current?.open();
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
    [activeOriginButton],
  );

  const AddressTypeModal = useMemo(
    () => (
      <Modal
        visible={showAddressTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddressTypeModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.addressTypeModal}>
            <View style={styles.addressTypeHeader}>
              <Text style={styles.addressTypeTitle}>Select Address Type</Text>
              <TouchableOpacity
                onPress={() => setShowAddressTypeModal(false)}
                style={styles.addressTypeCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.addressTypeSubtitle}>
              Please select the type of address for pickup location
            </Text>

            <View style={styles.addressTypeList}>
              {ADDRESS_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.addressTypeButton,
                    localValues.addressType === type.value &&
                      styles.addressTypeButtonSelected,
                  ]}
                  onPress={() =>
                    handleAddressTypeSelect(
                      type.value as LocalPickupData['addressType'],
                    )
                  }
                >
                  <Text
                    style={[
                      styles.addressTypeText,
                      localValues.addressType === type.value &&
                        styles.addressTypeTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {fieldErrors.addressType && (
              <Text style={styles.errorText}>{fieldErrors.addressType}</Text>
            )}

            <TouchableOpacity
              style={styles.addressTypeConfirmButton}
              onPress={() => {
                if (localValues.addressType) {
                  setShowAddressTypeModal(false);
                } else {
                  setFieldErrors(prev => ({
                    ...prev,
                    addressType: 'Please select address type',
                  }));
                }
              }}
            >
              <Text style={styles.addressTypeConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    ),
    [
      showAddressTypeModal,
      localValues.addressType,
      fieldErrors.addressType,
      handleAddressTypeSelect,
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
            initialRegion={undefined}
          />
        </View>
      </Modal>
    ),
    [showMapModal, handleLocationSelected],
  );

  return (
    <>
      <BottomModal
        ref={bottomModalRef}
        customHeight="85%"
        backdropOpacity={0.8}
        animationDuration={500}
        swipeThreshold={50}
        onClose={handleBottomModalClose}
        disableSwipe
      >
        <ScrollView style={styles.container}>
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
            <View style={tw`flex-row items-center flex-wrap`}>
              {/* Registered Option */}
              <View style={tw`flex-row items-center mr-4`}>
                <RadioButton
                  value="Registered"
                  status={
                    localValues.pickupType == 'Registered'
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    setLocalValues(prev => ({
                      ...prev,
                      pickupType: 'Registered',
                    }));
                  }}
                  color={tw.color('blue-500')}
                />
                <Text style={styles.radioLabel}>Registered</Text>
              </View>

              {/* Current Option */}
              <View style={tw`flex-row items-center mr-4`}>
                <RadioButton
                  value="self"
                  status={
                    localValues.pickupType === 'self' ? 'checked' : 'unchecked'
                  }
                  onPress={() => {
                    setLocalValues(prev => ({ ...prev, pickupType: 'self' }));
                  }}
                  color={tw.color('blue-500')}
                />
                <Text style={styles.radioLabel}>Current</Text>
              </View>

              {/* Other Option + History */}
              <View style={tw`flex-row items-center`}>
                <RadioButton
                  value="other"
                  status={
                    localValues.pickupType == 'other' ? 'checked' : 'unchecked'
                  }
                  onPress={() => {
                    setLocalValues(prev => ({ ...prev, pickupType: 'other' }));
                  }}
                  color={tw.color('blue-500')}
                />
                <Text style={styles.radioLabel}>Other</Text>

                {localValues.pickupType == 'other' && (
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
            {isRegisteredPickupType && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.contactName && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact person name"
                  value={localValues.contactName}
                  textTransform="capitalize"
                  onChangeText={text => {
                    setLocalValues(prev => ({ ...prev, contactName: text }));
                    if (fieldErrors.contactName) {
                      setFieldErrors(prev => ({
                        ...prev,
                        contactName: '',
                      }));
                    }
                  }}
                />
                {fieldErrors.contactName && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.contactName}
                  </Text>
                )}
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.contactNumber && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact number"
                  value={localValues.contactNumber}
                  maxLength={10}
                  onChangeText={text => {
                    setLocalValues(prev => ({ ...prev, contactNumber: text }));
                    if (fieldErrors.contactNumber) {
                      setFieldErrors(prev => ({
                        ...prev,
                        contactNumber: '',
                      }));
                    }
                  }}
                  keyboardType="phone-pad"
                />
                {fieldErrors.contactNumber && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.contactNumber}
                  </Text>
                )}
                <Text style={styles.label}>Registered Pickup Address *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.origin && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter registered pickup address"
                  value={localValues?.origin?.address || ''}
                  textTransform="capitalize"
                  onChangeText={text => {
                    setLocalValues(prev => ({
                      ...prev,
                      origin: {
                        ...prev.origin,
                        address: text,
                      },
                    }));

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

            {isOtherPickupType && (
              <View style={styles.sectionContainer}>
                {/* Show selected address type */}
                {localValues.addressType && (
                  <View style={styles.addressTypeBadge}>
                    <Text style={styles.addressTypeBadgeText}>
                      {localValues.addressType}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddressTypeModal(true)}
                      style={styles.addressTypeEditButton}
                    >
                      <Icon name="edit" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.contactName && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="Enter contact person name"
                    value={localValues.contactName}
                    textTransform="capitalize"
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({
                          ...prev,
                          contactName: '',
                        }));
                      }
                    }}
                  />
                  {fieldErrors.contactName && (
                    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.contactName}
                    </Text>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company / Warehouse Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.companyName && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="Enter Company / Warehouse Name"
                    value={localValues.companyName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, companyName: text }));
                      if (fieldErrors.companyName) {
                        setFieldErrors(prev => ({
                          ...prev,
                          companyName: '',
                        }));
                      }
                    }}
                  />
                  {fieldErrors.companyName && (
                    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.companyName}
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.contactNumber && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="Enter contact number"
                    value={localValues.contactNumber}
                    maxLength={10}
                    onChangeText={text => {
                      setLocalValues(prev => ({
                        ...prev,
                        contactNumber: text,
                      }));
                      if (fieldErrors.contactNumber) {
                        setFieldErrors(prev => ({
                          ...prev,
                          contactNumber: '',
                        }));
                      }
                    }}
                    keyboardType="phone-pad"
                  />
                  {fieldErrors.contactNumber && (
                    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.contactNumber}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {isselfPickupType && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Location (fetched)</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="Current location"
                  value={localValues?.origin?.address || ''}
                  editable={false}
                />
                <Text style={styles.label}>Contact Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.contactName && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact person name"
                  value={localValues.contactName}
                  textTransform="capitalize"
                  onChangeText={text => {
                    setLocalValues(prev => ({ ...prev, contactName: text }));
                    if (fieldErrors.contactName) {
                      setFieldErrors(prev => ({
                        ...prev,
                        contactName: '',
                      }));
                    }
                  }}
                />
                {fieldErrors.contactName && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.contactName}
                  </Text>
                )}
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.contactNumber && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter contact number"
                  value={localValues.contactNumber}
                  maxLength={10}
                  onChangeText={text => {
                    setLocalValues(prev => ({ ...prev, contactNumber: text }));
                    if (fieldErrors.contactNumber) {
                      setFieldErrors(prev => ({
                        ...prev,
                        contactNumber: '',
                      }));
                    }
                  }}
                  keyboardType="phone-pad"
                />
                {fieldErrors.contactNumber && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {fieldErrors.contactNumber}
                  </Text>
                )}
                <Text style={[styles.label, { marginTop: 10 }]}>
                  Plot / Unit / Building *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.plotOrBuilding && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter plot/unit number"
                  value={localValues.plotOrBuilding}
                  onChangeText={text =>
                    setLocalValues(prev => ({ ...prev, plotOrBuilding: text }))
                  }
                />

                <Text style={styles.label}>
                  Street / Area /Sector / Village *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.streetArea && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Enter area details"
                  value={localValues.streetArea}
                  onChangeText={text =>
                    setLocalValues(prev => ({ ...prev, streetArea: text }))
                  }
                />
              </View>
            )}

            {isOtherPickupType && (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={styles.label}>Plot / Unit / Building *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.plotOrBuilding && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="Enter plot/unit number"
                    value={localValues.plotOrBuilding}
                    onChangeText={text =>
                      setLocalValues(prev => ({
                        ...prev,
                        plotOrBuilding: text,
                      }))
                    }
                  />

                  <Text style={styles.label}>
                    Street / Area /Sector /Village *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.streetArea && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="Enter area details"
                    value={localValues.streetArea}
                    onChangeText={text =>
                      setLocalValues(prev => ({ ...prev, streetArea: text }))
                    }
                  />
                  <View style={tw`flex-row gap-3 mb-4`}>
                    <View style={tw`flex-1`}>
                      <Text style={styles.label}>Pincode *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Pincode"
                        value={localValues.pincode}
                        onChangeText={text => {
                          handlePinchange(text);
                          if (fieldErrors.pincode) {
                            setFieldErrors(prev => ({ ...prev, pincode: '' }));
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={6}
                        error={!!fieldErrors.pincode}
                      />
                      {fieldErrors.pincode && (
                        <Text style={{ color: 'red', fontSize: 12 }}>
                          {fieldErrors.pincode}
                        </Text>
                      )}
                    </View>

                    <View style={tw`flex-1`}>
                      <Text style={styles.label}>State *</Text>
                      <SelectList
                        data={stateData?.data || []}
                        displayKey="state"
                        save="state"
                        value={localValues.state}
                        setSelected={value => {
                          handleState(value);
                          if (fieldErrors.state) {
                            setFieldErrors(prev => ({ ...prev, state: '' }));
                          }
                        }}
                        placeholder="Select State"
                        onClear={() =>
                          setLocalValues(prev => ({ ...prev, state: '' }))
                        }
                        inputStyles={tw`border-gray-200`}
                        style={
                          fieldErrors.state && {
                            borderColor: 'red',
                            borderWidth: 1,
                          }
                        }
                      />
                      {fieldErrors.state && (
                        <Text style={{ color: 'red', fontSize: 12 }}>
                          {fieldErrors.state}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={tw`flex-row gap-3 mb-4`}>
                    <View style={tw`flex-1`}>
                      <Text style={styles.label}>District / City *</Text>
                      <SelectList
                        data={availableDistricts}
                        displayKey="region"
                        save="region"
                        value={localValues.district}
                        setSelected={val =>
                          setLocalValues(prev => ({ ...prev, district: val }))
                        }
                        placeholder="Select District"
                        onClear={() =>
                          setLocalValues(prev => ({ ...prev, district: '' }))
                        }
                        disabled={!localValues.state}
                        inputStyles={tw`border-gray-200`}
                      />
                    </View>

                    <View style={tw`flex-1`}>
                      <Text style={styles.label}>Taluka / Town</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Taluka"
                        value={localValues.taluka}
                        error={!!fieldErrors.taluka}
                        onChangeText={text => {
                          setLocalValues(prev => ({ ...prev, taluka: text }));
                          if (fieldErrors.taluka) {
                            setFieldErrors(prev => ({ ...prev, taluka: '' }));
                          }
                        }}
                      />
                      {fieldErrors.taluka && (
                        <Text style={{ color: 'red', fontSize: 12 }}>
                          {fieldErrors.taluka}
                        </Text>
                      )}
                    </View>
                  </View>

                  <SelectList
                    data={originPlaces?.suggestions}
                    displayKey="value"
                    value={
                      originPlaces.inputValue ||
                      localValues?.origin?.address ||
                      ''
                    }
                    save="object"
                    setSelected={handleOriginSelect}
                    placeholder="Search pickup location..."
                    search={true}
                    onSearchChange={originPlaces.handleInputChange}
                    searchValue={originPlaces.inputValue}
                    inputStyles={[
                      tw`border-gray-200`,
                      fieldErrors.origin && {
                        borderColor: 'red',
                        borderWidth: 1,
                      },
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
                          tw`border border-${button.borderColor}`,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </>
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
        </ScrollView>

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
      </BottomModal>

      {AddressTypeModal}
      {MapSelectionModal}
    </>
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
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    marginBottom: 0,
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
  // Address Type Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addressTypeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  addressTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addressTypeCloseButton: {
    padding: 4,
  },
  addressTypeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  addressTypeList: {
    marginBottom: 20,
  },
  addressTypeButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  addressTypeButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  addressTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  addressTypeTextSelected: {
    color: 'white',
  },
  addressTypeConfirmButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addressTypeConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  // Address Type Badge
  addressTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  addressTypeBadgeText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  addressTypeEditButton: {
    padding: 2,
  },
});

export default PickupModal;
