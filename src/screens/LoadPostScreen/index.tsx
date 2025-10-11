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
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
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

const LoadPostForm: React.FC = ({ params }: any) => {
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [postCustomerRequirement] = usePostCustomerRequirementMutation();
  const [currentStep, setCurrentStep] = useState<FormStep>('Location');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);

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
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
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
    console.log('Form submitted:', values);
    try {
      let response = await postCustomerRequirement({
        ...values,
        CustomerID: CustomerID,
      });
      console.log({ response });
      if (response?.data?.status === '00') {
        Toast.show({
          type: 'success',
          text1: response?.data?.message,
        });
        dispatch(setCustomerMap('Load'));
        dispatch(addOrUpdateDriver([]));
        dispatch(setPostId(response?.data?.[0]?.LoadPostID));
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

        // Reset form after successful submission
        setCurrentStep('Location');
        resetForm();
        setCompletedSteps([]);

        navigation.navigate(routeName.DASHBOARD, {
          screen: routeName.HOMESTACK,
          params: {
            screen: routeName.HOME,
            params: response.data,
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: response?.data?.message,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
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
        // validationSchema={getStepSchema(currentStep)}
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({
          handleSubmit,
          values,
          errors,
          isValid,
          isSubmitting,
          resetForm,
        }) => (
          <View style={styles.container}>
            <FormProgress
              currentStep={currentStep}
              steps={STEPS}
              completedSteps={completedSteps}
            />
            <ScrollView
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {renderStep()}
            </ScrollView>
            <FormNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isValid={true}
              isSubmitting={isSubmitting}
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});

export default LoadPostForm;
