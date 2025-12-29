// Step1_VehicleCustomer.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Divider,
  TextInput,
  Modal,
  Portal,
  Button,
} from 'react-native-paper';

// ========== TYPES ==========
interface Step1_VehicleCustomerProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  selectedLoadPost?: string;
  dropdownItems?: any[];
}

interface LocationModalProps {
  visible: boolean;
  onDismiss: () => void;
  type: 'pickup' | 'drop';
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

// ========== HELPER FUNCTIONS ==========
const formatAddress = (address1?: string, address2?: string): string => {
  if (address1 && address2) return `${address1}, ${address2}`;
  return address1 || address2 || 'Address not specified';
};

const getFullAddressText = (values: any, prefix: 'pickup' | 'drop') => {
  const parts: string[] = [];

  if (values[`${prefix}Address1`]) parts.push(values[`${prefix}Address1`]);
  if (values[`${prefix}Address2`]) parts.push(values[`${prefix}Address2`]);

  if (values[`${prefix}Google`]) {
    parts.push('-------------------------------------------------------------');
    parts.push(values[`${prefix}Google`]);
  }

  const cityDistrict = [values[`${prefix}City`], values[`${prefix}District`]]
    .filter(Boolean)
    .join(', ');
  if (cityDistrict) parts.push(cityDistrict);

  const statePincode = [values[`${prefix}State`], values[`${prefix}Pincode`]]
    .filter(Boolean)
    .join(', ');
  if (statePincode) parts.push(statePincode);

  return parts.join('\n');
};

// ========== REUSABLE COMPONENTS ==========
const LocationCard: React.FC<{
  title: string;
  values: any;
  onEdit: () => void;
  type: 'pickup' | 'drop';
}> = ({ title, values, onEdit, type }) => {
  const prefix = type;

  return (
    <Card style={styles.card} elevation={0}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            {title}
          </Text>
          <IconButton
            icon="pencil"
            size={16}
            onPress={onEdit}
            style={styles.editButton}
          />
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.cardContent}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldContainer}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              NAME
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}Name`] || '—'}
            </Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              PHONE
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}Phone`] || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            GST NO
          </Text>
          <Text variant="bodySmall" style={styles.fieldValue}>
            {values[`${prefix}Gst`] || 'Not specified'}
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            ADDRESS
          </Text>
          <Text variant="bodySmall" style={styles.fieldValue}>
            {formatAddress(
              values[`${prefix}Address1`],
              values[`${prefix}Address2`],
            ) || '—'}
          </Text>
          {values[`${prefix}Google`] && (
            <View style={styles.fieldContainer}>
              <Text variant="bodySmall" style={styles.googleValue}>
                {values[`${prefix}Google`]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldContainer}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              CITY
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}City`] || '—'}
            </Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              STATE
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}State`] || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldContainer}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              PINCODE
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}Pincode`] || '—'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onDismiss,
  type,
  values,
  setFieldValue,
}) => {
  const prefix = type;
  const title =
    type === 'pickup' ? 'Update Consigner Details' : 'Update Consignee Details';

  const handleSave = () => {
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            </View>
            <Divider style={styles.modalDivider} />

            <ScrollView style={styles.modalContent}>
              <TextInput
                label="GST Number"
                value={values[`${prefix}Gst`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Gst`, t)}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label={
                  type === 'pickup'
                    ? 'Consigner Name / Shipper Name'
                    : 'Consignee Name'
                }
                value={values[`${prefix}Name`]}
                onChangeText={t => setFieldValue(`${prefix}Name`, t)}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Full Address"
                value={getFullAddressText(values, prefix)}
                mode="outlined"
                multiline
                numberOfLines={6}
                editable={true}
                style={styles.fullAddressInput}
              />

              <TextInput
                label="Pincode"
                keyboardType="numeric"
                value={values[`${prefix}Pincode`]}
                onChangeText={t => setFieldValue(`${prefix}Pincode`, t)}
                mode="outlined"
                style={styles.halfInput}
              />

              <TextInput
                label={type === 'pickup' ? 'Origin' : 'Destination'}
                value={values[`${prefix}City`] || ''}
                onChangeText={t => setFieldValue(`${prefix}City`, t)}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="State"
                value={values[`${prefix}State`]}
                onChangeText={t => setFieldValue(`${prefix}State`, t)}
                mode="outlined"
                style={styles.halfInput}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  Save Changes
                </Button>
              </View>
            </ScrollView>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

// ========== MAIN COMPONENT ==========
export default function Step1_VehicleCustomer({
  values,
  setFieldValue,
  selectedLoadPost: propSelectedLoadPost,
  dropdownItems: propDropdownItems,
}: Step1_VehicleCustomerProps) {
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const selectedLoadPost = propSelectedLoadPost || '';
  const dropdownItems = propDropdownItems || [];

  const selectedCard = useMemo(
    () =>
      dropdownItems.find(item => item.loadPostId === selectedLoadPost)?.full,
    [selectedLoadPost, dropdownItems],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedCard ? (
          <>
            <LocationCard
              title="Consignor Details"
              values={values}
              onEdit={() => setPickupOpen(true)}
              type="pickup"
            />

            <LocationCard
              title="Consignee Details"
              values={values}
              onEdit={() => setDropOpen(true)}
              type="drop"
            />
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Select a load post to view details
            </Text>
          </View>
        )}
      </ScrollView>

      <LocationModal
        visible={pickupOpen}
        onDismiss={() => setPickupOpen(false)}
        type="pickup"
        values={values}
        setFieldValue={setFieldValue}
      />

      <LocationModal
        visible={dropOpen}
        onDismiss={() => setDropOpen(false)}
        type="drop"
        values={values}
        setFieldValue={setFieldValue}
      />
    </View>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 0,
    paddingTop: 0,
  },
  modalContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    maxHeight: '85%',
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    margin: 0,
  },
  modalDivider: {
    marginVertical: 12,
  },
  modalContent: {
    maxHeight: 500,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  fullAddressInput: {
    backgroundColor: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 0,
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    margin: 0,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    backgroundColor: '#f0f0f0',
    height: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fieldContainer: {
    flex: 1,
  },
  fieldLabel: {
    color: '#000000ff',
    fontWeight: '500',
    marginBottom: 2,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: '#212121',
    fontSize: 12,
    lineHeight: 16,
  },
  googleValue: {
    color: '#1d1d1dff',
    fontSize: 11,
    lineHeight: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  halfInput: {
    flex: 1,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    borderColor: '#ddd',
    borderRadius: 2,
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 2,
  },
  placeholderContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});
