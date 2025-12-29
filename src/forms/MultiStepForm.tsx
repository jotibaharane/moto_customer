// MultiStepFormTabs.tsx
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Step1_VehicleCustomer from './Step1_VehicleCustomer';
import Step2_CargoInvoice from './Step2_CargoInvoice';
import Step3_FreightDetails from './Step3_FreightDetails';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useGetcustomerloadpostdetailsQuery } from '@api/hooks_api';
import { useUpdateloadpostMutation } from '@api/hooks_api';
import LoadpostDropdown from '@components/common/DropDown/LoadpostDropdown';
import { useInsertVehicleloadpostdatasheetMutation } from '@api/hooks_api';

// Import types
import {
  FormikValues,
  LoadPostData,
  DropdownItem,
  LoadPostApiPayload,
} from '../forms/api.types';

// ========== DUMMY DATA ==========
const DUMMY_DATA: LoadPostData[] = [
  {
    LoadPostID: 'LP721277',
    full_name: 'RAIS AHMED SHAH',
    MobileNo: '8779239065',
    Vehcile_No: 'MH12DE1433',
    Origin: '825H+JJ Bhiwandi, Maharashtra, India',
    Origin_City: 'Bhiwandi',
    Origin_State: 'Maharashtra',
    Origin_Pincode: '421302',
    Destination:
      'J6V9+2MW, Ratan Lal Market, Kaseru Walan, Ajmeri Gate, New Delhi, Delhi, 110055, India',
    Destination_City: 'New Delhi',
    Destination_State: 'Delhi',
    Destination_Pincode: '110055',
    BodyType: 'Multiaxel Trailer',
    CargoContent: 'Agro',
    CargoPackageType: 'Corrugated Boxes',
    VehicleType: 'Multi Axle',
    Weight: '12500-18000kg',
    Approximate_weight: '200',
  },
  // ... other dummy data
];

// ========== HELPER FUNCTIONS ==========
const transformToDropdownItems = (data: LoadPostData[]): DropdownItem[] => {
  return data.map(item => ({
    loadPostId: item.LoadPostID,
    pickupCity: item.Origin_City,
    dropCity: item.Destination_City,
    pickupName: item.full_name,
    full: item,
  }));
};

const mapApiDataToFormik = (item: LoadPostData): Partial<FormikValues> => ({
  // Pickup Details
  pickupName: item.full_name || '',
  pickupPhone: item.MobileNo || '',
  pickupAddress1: item.Origin || '',
  pickupAddress2: '',
  pickupGoogle: item.Origin || '',
  pickupCity: item.Origin_City || '',
  pickupState: item.Origin_State || '',
  pickupPincode: item.Origin_Pincode || '',
  pickupGst: '27AAACR5055M1ZP',
  pickupDistrict: 'Thane',
  pickupTaluka: '',
  pickupLat: 0,
  pickupLng: 0,

  // Drop Details
  dropName: item.full_name || '',
  dropPhone: item.MobileNo || '',
  dropAddress1: item.Destination || '',
  dropAddress2: '',
  dropGoogle: item.Destination || '',
  dropCity: item.Destination_City || '',
  dropState: item.Destination_State || '',
  dropPincode: item.Destination_Pincode || '',
  dropGst: '07AABCS1429M1ZQ',
  dropDistrict: 'Central Delhi',
  dropTaluka: '',
  dropLat: 0,
  dropLng: 0,

  // Vehicle & Cargo Details
  bodyType: item.BodyType || '',
  cargoContent: item.CargoContent || '',
  packageType: item.CargoPackageType || '',
  dhalaLength: '',
  Approximate_weight: item.Approximate_weight || '',
  netWeight: item.Weight || '',
  grossWeight: item.Weight || '',
  VehicleType: item.VehicleType || '',

  // Driver Details
  driverName: item.full_name || '',
  driverNumber: item.MobileNo || '',
  vehicleNo: item.Vehcile_No || '',
});

