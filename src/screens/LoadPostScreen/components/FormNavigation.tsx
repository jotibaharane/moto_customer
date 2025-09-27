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
        {!isFirstStep && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onBack}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            (!isValid || isSubmitting) && styles.nextButtonDisabled,
          ]}
          onPress={isLastStep ? onSubmit : onNext}
          disabled={!isValid || isSubmitting}
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

      <Text style={styles.stepIndicator}>
        Step {currentStepIndex} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  buttonContainer: {
    flexDirection: 'row',
    // justifyContent: isFirstStep ? 'flex-end' : 'space-between',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  stepIndicator: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 14,
  },
});

export default FormNavigation;
