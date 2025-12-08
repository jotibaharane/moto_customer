import React from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Step1_VehicleCustomer from './Step1_VehicleCustomer';
import Step2_CargoInvoice from './Step2_CargoInvoice';
import Step3_WeightLabInsurance from './Step3_WeightLabInsurance';
import Step4_Weight from './Step4_Weight';

type Invoice = {
  poNo?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  quantity?: number;
  value?: number;
  image?: any;
};

type CargoItem = { description?: string };
type PackagingItem = { type?: string; details?: string };

export type FormValues = {
  vehicleNo?: string;
  driverName?: string;
  driverNumber?: string;
  loadPosDate?: string;
  customerName?: string;

  pickupAddress?: string;
  pickupPincode?: string;
  pickupCity?: string;
  pickupState?: string;

  dropAddress?: string;
  dropPincode?: string;
  dropCity?: string;
  dropState?: string;

  cargo?: CargoItem[];
  packaging?: PackagingItem[];
  invoices?: Invoice[];

  netWeight?: number | null;
  grossWeight?: number | null;
  labReportApplied?: boolean;
  labReportAvailable?: boolean;
  insurance?: boolean;
  transitRisk?: string;
};

const initialValues: FormValues = {
  vehicleNo: '',
  driverName: '',
  driverNumber: '',
  loadPosDate: '',
  customerName: '',
  pickupAddress: '',
  pickupPincode: '',
  pickupCity: '',
  pickupState: '',
  dropAddress: '',
  dropPincode: '',
  dropCity: '',
  dropState: '',
  cargo: [],
  packaging: [],
  invoices: [],
  netWeight: null,
  grossWeight: null,
  labReportApplied: false,
  labReportAvailable: false,
  insurance: false,
  transitRisk: '',
};

// Optional: You can add field validations for each step

const Tab = createMaterialTopTabNavigator();

export default function MultiStepFormTabs() {
  const tabs = ['VehicleCustomer', 'CargoInvoice', 'WeightsChecks', 'Weight'];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object()}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={values => {
        Alert.alert('Submitted', JSON.stringify(values, null, 2));
      }}
    >
      {formik => (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#3366FF',
            tabBarIndicatorStyle: { backgroundColor: '#3366FF' },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            swipeEnabled: false, // disable swipe to force wizard flow
          }}
        >
          {/* ---------------- STEP 1 ---------------- */}
          <Tab.Screen name="VehicleCustomer" options={{ title: 'Load' }}>
            {({ navigation }) => (
              <ScrollView style={styles.container}>
                <Step1_VehicleCustomer
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                />

                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CargoInvoice')}
                  style={{ marginTop: 20 }}
                >
                  Next
                </Button>
              </ScrollView>
            )}
          </Tab.Screen>

          {/* ---------------- STEP 2 ---------------- */}
          <Tab.Screen name="CargoInvoice" options={{ title: 'Cargo' }}>
            {({ navigation }) => (
              <ScrollView style={styles.container}>
                <Step2_CargoInvoice
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                />

                <View style={styles.navButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('VehicleCustomer')}
                  >
                    Back
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('WeightsChecks')}
                  >
                    Next
                  </Button>
                </View>
              </ScrollView>
            )}
          </Tab.Screen>

          {/* ---------------- STEP 3 ---------------- */}
          <Tab.Screen name="WeightsChecks" options={{ title: 'Invoice' }}>
            {({ navigation }) => (
              <ScrollView style={styles.container}>
                <Step3_WeightLabInsurance
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                />

                <View style={styles.navButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('CargoInvoice')}
                  >
                    Back
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Weight')}
                  >
                    Next
                  </Button>
                </View>
              </ScrollView>
            )}
          </Tab.Screen>

          {/* ---------------- STEP 4 ---------------- */}
          <Tab.Screen name="Weight" options={{ title: 'Weight' }}>
            {({ navigation }) => (
              <ScrollView style={styles.container}>
                <Step4_Weight
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                />

                <View style={styles.navButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('WeightsChecks')}
                  >
                    Back
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => formik.handleSubmit()}
                  >
                    Submit
                  </Button>
                </View>
              </ScrollView>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
