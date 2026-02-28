import { useSendOtpMutation, useValidateOtpMutation } from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import {
  setCustomerDetails,
  setMobileNumber,
  setToken,
} from '@store/slices/authSlice';
import colors from '@utils/colors';
import { routeName } from '@utils/navigationHelpers';
import React, { useRef, useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  Animated,
} from 'react-native';
import {
  Button,
  HelperText,
  TextInput as PaperTextInput,
  Text,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { styles } from './LoginScreen.style';

interface SendOtpPayload {
  mobile_number: string;
}

const OtpLoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [sendOTP] = useSendOtpMutation();
  const [validateOTP] = useValidateOtpMutation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const otpInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<any>(null);

  // Animation for smooth transition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isOtpSent]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber?.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await sendOTP({
        mobile_number: phoneNumber,
      });
      console.log({ response });

      if (response?.data?.status === '00') {
        setIsLoading(false);
        setIsOtpSent(true);
        setSuccessMessage('OTP sent successfully!');
        setTimeout(() => otpInputRef?.current?.focus(), 200);
      } else {
        setIsLoading(false);
        setError(
          response?.data?.message || 'Failed to send OTP. Please try again.',
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await validateOTP({
        mobile_number: phoneNumber,
        otp: otp,
      });

      if (response?.data?.status === '00') {
        dispatch(setMobileNumber(phoneNumber));

        if (!response?.data?.Customer_Details) {
          setIsLoading(false);
          setSuccessMessage('OTP verified successfully!');
          navigation.replace(routeName.REGISTRATION);
        } else {
          dispatch(setCustomerDetails(response?.data?.Customer_Details));
          if (response?.data?.Customer_Details?.MPIN_Flag !== 'Y') {
            navigation.replace(routeName.SET_MPIN);
          } else {
            dispatch(setToken('true'));
            navigation.replace(routeName.DASHBOARD);
          }
        }
      } else {
        setIsLoading(false);
        setError(response?.data?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const payload: SendOtpPayload = {
        mobile_number: phoneNumber,
      };

      const response = await sendOTP(payload);
      if (response?.data?.status === '00') {
        setIsLoading(false);
        setOtp('');
        setSuccessMessage('New OTP sent successfully!');
        setTimeout(() => otpInputRef.current?.focus(), 200);
      } else {
        setIsLoading(false);
        setError(
          response?.data?.message || 'Failed to resend OTP. Please try again.',
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  // ✅ NEW: Handle change number
  const handleChangeNumber = () => {
    setIsOtpSent(false);
    setOtp('');
    setError('');
    setSuccessMessage('');
    setTimeout(() => phoneInputRef.current?.focus(), 200);
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setOtp(cleaned);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Image
              source={require('@assets/moto_help_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.companyName}>ABC COMPANY</Text>
          <Text style={styles.tagline}>Your Roadside Assistance Partner</Text>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>
            {isOtpSent ? 'Enter Verification Code' : 'Login with Phone Number'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isOtpSent
              ? `We've sent a 4-digit code to ${phoneNumber}`
              : 'We will send you a one-time password'}
          </Text>

          {!isOtpSent ? (
            <PaperTextInput
              ref={phoneInputRef}
              mode="outlined"
              label="Phone Number"
              placeholder="Enter your 10-digit phone number"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={10}
              outlineColor={colors.divider}
              activeOutlineColor={colors.primary}
              left={<PaperTextInput.Icon icon="phone" color={colors.primary} />}
              autoFocus
              theme={{
                colors: {
                  placeholder: colors.textSecondary,
                  text: colors.textPrimary,
                },
              }}
            />
          ) : (
            <View style={styles.otpContainer}>
              <TextInput
                ref={otpInputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.otpInput}
                selectionColor={colors.primary}
                textContentType="oneTimeCode"
              />
              <View style={styles.otpBoxes}>
                {[0, 1, 2, 3].map(index => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      otp.length === index && styles.otpBoxActive,
                      index < otp.length && styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={styles.otpText}>{otp[index] || ''}</Text>
                  </View>
                ))}
              </View>

              {/* ✅ Change Number Option */}
              <Button
                mode="text"
                onPress={handleChangeNumber}
                labelStyle={[styles.resendButton, { fontSize: 14 }]}
              >
                Change Contact Number
              </Button>
            </View>
          )}

          {error ? (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          {successMessage ? (
            <HelperText type="info" visible={!!successMessage}>
              {successMessage}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            {isOtpSent ? 'Verify & Continue' : 'Send OTP'}
          </Button>

          {isOtpSent && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn’t receive code?</Text>
              <Button
                mode="text"
                onPress={handleResendOtp}
                disabled={isLoading}
                labelStyle={styles.resendButton}
              >
                Resend OTP
              </Button>
            </View>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our</Text>
          <View style={styles.linksContainer}>
            <Button mode="text" compact labelStyle={styles.footerLink}>
              Terms
            </Button>
            <Text style={styles.footerText}> and </Text>
            <Button mode="text" compact labelStyle={styles.footerLink}>
              Privacy Policy
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpLoginScreen;
