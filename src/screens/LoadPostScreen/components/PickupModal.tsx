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
import { TextInput, HelperText, Button, Card } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShipmentData } from '@api/api.type';
import {
  useGetCurrentAddressQuery,
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useGetStateQuery,
} from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import { SelectList } from '@components/common/Select';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import LocationHistoryModal from './LocationHistoryModal';
import { useGetCustomerAddressQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { SegmentedButtons } from 'react-native-paper';

export interface PickupModalRef {
  open: () => void;
  close: () => void;
}

interface LocationSuggestion {
  key: string;
  value: string;
}

interface LocalPickupData {
  origin: any;
  contactName: string;
  contactNumber: string;
  plotOrBuilding: string;
  streetArea: string;
  state: string;
  district: string;
  shipperName: string;
  taluka: string;
  pincode: string;
  companyName: string;
  addressType: 'Office' | 'Factory' | 'Warehouse' | 'Other' | null;
  alternateNo?: string;
}

const ADDRESS_TYPES = [
  { label: 'Office', value: 'Office' },
  { label: 'Factory', value: 'Factory' },
  { label: 'Warehouse', value: 'Warehouse' },
  { label: 'Other', value: 'Other' },
];

const PickupModal = forwardRef<PickupModalRef>((props, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const CustomerDetail = useSelector(
    (state: RootState) => state?.auth?.customerDetails,
  );
  const currentlocation = useSelector(
    (state: RootState) => state?.map?.currentlocation,
  );
  const isOriganization = CustomerDetail?.CompanyType === 'Origanization';

  const { selectedLocation, handleInputChange, suggestions } =
    useGooglePlacesSelect();
  const { values, setFieldValue } = useFormikContext<ShipmentData>();
  const isOther = values?.pickup?.pickupType === 'Other';
  const bottomModalRef = useRef<BottomModalRef>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isConfirmStep, setIsConfirmStep] = useState(false);

  const { data: stateData } = useGetStateQuery();
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [PincodeData] = useGetPincodeDataMutation();
  const [getDistricts] = useGetDistrictMutation();
  const { data: currentData } = useGetCurrentAddressQuery<any>();
  const { data: customerAddressData } = useGetCustomerAddressQuery({
    CustomerID: CustomerID,
    CompanyType: 'Organization',
  });

  const originPlaces = useGooglePlacesSelect();
  console.log({ originPlaces });
  const [localValues, setLocalValues] = useState<LocalPickupData>({
    origin: null,
    contactName: '',
    contactNumber: '',
    plotOrBuilding: '',
    shipperName: '',
    streetArea: '',
    state: '',
    district: '',
    taluka: '',
    pincode: '',
    companyName: '',
    addressType: null,
    alternateNo: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    const hasPickupData = values.pickup?.origin?.address;

    if (hasPickupData) {
      // ✅ Pre‑fill from Formik (edit mode)
      setLocalValues({
        origin: values.pickup.origin || null,
        contactName: values.pickup.contactName || '',
        contactNumber: values.pickup.contactNumber || '',
        plotOrBuilding: values.pickup.plotOrBuilding || '',
        streetArea: values.pickup.streetArea || '',
        shipperName: values.pickup.shipperName || '', // <-- include shipperName
        state: values.pickup.state || '',
        district: values.pickup.district || '',
        taluka: values.pickup.taluka || '',
        pincode: values.pickup.pincode || '',
        companyName: values.pickup.companyName || '',
        addressType: values.pickup.addressType || null,
        alternateNo: values.pickup.alternateNo || '',
      });

      // also fetch districts if state is present
      if (values.pickup.state) {
        handleState(values.pickup.state);
      }
    } else {
      // 🆕 No saved data – use empty defaults
      setLocalValues({
        origin: null,
        contactName: '',
        contactNumber: '',
        plotOrBuilding: '',
        streetArea: '',
        state: '',
        shipperName: '',
        district: '',
        taluka: '',
        pincode: '',
        companyName: '',
        addressType: null,
        alternateNo: '',
      });
      setAvailableDistricts([]);
    }

    setFieldErrors({});
  }, [isModalOpen, values.pickup]);

  const handleCurrentLocation = useCallback(() => {
    if (currentlocation) {
      const components = currentlocation?.components || {};

      // Update local values with current location data
      const updatedValues = {
        ...localValues,
        origin: {
          address: currentlocation?.address,
          coordinates: {
            lat: currentlocation?.latitude,
            lng: currentlocation?.longitude,
          },
          components: components,
        },
        state: components.state || '',
        district: components.dist || '',
        taluka: components.tal || '',
        pincode: components.pincode || '',
        contactName: CustomerDetail?.ContactPerson || '',
        contactNumber: CustomerDetail?.ContactNo || '',
        companyName: CustomerDetail?.CompanyName || '',
        plotOrBuilding: '',
        streetArea: '',
      };

      setLocalValues(updatedValues);

      // If state is available from current location, fetch districts for that state
      if (components.state) {
        handleState(components.state);
      }

      Toast.show({
        type: 'success',
        text1: 'Current Location Loaded',
        text2: 'Address details have been auto-filled',
      });
    } else {
      Alert.alert('Error', 'Unable to get current location');
    }
  }, [currentlocation, CustomerDetail, localValues]);
  console.log({ CustomerDetail });

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

  // Handle Registered button press
  const handleRegisteredPress = useCallback(() => {
    if (customerAddressData?.data?.length > 0) {
      const registeredAddress = customerAddressData.data[0];

      const updatedValues = {
        origin: {
          address: registeredAddress.Address,
          coordinates: {
            lat: parseFloat(registeredAddress.latitude) || 0,
            lng: parseFloat(registeredAddress.longitude) || 0,
          },
          components: {
            dist: registeredAddress.City || '',
            pincode: registeredAddress.Pincode || '',
            place: registeredAddress.Address1 || '',
            state: registeredAddress.State || '',
            tal: registeredAddress.Tahsil || '',
          },
        },
        contactName: registeredAddress.ContactPerson || '',
        contactNumber: registeredAddress.ContactNo || '',
        companyName: registeredAddress.CompanyName || '',
        plotOrBuilding: registeredAddress.Address1 || '',
        streetArea: registeredAddress.Address2 || '',
        state: registeredAddress.State || '',
        district: registeredAddress.City || '',
        taluka: registeredAddress.Tahsil || '',
        pincode: registeredAddress.Pincode || '',
        addressType: null,
        alternateNo: '',
        shipperName: '', // <-- clear shipperName for registered
      };

      setLocalValues(updatedValues);

      if (registeredAddress.State) {
        handleState(registeredAddress.State);
      }

      Toast.show({
        type: 'success',
        text1: 'Registered Address Loaded',
        text2: 'Registered address has been set',
      });
    } else {
      Alert.alert(
        'No Registered Address',
        'No registered address found for this customer.',
        [{ text: 'OK' }],
      );
    }
  }, [customerAddressData, handleState]);

  // Handle History button press
  const handleHistoryPress = useCallback(() => {
    setShowHistoryModal(true);
  }, []);

  const handleAddressTypeSelect = useCallback(
    (type: LocalPickupData['addressType']) => {
      setLocalValues(prev => ({ ...prev, addressType: type }));
      setShowAddressTypeModal(false);
      setFieldErrors(prev => ({ ...prev, addressType: '' }));
    },
    [],
  );

  const completeConfirmation = useCallback(
    (valuesToConfirm: LocalPickupData) => {
      // Set all values to Formik at once
      setFieldValue('pickup.origin', valuesToConfirm.origin);
      setFieldValue('pickup.contactName', valuesToConfirm.contactName);
      setFieldValue('pickup.contactNumber', valuesToConfirm.contactNumber);
      setFieldValue('pickup.plotOrBuilding', valuesToConfirm.plotOrBuilding);
      setFieldValue('pickup.streetArea', valuesToConfirm.streetArea);
      setFieldValue('pickup.alternateNo', valuesToConfirm.alternateNo);
      setFieldValue('pickup.state', valuesToConfirm.state);
      setFieldValue('pickup.district', valuesToConfirm.district);
      setFieldValue('pickup.taluka', valuesToConfirm.taluka);
      setFieldValue('pickup.pincode', valuesToConfirm.pincode);
      setFieldValue('pickup.companyName', valuesToConfirm.companyName);
      setFieldValue('pickup.addressType', valuesToConfirm.addressType);
      setFieldValue('pickup.shipperName', valuesToConfirm.shipperName); // <-- include shipperName

      setFieldErrors({});
      setIsConfirmStep(false);
      handleModalClose();
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    const errors: any = {};

    // (Validation code is commented out in original; if needed, uncomment and adjust)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields correctly',
      });
      return;
    }

    // Auto-set company name from customer details if not set
    const finalValues = {
      ...localValues,
      companyName: localValues.companyName || CustomerDetail?.CompanyName || '',
      contactName: localValues.contactName || CustomerDetail?.CompanyName || '',
      contactNumber:
        localValues.contactNumber || CustomerDetail?.ContactNo || '',
    };

    completeConfirmation(finalValues);
  }, [localValues, CustomerDetail, completeConfirmation]);

  const handleOriginSelect = useCallback(
    async (selected: LocationSuggestion) => {
      try {
        const location = await originPlaces.getPlaceDetails(selected.key);
        if (location) {
          const components = location.components || {};

          setLocalValues(prev => ({
            ...prev,
            origin: location,
            state: components.state || '',
            district: components.dist || '',
            taluka: components.tal || '',
            pincode: components.pincode || '',
            plotOrBuilding: components.place || prev.plotOrBuilding,
            streetArea: location.address || prev.streetArea,
          }));

          setFieldErrors(prev => ({ ...prev, origin: '' }));

          if (components.state) {
            handleState(components.state);
          }

          Toast.show({
            type: 'success',
            text1: 'Address Selected',
            text2: 'Address details have been auto-filled',
          });
        }
      } catch (error) {
        console.error('Error fetching location details:', error);
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces, handleState],
  );

  const handleHistoryLocationSelect = useCallback(
    (item: any) => {
      setLocalValues(prev => ({
        ...prev,
        origin: {
          address: item?.Origin,
          coordinates: {},
          components: {},
        },
        plotOrBuilding: item.plotOrBuilding || '',
        streetArea: item.streetArea || '',
        state: item.State || '',
        contactName: item.contactName || '',
        contactNumber: item.contactNumber || '',
        addressType: item.addressType || null,
        companyName: CustomerDetail?.CompanyName || '',
        district: item.district || '',
        taluka: item.taluka || '',
        pincode: item.pincode || '',
        shipperName: '', // <-- clear shipperName for history selection
      }));

      setShowHistoryModal(false);
      setFieldErrors({});

      Toast.show({
        type: 'success',
        text1: 'History Address Loaded',
        text2: 'Address has been populated from history',
      });
    },
    [CustomerDetail],
  );

  const handleModalClose = useCallback(() => {
    setShowHistoryModal(false);
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

              <Button
                mode="contained"
                style={styles.addressTypeConfirmButton}
                onPress={handleAddressTypeModalClose}
              >
                Close
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    ),
    [
      showAddressTypeModal,
      localValues.addressType,
      handleAddressTypeSelect,
      handleAddressTypeModalClose,
    ],
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
                <Text style={styles.title}>Pickup Address</Text>
                <TouchableOpacity
                  onPress={handleModalClose}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.sectionContainer}>
            <View style={tw`mt-4 mb-4`}>
              <SegmentedButtons
                value={values.pickup.pickupType || ''}
                onValueChange={value => {
                  // 🔥 FIX: Set pickup.pickupType so that isOther works correctly
                  setFieldValue('pickup.pickupType', value);
                  // Also set locationType if needed elsewhere
                  setFieldValue('locationType', value);
                  if (value === 'Other') {
                    setLocalValues(prev => ({
                      ...prev,
                      origin: {
                        address: '',
                        coordinates: null,
                        components: {},
                      },
                    }));
                  }

                  if (value === 'registered') handleRegisteredPress();
                  if (value === 'current') handleCurrentLocation();
                  if (value === 'history') handleHistoryPress();
                  // For 'Other', no automatic data loading is needed
                }}
                buttons={[
                  {
                    value: 'registered',
                    label: 'Registered',
                    icon: 'office-building',
                  },
                  {
                    value: 'current',
                    label: 'Current',
                    icon: 'office-building',
                  },
                  {
                    value: 'Other',
                    label: 'Other',
                    icon: 'user',
                  },
                  {
                    value: 'history',
                    label: 'History',
                    icon: 'history',
                  },
                ]}
              />
            </View>

            <Card.Content>
              <TextInput
                mode="outlined"
                label="Pickup Address"
                style={styles.input}
                placeholder="Enter pickup address"
                value={localValues?.origin?.address || ''}
                multiline
                editable={isOther}
                onChangeText={text => {
                  if (!isOther) return;

                  setLocalValues(prev => ({
                    ...prev,
                    origin: {
                      ...(prev.origin || {}),
                      address: text,
                      coordinates: prev.origin?.coordinates || null,
                      components: prev.origin?.components || {},
                    },
                  }));
                }}
              />
              {!isOther && (
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
                  dropdownType="modal"
                  onSearchChange={originPlaces.handleInputChange}
                  searchValue={originPlaces.inputValue}
                />
              )}
              {fieldErrors.origin && (
                <HelperText type="error" visible={true}>
                  {fieldErrors.origin}
                </HelperText>
              )}

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

              {/* 🔥 Shipper Name input appears only when pickupType is 'Other' */}
              {isOther && (
                <TextInput
                  mode="outlined"
                  label="Shipper Name"
                  style={styles.input}
                  placeholder="Enter shipper name"
                  value={localValues?.shipperName}
                  onChangeText={text => {
                    setLocalValues(prev => ({ ...prev, shipperName: text }));
                  }}
                  keyboardType="default"
                  maxLength={100}
                />
              )}

              <TextInput
                mode="outlined"
                label="Alternate No"
                style={styles.input}
                placeholder="Enter alternate number"
                value={localValues?.alternateNo}
                onChangeText={text => {
                  setLocalValues(prev => ({ ...prev, alternateNo: text }));
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />

              {/* Address Type */}
              <Text style={tw`text-gray-700 mb-2 text-base font-medium`}>
                Save This Address Type As
              </Text>

              <SegmentedButtons
                value={localValues.addressType || ''}
                onValueChange={value => {
                  setLocalValues(prev => ({
                    ...prev,
                    addressType: value as LocalPickupData['addressType'],
                  }));

                  if (fieldErrors.addressType) {
                    setFieldErrors(prev => ({ ...prev, addressType: '' }));
                  }
                }}
                buttons={ADDRESS_TYPES.map(type => ({
                  value: type.value,
                  label: type.label,
                }))}
                style={tw`mb-2`}
                density="regular"
              />

              {fieldErrors.addressType && (
                <HelperText type="error" visible={true}>
                  {fieldErrors.addressType}
                </HelperText>
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
          }}
          onSelectLocation={handleHistoryLocationSelect}
          locations={currentData?.Address || []}
          type="origin"
        />
      </BottomModal>

      {AddressTypeModal}
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
    textAlign: 'center',
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
  input: {
    backgroundColor: 'white',
    marginBottom: 8,
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
  cancelButton: {
    minWidth: 100,
  },
  confirmButton: {
    minWidth: 100,
  },
});

export default PickupModal;
