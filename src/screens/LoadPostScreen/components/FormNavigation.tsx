import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { STEPS } from '../constant';
import { FormStep } from '../type';

interface FormNavigationProps {
  currentStep: FormStep;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isValid: boolean;
  isSubmitting: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isValid,
  isSubmitting,
}) => {
  const currentStepIndex = STEPS.indexOf(currentStep) + 1;
  const isFirstStep = currentStepIndex === 1;
  const isLastStep = currentStepIndex === totalSteps;

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Back button */}
        {!isFirstStep && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onBack}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {/* ✅ Next / Submit button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            isSubmitting && styles.nextButtonDisabled, // disable only while submitting
          ]}
          onPress={isLastStep ? onSubmit : onNext}
          disabled={isSubmitting} // ❌ removed !isValid check
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Submit' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* <Text style={styles.stepIndicator}>
        Step {currentStepIndex} of {totalSteps}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    padding: 0,
    margin: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    // paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  nextButton: {
    backgroundColor: '#007bff',
  },
  nextButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FormNavigation;
