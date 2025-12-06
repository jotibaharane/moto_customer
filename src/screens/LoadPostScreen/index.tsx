import Toast from 'react-native-toast-message';
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
import { StatusBar, StyleSheet, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ConfirmationStep from './components/ConfirmationStep';
import FirstStep from './components/FirstStep';
import FormNavigation from './components/FormNavigation';
import FormProgress from './components/FormProgress';
import SecondStep from './components/SecondStep';
import { emptyShipmentData, STEPS } from './constant';
import { FormStep } from './type';
import { getStepSchema } from './validation';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const LoadPostForm: React.FC = () => {
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [postCustomerRequirement] = usePostCustomerRequirementMutation();
  const [currentStep, setCurrentStep] = useState<FormStep>('Location');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);

  // Navigate to next step
  const handleNext = async (
    validateForm: any,
    setTouched: any,
    values: any,
  ) => {
    const stepSchema = getStepSchema(currentStep);

    try {
      await stepSchema.validate(values, { abortEarly: false });

      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        const nextStep = STEPS[currentIndex + 1];
        setCurrentStep(nextStep);

        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
      }
    } catch (err: any) {
      console.log('🛑 Validation Error in Step =>', currentStep);

      if (err.inner && err.inner.length > 0) {
        // 🔥 Log all errors (your current behavior)
        err.inner.forEach((e: any, i: number) => {
          console.log(
            `❌ Error ${i + 1}:`,
            `Field: ${e.path}`,
            `Message: ${e.message}`,
          );
        });

        // ⚠️ Show toast for the FIRST error
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: err.inner[0].message,
        });

        // Mark all invalid fields as touched
        const touchedFields: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) touchedFields[e.path] = true;
        });
        setTouched(touchedFields, true);
      } else {
        // Single error fallback
        console.log('❌ Validation Error:', err.message);

        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: err.message,
        });
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

  const handleSubmit = async (values: ShipmentData, { resetForm }: any) => {
    try {
      const response = await postCustomerRequirement({ ...values, CustomerID });

      if (response?.data?.status === '00') {
        Toast.show({ type: 'success', text1: response?.data?.message });

        dispatch(setCustomerMap('Load'));
        dispatch(addOrUpdateDriver([]));
        dispatch(setPostId(response?.data?.[0]?.LoadPostID));

        // Set origin & destination in map
        dispatch(
          setOrigin({
            latitude: values?.origin?.coordinates?.lat,
            longitude: values?.origin?.coordinates?.lng,
          }),
        );
        dispatch(setOriginAddress(values?.origin?.components?.place));
        dispatch(setDestinationAddress(values?.destination?.components?.place));
        dispatch(
          setDestination({
            latitude: values?.destination?.coordinates?.lat,
            longitude: values?.destination?.coordinates?.lng,
          }),
        );

        // Reset form and step
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
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          validateForm,
          setTouched,
          isValid,
          isSubmitting,
        }) => (
          <View style={styles.innerContainer}>
            {/* Step Progress */}
            <FormProgress
              currentStep={currentStep}
              steps={STEPS}
              completedSteps={completedSteps}
            />

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <FormNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={() => handleNext(validateForm, setTouched, values)}
              onSubmit={handleSubmit}
              isValid={isValid}
              isSubmitting={isSubmitting}
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
