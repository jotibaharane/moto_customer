import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FormStep } from '../type';

interface FormProgressProps {
  currentStep: FormStep;
  steps: FormStep[];
  completedSteps: FormStep[];
}

const stepLabels: Record<FormStep, string> = {
  Location: 'Location',
  Load: 'Load',
  Confirmation: 'Confirmation',
};

const FormProgress: React.FC<FormProgressProps> = ({
  currentStep,
  steps,
  completedSteps,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                currentStep === step && styles.stepCircleActive,
                completedSteps.includes(step) && styles.stepCircleCompleted,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (currentStep === step || completedSteps.includes(step)) &&
                    styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                (currentStep === step || completedSteps.includes(step)) &&
                  styles.stepLabelActive,
              ]}
            >
              {stepLabels[step]}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  completedSteps.includes(step) && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#007bff',
  },
  stepCircleCompleted: {
    backgroundColor: '#28a745',
  },
  stepNumber: {
    color: '#6c757d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#495057',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#dee2e6',
    marginHorizontal: 8,
    marginLeft: 12,
  },
  connectorCompleted: {
    backgroundColor: '#28a745',
  },
});

export default FormProgress;
