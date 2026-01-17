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
import {
  RadioButton,
  TextInput,
  HelperText,
  Button,
  Chip,
  Card,
  Divider,
} from 'react-native-paper';
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
  addressType: 'Office' | 'Factory' | 'Warehouse' | 'Other' | null;
}

const ADDRESS_TYPES = [
  { label: 'Office', value: 'Office' },
  { label: 'Factory', value: 'Factory' },
  { label: 'Warehouse', value: 'Warehouse' },
  // { label: 'Personal', value: 'Personal' },
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
  console.log({ CustomerDetail });
  const currentlocation = useSelector(
    (state: RootState) => state?.map?.currentlocation,
  );

  console.log({ CustomerDetail });
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
  const [isConfirmStep, setIsConfirmStep] = useState(false);

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

  const { values, setFieldValue } = useFormikContext<ShipmentData>();
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

  // Handle pickup type change
  const handlePickupTypeChange = useCallback(
    (type: LocalPickupData['pickupType']) => {
      setLocalValues(prev => ({ ...prev, pickupType: type }));
      setFieldErrors({}); // Clear previous errors

      if (type === 'Registered' && GoogleAddress) {
        setLocalValues(prev => ({
          ...prev,
          pickupType: type,
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
          companyName: CustomerDetail?.CompanyName || '',
          addressType: null,
          plotOrBuilding: '',
          streetArea: '',
        }));
      } else if (type === 'self' && currentlocation) {
        setLocalValues(prev => ({
          ...prev,
          pickupType: type,
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
          companyName: CustomerDetail?.CompanyName || '',
          plotOrBuilding: '',
          streetArea: '',
        }));
      } else if (type === 'other') {
        // Clear fields for other type
        setLocalValues(prev => ({
          ...prev,
          pickupType: type,
          origin: null,
          contactName: '',
          contactNumber: '',
          plotOrBuilding: '',
          streetArea: '',
          companyName: '',
          addressType: null,
        }));
      }
    },
    [GoogleAddress, CustomerDetail, currentlocation],
  );

  const handleAddressTypeSelect = useCallback(
    (type: LocalPickupData['addressType']) => {
      const updatedValues = {
        ...localValues,
        addressType: type,
      };

      // Auto-fill based on address type
      if (type === 'Personal') {
        updatedValues.companyName = '';
        updatedValues.contactName = CustomerDetail?.FullName || '';
      } else {
        updatedValues.companyName = CustomerDetail?.CompanyName || '';
        updatedValues.contactName = CustomerDetail?.CompanyName || '';
      }

      updatedValues.contactNumber = CustomerDetail?.ContactNo || '';

      setLocalValues(updatedValues);
      setShowAddressTypeModal(false);
      setFieldErrors(prev => ({ ...prev, addressType: '' })); // Clear error

      // If this was triggered from confirm step, complete the confirmation
      if (isConfirmStep) {
        completeConfirmation(updatedValues);
      }
    },
    [localValues, CustomerDetail, isConfirmStep],
  );

  const completeConfirmation = useCallback(
    (valuesToConfirm: LocalPickupData) => {
      // ✅ Set all values to Formik at once
      setFieldValue('pickup.pickupType', valuesToConfirm.pickupType);
      setFieldValue('pickup.origin', valuesToConfirm.origin);
      setFieldValue('pickup.contactName', valuesToConfirm.contactName);
      setFieldValue('pickup.contactNumber', valuesToConfirm.contactNumber);
      setFieldValue('pickup.plotOrBuilding', valuesToConfirm.plotOrBuilding);
      setFieldValue('pickup.streetArea', valuesToConfirm.streetArea);
      setFieldValue('pickup.state', valuesToConfirm.state);
      setFieldValue('pickup.district', valuesToConfirm.district);
      setFieldValue('pickup.taluka', valuesToConfirm.taluka);
      setFieldValue('pickup.pincode', valuesToConfirm.pincode);
      setFieldValue('pickup.companyName', valuesToConfirm.companyName);
      setFieldValue('pickup.addressType', valuesToConfirm.addressType);

      setFieldErrors({});
      setIsConfirmStep(false);
      handleModalClose();
    },
    [setFieldValue, handleModalClose],
  );

  const handleConfirm = useCallback(() => {
    const errors: any = {};

    // Always validate these fields regardless of pickup type
    if (!localValues.origin?.address) {
      errors.origin = 'Please select a pickup location';
    }

    // Validate based on pickup type
    if (localValues.pickupType === 'other') {
      if (!localValues.contactName?.trim()) {
        errors.contactName = 'Please enter contact person name';
      }
      if (!localValues.contactNumber?.trim()) {
        errors.contactNumber = 'Please enter contact number';
      } else if (localValues.contactNumber.length !== 10) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
      }
      if (!localValues.companyName?.trim()) {
        errors.companyName = 'Please enter company/warehouse name';
      }
      if (!localValues.plotOrBuilding?.trim()) {
        errors.plotOrBuilding = 'Please enter plot/unit/building details';
      }
      if (!localValues.streetArea?.trim()) {
        errors.streetArea = 'Please enter area/street details';
      }
      if (!localValues.pincode?.trim()) {
        errors.pincode = 'Please enter pincode';
      } else if (localValues.pincode.length !== 6) {
        errors.pincode = 'Please enter a valid 6-digit pincode';
      }
      if (!localValues.state?.trim()) {
        errors.state = 'Please select state';
      }

      // Check if address type is needed (for other pickup type)
      if (!localValues.addressType) {
        // Set confirm step and show address type modal
        setIsConfirmStep(true);
        setShowAddressTypeModal(true);
        return; // Don't complete confirmation yet
      }
    } else if (localValues.pickupType === 'self') {
      if (!localValues.contactName?.trim()) {
        errors.contactName = 'Please enter contact person name';
      }
      if (!localValues.contactNumber?.trim()) {
        errors.contactNumber = 'Please enter contact number';
      } else if (localValues.contactNumber.length !== 10) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
      }
      if (!localValues.plotOrBuilding?.trim()) {
        errors.plotOrBuilding = 'Please enter plot/unit/building details';
      }
      if (!localValues.streetArea?.trim()) {
        errors.streetArea = 'Please enter area/street details';
      }

      // Check if address type is needed (for self pickup type)
      if (!localValues.addressType) {
        // Set confirm step and show address type modal
        setIsConfirmStep(true);
        setShowAddressTypeModal(true);
        return; // Don't complete confirmation yet
      }
    } else if (localValues.pickupType === 'Registered') {
      if (!localValues.contactName?.trim()) {
        errors.contactName = 'Please enter contact person name';
      }
      if (!localValues.contactNumber?.trim()) {
        errors.contactNumber = 'Please enter contact number';
      } else if (localValues.contactNumber.length !== 10) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
      }
      // For Registered pickup type, we can confirm immediately
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // If we reach here, all validations passed and address type is set (for self/other)
    completeConfirmation(localValues);
  }, [localValues, completeConfirmation]);

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
          setFieldErrors(prev => ({ ...prev, origin: '' }));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces],
  );

  const handleHistoryLocationSelect = useCallback(
    (item: {
      Origin: any;
      plotOrBuilding: any;
      streetArea: any;
      State: any;
      contactName: any;
      contactNumber: any;
      addressType: any;
    }) => {
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
        companyName:
          item.addressType === 'Personal'
            ? ''
            : CustomerDetail?.CompanyName || '',
      }));

      setShowHistoryModal(false);
      setFieldErrors({}); // Clear errors when selecting from history
    },
    [CustomerDetail],
  );

  const handleModalClose = useCallback(() => {
    setActiveOriginButton('');
    setShowHistoryModal(false);
    setShowMapModal(false);
    setShowAddressTypeModal(false);
    setIsModalOpen(false);
    setIsConfirmStep(false);
    bottomModalRef.current?.close();
  }, []);

  const handleBottomModalClose = useCallback(() => {
    setIsModalOpen(false);
    setIsConfirmStep(false);
  }, []);

  const handleAddressTypeModalClose = useCallback(() => {
    setShowAddressTypeModal(false);
    setIsConfirmStep(false);
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
        onRequestClose={handleAddressTypeModalClose}
      >
        <View style={styles.overlay}>
          <Card style={styles.addressTypeModal}>
            <Card.Content>
              <View style={styles.addressTypeHeader}>
                <Text style={styles.addressTypeTitle}>Select Address Type</Text>
                <TouchableOpacity
                  onPress={handleAddressTypeModalClose}
                  style={styles.addressTypeCloseButton}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.addressTypeSubtitle}>
                {isConfirmStep
                  ? 'Please select address type to complete pickup confirmation'
                  : 'Please select the type of address for pickup location'}
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

              <Button
                mode="contained"
                style={styles.addressTypeConfirmButton}
                onPress={handleAddressTypeModalClose}
              >
                {isConfirmStep ? 'Cancel' : 'Close'}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    ),
    [
      showAddressTypeModal,
      localValues.addressType,
      isConfirmStep,
      handleAddressTypeSelect,
      handleAddressTypeModalClose,
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
          <Card style={styles.mapHeader}>
            <Card.Content style={styles.mapHeaderContent}>
              <Text style={styles.mapTitle}>Select Location on Map</Text>
              <TouchableOpacity
                onPress={() => setShowMapModal(false)}
                style={styles.mapCloseButton}
                accessibilityLabel="Close map modal"
                accessibilityHint="Closes the map selection modal"
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </Card.Content>
          </Card>

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
          <Card style={styles.header}>
            <Card.Content style={styles.headerContent}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={styles.title}>Pickup Location</Text>
                <View style={tw`flex-row items-center`}>
                  {localValues.pickupType === 'other' && (
                    <Button
                      mode="outlined"
                      icon="history"
                      onPress={() => {
                        setActiveOriginButton('history');
                        setShowHistoryModal(true);
                      }}
                      style={tw`mr-2`}
                      labelStyle={tw`text-gray-700`}
                    >
                      History
                    </Button>
                  )}
                  <TouchableOpacity
                    onPress={handleModalClose}
                    style={styles.closeButton}
                    accessibilityLabel="Close pickup modal"
                    accessibilityHint="Closes the pickup location selection modal"
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.sectionContainer}>
            <Card.Content>
              {/* <Text style={styles.sectionLabel}>Pickup Type</Text> */}
              <View style={tw`flex-row items-center flex-wrap mt-2`}>
                {/* Registered Option */}
                <View style={tw`flex-row items-center mr-4`}>
                  <RadioButton
                    value="Registered"
                    status={
                      localValues.pickupType === 'Registered'
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handlePickupTypeChange('Registered')}
                    color={tw.color('blue-500')}
                  />
                  <Text style={styles.radioLabel}>Registered</Text>
                </View>

                {/* Current Option */}
                <View style={tw`flex-row items-center mr-4`}>
                  <RadioButton
                    value="self"
                    status={
                      localValues.pickupType === 'self'
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handlePickupTypeChange('self')}
                    color={tw.color('blue-500')}
                  />
                  <Text style={styles.radioLabel}>Current</Text>
                </View>

                {/* Other Option */}
                <View style={tw`flex-row items-center`}>
                  <RadioButton
                    value="other"
                    status={
                      localValues.pickupType === 'other'
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handlePickupTypeChange('other')}
                    color={tw.color('blue-500')}
                  />
                  <Text style={styles.radioLabel}>Other</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.sectionContainer}>
            <Card.Content>
              {isRegisteredPickupType && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Contact Name *"
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={localValues.contactName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }}
                    error={!!fieldErrors.contactName}
                  />
                  {fieldErrors.contactName && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactName}
                    </HelperText>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Contact Number *"
                    style={styles.input}
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
                    error={!!fieldErrors.contactNumber}
                  />
                  {fieldErrors.contactNumber && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactNumber}
                    </HelperText>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Company Name *"
                    style={styles.input}
                    value={localValues.companyName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, companyName: text }));
                    }}
                  />
                  {/* <TextInput
                    mode="outlined"
                    label="Alternate Name *"
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={localValues?.contactName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }}
                    error={!!fieldErrors.contactName}
                  /> */}
                  <TextInput
                    mode="outlined"
                    label="Alternate No *"
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={localValues?.contactName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }}
                    error={!!fieldErrors.contactName}
                  />

                  <TextInput
                    mode="outlined"
                    label="Registered Pickup Address *"
                    style={styles.input}
                    placeholder="Enter registered pickup address"
                    value={localValues?.origin?.address || ''}
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
                    error={!!fieldErrors.origin}
                  />
                  {fieldErrors.origin && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.origin}
                    </HelperText>
                  )}
                </>
              )}

              {isOtherPickupType && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Contact Name *"
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={localValues.contactName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }}
                    error={!!fieldErrors.contactName}
                  />
                  {fieldErrors.contactName && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactName}
                    </HelperText>
                  )}
                  <TextInput
                    mode="outlined"
                    label="Contact Number *"
                    style={styles.input}
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
                    error={!!fieldErrors.contactNumber}
                  />
                  {fieldErrors.contactNumber && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactNumber}
                    </HelperText>
                  )}
                  <TextInput
                    mode="outlined"
                    label="Company / Warehouse Name *"
                    style={styles.input}
                    placeholder="Enter Company / Warehouse Name"
                    value={localValues.companyName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, companyName: text }));
                      if (fieldErrors.companyName) {
                        setFieldErrors(prev => ({ ...prev, companyName: '' }));
                      }
                    }}
                    error={!!fieldErrors.companyName}
                  />
                  {fieldErrors.companyName && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.companyName}
                    </HelperText>
                  )}
                  {/* <Divider style={tw`my-4`} /> */}
                  <TextInput
                    mode="outlined"
                    label="Plot / Unit / Building *"
                    style={styles.input}
                    placeholder="Enter plot/unit number"
                    value={localValues.plotOrBuilding}
                    onChangeText={text => {
                      setLocalValues(prev => ({
                        ...prev,
                        plotOrBuilding: text,
                      }));
                      if (fieldErrors.plotOrBuilding) {
                        setFieldErrors(prev => ({
                          ...prev,
                          plotOrBuilding: '',
                        }));
                      }
                    }}
                    error={!!fieldErrors.plotOrBuilding}
                  />
                  {fieldErrors.plotOrBuilding && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.plotOrBuilding}
                    </HelperText>
                  )}
                  <TextInput
                    mode="outlined"
                    label="Street / Area / Sector / Village *"
                    style={styles.input}
                    placeholder="Enter area details"
                    value={localValues.streetArea}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, streetArea: text }));
                      if (fieldErrors.streetArea) {
                        setFieldErrors(prev => ({ ...prev, streetArea: '' }));
                      }
                    }}
                    error={!!fieldErrors.streetArea}
                  />
                  {fieldErrors.streetArea && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.streetArea}
                    </HelperText>
                  )}
                  <View style={tw`flex-row gap-3 mb-4`}>
                    <View style={tw`flex-1`}>
                      <TextInput
                        mode="outlined"
                        label="Pincode *"
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
                        <HelperText type="error" visible={true}>
                          {fieldErrors.pincode}
                        </HelperText>
                      )}
                    </View>

                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-700 mb-1`}>State *</Text>
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
                        <HelperText type="error" visible={true}>
                          {fieldErrors.state}
                        </HelperText>
                      )}
                    </View>
                  </View>
                  <View style={tw`flex-row gap-3 mb-4`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-700 mb-1`}>
                        District / City *
                      </Text>
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
                      <TextInput
                        mode="outlined"
                        label="Taluka / Town"
                        style={styles.input}
                        placeholder="Enter Taluka"
                        value={localValues.taluka}
                        onChangeText={text => {
                          setLocalValues(prev => ({ ...prev, taluka: text }));
                          if (fieldErrors.taluka) {
                            setFieldErrors(prev => ({ ...prev, taluka: '' }));
                          }
                        }}
                        error={!!fieldErrors.taluka}
                      />
                      {fieldErrors.taluka && (
                        <HelperText type="error" visible={true}>
                          {fieldErrors.taluka}
                        </HelperText>
                      )}
                    </View>
                  </View>
                  <Text style={tw`text-gray-700 mb-2`}>Pickup Location</Text>
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
                </>
              )}

              {isselfPickupType && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Contact Name *"
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={localValues.contactName}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, contactName: text }));
                      if (fieldErrors.contactName) {
                        setFieldErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }}
                    error={!!fieldErrors.contactName}
                  />
                  {fieldErrors.contactName && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactName}
                    </HelperText>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Contact Number *"
                    style={styles.input}
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
                    error={!!fieldErrors.contactNumber}
                  />
                  {fieldErrors.contactNumber && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.contactNumber}
                    </HelperText>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Company Name *"
                    style={styles.input}
                    placeholder="Company Name"
                    value={localValues.companyName}
                    onChangeText={text =>
                      setLocalValues(prev => ({ ...prev, companyName: text }))
                    }
                  />

                  <TextInput
                    mode="outlined"
                    label="Current Location (fetched)"
                    style={styles.input}
                    placeholder="Current location"
                    value={localValues?.origin?.address || ''}
                    editable={false}
                  />

                  <TextInput
                    mode="outlined"
                    label="Plot / Unit / Building *"
                    style={styles.input}
                    placeholder="Enter plot/unit number"
                    value={localValues.plotOrBuilding}
                    onChangeText={text => {
                      setLocalValues(prev => ({
                        ...prev,
                        plotOrBuilding: text,
                      }));
                      if (fieldErrors.plotOrBuilding) {
                        setFieldErrors(prev => ({
                          ...prev,
                          plotOrBuilding: '',
                        }));
                      }
                    }}
                    error={!!fieldErrors.plotOrBuilding}
                  />
                  {fieldErrors.plotOrBuilding && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.plotOrBuilding}
                    </HelperText>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Street / Area / Sector / Village *"
                    style={styles.input}
                    placeholder="Enter area details"
                    value={localValues.streetArea}
                    onChangeText={text => {
                      setLocalValues(prev => ({ ...prev, streetArea: text }));
                      if (fieldErrors.streetArea) {
                        setFieldErrors(prev => ({ ...prev, streetArea: '' }));
                      }
                    }}
                    error={!!fieldErrors.streetArea}
                  />
                  {fieldErrors.streetArea && (
                    <HelperText type="error" visible={true}>
                      {fieldErrors.streetArea}
                    </HelperText>
                  )}
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.modalFooter}>
            <Card.Content style={styles.footerContent}>
              <View style={tw`flex-row justify-between w-full`}>
                <Button
                  mode="outlined"
                  style={[styles.cancelButton, tw`flex-1 mr-2`]}
                  onPress={handleModalClose}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  style={[styles.confirmButton, tw`flex-1 ml-2`]}
                  onPress={handleConfirm}
                >
                  Confirm Pickup
                </Button>
              </View>
            </Card.Content>
          </Card>
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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  footerContent: {
    padding: 16,
  },
  sectionContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    backgroundColor: '#FFF',
    elevation: 2,
  },
  mapHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapCloseButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addressTypeModal: {
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
    marginTop: 8,
  },
  addressTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    minWidth: 100,
  },
  confirmButton: {
    minWidth: 100,
  },
});

export default PickupModal;
