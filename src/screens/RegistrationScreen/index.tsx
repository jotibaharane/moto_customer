import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Provider as PaperProvider,
  Text,
  TextInput,
} from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RegisterRequest } from '@api/api.type';
import {
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useGetStateQuery,
  useInsertCustomerMutation,
} from '@api/hooks_api';

import { SelectList } from '@components/common/Select';
import AddressSearch from '@screens/LoadPostScreen/components/AddressSearch';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import { Snackbar } from 'react-native-paper';

import { RootState } from '@store/index';
import {
  setCustomerDetails,
  setRegisteredAddress,
} from '@store/slices/authSlice';

import { routeName } from '@utils/navigationHelpers';
import { styles as screenStyles } from './style';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';

/* ---------------------------------------------------------------
 * CONSTANTS & INITIAL FORM STATE
 * --------------------------------------------------------------- */

const initialForm: RegisterRequest = {
  CompanyType: '',
  CompanyName: '',
  ContactPerson: '',
  ContactNo: '',
  EmailID: '',
  Address1: '',
  Address2: '',
  Pincode: '',
  Factory: 'N',
  Warehouse: 'N',
  Office: 'N',

  State: '',
  Destination: '',
  City: '',
};

/* ---------------------------------------------------------------
 * REUSABLE UI COMPONENTS
 * --------------------------------------------------------------- */

/** Company Type Selection Buttons */
const CompanyTypeSelector = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (type: 'Individual' | 'Organization') => void;
}) => (
  <View style={localStyles.companyTypeRow}>
    {['Individual', 'Organization'].map(type => (
      <Button
        key={type}
        mode={selected === type ? 'contained' : 'outlined'}
        style={localStyles.companyTypeButton}
        onPress={() => onSelect(type as any)}
      >
        {type}
      </Button>
    ))}
  </View>
);

