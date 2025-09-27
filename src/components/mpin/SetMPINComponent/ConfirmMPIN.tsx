// ConfirmMPIN.tsx
import MPINDots from '@components/mpin/MPINDots';
import MPINHeader from '@components/mpin/MPINHeader';
import MPINKeypad from '@components/mpin/MPINKeypad';
import colors from '@utils/colors';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ConfirmMPINProps {
  mpin: string;
  onConfirm: () => void;
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
}

const ConfirmMPIN: React.FC<ConfirmMPINProps> = ({
  mpin,
  onConfirm,
  onNumberPress,
  onBackspace,
}) => {
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (mpin.length === 6) {
      // Changed from 4 to 6
      onConfirm();
    } else {
      setError('Please enter 6-digit MPIN'); // Updated error message
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <MPINHeader
          title="Confirm New MPIN"
          subtitle="Re-enter your new 6-digit MPIN to confirm" // Updated subtitle
        />

        <View style={styles.mpinContainer}>
          <MPINDots value={mpin} /> {/* Added length prop */}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <MPINKeypad onNumberPress={onNumberPress} onBackspace={onBackspace} />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>CONFIRM</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp(20),
  },
  mpinContainer: {
    alignItems: 'center',
    marginBottom: hp(30),
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize(14),
    textAlign: 'center',
    marginBottom: hp(10),
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: hp(14),
    borderRadius: ms(8),
    marginHorizontal: wp(24),
    marginTop: hp(10),
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ConfirmMPIN;
