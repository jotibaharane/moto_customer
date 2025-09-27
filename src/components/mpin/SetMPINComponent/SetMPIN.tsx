// SetMPIN.tsx
import MPINDots from '@components/mpin/MPINDots';
import MPINHeader from '@components/mpin/MPINHeader';
import MPINKeypad from '@components/mpin/MPINKeypad';
import colors from '@utils/colors';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SetMPINProps {
  mpin: string;
  setMpin: (val: any) => void;
  onSuccess: () => void;
}

const SetMPIN: React.FC<SetMPINProps> = ({ onSuccess, setMpin, mpin }) => {
  const [error, setError] = useState('');
  const mpinInputRef = useRef<TextInput>(null);

  const handleNumberPress = (num: string) => {
    if (mpin.length < 6) {
      // Changed from 4 to 6
      setMpin((prev: any) => prev + num);
    }
  };

  const handleBackspace = () => {
    setMpin((prev: any) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (mpin.length === 6) {
      // Changed from 4 to 6
      onSuccess();
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
          title="Set New MPIN"
          subtitle="Enter your 6-digit security PIN" // Updated subtitle
        />

        <View style={styles.mpinContainer}>
          <MPINDots value={mpin} /> {/* Added length prop */}
          <TextInput
            ref={mpinInputRef}
            value={mpin}
            onChangeText={setMpin}
            maxLength={6} // Changed from 4 to 6
            keyboardType="number-pad"
            style={styles.hiddenInput}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <MPINKeypad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
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
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
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
  resetLink: {
    marginTop: hp(20),
    alignSelf: 'center',
  },
  resetLinkText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontWeight: '500',
  },
});

export default SetMPIN;
