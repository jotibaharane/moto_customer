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

import React, { useState } from 'react';
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

import ConfirmationStep from './components/ConfirmationStep';
import FirstStep from './components/FirstStep';
import FormNavigation from './components/FormNavigation';
import FormProgress from './components/FormProgress';
import SecondStep from './components/SecondStep';
import { emptyShipmentData, STEPS } from './constant';
import { FormStep } from './type';
import { emitCreateCustomerLoad } from '../../sockets';

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

  // ----------------------- API SUBMISSION -----------------------
  const handleSubmit = async (values: ShipmentData, { resetForm }: any) => {
    try {
      // ✅ Prepare the payload in the new nested format
      const payload: ShipmentData = {
        ...values,
        customerId: CustomerID,
        schedule: {
          date: values.schedule.date || '',
          time: values.schedule.time || '',
        },
      };

      const response = await postCustomerRequirement(payload).unwrap();

      if (response?.status === '00') {
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
        setCompletedSteps([]);
        resetForm();

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
        onSubmit={async (values, actions) => {
          setSubmitting(true);
          await handleSubmit(values, actions);
          setSubmitting(false);
        }}
      >
        {({ handleSubmit, isValid }) => (
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
              onNext={handleNext}
              onSubmit={handleSubmit}
              isValid={isValid}
              isSubmitting={submitting}
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  innerContainer: { flex: 1 },
});

export default LoadPostForm;
