// SetMPINScreen.tsx

import { useSetMpinMutation } from '@api/hooks_api';
import ConfirmMPIN from '@components/mpin/SetMPINComponent/ConfirmMPIN';
import SetMPIN from '@components/mpin/SetMPINComponent/SetMPIN';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import { setToken } from '@store/slices/authSlice';
import colors from '@utils/colors';
import { routeName } from '@utils/navigationHelpers';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const SetMPINScreen: React.FC<any> = () => {
  const navigation = useNavigation<any>();
  const res = useSelector((state: RootState) => state?.auth);
  const mobilenumber = res?.mobileNumber;
  const CustomerID = res?.customerDetails?.CustomerID;
  const dispatch = useDispatch();
  const [setMpinApi] = useSetMpinMutation();
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstMpin, setFirstMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');

  const handleEnterSuccess = () => {
    if (firstMpin.length === 6) {
      // Changed from 4 to 6
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    if (confirmMpin !== firstMpin) {
      Alert.alert('Error', 'MPINs do not match');
      setConfirmMpin('');
      return;
    }

    try {
      const response = await setMpinApi({
        CustomerID: CustomerID || '',
        ContactNo: mobilenumber || '',
        Customer_MPIN: confirmMpin,
      });

      if (response?.data?.status_code === '00') {
        dispatch(setToken('true'));
        navigation.replace(routeName.DASHBOARD as never);
      } else {
        Alert.alert('Failed');
        setStep('enter');
        setFirstMpin('');
        setConfirmMpin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      {step === 'enter' ? (
        <SetMPIN
          onSuccess={handleEnterSuccess}
          setMpin={setFirstMpin}
          mpin={firstMpin}
        />
      ) : (
        <ConfirmMPIN
          mpin={confirmMpin}
          onConfirm={handleConfirm}
          onNumberPress={num => {
            if (confirmMpin.length < 6) {
              // Changed from 4 to 6
              setConfirmMpin(prev => prev + num);
            }
          }}
          onBackspace={() => setConfirmMpin(prev => prev.slice(0, -1))}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default SetMPINScreen;
