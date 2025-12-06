import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3...
  totalSteps?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 3,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isActive && styles.activeCircle,
              ]}
            >
              <Text
                style={[
                  styles.number,
                  isActive && styles.activeNumber,
                  isCompleted && styles.completedNumber,
                ]}
              >
                {step}
              </Text>
            </View>

            {step !== totalSteps && (
              <View
                style={[styles.line, isCompleted && styles.completedLine]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircle: {
    backgroundColor: '#4CAF50',
  },
  activeCircle: {
    backgroundColor: '#3F51B5',
  },

  // numbers
  number: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  activeNumber: {
    color: '#fff',
  },
  completedNumber: {
    color: '#fff',
  },

  line: {
    width: 40,
    height: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
});

export default StepIndicator;
