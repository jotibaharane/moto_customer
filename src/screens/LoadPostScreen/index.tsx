import { ShipmentData } from '@api/api.type';
import { usePostCustomerRequirementMutation } from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import {
  addOrUpdateDriver,
  setCustomerMap,
  setDestination,
  setDestinationAddress,
  setOrigin,
  setOriginAddress,
  setPostId,
} from '@store/slices/mapSlice';
import { routeName } from '@utils/navigationHelpers';
import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';

import { emitCreateCustomerLoad } from '../../sockets';
import ConfirmationStep from './components/ConfirmationStep';
import FirstStep from './components/FirstStep';
import FormNavigation from './components/FormNavigation';
import FormProgress from './components/FormProgress';
import SecondStep from './components/SecondStep';
import { emptyShipmentData, STEPS } from './constant';
import { FormStep } from './type';

const LoadPostForm: React.FC = () => {
  const CustomerID =
    useSelector((state: RootState) => state.auth.customerDetails?.CustomerID) ??
    '';

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [postCustomerRequirement] = usePostCustomerRequirementMutation();

  const [currentStep, setCurrentStep] = useState<FormStep>('Location');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // 🔥 MPIN Modal State
  const [mpinModal, setMpinModal] = useState(false);
  const [mpin, setMpin] = useState('');
  const formikSubmitRef = useRef<any>(null);

  // ----------------------- STEP NAVIGATION -----------------------
  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);

    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      setCurrentStep(nextStep);

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(STEPS[currentIndex - 1]);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'Location':
        return <FirstStep />;
      case 'Load':
        return <SecondStep />;
      case 'Confirmation':
        return <ConfirmationStep />;
      default:
        return null;
    }
  };

  // ----------------------- API Submission (unchanged) -----------------------
  const handleSubmit = async (values: ShipmentData, { resetForm }: any) => {
    try {
      // ✅ Prepare the payload in the new nested format
      const payload: ShipmentData = {
        ...values,
        customerId: CustomerID, // Ensure customerId is set
        schedule: {
          date: values.schedule.date || '',
          time: values.schedule.time || '',
        },
      };

      const response = await postCustomerRequirement(payload).unwrap();

      if (response?.status === '00') {
        console.log('_CHECK', {
          loadId: response?.data?.[0]?.LoadPostID,
          customerId: CustomerID,
          lat: values?.pickup?.origin?.coordinates?.lat || 0,
          lng: values?.pickup?.origin?.coordinates?.lng || 0,
        });
        emitCreateCustomerLoad({
          loadId: response?.data?.[0]?.LoadPostID,
          customerId: CustomerID,
          lat: values?.pickup?.origin?.coordinates?.lat || 0,
          lng: values?.pickup?.origin?.coordinates?.lng || 0,
        });
        Toast.show({ type: 'success', text1: response?.message });

        dispatch(setCustomerMap('Load'));
        dispatch(addOrUpdateDriver([]));
        dispatch(setPostId(response?.data?.[0]?.LoadPostID));

        // Set origin & destination in map
        if (values.pickup.origin?.coordinates) {
          dispatch(
            setOrigin({
              latitude: values.pickup.origin.coordinates.lat,
              longitude: values.pickup.origin.coordinates.lng,
            }),
          );
          dispatch(
            setOriginAddress(values.pickup.origin.components.place || ''),
          );
        }

        if (values.delivery.destination?.coordinates) {
          dispatch(
            setDestinationAddress(
              values.delivery.destination.components.place || '',
            ),
          );
          dispatch(
            setDestination({
              latitude: values.delivery.destination.coordinates.lat,
              longitude: values.delivery.destination.coordinates.lng,
            }),
          );
        }

        setCurrentStep('Location');
        resetForm();
        setCompletedSteps([]);

        navigation.navigate(routeName.DASHBOARD, {
          screen: routeName.HOMESTACK,
          params: { screen: routeName.HOME, params: response.data },
        });
      } else {
        Toast.show({ type: 'error', text1: response?.data?.message });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error?.message });
      console.error('Submission error:', error);
    }
  };
  // ----------------------- MPIN Validation -----------------------
  const validateMPIN = () => {
    if (mpin !== '123456') {
      Toast.show({
        type: 'error',
        text1: 'Invalid MPIN',
        text2: 'Please enter correct MPIN',
      });
      return false;
    }
    return true;
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <Formik
        initialValues={emptyShipmentData}
        onSubmit={(values, actions) => {
          formikSubmitRef.current = async () => {
            setSubmitting(true);
            await handleSubmit(values, actions);
            setSubmitting(false);
          };
          setMpinModal(true);
        }}
      >
        {({
          handleSubmit,
          validateForm,
          setTouched,
          isValid,
          isSubmitting,
          values,
        }) => (
          <View style={styles.innerContainer}>
            <FormProgress
              currentStep={currentStep}
              steps={STEPS}
              completedSteps={completedSteps}
            />

            {renderStep()}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={() => handleNext(validateForm, setTouched, values)}
              onSubmit={handleSubmit}
              isValid={isValid}
              isSubmitting={submitting} // ✅ FIX
            />

            {/* ----------------------------- MPIN MODAL ----------------------------- */}
            <Modal transparent animationType="fade" visible={mpinModal}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Enter MPIN</Text>

                  {/* ●●●●●● CIRCLES */}
                  <View style={styles.circleContainer}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.circle,
                          { backgroundColor: mpin[i] ? '#000' : '#d1d1d1' },
                        ]}
                      />
                    ))}
                  </View>

                  {/* Hidden Input */}
                  <TextInput
                    value={mpin}
                    onChangeText={setMpin}
                    maxLength={6}
                    keyboardType="numeric"
                    style={styles.hiddenInput}
                    autoFocus
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#d32f2f' }]}
                      onPress={() => {
                        setMpin('');
                        setSubmitting(false); // ✅ stop loader
                        setMpinModal(false);
                      }}
                    >
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: '#1e40af' }]}
                      onPress={() => {
                        // if (!validateMPIN()) return;

                        setMpinModal(false);
                        formikSubmitRef.current && formikSubmitRef.current();
                      }}
                    >
                      <Text style={styles.btnText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* -------------------------------------------------------------------- */}
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  innerContainer: { flex: 1 },

  // 🔥 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '82%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },

  // MPIN Circles
  circleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 20,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
    marginTop: 15,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoadPostForm;