// ========== API PAYLOAD TRANSFORMATION ==========
const transformToApiPayload = (
  values: FormikValues,
  selectedLoadPostId: string,
): LoadPostApiPayload => {
  // Get CustomerID from Redux store or use default
  const customerID =
    useSelector((state: RootState) => state.auth.customerId) || 'CM123456';

  return {
    LoadPostID: selectedLoadPostId || 'LP999888',
    CustomerID: customerID,

    consigner: {
      consigner_name: values.pickupName || '',
      consigner_gst: values.pickupGst || '',
      consigner_address:
        `${values.pickupAddress1} ${values.pickupAddress2}`.trim(),
      consigner_pincode: values.pickupPincode || '',
      consigner_origin: values.pickupCity || '',
      consigner_state: values.pickupState || '',

      pickup: {
        pickup_plot_unit: values.pickupAddress1 || '',
        pickup_area_street: values.pickupAddress2 || '',
        pickup_pincode: values.pickupPincode || '',
        pickup_state: values.pickupState || '',
        pickup_district: values.pickupDistrict || '',
        pickup_taluka: values.pickupTaluka || '',
        pickup_map_location: values.pickupGoogle || '',
        pickup_Lat: values.pickupLat || 0,
        pickup_Lng: values.pickupLng || 0,
      },
    },

    consignee: {
      consignee_name: values.dropName || '',
      consignee_gst: values.dropGst || '',
      consignee_address: `${values.dropAddress1} ${values.dropAddress2}`.trim(),
      consignee_pincode: values.dropPincode || '',
      consignee_destination: values.dropCity || '',
      consignee_state: values.dropState || '',

      drop: {
        drop_plot_unit: values.dropAddress1 || '',
        drop_area_street: values.dropAddress2 || '',
        drop_pincode: values.dropPincode || '',
        drop_state: values.dropState || '',
        drop_district: values.dropDistrict || '',
        drop_taluka: values.dropTaluka || '',
        drop_map_location: values.dropGoogle || '',
        drop_Lat: values.dropLat || 0,
        drop_Lng: values.dropLng || 0,
      },
    },

    cargo: {
      cargo_content: values.cargoContent || '',
      package_type: values.packageType || '',
      package_name: values.packageNote || '',
    },

    PO: {
      po_number: values.poNo || '',
      po_date: values.poDate || '',
    },

    weight: {
      No_of_package: values.freightDetails?.noOfPackages || '0',
      net_weight: values.freightDetails?.netQuantity || values.netWeight || '0',
      approx_weight: values.Approximate_weight || '0',
      gross_weight:
        values.freightDetails?.grossWeight || values.grossWeight || '0',
    },

    charges: {
      freightAmount: values.freightDetails?.freightAmount || '0',
      loadingcharge: values.freightDetails?.loading || '0',
      unloadingcharge: values.freightDetails?.unloading || '0',
      LRcharge: values.freightDetails?.lrCharges || '0',
      othercharge: values.freightDetails?.otherCharges || '0',
      otherchargelabel: values.freightDetails?.otherChargesLabel || '',
      Advance: values.freightDetails?.advance || '0',
    },

    lr_no: values.lr_no || '',
    lr_date: values.lr_date || '',

    invoiceDetails: (values.invoices || []).map(inv => ({
      invoice_number: inv.invoiceNo || '',
      invoice_date: inv.invoiceDate || '',
      Unit: inv.unit || '',
      quantity: inv.quantity || '',
      value_amount: inv.value || '',
      invoice_img: inv.image || '',
      remarks: '',
    })),

    challanDetails: (values.challans || []).map(ch => ({
      challan_number: ch.challanNo || '',
      challan_date: ch.challanDate || '',
      Unit: ch.unit || '',
      quantity: ch.quantity || '',
      value_amount: ch.value || '',
      challan_img: ch.image || '',
      remarks: '',
    })),
  };
};

// ========== INITIAL VALUES ==========
const initialValues: FormikValues = {
  vehicleNo: '',
  driverName: '',
  driverNumber: '',
  loadPosDate: '',
  customerName: '',

  // Pickup Details
  pickupName: '',
  pickupPhone: '',
  pickupGst: '',
  pickupAddress1: '',
  pickupAddress2: '',
  pickupPincode: '',
  pickupCity: '',
  pickupState: '',
  pickupDistrict: '',
  pickupTaluka: '',
  pickupGoogle: '',
  pickupLat: 0,
  pickupLng: 0,

  // Drop Details
  dropName: '',
  dropPhone: '',
  dropGst: '',
  dropAddress1: '',
  dropAddress2: '',
  dropPincode: '',
  dropCity: '',
  dropState: '',
  dropDistrict: '',
  dropTaluka: '',
  dropGoogle: '',
  dropLat: 0,
  dropLng: 0,

  // Vehicle & Cargo
  VehicleType: '',
  bodyType: '',
  cargoContent: '',
  packageType: '',
  packageNote: '',
  dhalaLength: '',
  Approximate_weight: '',

  // PO
  poNo: '',
  poDate: '',

  // Arrays
  invoices: [],
  challans: [],
  cargo: [],
  packaging: [],
  // freightDetailsArray: [],

  // Weight
  netWeight: '',
  grossWeight: '',

  // Freight Details
  freightDetails: {
    noOfPackages: '0',
    netQuantity: '0',
    grossWeight: '0',
    freightAmount: '0',
    loading: '0',
    unloading: '0',
    lrCharges: '0',
    otherCharges: '0',
    otherChargesLabel: '',
    advance: '0',
    balance: '0',
  },

  // Additional
  labReportApplied: false,
  labReportAvailable: false,
  insurance: false,
  transitRisk: '',
  lr_no: '',
  lr_date: '',
};