const AddressTypeSelector = ({
  value,
  onChange,
  error,
}: {
  value: Pick<RegisterRequest, 'Factory' | 'Warehouse' | 'Office'>;
  onChange: (v: Partial<RegisterRequest>) => void;
  error?: string;
}) => {
  const toggle = (key: 'Factory' | 'Warehouse' | 'Office') => {
    onChange({
      [key]: value[key] === 'Y' ? 'N' : 'Y',
    });
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={localStyles.businessTypeLabel}>Pickup Location *</Text>

      <View style={localStyles.businessTypeContainer}>
        {(['Factory', 'Warehouse', 'Office'] as const).map(item => (
          <TouchableOpacity
            key={item}
            style={localStyles.businessTypeItem}
            onPress={() => toggle(item)}
          >
            <Icon
              name={
                value[item] === 'Y'
                  ? 'checkbox-marked'
                  : 'checkbox-blank-outline'
              }
              size={22}
            />
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

/* ---------------------------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------------------------- */

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [snack, setSnack] = useState({
    visible: false,
    message: '',
  });
  const authState = useSelector((s: RootState) => s.auth);
  console.log('Auth State in Registration:', authState);
  const mobilenumber = authState?.mobileNumber ?? '';

  console.log('Mobile Number in Registration Screen:', mobilenumber);

  const modalRef = useRef<BottomModalRef>(null);

  const [registrationMutation] = useInsertCustomerMutation();
  const [pincodeLookup] = useGetPincodeDataMutation();
  const { data: stateData } = useGetStateQuery();
  const [getDistricts] = useGetDistrictMutation();

  const [formData, setFormData] = useState<RegisterRequest>(initialForm);
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const originPlaces = useGooglePlacesSelect();
  const [addressTypeUI, setAddressTypeUI] = useState({
    Factory: 'N',
    Warehouse: 'N',
    Office: 'N',
  });

  /* -------------------------------------------------------------
   * EFFECT: Clear company name when switching to Individual
   * ------------------------------------------------------------- */
  useEffect(() => {
    if (formData.CompanyType === 'Individual' && formData.CompanyName) {
      setFormData(prev => ({ ...prev, CompanyName: '' }));
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.CompanyName;
        return updated;
      });
    }
  }, [formData.CompanyType]);
  useEffect(() => {
    if (mobilenumber) {
      setFormData(prev => ({
        ...prev,
        ContactNo: mobilenumber,
      }));
    }
  }, [mobilenumber]);
  const showSnack = (message: string) => {
    setSnack({ visible: true, message });
  };

  const hideSnack = () => {
    setSnack(prev => ({ ...prev, visible: false }));
  };

  /* -------------------------------------------------------------
   * HANDLERS
   * ------------------------------------------------------------- */

  const handleChange = async (
    name: keyof RegisterRequest,
    value: string,
  ): Promise<void> => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-load districts when state changes
    if (name === 'State') {
      try {
        const response = await getDistricts({ state: value }).unwrap();
        setAvailableDistricts(response?.data || []);
        setFormData(prev => ({ ...prev, Destination: '' }));
      } catch (err) {
        console.warn('District fetch error', err);
      }
    }

    // Auto-fill state & district from pincode
    if (name === 'Pincode' && value.length === 6) {
      try {
        const response = await pincodeLookup({ pincode: value }).unwrap();
        const mapped = response?.data;

        if (!mapped) return setAvailableDistricts([]);

        setFormData(prev => ({
          ...prev,
          Pincode: value,
          State: mapped.State || prev.State,
          Destination: mapped.District || prev.Destination,
        }));

        const districtRes = await getDistricts({
          state: mapped.State,
        }).unwrap();

        setAvailableDistricts(districtRes?.data ?? []);
      } catch (err) {
        console.warn('Pincode lookup error', err);
      }
    }
  };

  const handleOriginSelect = useCallback(
    async (placeId: string, description: string) => {
      try {
        const location = await originPlaces.getPlaceDetails(placeId);

        if (!location) return;

        const { place, pincode, state, dist, tal } = location.components;

        const registeredAddressObj = {
          id: placeId,
          fullAddress: location.address,
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          addressComponents: {
            place: place || '',
            dist: dist || '',
            tal: tal || '',
            state: state || '',
            pincode: pincode || '',
          },
        };

        // ---- UPDATE FORM DATA ----
        setFormData(prev => ({
          ...prev,

          Pincode: pincode || prev.Pincode,
          State: state || prev.State,
          Destination: dist || prev.Destination,
          City: tal || prev.City,

          // ⭐ store FULL location object
          RegisteredAddress: registeredAddressObj,
        }));

        // ---- SAVE TO REDUX ----zz
        dispatch(setRegisteredAddress(registeredAddressObj));
      } catch (error) {
        console.log('Location Fetch Error:', error);
        showSnack('Failed to fetch location details');
      }
    },
    [originPlaces, dispatch],
  );
  /* -------------------------------------------------------------
   * VALIDATION
   * ------------------------------------------------------------- */

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.CompanyType) {
      newErrors.CompanyType = 'Company type is required';
    }

    if (!formData.ContactPerson) {
      newErrors.ContactPerson = 'Full name is required';
    }

    if (!formData.EmailID) {
      newErrors.EmailID = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.EmailID)) {
      newErrors.EmailID = 'Invalid email format';
    }

    if (!formData.Address1) {
      newErrors.Address1 = 'Address is required';
    }

    if (!formData.Pincode || !/^\d{6}$/.test(formData.Pincode)) {
      newErrors.Pincode = 'Valid 6-digit pincode required';
    }

    if (!formData.State) {
      newErrors.State = 'State is required';
    }

    if (!formData.Destination) {
      newErrors.Destination = 'District is required';
    }

    // ✅ CORRECT Address Type validation
    if (
      formData.Factory === 'N' &&
      formData.Warehouse === 'N' &&
      formData.Office === 'N'
    ) {
      setErrors(prev => ({
        ...prev,
        Factory: 'Select at least one pickup location',
      }));
      return false;
    }

    if (formData.CompanyType === 'Organization' && !formData.CompanyName) {
      newErrors.CompanyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------------------------------------------------
   * SUBMIT
   * ------------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload: RegisterRequest = {
        ...formData,
        ContactNo: mobilenumber || '',
      };

      console.log('FINAL PAYLOAD 👉', payload);

      const response = await registrationMutation(payload).unwrap();

      if (response?.status === '00') {
        dispatch(
          setCustomerDetails({
            CustomerID: response.Customer_Details?.CustomerID || '',
            CompanyName: response.Customer_Details?.CompanyName || '',
            ContactPerson: response.Customer_Details?.ContactPerson || '',
            EmailID: response.Customer_Details?.EmailID || '',
            ContactNo: response.Customer_Details?.ContactNo || '',
            MPIN_Flag: 'N',
          }),
        );

        navigation.replace(
          formData.CompanyType === 'Individual'
            ? routeName.INDIVIDUAL
            : routeName.ADD_EMPLOYEE,
        );
      } else {
        Alert.alert(
          'Registration Failed',
          response?.message || 'Please try again later',
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err?.data?.message || 'Internal server error',
      );
    }
  };

  /* -------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------- */

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[screenStyles.container, { paddingTop: insets.top }]}
      >
        <ScrollView
          contentContainerStyle={screenStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={screenStyles.header}>Customer Registration</Text>

          {/* Personal Information */}
          <Card style={screenStyles.card}>
            <Card.Content>
              {/* Company Type */}
              <CompanyTypeSelector
                selected={formData.CompanyType}
                onSelect={type => {
                  setFormData(prev => ({
                    ...prev,
                    CompanyType: type,
                    ...(type === 'Individual' && { CompanyName: '' }),
                  }));
                  setErrors(prev => {
                    const updated = { ...prev };
                    delete updated.CompanyType;
                    delete updated.CompanyName;
                    return updated;
                  });
                }}
              />

              <HelperText type="error" visible={!!errors.CompanyType}>
                {errors.CompanyType}
              </HelperText>

              <Text style={screenStyles.sectionTitle}>
                Personal Information
              </Text>

              {/* Full Name */}
              <TextInput
                mode="outlined"
                label="Full Name *"
                value={formData.ContactPerson}
                onChangeText={text => handleChange('ContactPerson', text)}
                error={!!errors.ContactPerson}
                style={screenStyles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.ContactPerson}>
                {errors.ContactPerson}
              </HelperText>

              {/* Company Name */}
              {formData.CompanyType === 'Organization' && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Organization Name *"
                    value={formData.CompanyName}
                    onChangeText={text => handleChange('CompanyName', text)}
                    error={!!errors.CompanyName}
                    style={screenStyles.input}
                    theme={{ roundness: 8 }}
                    left={<TextInput.Icon icon="office-building" />}
                  />
                  <HelperText type="error" visible={!!errors.CompanyName}>
                    {errors.CompanyName}
                  </HelperText>
                </>
              )}

              {/* Contact Number */}
              <TextInput
                mode="outlined"
                label="Contact Number *"
                value={formData.ContactNo}
                editable={false}
                style={screenStyles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="phone" />}
              />
              <HelperText type="error" visible={!!errors.ContactNo}>
                {errors.ContactNo}
              </HelperText>

              {/* Email */}
              <TextInput
                mode="outlined"
                label="Email Address *"
                value={formData.EmailID}
                onChangeText={text => handleChange('EmailID', text)}
                keyboardType="email-address"
                error={!!errors.EmailID}
                style={screenStyles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={!!errors.EmailID}>
                {errors.EmailID}
              </HelperText>
            </Card.Content>
          </Card>

          {/* Business Type (Only for Organization) */}
          {/*  {formData.CompanyType === 'Organization' && (
            <AddressTypeSelector
              value={{
                Factory: formData.Factory,
                Warehouse: formData.Warehouse,
                Office: formData.Office,
              }}
              onChange={val =>
                setFormData(prev => ({
                  ...prev,
                  ...val,
                }))
              }
              error={errors.Factory}
            />
          )}

          {/* ADDRESS SECTION */}
          <Card style={screenStyles.card}>
            <Card.Content>
              <Text style={screenStyles.sectionTitle}>Address Details</Text>

              {/* Address Line 1 */}
              <TextInput
                mode="outlined"
                label="Building, Apartment, Plot Number *"
                value={formData.Address1}
                onChangeText={text => handleChange('Address1', text)}
                error={!!errors.Address1}
                style={screenStyles.input}
                theme={{ roundness: 8 }}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="home" />}
              />
              <HelperText type="error" visible={!!errors.Address1}>
                {errors.Address1}
              </HelperText>

              {/* Address Line 2 */}
              <TextInput
                mode="outlined"
                label="Street,Area,Sector,Village"
                value={formData.Address2}
                onChangeText={text => handleChange('Address2', text)}
                style={screenStyles.input}
                theme={{ roundness: 8 }}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="home" />}
              />

              {/* Pincode + City */}
              <View style={screenStyles.row}>
                <View style={screenStyles.halfInput}>
                  <TextInput
                    mode="outlined"
                    label="Pincode *"
                    value={formData.Pincode}
                    onChangeText={text => handleChange('Pincode', text)}
                    keyboardType="number-pad"
                    error={!!errors.Pincode}
                    style={screenStyles.input}
                  />
                  <HelperText type="error" visible={!!errors.Pincode}>
                    {errors.Pincode}
                  </HelperText>
                </View>

                <View style={screenStyles.halfInput}>
                  <TextInput
                    mode="outlined"
                    label="Town/Tahsil"
                    value={formData.City}
                    onChangeText={text => handleChange('City', text)}
                    style={screenStyles.input}
                    theme={{ roundness: 8 }}
                  />
                </View>
              </View>

              {/* State */}
              <SelectList
                label="State *"
                data={stateData?.data || []}
                displayKey="state"
                save="state"
                value={formData.State}
                setSelected={(val: any) => handleChange('State', val)}
                placeholder="Select State"
                onClear={() => handleChange('State', '')}
              />
              <HelperText type="error" visible={!!errors.State}>
                {errors.State}
              </HelperText>

              {/* District */}
              <SelectList
                label="District / City *"
                data={availableDistricts}
                displayKey="region"
                save="region"
                value={formData.Destination}
                setSelected={(val: any) => handleChange('Destination', val)}
                placeholder="Select District"
                onClear={() => handleChange('Destination', '')}
                disabled={!formData.State}
              />
              <HelperText type="error" visible={!!errors.Destination}>
                {errors.Destination}
              </HelperText>

              <AddressSearch onSelect={handleOriginSelect} />
            </Card.Content>
          </Card>

          {/* SUBMIT BUTTON */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={screenStyles.submitButton}
            labelStyle={screenStyles.submitButtonText}
            contentStyle={screenStyles.submitButtonContent}
          >
            Register Now
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={snack.visible} onDismiss={hideSnack} duration={3000}>
        {snack.message}
      </Snackbar>
    </PaperProvider>
  );
};

export default RegistrationScreen;

/* ---------------------------------------------------------------
 * LOCAL STYLES
 * --------------------------------------------------------------- */

const localStyles = StyleSheet.create({
  businessTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  companyTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  companyTypeButton: {
    flex: 1,
  },

  businessTypeLabel: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
  },

  businessTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // EVEN SPACING
    alignItems: 'center',
    paddingVertical: 5,
  },

  businessTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // SPACE BETWEEN ICON & TEXT
  },

  businessTypeText: {
    fontSize: 15,
  },
});
