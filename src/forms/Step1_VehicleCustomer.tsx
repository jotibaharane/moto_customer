// Step1_VehicleCustomer.tsx
import React, { useState, useMemo } from 'react';
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
        {/* Name - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            NAME
          </Text>

          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}Name`] || '—'}
          </Text>
        </View>

        {/* Phone - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            PHONE
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}Phone`] || '—'}
          </Text>
        </View>

        {/* GST - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            GST NO
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}Gst`] || 'Not specified'}
          </Text>
        </View>

        {/* Address Line 1 - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            ADDRESS
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}Address1`] || '—'}
          </Text>
        </View>

        {/* Address Line 2 - only show if exists */}
        {values[`${prefix}Address2`] && (
          <View style={styles.fieldRow}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              ADDRESS 2
            </Text>
            <Text variant="bodyMedium" style={styles.fieldValue}>
              {values[`${prefix}Address2`]}
            </Text>
          </View>
        )}

        {/* Google Address - only show if exists */}
        {values[`${prefix}Google`] && (
          <View style={styles.fieldRow}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              GOOGLE
            </Text>
            <Text variant="bodySmall" style={styles.fieldValue}>
              {values[`${prefix}Google`]}
            </Text>
          </View>
        )}

        {/* City - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            CITY
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}City`] || '—'}
          </Text>
        </View>

        {/* District - only show if exists */}
        {values[`${prefix}District`] && (
          <View style={styles.fieldRow}>
            <Text variant="labelSmall" style={styles.fieldLabel}>
              DISTRICT
            </Text>
            <Text variant="bodyMedium" style={styles.fieldValue}>
              {values[`${prefix}District`]}
            </Text>
          </View>
        )}

        {/* State - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            STATE
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}State`] || '—'}
          </Text>
        </View>

        {/* Pincode - label and value in same row */}
        <View style={styles.fieldRow}>
          <Text variant="labelSmall" style={styles.fieldLabel}>
            PINCODE
          </Text>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {values[`${prefix}Pincode`] || '—'}
          </Text>
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
              {/* GST Number */}
              <TextInput
                label="GST Number"
                value={values[`${prefix}Gst`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Gst`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* Name */}
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

              {/* Phone */}
              <TextInput
                label="Phone Number"
                value={values[`${prefix}Phone`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Phone`, t)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
              />

              {/* Address Line 1 */}
              <TextInput
                label="Address Line 1"
                value={values[`${prefix}Address1`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Address1`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* Address Line 2 */}
              <TextInput
                label="Address Line 2"
                value={values[`${prefix}Address2`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Address2`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* Google Address */}
              <TextInput
                label="Google Address"
                value={values[`${prefix}Google`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Google`, t)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              {/* City */}
              <TextInput
                label={type === 'pickup' ? 'Origin City' : 'Destination City'}
                value={values[`${prefix}City`] || ''}
                onChangeText={t => setFieldValue(`${prefix}City`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* District */}
              <TextInput
                label="District"
                value={values[`${prefix}District`] || ''}
                onChangeText={t => setFieldValue(`${prefix}District`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* State */}
              <TextInput
                label="State"
                value={values[`${prefix}State`] || ''}
                onChangeText={t => setFieldValue(`${prefix}State`, t)}
                mode="outlined"
                style={styles.input}
              />

              {/* Pincode */}
              <TextInput
                label="Pincode"
                keyboardType="numeric"
                value={values[`${prefix}Pincode`] || ''}
                onChangeText={t => setFieldValue(`${prefix}Pincode`, t)}
                mode="outlined"
                style={styles.input}
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
    padding: 16,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  editButton: {
    margin: 0,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    backgroundColor: '#e2e8f0',
    height: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#000000', // Light gray for labels
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
    flex: 1,
  },
  fieldValue: {
    color: '#000000ff', // Dark color for values
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    marginLeft: 8,
    textAlign: 'left',
  },
  googleValue: {
    color: '#475569', // Slightly lighter for google address
    fontSize: 12,
    fontStyle: 'italic',
    flex: 2,
    textAlign: 'right',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
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
