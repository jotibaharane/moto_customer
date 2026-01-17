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
import {
  TextInput,
  HelperText,
  Button,
  Card,
  Divider,
} from 'react-native-paper';
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
  const [fieldName, setFieldName] = useState<'pickup' | 'delivery' | ''>('');
  const [activeDestinationButton, setActiveDestinationButton] =
    useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: stateData } = useGetStateQuery();
  const [getDistricts] = useGetDistrictMutation();
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const { currentData } = useGetCurrentAddressQuery<any>();
  const destinationPlaces = useGooglePlacesSelect();

  type FieldErrors = {
    consigneeName?: string;
    contactPerson?: string;
    contactNumber?: string;
    pincode?: string;
    state?: string;
    district?: string;
    taluka?: string;
    plotOrBuilding?: string;
    streetArea?: string;
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
        setFieldValue('delivery.destination', location);
        // Update map region if needed
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
    setFieldValue('delivery.consigneeName', item.consigneeName || '');
    setFieldValue('delivery.contactNumber', item.contactNumber || '');
    setFieldValue('delivery.contactPerson', item.contactPerson || '');

    // Address fields
    setFieldValue('delivery.plotOrBuilding', item.plotOrBuilding || '');
    setFieldValue('delivery.streetArea', item.streetArea || '');

    // Extract pincode from item.address or database field
    const pincode = item.Pincode || item.address?.match(/\b\d{6}\b/)?.[0] || '';

    setFieldValue('delivery.pincode', pincode);

    // Set district + state if present
    setFieldValue('delivery.district', item.district || '');
    setFieldValue('delivery.taluka', item.taluka || '');
    setFieldValue('delivery.state', item.state || '');

    // Google-like structure for destination
    setFieldValue('delivery.destination', {
      address: item.address || '',
      components: {
        dist: item.district || '',
        pincode: pincode,
        place: item.place || item.city || item.district || '',
        state: item.state || '',
        tal: item.taluka || '',
      },
      coordinates: {
        lat: item.latitude || 0,
        lng: item.longitude || 0,
      },
    });

    // Close modal
    setShowHistoryModal(false);
    setActiveDestinationButton('');
  };
  const handleModalClose = useCallback(() => {
    setActiveDestinationButton('');
    setShowMap(false);
    setShowHistoryModal(false);
    setFieldName('');
    setIsModalOpen(false);
    bottomModalRef.current?.close();
  }, []);

  const handleConfirm = useCallback(() => {
    const newErrors: any = {};

    if (!values.delivery.consigneeName && !values.delivery.contactPerson) {
      newErrors.consigneeName =
        'Either Consignee/Company Name or Contact Person Name is required';
      newErrors.contactPerson =
        'Either Consignee/Company Name or Contact Person Name is required';
    }
    if (!values.delivery.destination?.address)
      newErrors.destination = 'Please select a drop-off location';
    if (!values.delivery.pincode || values.delivery.pincode.length !== 6)
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    if (!values.delivery.state) newErrors.state = 'Please select a state';
    if (!values.delivery.district)
      newErrors.district = 'Please select a district';

    if (!values.delivery.plotOrBuilding)
      newErrors.plotOrBuilding = 'Please enter a valid destination';
    if (!values.delivery.streetArea)
      newErrors.streetArea = 'Please enter a valid destination';

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
        setFieldValue('delivery.state', value);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    },
    [getDistricts, setFieldValue],
  );

  const handlePinchange = useCallback(
    async (value: string) => {
      setFieldValue('delivery.pincode', value);
      if (value.length === 6) {
        try {
          const response = await PincodeData({ pincode: value }).unwrap();
          const mapped = response?.data;
          if (mapped) {
            setFieldValue('delivery.state', mapped?.State);
            setFieldValue('delivery.district', mapped?.District);

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
        <Card style={styles.mapHeader}>
          <Card.Content style={styles.mapHeaderContent}>
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
          </Card.Content>
        </Card>

        <PickupModal
          // Use pincodeCoords if available, otherwise fallback to Formik destination coordinates
          pincodeCoords={
            pincodeCoords ||
            (values.delivery.destination?.coordinates?.lat
              ? {
                  latitude: values.delivery.destination.coordinates.lat,
                  longitude: values.delivery.destination.coordinates.lng,
                }
              : null)
          }
          onLocationSelected={location => {
            setFieldValue('delivery.destination', {
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
                pincode: '',
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
      <ScrollView style={styles.container}>
        {/* Header */}
        <Card style={styles.header}>
          <Card.Content style={styles.headerContent}>
            <View style={tw`flex-row justify-between items-center`}>
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
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Consignee / Company Name *"
              style={styles.input}
              placeholder="Enter consignee name"
              value={values.delivery.consigneeName}
              error={!!fieldErrors.consigneeName}
              onChangeText={text => {
                setFieldValue('delivery.consigneeName', text);

                if (fieldErrors.consigneeName || fieldErrors.contactPerson) {
                  setFieldErrors(prev => ({
                    ...prev,
                    consigneeName: '',
                    contactPerson: '',
                  }));
                }
              }}
            />
            {fieldErrors.consigneeName && (
              <HelperText type="error" visible={true}>
                {fieldErrors.consigneeName}
              </HelperText>
            )}

            <TextInput
              mode="outlined"
              label="Contact Person Name *"
              style={styles.input}
              placeholder="Enter Contact Person name"
              value={values.delivery.contactPerson}
              error={!!fieldErrors.contactPerson}
              onChangeText={text => {
                setFieldValue('delivery.contactPerson', text);

                if (fieldErrors.consigneeName || fieldErrors.contactPerson) {
                  setFieldErrors(prev => ({
                    ...prev,
                    consigneeName: '',
                    contactPerson: '',
                  }));
                }
              }}
            />
            {fieldErrors.contactPerson && (
              <HelperText type="error" visible={true}>
                {fieldErrors.contactPerson}
              </HelperText>
            )}
            <TextInput
              mode="outlined"
              label="Contact Mobile Number *"
              style={styles.input}
              placeholder="Enter mobile number"
              value={values.delivery.contactNumber}
              onChangeText={text => {
                setFieldValue('delivery.contactNumber', text);
                if (fieldErrors.contactNumber) {
                  setFieldErrors(prev => ({
                    ...prev,
                    contactNumber: '',
                  }));
                }
              }}
              keyboardType="numeric"
              maxLength={10}
              error={!!fieldErrors.contactNumber}
            />
            {fieldErrors.contactNumber && (
              <HelperText type="error" visible={true}>
                {fieldErrors.contactNumber}
              </HelperText>
            )}

            <View style={tw`flex-row gap-3 mb-4`}>
              <View style={tw`flex-1`}>
                <TextInput
                  mode="outlined"
                  label="Pincode *"
                  style={styles.input}
                  placeholder="Enter Pincode"
                  value={values.delivery.pincode}
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

              <View style={tw`flex-1 mt-2`}>
                {/* <Text style={tw`text-gray-700 mb-1`}>State *</Text> */}
                <SelectList
                  data={stateData?.data || []}
                  displayKey="state"
                  save="state"
                  value={values.delivery.state}
                  setSelected={value => {
                    handleState(value);
                    if (fieldErrors.state) {
                      setFieldErrors(prev => ({ ...prev, state: '' }));
                    }
                  }}
                  placeholder="Select State"
                  onClear={() => setFieldValue('delivery.state', '')}
                  inputStyles={tw`border-gray-200`}
                  style={
                    fieldErrors.state && { borderColor: 'red', borderWidth: 1 }
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
                {/* <Text style={tw`text-gray-700 mb-1`}>District / City *</Text> */}
                <SelectList
                  data={availableDistricts}
                  displayKey="region"
                  save="region"
                  value={values.delivery.district}
                  setSelected={val => setFieldValue('delivery.district', val)}
                  placeholder="Select District"
                  onClear={() => setFieldValue('delivery.district', '')}
                  disabled={!values.delivery.state}
                  inputStyles={tw`border-gray-200`}
                />
              </View>

              <View style={tw`flex-1 mb-2`}>
                <TextInput
                  mode="outlined"
                  label="Taluka / Town"
                  style={styles.input}
                  placeholder="Enter Taluka"
                  value={values.delivery.taluka}
                  error={!!fieldErrors.taluka}
                  onChangeText={text => {
                    setFieldValue('delivery.taluka', text);
                    if (fieldErrors.taluka) {
                      setFieldErrors(prev => ({ ...prev, taluka: '' }));
                    }
                  }}
                />
                {fieldErrors.taluka && (
                  <HelperText type="error" visible={true}>
                    {fieldErrors.taluka}
                  </HelperText>
                )}
              </View>
            </View>

            <TextInput
              mode="outlined"
              label="Plot No/ Unit No/ Building / Flat / Company"
              style={styles.input}
              placeholder="Enter plot/unit number"
              value={values.delivery.plotOrBuilding}
              error={!!fieldErrors.plotOrBuilding}
              onChangeText={text => {
                setFieldValue('delivery.plotOrBuilding', text);

                // ✅ clear error when user starts typing
                if (fieldErrors.plotOrBuilding) {
                  setFieldErrors(prev => ({
                    ...prev,
                    plotOrBuilding: '',
                  }));
                }
              }}
            />
            {fieldErrors.plotOrBuilding && (
              <HelperText type="error" visible={true}>
                {fieldErrors.plotOrBuilding}
              </HelperText>
            )}

            <TextInput
              mode="outlined"
              label="Area/Street/Sector/Village"
              style={styles.input}
              placeholder="Enter area details"
              value={values.delivery.streetArea}
              error={!!fieldErrors.streetArea}
              onChangeText={text => {
                setFieldValue('delivery.streetArea', text);

                // ✅ clear error when user starts typing
                if (fieldErrors.streetArea) {
                  setFieldErrors(prev => ({
                    ...prev,
                    streetArea: '',
                  }));
                }
              }}
            />
            {fieldErrors.streetArea && (
              <HelperText type="error" visible={true}>
                {fieldErrors.streetArea}
              </HelperText>
            )}

            <Text style={tw`text-gray-700 mb-2`}>Delivery Location</Text>
            <SelectList
              data={destinationPlaces?.suggestions}
              displayKey="value"
              value={values.delivery.destination?.address}
              save="object"
              setSelected={handleDestinationSelect}
              placeholder="Google Address"
              search={true}
              onSearchChange={destinationPlaces.handleInputChange}
              searchValue={destinationPlaces.inputValue}
              onClear={() => {
                setFieldValue('delivery.destination', {
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

            <View style={tw`flex-row justify-between mt-4`}>
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
                  setFieldName('delivery');
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
            </View>
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
                Confirm Drop
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 8,
  },
  footerContent: {
    padding: 16,
  },
  cancelButton: {
    minWidth: 100,
  },
  confirmButton: {
    minWidth: 100,
  },
  inputGroup: {
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  // Map Modal Styles
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
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  historyButton: {
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
});

export default DropModal;
