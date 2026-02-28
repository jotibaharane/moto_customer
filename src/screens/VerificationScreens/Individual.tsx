import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  Divider,
} from 'react-native-paper';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { routeName } from '@utils/navigationHelpers';

interface FormValues {
  aadhaar: string;
  pan: string;
  gst: string;
}

const formatAadhaar = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join('-') : '';
};

export default function Individual() {
  const navigation = useNavigation<any>();

  const [verifiedAadhaar, setVerifiedAadhaar] = useState(true);
  const [verifiedPan, setVerifiedPan] = useState(false);
  const [verifiedGst, setVerifiedGst] = useState(false);

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackVisible(true);
  };

  const fakeVerify = async () =>
    new Promise(resolve => setTimeout(resolve, 800));

  const verifyAadhaar = async (a: string) => {
    await fakeVerify();
    setVerifiedAadhaar(true);
    showSnack('Aadhaar Verified Successfully');
  };

  const verifyPan = async (p: string) => {
    await fakeVerify();
    setVerifiedPan(true);
    showSnack('PAN Verified Successfully');
  };

  const verifyGst = async (g: string) => {
    await fakeVerify();
    setVerifiedGst(true);
    showSnack('GST Verified Successfully');
  };

  const submitDocuments = async (values: FormValues) => {
    showSnack('All Documents Submitted Successfully!');
    navigation.navigate(routeName.SET_MPIN);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.heading}>Legal Documents</Text>
        <Divider style={{ marginVertical: 10 }} />

        <Formik<FormValues>
          initialValues={{ aadhaar: '', pan: '', gst: '' }}
          onSubmit={submitDocuments}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            setFieldValue,
          }) => {
            const getBorderColor = (verified: boolean) => {
              return verified ? 'green' : '#ccc';
            };

            return (
              <>
                {/* Aadhaar */}
                <Text style={styles.sectionTitle}>Aadhaar Verification</Text>

                <TextInput
                  label="Aadhaar Number"
                  value={values.aadhaar}
                  keyboardType="number-pad"
                  maxLength={14}
                  style={[
                    styles.input,
                    { borderColor: getBorderColor(verifiedAadhaar) },
                  ]}
                  onChangeText={text => {
                    setVerifiedAadhaar(false);
                    setFieldValue('aadhaar', formatAadhaar(text));
                  }}
                  onBlur={handleBlur('aadhaar')}
                />

                <Button
                  mode="contained"
                  onPress={() => verifyAadhaar(values.aadhaar)}
                  disabled={!values.aadhaar}
                  style={styles.verifyBtn}
                >
                  Verify Aadhaar
                </Button>

                <Divider style={styles.divider} />

                {/* PAN */}
                <Text style={styles.sectionTitle}>PAN Verification</Text>

                <TextInput
                  label="PAN Number"
                  value={values.pan}
                  autoCapitalize="characters"
                  maxLength={10}
                  style={[
                    styles.input,
                    { borderColor: getBorderColor(verifiedPan) },
                  ]}
                  onChangeText={text => {
                    setVerifiedPan(false);
                    handleChange('pan')(text);
                  }}
                  onBlur={handleBlur('pan')}
                />

                <Button
                  mode="contained"
                  onPress={() => verifyPan(values.pan)}
                  disabled={!values.pan}
                  style={styles.verifyBtn}
                >
                  Verify PAN
                </Button>

                <Divider style={styles.divider} />

                {/* GST */}
                <Text style={styles.sectionTitle}>GST Verification</Text>

                <TextInput
                  label="GST Number"
                  value={values.gst}
                  autoCapitalize="characters"
                  maxLength={15}
                  style={[
                    styles.input,
                    { borderColor: getBorderColor(verifiedGst) },
                  ]}
                  onChangeText={text => {
                    setVerifiedGst(false);
                    handleChange('gst')(text);
                  }}
                  onBlur={handleBlur('gst')}
                />

                <Button
                  mode="contained"
                  onPress={() => verifyGst(values.gst)}
                  disabled={!values.gst}
                  style={styles.verifyBtn}
                >
                  Verify GST
                </Button>

                {/* Submit */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  disabled={!verifiedAadhaar || !verifiedPan || !verifiedGst}
                  style={styles.submitBtn}
                >
                  Submit Documents
                </Button>
              </>
            );
          }}
        </Formik>
      </Card>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2000}
      >
        {snackMsg}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 40,
    backgroundColor: '#F4F5F7',
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 6,
  },
  verifyBtn: {
    marginBottom: 15,
    borderRadius: 8,
  },
  submitBtn: {
    marginTop: 5,
    borderRadius: 10,
    paddingVertical: 5,
  },
  divider: {
    marginVertical: 14,
  },
});
