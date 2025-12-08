import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useGetStateQuery,
  useUpdateCustomerMutation,
} from '@api/hooks_api';

import { SelectList } from '@components/common/Select';
import { RegisterRequest } from '@api/api.type';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';

import { styles } from './style';
import { setRegisteredAddress } from '@store/slices/authSlice';
import AddressSearch from '@screens/LoadPostScreen/components/AddressSearch';
import { useDispatch } from 'react-redux';

const EditCustomerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const customer = route.params?.customer; // Correct key
  // console.log('Editing Customer:', customer);

  const [updateCustomer] = useUpdateCustomerMutation();
  const { data: stateData } = useGetStateQuery();
  const [getDistricts] = useGetDistrictMutation();
  const [pincodeData] = useGetPincodeDataMutation();

  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const originPlaces = useGooglePlacesSelect();

  // Prefilled form
  const [formData, setFormData] = useState<RegisterRequest>({
    ...customer,
    RegisteredAddress: customer?.RegisteredAddress || null,
  });

  console.log(formData);
  /** Load districts when screen loads */
  useEffect(() => {
    if (customer?.State) {
      getDistricts({ state: customer.State })
        .unwrap()
        .then(res => {
          setAvailableDistricts(res.data || []);
        });
    }
  }, [customer?.State]);

  /** Handle Change */
  const handleChange = async (name: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      RegisteredAddress:
        prev.RegisteredAddress || customer?.RegisteredAddress || null,
    }));

    /** State changed → load districts */
    if (name === 'State') {
      const res = await getDistricts({ state: value }).unwrap();
      setAvailableDistricts(res.data || []);
      setFormData(prev => ({ ...prev, Destination: '' }));
    }

    /** Pincode auto-fill */
    if (name === 'Pincode' && value.length === 6) {
      try {
        const res = await pincodeData({ pincode: value }).unwrap();
        if (res?.data) {
          setFormData(prev => ({
            ...prev,
            Pincode: value,
            State: res.data.State,
            Destination: res.data.District,
          }));

          const distRes = await getDistricts({
            state: res.data.State,
          }).unwrap();

          setAvailableDistricts(distRes.data || []);
        }
      } catch (err) {
        console.log('Pincode Not Found');
      }
    }
  };

  /** Validation */
  const validateForm = () => {
    const requiredFields: Array<keyof RegisterRequest> = [
      'ContactPerson',
      'EmailID',
      'Address1',
      'Pincode',
      'State',
      'City',
    ];

    const newErrors: any = {};
    requiredFields.forEach(key => {
      if (!formData[key]) newErrors[key] = 'Required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Submit */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await updateCustomer(formData).unwrap();
      console.log(response, 'this is reposne for update');

      if (response?.status === '00') {
        Toast.show({
          type: 'success',
          text1: 'Customer updated successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: response?.message || 'Update failed',
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleOriginSelect = useCallback(
    async (placeId: string, description: string) => {
      try {
        const location = await originPlaces.getPlaceDetails(placeId);

        if (!location) return;

        const { place, pincode, state, dist, tal } = location?.components;

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
        Alert.alert('Error', 'Failed to fetch location details');
      }
    },
    [originPlaces, dispatch],
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Edit Customer</Text>

        {/* Personal Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <TextInput
              mode="outlined"
              label="Full Name *"
              value={formData.ContactPerson}
              onChangeText={t => handleChange('ContactPerson', t)}
              error={!!errors.ContactPerson}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            <HelperText type="error">{errors.ContactPerson}</HelperText>

            <TextInput
              mode="outlined"
              label="Company Name"
              value={formData.CompanyName}
              onChangeText={t => handleChange('CompanyName', t)}
              style={styles.input}
              left={<TextInput.Icon icon="office-building" />}
            />

            <TextInput
              mode="outlined"
              label="Email Address *"
              value={formData.EmailID}
              onChangeText={t => handleChange('EmailID', t)}
              style={styles.input}
              error={!!errors.EmailID}
              left={<TextInput.Icon icon="email" />}
            />
          </Card.Content>
        </Card>

        {/* Address */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Address Details</Text>

            <TextInput
              mode="outlined"
              label="Address 1 *"
              value={formData.Address1}
              onChangeText={t => handleChange('Address1', t)}
              style={styles.input}
              error={!!errors.Address1}
            />

            <TextInput
              mode="outlined"
              label="Address 2"
              value={formData.Address2}
              onChangeText={t => handleChange('Address2', t)}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Pincode *"
              value={formData.Pincode}
              onChangeText={t => handleChange('Pincode', t)}
              style={styles.input}
              keyboardType="number-pad"
              error={!!errors.Pincode}
            />

            {/* State */}
            <SelectList
              label="State *"
              data={stateData?.data || []}
              displayKey="state"
              save="state"
              value={formData.State}
              setSelected={v => handleChange('State', v)}
            />
            <HelperText type="error">{errors.State}</HelperText>

            {/* District */}
            <SelectList
              label="District *"
              data={availableDistricts}
              displayKey="region"
              save="region"
              value={formData.City}
              setSelected={v => handleChange('City', v)}
            />
            <HelperText type="error">{errors.City}</HelperText>

            <AddressSearch
              initialAddress={customer?.Address}
              onSelect={handleOriginSelect}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Update Customer
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditCustomerScreen;
