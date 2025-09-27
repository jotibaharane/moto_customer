import { RegisterRequest } from '@api/api.type';
import {
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useGetStateQuery,
  useInsertCustomerMutation,
} from '@api/hooks_api';

import { SelectList } from '@components/common/Select';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import { setCustomerDetails } from '@store/slices/authSlice';
import { routeName } from '@utils/navigationHelpers';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Provider as PaperProvider,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './style';

const RegistrationScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const res = useSelector((state: RootState) => state?.auth);
  const mobilenumber = res?.mobileNumber;
  const [Registration] = useInsertCustomerMutation();
  const [pincodeData] = useGetPincodeDataMutation();
  const { data: stateData } = useGetStateQuery();
  const [getDistricts] = useGetDistrictMutation();
  const [formData, setFormData] = useState<RegisterRequest>({
    CompanyType: '',
    CompanyName: '',
    ContactPerson: '',
    ContactNo: '',
    EmailID: '',
    Address1: '',
    Address2: '',
    Pincode: '',
    State: '',
    Destination: '',
    AadharNo: '',
    GstNo: '',
    PancardNo: '',
    City: '',
  });
  console.log({ stateData });
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);

  const handleChange = async (name: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'State') {
      const response = await getDistricts({ state: value }).unwrap();

      const districtsList = response?.data || [];
      setAvailableDistricts(districtsList);
      setFormData(prev => ({ ...prev, Destination: '' }));
    }

    if (name === 'Pincode' && value.length === 6) {
      const response = await pincodeData({ pincode: value }).unwrap();

      const mapped = response?.data;
      if (mapped) {
        setFormData(prev => ({
          ...prev,
          Pincode: value,
          State: mapped?.State,
          Destination: mapped?.District,
        }));
        const response = await getDistricts({ state: mapped?.State }).unwrap();

        setAvailableDistricts(response?.data ? response?.data : []);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};
    const requiredFields: Array<keyof RegisterRequest> = [
      'ContactPerson',
      'EmailID',
      'Address1',
      'Pincode',
      'State',
      'Destination',
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.EmailID && !/^\S+@\S+\.\S+$/.test(formData.EmailID)) {
      newErrors.EmailID = 'Invalid email format';
    }

    if (formData.Pincode && !/^\d{6}$/.test(formData.Pincode)) {
      newErrors.Pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (validateForm()) {
        console.log('Submitting:', formData);
        const response = await Registration({
          ...formData,
          ContactNo: mobilenumber || '',
        });
        console.log({ response });
        if (response?.data?.status === '00') {
          dispatch(
            setCustomerDetails({
              CustomerID: response?.data?.Customer_Details?.CustomerID || '',
              CompanyName: response?.data?.Customer_Details?.CompanyName || '',
              ContactPerson:
                response?.data?.Customer_Details?.ContactPerson || '',
              EmailID: response?.data?.Customer_Details?.EmailID || '',
              ContactNo: response?.data?.Customer_Details?.ContactNo || '',
              MPIN_Flag: 'N',
            }),
          );
          navigation.replace(routeName.SET_MPIN);
        } else {
          Toast.show({ type: 'error', text1: response?.data?.message });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.container,
          { paddingTop: Platform.OS === 'android' ? insets.top : 0 },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Customer Registration</Text>

          {/* ------- Personal Information -------- */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <TextInput
                mode="outlined"
                label="Full Name *"
                value={formData.ContactPerson}
                onChangeText={text => handleChange('ContactPerson', text)}
                error={!!errors.ContactPerson}
                style={styles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.ContactPerson}>
                {errors.ContactPerson}
              </HelperText>

              <TextInput
                mode="outlined"
                label="Company Name"
                value={formData.CompanyName}
                onChangeText={text => handleChange('CompanyName', text)}
                style={styles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="office-building" />}
              />

              <TextInput
                mode="outlined"
                label="Contact Number *"
                value={mobilenumber || ''}
                keyboardType="phone-pad"
                error={!!errors.ContactNo}
                style={styles.input}
                theme={{ roundness: 8 }}
                editable={false}
                left={<TextInput.Icon icon="phone" />}
              />
              <HelperText type="error" visible={!!errors.ContactNo}>
                {errors.ContactNo}
              </HelperText>

              <TextInput
                mode="outlined"
                label="Email Address *"
                value={formData.EmailID}
                onChangeText={text => handleChange('EmailID', text)}
                keyboardType="email-address"
                error={!!errors.EmailID}
                style={styles.input}
                theme={{ roundness: 8 }}
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={!!errors.EmailID}>
                {errors.EmailID}
              </HelperText>
            </Card.Content>
          </Card>

          {/* ------- Address Section -------- */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Address Details</Text>

              <TextInput
                mode="outlined"
                label="Building, Apartment, Plot Number *"
                value={formData.Address1}
                onChangeText={text => handleChange('Address1', text)}
                error={!!errors.Address1}
                style={styles.input}
                theme={{ roundness: 8 }}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="home" />}
              />
              <HelperText type="error" visible={!!errors.Address1}>
                {errors.Address1}
              </HelperText>

              <TextInput
                mode="outlined"
                label="Area, Street, Sector, Village *"
                value={formData.Address2}
                onChangeText={text => handleChange('Address2', text)}
                style={styles.input}
                theme={{ roundness: 8 }}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="map-marker" />}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    mode="outlined"
                    label="Pincode *"
                    value={formData.Pincode}
                    onChangeText={text => handleChange('Pincode', text)}
                    keyboardType="number-pad"
                    error={!!errors.Pincode}
                    style={styles.input}
                    theme={{ roundness: 8 }}
                    left={<TextInput.Icon icon="pin" />}
                  />
                  <HelperText type="error" visible={!!errors.Pincode}>
                    {errors.Pincode}
                  </HelperText>
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    mode="outlined"
                    label="Town/Tahsil"
                    value={formData.City}
                    onChangeText={text => handleChange('City', text)}
                    style={styles.input}
                    theme={{ roundness: 8 }}
                    left={<TextInput.Icon icon="city" />}
                  />
                </View>
              </View>

              {/* ✅ State SelectList */}
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

              {/* ✅ District SelectList */}
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
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
            contentStyle={styles.submitButtonContent}
          >
            Register Now
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

export default RegistrationScreen;
