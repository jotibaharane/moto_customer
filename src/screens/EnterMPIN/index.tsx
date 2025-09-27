import { useMpinLoginMutation } from '@api/hooks_api';
import MPINDots from '@components/mpin/MPINDots';
import MPINHeader from '@components/mpin/MPINHeader';
import MPINKeypad from '@components/mpin/MPINKeypad';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import colors from '@utils/colors';
import { routeName } from '@utils/navigationHelpers';
import { fontSize, hp, ms, wp } from '@utils/responsive';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBiometrics, {
  BiometryType,
  BiometryTypes,
} from 'react-native-biometrics';
import { useSelector } from 'react-redux';

const EnterMPINScreen: React.FC<any> = () => {
  const [loginWithMpin] = useMpinLoginMutation();
  const { customerDetails } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<
    BiometryType | undefined | null
  >(null);
  const mpinInputRef = useRef<TextInput>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      setIsBiometricSupported(available);
      setBiometricType(biometryType);

      // If biometrics is available and enrolled, prompt for fingerprint
      if (available) {
        const { available: enrolled } = await rnBiometrics.isSensorAvailable();
        if (enrolled) {
          // Auto-prompt fingerprint after a short delay
          setTimeout(() => {
            handleBiometricAuth();
          }, 500);
        }
      }
    } catch (error) {
      console.log('Biometric check error:', error);
      setIsBiometricSupported(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate with Biometrics',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        // Here you would typically send the signature to your backend for verification
        // For this example, we'll assume successful authentication
        console.log('Biometric authentication successful');

        // Navigate to dashboard on successful biometric auth
        navigation.replace(routeName.DASHBOARD, {
          screen: routeName.HOMESTACK,
          params: {
            screen: routeName.HOME,
          },
        });
      } else {
        console.log('Biometric authentication failed or was cancelled');
      }
    } catch (error) {
      console.log('Biometric authentication error:', error);
      Alert.alert(
        'Error',
        'Biometric authentication failed. Please try again or use MPIN.',
      );
    }
  };

  const handleNumberPress = (num: string) => {
    if (mpin.length < 6) {
      // Changed from 4 to 6
      setMpin((prev: any) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setMpin((prev: any) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (mpin.length === 6) {
      // Changed from 4 to 6
      // Verify MPIN with your backend
      const response = await loginWithMpin({
        CustomerID: customerDetails?.CustomerID || '',
        ContactNo: customerDetails?.ContactNo || '',
        Customer_MPIN: mpin,
      });
      console.log({ response });
      if (response?.data?.status_code === '00') {
        navigation.replace(routeName.DASHBOARD, {
          screen: routeName.HOMESTACK,
          params: {
            screen: routeName.HOME,
          },
        });
      } else {
        Alert.alert('Error', 'Enter Correct Pin');
        setMpin('');
      }
    } else {
      setError('Please enter 6-digit MPIN'); // Updated error message
    }
  };

  const getBiometricIconName = () => {
    if (biometricType === BiometryTypes.FaceID) {
      return 'Face ID';
    } else if (biometricType === BiometryTypes.TouchID) {
      return 'Touch ID';
    } else {
      return 'Fingerprint';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <MPINHeader
          title="Enter MPIN"
          subtitle="Enter your 6-digit security PIN" // Updated subtitle
        />

        <View style={styles.mpinContainer}>
          <MPINDots value={mpin} />
          {/* Pass length prop to MPINDots */}
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

        {isBiometricSupported && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <Text style={styles.biometricButtonText}>
              Use {getBiometricIconName()}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.resetLink} onPress={() => {}}>
          <Text style={styles.resetLinkText}>Reset MPIN</Text>
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
    justifyContent: 'center',
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
  biometricButton: {
    paddingVertical: hp(14),
    borderRadius: ms(8),
    marginHorizontal: wp(24),
    marginTop: hp(15),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  biometricButtonText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontWeight: '500',
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

export default EnterMPINScreen;
