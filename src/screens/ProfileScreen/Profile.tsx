import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import colors from '@utils/colors';
import { useNavigation } from '@react-navigation/native';
import { routeName } from '@utils/navigationHelpers';
import { useGetCustomerQuery } from '@api/hooks_api';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import AddressSearch from '@screens/LoadPostScreen/components/AddressSearch';
import { setRegisteredAddress } from '@store/slices/authSlice';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };
  const { data: customerData } = useGetCustomerQuery({
    CustomerID: CustomerID,
    refetchOnMountOrArgChange: true,
  });

  const customer = customerData?.data?.[0];
  console.log('Fetched Customer Data:', customerData);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{customer?.ContactPerson || '-'}</Text>
        <Text style={styles.subText}>
          {' '}
          Customer Code: {customer?.CustomerID || '-'}
        </Text>
        <Text style={styles.subText}>{customer?.CompanyName || '-'}</Text>
      </View>

      {/* --- Personal Info --- */}
      <SectionTitle title="Personal Information" />
      <Info label="Full Name" value={customer?.ContactPerson || '-'} />
      <Info label="Mobile" value={customer?.ContactNo || '-'} />
      <Info label="Email" value={customer?.EmailID || '-'} />
      <Info label="Account Created" value={customer?.Insert_Date || '-'} />

      {/* Divider */}
      <Divider />

      {/* --- Company Info --- */}
      <SectionTitle title="Company Details" />
      <Info label="Company Name" value={customer?.CompanyName || '-'} />
      <Info label="Branch / Location" value={customer?.City || '-'} />
      <Info label="State" value={customer?.State || '-'} />

      <Divider />

      {/* --- Address Info --- */}
      <SectionTitle title="Address" />
      <Info label="Address Line 1" value={customer?.Address1 || '-'} />
      <Info label="Address Line 2" value={customer?.Address2 || '-'} />
      <Info label="Pincode" value={customer?.Pincode || '-'} />
      <Info label="City" value={customer?.City || '-'} />
      <Info label="State" value={customer?.State || '-'} />
      <Info label="Registered Address" value={customer?.Address || ''} />

      <Divider />

      {/* --- Account Settings --- */}
      <SectionTitle title="Account Settings" />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(routeName.EDIT_CUSTOMER, { customer })
        }
      >
        <TouchableRow text="Update Profile" />
      </TouchableOpacity>
      <TouchableRow text="Change Password" />
      <TouchableRow text="Logout" last />

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const TouchableRow = ({ text, last }: { text: string; last?: boolean }) => (
  <View style={[styles.actionRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.actionText}>{text}</Text>
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: colors.background,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 100,
    marginBottom: 10,
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    width: '50%',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },

  actionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e6e6e6',
  },

  actionText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});
