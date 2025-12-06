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
import PickupModal from './Pickupdebug';
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
import { useDispatch, useSelector } from 'react-redux';
import { setDestination } from '@store/slices/mapSlice';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import Toast from 'react-native-toast-message';
import { useCustomerhistoryQuery } from '@api/hooks_api';
import { RootState } from '@store/index';

export interface DropModalRef {
  open: () => void;
  close: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DropModal = forwardRef<DropModalRef>((props, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );

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

  type FieldErrors = {
    ConsigneeName?: string;
    ConsigneeContactNumber?: string;
    Pincode?: string;
    state?: string;
    District?: string;
    Taluka?: string;
    Destination_1?: string;
    Destination_2?: string;
    destination?: string;
  };
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pincodeCoords, setPincodeCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const dispatch = useDispatch();

  // Handle destination select
  const handleDestinationSelect = useCallback(
    async (selected: any) => {
      const location = await destinationPlaces.getPlaceDetails(selected.key);
      if (location) {
        setFieldValue('destination', location);
        setMapRegion({
          latitude: location.coordinates?.lat,
          longitude: location.coordinates?.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    },
    [destinationPlaces, setFieldValue],
  );
  const { data, isLoading, error } = useCustomerhistoryQuery({
    CustomerID: CustomerID,
  });

  console.log(data, 'this is selected location');

  // Handle history location select
  const handleHistoryLocationSelect = (item: any) => {
    console.log('Selected history item:', item);

    // Consignee details
    setFieldValue('ConsigneeName', item.ConsigneeName || '');
    setFieldValue('ConsigneeContactNumber', item.ConsigneeContactNumber || '');

    // Address fields
    setFieldValue('Destination_1', item.Destination_1 || '');
    setFieldValue('Destination_2', item.Destination_2 || '');

    // Extract pincode from item.address or database field
    const pincode = item.Pincode || item.address?.match(/\b\d{6}\b/)?.[0] || '';

    setFieldValue('Pincode', pincode);

    // Set district + state if present
    setFieldValue('District', item.Destination_District || '');
    setFieldValue('Taluka', item.Destination_Taluka || '');
    setFieldValue('state', item.Destination_State || '');

    // Google-like structure for destination
    setFieldValue('destination', {
      address: item.address || '',
      components: {
        dist: item.District || '',
        Pincode: pincode,
        place: item.Place || item.City || item.District || '',
        state: item.State || '',
        tal: item.Taluka || '',
      },
      coordinates: {
        lat: item.Latitude || 0,
        lng: item.Longitude || 0,
      },
    });

    // Close modal
    setShowHistoryModal(false);
    setActiveDestinationButton('');
  };

  const handleConfirm = useCallback(() => {
    const newErrors: any = {};

    if (!values.ConsigneeName)
      newErrors.ConsigneeName = 'Please enter consignee name';
    if (!values.destination?.address)
      newErrors.destination = 'Please select a drop-off location';
    if (!values.Pincode || values.Pincode.length !== 6)
      newErrors.Pincode = 'Please enter a valid 6-digit pincode';
    if (!values.state) newErrors.state = 'Please select a state';
    if (!values.District) newErrors.District = 'Please select a district';

    if (!values.Destination_1)
      newErrors.Destination_1 = 'Please enter a valid destination';
    if (!values.Destination_2)
      newErrors.Destination_2 = 'Please enter a valid destination';

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // prevent closing modal
    }

    handleModalClose();
  }, [values, handleModalClose]);

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

            // ✅ Convert Pincode to coordinates using Google API
            const geocodeRes = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${value}&key=${GOOGLE_MAPS_API_KEY}`,
            );
            const geocodeJson = await geocodeRes.json();
            console.log(geocodeJson);
            if (geocodeJson?.results?.length) {
              const { lat, lng } = geocodeJson.results[0]?.geometry?.location;
              setPincodeCoords({ latitude: lat, longitude: lng });
            }

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

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setActiveDestinationButton('');
    setShowMap(false);
    setShowHistoryModal(false);
    setFieldName('');
    setIsModalOpen(false);
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

        <PickupModal
          // Use pincodeCoords if available, otherwise fallback to Formik destination coordinates
          pincodeCoords={
            pincodeCoords ||
            (values.destination?.coordinates?.lat
              ? {
                  latitude: values.destination.coordinates.lat,
                  longitude: values.destination.coordinates.lng,
                }
              : null)
          }
          onLocationSelected={location => {
            setFieldValue('destination', {
              address: location.address,
              coordinates: {
                lat: location.latitude,
                lng: location.longitude,
              },
              components: {
                state: '',
                dist: '',
                place: '',
                tal: '',
                Pincode: '',
              },
            });

            // Update pincodeCoords as well so map stays in sync
            setPincodeCoords({
              latitude: location.latitude,
              longitude: location.longitude,
            });

            setShowMap(false);
            setActiveDestinationButton('');
          }}
        />
      </View>
      <Toast />
    </Modal>
  );

  return (
    <BottomModal
      ref={bottomModalRef}
      customHeight="98%"
      backdropOpacity={0.8}
      animationDuration={400}
      swipeThreshold={50}
      onClose={handleBottomModalClose}
      disableSwipe
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeButton}
          >
            <Icon name="close" size={22} color="#666" />
          </TouchableOpacity>

          <Text style={styles.title}>Drop Location</Text>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              setActiveDestinationButton('history');
              setShowHistoryModal(true);
            }}
          >
            <FontAwesome name="history" size={18} color="#005FCC" />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        </View>
        <View style={tw` bg-white p-4 rounded-2xl    border-gray-100`}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Consignee Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter consignee name"
              textTransform="capitalize"
              value={values.ConsigneeName}
              error={!!fieldErrors.ConsigneeName}
              onChangeText={text => {
                setFieldValue('ConsigneeName', text);

                // ✅ clear error when user starts typing in this field
                if (fieldErrors.ConsigneeName) {
                  setFieldErrors(prev => ({
                    ...prev,
                    ConsigneeName: '',
                  }));
                }
              }}
            />

            {fieldErrors.ConsigneeName && (
              <Text style={{ color: 'red', fontSize: 12 }}>
                {fieldErrors.ConsigneeName}
              </Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Consignee Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mobile number"
              value={values.ConsigneeContactNumber}
              onChangeText={text => {
                setFieldValue('ConsigneeContactNumber', text);
                if (fieldErrors.ConsigneeContactNumber) {
                  setFieldErrors(prev => ({
                    ...prev,
                    ConsigneeContactNumber: '',
                  }));
                }
              }}
              keyboardType="numeric"
              maxLength={10}
              error={!!fieldErrors.ConsigneeContactNumber}
            />
            {fieldErrors.ConsigneeContactNumber && (
              <Text style={{ color: 'red', fontSize: 12 }}>
                {fieldErrors.ConsigneeContactNumber}
              </Text>
            )}
          </View>

          <View style={tw`flex-row gap-3 mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Pincode"
                value={values.Pincode}
                onChangeText={text => {
                  handlePinchange(text);
                  if (fieldErrors.Pincode) {
                    setFieldErrors(prev => ({ ...prev, Pincode: '' }));
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                error={!!fieldErrors.Pincode}
              />
              {fieldErrors.Pincode && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {fieldErrors.Pincode}
                </Text>
              )}
            </View>

            <View style={tw`flex-1`}>
              <Text style={styles.label}>State *</Text>
              <SelectList
                data={stateData?.data || []}
                displayKey="state"
                save="state"
                value={values.state}
                setSelected={value => {
                  handleState(value);
                  if (fieldErrors.state) {
                    setFieldErrors(prev => ({ ...prev, state: '' }));
                  }
                }}
                placeholder="Select State"
                onClear={() => setFieldValue('state', '')}
                inputStyles={tw`border-gray-200`}
                style={
                  fieldErrors.state && { borderColor: 'red', borderWidth: 1 }
                }
              />
              {fieldErrors.state && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {fieldErrors.state}
                </Text>
              )}
            </View>
          </View>

          {/* Address Row 2 — District + Taluka */}
          <View style={tw`flex-row gap-3 mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={styles.label}>District / City *</Text>
              <SelectList
                data={availableDistricts}
                displayKey="region"
                save="region"
                value={values.District}
                setSelected={val => setFieldValue('District', val)}
                placeholder="Select District"
                onClear={() => setFieldValue('District', '')}
                disabled={!values.state}
                inputStyles={tw`border-gray-200`}
              />
            </View>

            <View style={tw`flex-1`}>
              <Text style={styles.label}>Taluka / Town</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Taluka"
                value={values.Taluka}
                error={!!fieldErrors.Taluka}
                onChangeText={text => {
                  setFieldValue('Taluka', text);
                  if (fieldErrors.Taluka) {
                    setFieldErrors(prev => ({ ...prev, Taluka: '' }));
                  }
                }}
              />
              {fieldErrors.Taluka && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {fieldErrors.Taluka}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Address Details */}
        <View style={tw` bg-white p-4 rounded-2xl    border-gray-100`}>
          <View style={tw`gap-3`}>
            {/* Destination_1 Field */}
            <View style={tw`flex-1`}>
              <Text style={styles.label}>
                Plot No/ Unit No/ Building / Flat / Company
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter plot/unit number"
                textTransform="capitalize"
                value={values.Destination_1}
                error={!!fieldErrors.Destination_1}
                onChangeText={text => {
                  setFieldValue('Destination_1', text);

                  // ✅ clear error when user starts typing
                  if (fieldErrors.Destination_1) {
                    setFieldErrors(prev => ({
                      ...prev,
                      Destination_1: '',
                    }));
                  }
                }}
              />
              {fieldErrors.Destination_1 && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {fieldErrors.Destination_1}
                </Text>
              )}
            </View>

            {/* Destination_2 Field */}
            <View style={tw`flex-1`}>
              <Text style={styles.label}>Area/Street/Sector/Village</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter area details"
                textTransform="capitalize"
                value={values.Destination_2}
                error={!!fieldErrors.Destination_2}
                onChangeText={text => {
                  setFieldValue('Destination_2', text);

                  // ✅ clear error when user starts typing
                  if (fieldErrors.Destination_2) {
                    setFieldErrors(prev => ({
                      ...prev,
                      Destination_2: '',
                    }));
                  }
                }}
              />
              {fieldErrors.Destination_2 && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {fieldErrors.Destination_2}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Delivery Location */}
        <View
          style={tw`mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100`}
        >
          {/* <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`w-2 h-6 bg-red-500 mr-3 rounded-full`} />
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Google Location
                </Text>
              </View> */}

          <SelectList
            data={destinationPlaces?.suggestions}
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
          <View style={tw`flex-row justify-between `}>
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
            {/* <ActionButton
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
                /> */}
          </View>
        </View>

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
        type="destination"
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
    padding: 5,
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
    marginBottom: 5,
  },
  label: {
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    borderRadius: 8,
    fontSize: 16,
  },
  // Map Modal Styles
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 5,
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

  historyButton: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  historyText: {
    marginLeft: 4,
    color: '#005FCC',
    fontWeight: '500',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  closeButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
});

export default DropModal;