// ========== VALIDATION SCHEMA ==========
const validationSchema = Yup.object().shape({
  pickupName: Yup.string().required('Consigner name is required'),
  pickupGst: Yup.string().required('GST number is required'),
  pickupAddress1: Yup.string().required('Address is required'),
  pickupPincode: Yup.string()
    .matches(/^\d{6}$/, 'Invalid pincode')
    .required('Pincode is required'),
  dropName: Yup.string().required('Consignee name is required'),
  dropGst: Yup.string().required('GST number is required'),
  dropAddress1: Yup.string().required('Address is required'),
  dropPincode: Yup.string()
    .matches(/^\d{6}$/, 'Invalid pincode')
    .required('Pincode is required'),
});

const Tab = createMaterialTopTabNavigator();

// ========== MAIN COMPONENT ==========
export default function MultiStepFormTabs() {
  const [selectedLoadPost, setSelectedLoadPost] = useState<string>('');
  const [stepCompletion, setStepCompletion] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  // API Integration
  const { data: loadPostData, isLoading } = useGetcustomerloadpostdetailsQuery({
    CustomerID: 'CM770175',
  });
  const [insertVehicleloadpostdatasheet, { isLoading: isInserting }] =
    useInsertVehicleloadpostdatasheetMutation();

  const [updateLoadPost, { isLoading: isSubmitting }] =
    useUpdateloadpostMutation();

  // Transform data for dropdown
  const dropdownItems = React.useMemo(() => {
    const dataSource = loadPostData?.length ? loadPostData : DUMMY_DATA;
    return transformToDropdownItems(dataSource);
  }, [loadPostData]);

  const handleSelectLoadpost = (loadPostId: string) => {
    setSelectedLoadPost(loadPostId);
  };

  // Step completion checks
  const checkStep1Completion = (values: FormikValues) => {
    return (
      values.pickupName?.trim() !== '' &&
      values.pickupGst?.trim() !== '' &&
      values.pickupAddress1?.trim() !== '' &&
      values.pickupPincode?.trim() !== '' &&
      values.dropName?.trim() !== '' &&
      values.dropGst?.trim() !== '' &&
      values.dropAddress1?.trim() !== '' &&
      values.dropPincode?.trim() !== ''
    );
  };

  const checkStep2Completion = (values: FormikValues) => {
    return (
      (values.invoices && values.invoices.length > 0) ||
      (values.challans && values.challans.length > 0)
    );
  };

  const checkStep3Completion = (values: FormikValues) => {
    return values.freightDetails && values.freightDetails.freightAmount !== '';
  };

  const checkStepCompletion = (values: FormikValues) => {
    setStepCompletion({
      step1: checkStep1Completion(values),
      step2: checkStep2Completion(values),
      step3: checkStep3Completion(values),
    });
  };

  // Submit Handler
  const handleSubmit = async (values: FormikValues) => {
    console.log({ values });
    try {
      // Validate required fields
      if (!selectedLoadPost) {
        Alert.alert('Error', 'Please select a load post from dropdown');
        return;
      }

      if (!checkStep1Completion(values)) {
        Alert.alert('Error', 'Please complete Step 1: Name & Address Details');
        return;
      }

      // Transform to API payload
      const payload = transformToApiPayload(values, selectedLoadPost);

      console.log('API Payload:', JSON.stringify(payload, null, 2));

      // Call API
      const response = await insertVehicleloadpostdatasheet(payload).unwrap();

      console.log('API Response:', response);
      Alert.alert('Success', 'Load data updated successfully!');
    } catch (error: any) {
      console.error('API Error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to update load data. Please try again.',
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#3366FF" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicle loading data sheet</Text>
      </View>

      {/* Dropdown Section */}
      <View style={styles.dropdownSection}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Select Load Post</Text>
          <LoadpostDropdown
            allData={dropdownItems}
            selected={selectedLoadPost}
            onSelect={handleSelectLoadpost}
            isLoading={isLoading}
            placeholder="Select a load post"
          />
        </View>
      </View>

      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {formik => {
          // Update formik values when load post is selected
          React.useEffect(() => {
            if (selectedLoadPost && dropdownItems.length > 0) {
              const selectedItem = dropdownItems.find(
                item => item.loadPostId === selectedLoadPost,
              )?.full;
              if (selectedItem) {
                const mappedData = mapApiDataToFormik(selectedItem);
                formik.setValues(prev => ({ ...prev, ...mappedData }));
              }
            }
          }, [selectedLoadPost, dropdownItems]);

          // Check step completion on values change
          React.useEffect(() => {
            checkStepCompletion(formik.values);
          }, [formik.values]);

          return (
            <View style={styles.tabContainer}>
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: '#3366FF',
                  tabBarInactiveTintColor: '#6B7280',

                  tabBarIndicatorStyle: {
                    backgroundColor: '#3366FF',
                    height: 3,
                  },

                  tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '600',
                    textTransform: 'none',
                  },

                  tabBarItemStyle: {
                    paddingVertical: 8,
                  },

                  tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 1,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                  },

                  swipeEnabled: false,
                }}
              >
                {/* STEP 1 */}
                <Tab.Screen
                  name="Name & Address Details"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text
                          style={[
                            styles.tabLabelText,
                            {
                              color: stepCompletion.step1
                                ? focused
                                  ? '#3366FF'
                                  : '#10B981'
                                : color,
                              fontWeight: stepCompletion.step1 ? '700' : '600',
                            },
                          ]}
                        >
                          Name & Address
                        </Text>
                        {stepCompletion.step1 && !focused && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step1_VehicleCustomer
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                        selectedLoadPost={selectedLoadPost}
                        dropdownItems={dropdownItems}
                      />

                      <Button
                        mode="contained"
                        onPress={() =>
                          navigation.navigate('Invoice/Documents Details')
                        }
                        style={styles.nextButton}
                        labelStyle={styles.buttonLabel}
                        disabled={!stepCompletion.step1}
                      >
                        Next: Invoice/Documents Detail
                      </Button>
                    </ScrollView>
                  )}
                </Tab.Screen>

                {/* STEP 2 */}
                <Tab.Screen
                  name="Invoice/Documents Details"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text
                          style={[
                            styles.tabLabelText,
                            {
                              color: stepCompletion.step2
                                ? focused
                                  ? '#3366FF'
                                  : '#10B981'
                                : color,
                              fontWeight: stepCompletion.step2 ? '700' : '600',
                            },
                          ]}
                        >
                          Invoice / Documents
                        </Text>
                        {stepCompletion.step2 && !focused && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step2_CargoInvoice
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                      />

                      <View style={styles.navButtons}>
                        <Button
                          mode="outlined"
                          onPress={() =>
                            navigation.navigate('Name & Address Details')
                          }
                          style={styles.backButton}
                          labelStyle={styles.buttonLabel}
                        >
                          Back
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => navigation.navigate('Freight Summary')}
                          style={styles.nextButton}
                          labelStyle={styles.buttonLabel}
                          disabled={!stepCompletion.step2}
                        >
                          <Text> Next: Freight Summary</Text>
                        </Button>
                      </View>
                    </ScrollView>
                  )}
                </Tab.Screen>

                {/* STEP 3 */}
                <Tab.Screen
                  name="Freight Summary"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text
                          style={[
                            styles.tabLabelText,
                            {
                              color: stepCompletion.step3
                                ? focused
                                  ? '#3366FF'
                                  : '#10B981'
                                : color,
                              fontWeight: stepCompletion.step3 ? '700' : '600',
                            },
                          ]}
                        >
                          Freight Summary
                        </Text>
                        {stepCompletion.step3 && !focused && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step3_FreightDetails
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                      />

                      <View style={styles.navButtons}>
                        <Button
                          mode="outlined"
                          onPress={() =>
                            navigation.navigate('Invoice/Documents Details')
                          }
                          style={styles.backButton}
                          labelStyle={styles.buttonLabel}
                        >
                          <Text>Back</Text>
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => formik.handleSubmit()}
                          style={styles.submitButton}
                          labelStyle={styles.buttonLabel}
                          loading={isSubmitting}
                          disabled={isSubmitting || !stepCompletion.step3}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Load'}
                        </Button>
                      </View>
                    </ScrollView>
                  )}
                </Tab.Screen>
              </Tab.Navigator>
            </View>
          );
        }}
      </Formik>
    </View>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#3366FF',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 5 : 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  dropdownSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tabContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 4,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#3366FF',
    borderWidth: 1,
    borderRadius: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#3366FF',
    borderRadius: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelText: {
    fontSize: 14,
    textTransform: 'none',
  },
  completedIndicator: {
    marginLeft: 4,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
