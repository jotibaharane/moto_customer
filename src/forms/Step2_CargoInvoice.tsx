// Step2_CargoInvoice.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFormikContext } from 'formik';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import DateInput from '@components/custumdate/DateInput';
import DocumentItemModal, {
  DocumentType,
  DocumentItem,
  InvoiceItem,
  ChallanItem,
  AirwayBillItem,
  BillOfEntryItem,
} from './DocumentItemModal';
import CustomRadioButton from '@components/common/CustomRadioButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------
// TYPES
// ---------------------------------------------
export interface InvoiceGroup {
  id: string;
  poNo: string;
  poDate: string;
  items: InvoiceItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

export interface ChallanGroup {
  id: string;
  items: ChallanItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

export interface AirwayBillGroup {
  id: string;
  items: AirwayBillItem[];
  totalValue: number;
  totalQuantity: string;
}

export interface BillOfEntryGroup {
  id: string;
  items: BillOfEntryItem[];
  totalValue: number;
  totalQuantity: string;
}

interface FormValues {
  cargoContent: string;
  packageType: string;
  Packages: string;
  poNo: string;
  poDate: string;
  invoices: InvoiceGroup[];
  challans: ChallanGroup[];
  airwayBills: AirwayBillGroup[];
  billOfEntries: BillOfEntryGroup[];
}

// Package Type Options
const PACKAGE_TYPE_OPTIONS = [
  { id: 'carton', label: 'Carton', value: 'carton' },
  { id: 'box', label: 'Box', value: 'box' },
  { id: 'pallet', label: 'Pallet', value: 'pallet' },
  { id: 'bag', label: 'Bag', value: 'bag' },
  { id: 'drum', label: 'Drum', value: 'drum' },
];

// Document Type Radio Options
const DOCUMENT_TYPES = [
  {
    id: 'invoice',
    label: 'Invoice',
    value: 'invoice',
    icon: 'file-document-outline',
  },
  { id: 'challan', label: 'Challan', value: 'challan', icon: 'truck-outline' },
  {
    id: 'airwaybill',
    label: 'Airway Bill',
    value: 'airwaybill',
    icon: 'airplane-outline',
  },
  {
    id: 'bill-of-entry',
    label: 'Bill of Entry',
    value: 'bill-of-entry',
    icon: 'ship-wheel',
  },
];

// Helper function to calculate total quantity
const calculateTotalQuantity = (
  items: DocumentItem[],
): { total: string; unitType?: string } => {
  if (items.length === 0) return { total: '0' };

  if (items[0] && 'unit' in items[0]) {
    const firstUnit = (items[0] as InvoiceItem).unit;
    let total = 0;

    items.forEach(item => {
      const typedItem = item as InvoiceItem;
      if (typedItem.unit === 'pcs') {
        total += parseFloat(typedItem.quantity || '0');
      } else {
        total += parseFloat(typedItem.netWeight || '0');
      }
    });

    return {
      total: total.toString(),
      unitType: firstUnit === 'pcs' ? 'pcs' : firstUnit,
    };
  } else {
    let total = 0;
    items.forEach(item => {
      const typedItem = item as AirwayBillItem;
      total += parseFloat(typedItem.qty || '0');
    });

    return { total: total.toString() };
  }
};

// Format quantity display
const formatQuantityDisplay = (group: any): string => {
  if (group.unitType) {
    if (group.unitType === 'pcs') {
      return `${group.totalQuantity} PCS`;
    } else if (group.unitType === 'kg') {
      return `${group.totalQuantity} KG`;
    } else if (group.unitType === 'litre') {
      return `${group.totalQuantity} L`;
    }
  }
  return `${group.totalQuantity} QTY`;
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
export default function Step2_InvoiceDetails() {
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>('invoice');

  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(
    null,
  );
  const [tempItems, setTempItems] = useState<DocumentItem[]>([]);

  const packageTypeModalRef = useRef<BottomModalRef>(null);
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // Handle package type selection
  const handleSelectPackageType = (type: string) => {
    setFieldValue('packageType', type);
    packageTypeModalRef.current?.close();
  };

  // Open document modal for adding new group
  const openAddDocumentModal = (type: DocumentType) => {
    setSelectedDocumentType(type);
    setTempItems([]);
    setEditingGroupIndex(null);
    setShowDocumentModal(true);
  };

  // Open document modal for editing existing group
  const openEditDocumentModal = (type: DocumentType, index: number) => {
    setSelectedDocumentType(type);

    switch (type) {
      case 'invoice':
        if (values.invoices?.[index]) {
          setTempItems(values.invoices[index].items);
        }
        break;
      case 'challan':
        if (values.challans?.[index]) {
          setTempItems(values.challans[index].items);
        }
        break;
      case 'airwaybill':
        if (values.airwayBills?.[index]) {
          setTempItems(values.airwayBills[index].items);
        }
        break;
      case 'bill-of-entry':
        if (values.billOfEntries?.[index]) {
          setTempItems(values.billOfEntries[index].items);
        }
        break;
    }

    setEditingGroupIndex(index);
    setShowDocumentModal(true);
  };

  // Submit document group
  const handleSubmitDocument = () => {
    if (tempItems.length === 0) {
      if (editingGroupIndex === null) {
        Alert.alert('Error', 'Please add at least one item!');
        return;
      }
      // If editing and no items, delete the group
      deleteDocumentGroup(selectedDocumentType, editingGroupIndex);
      setShowDocumentModal(false);
      return;
    }

    const totalValue = tempItems.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0,
    );
    const quantityData = calculateTotalQuantity(tempItems);

    const baseGroup = {
      id:
        editingGroupIndex !== null
          ? getGroupId(selectedDocumentType, editingGroupIndex)
          : `${selectedDocumentType}-group-${Date.now()}-${Math.random()}`,
      items: tempItems,
      totalValue: totalValue,
      totalQuantity: quantityData.total,
      ...(quantityData.unitType && { unitType: quantityData.unitType }),
    };

    switch (selectedDocumentType) {
      case 'invoice':
        const invoiceGroup = {
          ...baseGroup,
          poNo: values.poNo,
          poDate: values.poDate,
        };
        const updatedInvoices = [...(values.invoices || [])];
        if (editingGroupIndex !== null) {
          updatedInvoices[editingGroupIndex] = invoiceGroup;
        } else {
          updatedInvoices.push(invoiceGroup);
        }
        setFieldValue('invoices', updatedInvoices);
        break;

      case 'challan':
        const updatedChallans = [...(values.challans || [])];
        if (editingGroupIndex !== null) {
          updatedChallans[editingGroupIndex] = baseGroup;
        } else {
          updatedChallans.push(baseGroup);
        }
        setFieldValue('challans', updatedChallans);
        break;

      case 'airwaybill':
        const updatedAirwayBills = [...(values.airwayBills || [])];
        if (editingGroupIndex !== null) {
          updatedAirwayBills[editingGroupIndex] = baseGroup;
        } else {
          updatedAirwayBills.push(baseGroup);
        }
        setFieldValue('airwayBills', updatedAirwayBills);
        break;

      case 'bill-of-entry':
        const updatedBillOfEntries = [...(values.billOfEntries || [])];
        if (editingGroupIndex !== null) {
          updatedBillOfEntries[editingGroupIndex] = baseGroup;
        } else {
          updatedBillOfEntries.push(baseGroup);
        }
        setFieldValue('billOfEntries', updatedBillOfEntries);
        break;
    }

    setShowDocumentModal(false);
    setTempItems([]);
    setEditingGroupIndex(null);
  };

  // Delete document group
  const deleteDocumentGroup = (type: DocumentType, index: number) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete this ${type} group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            switch (type) {
              case 'invoice':
                const updatedInvoices = (values.invoices || []).filter(
                  (_, i) => i !== index,
                );
                setFieldValue('invoices', updatedInvoices);
                break;
              case 'challan':
                const updatedChallans = (values.challans || []).filter(
                  (_, i) => i !== index,
                );
                setFieldValue('challans', updatedChallans);
                break;
              case 'airwaybill':
                const updatedAirwayBills = (values.airwayBills || []).filter(
                  (_, i) => i !== index,
                );
                setFieldValue('airwayBills', updatedAirwayBills);
                break;
              case 'bill-of-entry':
                const updatedBillOfEntries = (
                  values.billOfEntries || []
                ).filter((_, i) => i !== index);
                setFieldValue('billOfEntries', updatedBillOfEntries);
                break;
            }
          },
        },
      ],
    );
  };

  // Get group ID
  const getGroupId = (type: DocumentType, index: number): string => {
    switch (type) {
      case 'invoice':
        return values.invoices[index].id;
      case 'challan':
        return values.challans[index].id;
      case 'airwaybill':
        return values.airwayBills[index].id;
      case 'bill-of-entry':
        return values.billOfEntries[index].id;
    }
  };

  // Get groups by type
  const getGroupsByType = (type: DocumentType): any[] => {
    switch (type) {
      case 'invoice':
        return values.invoices || [];
      case 'challan':
        return values.challans || [];
      case 'airwaybill':
        return values.airwayBills || [];
      case 'bill-of-entry':
        return values.billOfEntries || [];
    }
  };

  // Get group icon and color
  const getGroupIcon = (type: DocumentType) => {
    switch (type) {
      case 'invoice':
        return { icon: 'file-document-outline', color: '#10B981' };
      case 'challan':
        return { icon: 'truck-outline', color: '#10B981' };
      case 'airwaybill':
        return { icon: 'airplane-outline', color: '#8B5CF6' };
      case 'bill-of-entry':
        return { icon: 'ship-wheel', color: '#F59E0B' };
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalInvoiceValue = 0;
    let totalChallanValue = 0;
    let totalAirwayBillValue = 0;
    let totalBillOfEntryValue = 0;

    (values.invoices || []).forEach(
      group => (totalInvoiceValue += group.totalValue),
    );
    (values.challans || []).forEach(
      group => (totalChallanValue += group.totalValue),
    );
    (values.airwayBills || []).forEach(
      group => (totalAirwayBillValue += group.totalValue),
    );
    (values.billOfEntries || []).forEach(
      group => (totalBillOfEntryValue += group.totalValue),
    );

    return {
      totalInvoiceValue,
      totalChallanValue,
      totalAirwayBillValue,
      totalBillOfEntryValue,
      grandTotalValue:
        totalInvoiceValue +
        totalChallanValue +
        totalAirwayBillValue +
        totalBillOfEntryValue,
    };
  };

  const {
    totalInvoiceValue,
    totalChallanValue,
    totalAirwayBillValue,
    totalBillOfEntryValue,
    grandTotalValue,
  } = calculateTotals();

  // Render document types in rows of 2
  const renderDocumentTypeButtons = () => {
    const rows = [];
    for (let i = 0; i < DOCUMENT_TYPES.length; i += 2) {
      const rowItems = DOCUMENT_TYPES.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.documentTypeRow}>
          {rowItems.map(docType => (
            <TouchableOpacity
              key={docType.id}
              style={[
                styles.documentTypeButton,
                selectedDocumentType === docType.value &&
                  styles.documentTypeButtonSelected,
              ]}
              onPress={() =>
                openAddDocumentModal(docType.value as DocumentType)
              }
            >
              <View style={styles.documentTypeButtonContent}>
                <Icon
                  name={docType.icon}
                  size={24}
                  color={
                    selectedDocumentType === docType.value
                      ? '#3B82F6'
                      : '#6B7280'
                  }
                />
                <Text
                  style={[
                    styles.documentTypeButtonText,
                    selectedDocumentType === docType.value &&
                      styles.documentTypeButtonTextSelected,
                  ]}
                >
                  {docType.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>,
      );
    }
    return rows;
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cargo Details Section */}
        <View style={styles.section}>
          <View style={styles.formGroup}>
            <TextInput
              label="Cargo Content / Material Remark"
              value={values.cargoContent}
              onChangeText={t => setFieldValue('cargoContent', t)}
              mode="outlined"
              style={styles.compactInput}
              outlineStyle={styles.inputOutline}
              theme={{
                roundness: 8,
                colors: {
                  primary: '#3B82F6',
                  background: '#FFFFFF',
                },
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="Package Type"
              value={values.packageType}
              onChangeText={t => setFieldValue('packageType', t)}
              mode="outlined"
              style={styles.compactInput}
              outlineStyle={styles.inputOutline}
              theme={{
                roundness: 8,
                colors: {
                  primary: '#3B82F6',
                  background: '#FFFFFF',
                },
              }}
              right={
                <TextInput.Icon
                  icon="menu-down"
                  onPress={() => packageTypeModalRef.current?.open()}
                />
              }
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              label="Number of Packages"
              value={values.Packages}
              onChangeText={t => setFieldValue('Packages', t)}
              mode="outlined"
              style={styles.compactInput}
              outlineStyle={styles.inputOutline}
              keyboardType="numeric"
              theme={{
                roundness: 8,
                colors: {
                  primary: '#3B82F6',
                  background: '#FFFFFF',
                },
              }}
            />
          </View>
        </View>

        {/* PO Details */}
        <View style={styles.section}>
          <View style={styles.formRow}>
            <View style={[styles.formColumn, styles.formColumnGap]}>
              <TextInput
                label="PO Number"
                value={values.poNo}
                onChangeText={t => setFieldValue('poNo', t)}
                mode="outlined"
                style={styles.compactInput}
                outlineStyle={styles.inputOutline}
                theme={{
                  roundness: 8,
                  colors: {
                    primary: '#3B82F6',
                    background: '#FFFFFF',
                  },
                }}
              />
            </View>
            <View style={styles.formColumn}>
              <DateInput
                label="PO Date"
                value={values.poDate}
                onChange={date => setFieldValue('poDate', date)}
                style={styles.compactInput}
              />
            </View>
          </View>
        </View>

        {/* Document Type Selection - Professional 2-column layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Documents</Text>
          {/* <Text style={styles.sectionSubtitle}>
            Select document type to add:
          </Text> */}

          <View style={[styles.documentTypeGrid, { flexDirection: 'column' }]}>
            <View style={{ gap: 12 }}>
              {DOCUMENT_TYPES.map(docType => (
                <CustomRadioButton
                  key={docType.id}
                  options={[docType]} // 👈 SINGLE OPTION
                  selectedOption={selectedDocumentType}
                  onSelect={(value: DocumentType) => {
                    setSelectedDocumentType(value);
                    openAddDocumentModal(value);
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Documents List */}
        {DOCUMENT_TYPES.filter(
          docType => docType.value === selectedDocumentType,
        ).map(docType => {
          const groups = getGroupsByType(docType.value as DocumentType);
          if (groups.length === 0) return null;

          return (
            <View key={docType.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{docType.label}s</Text>
              <View style={styles.buttonsGrid}>
                {groups.map((group, index) => {
                  const iconInfo = getGroupIcon(docType.value as DocumentType);
                  return (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.documentButton, styles.buttonCompleted]}
                      onPress={() =>
                        openEditDocumentModal(
                          docType.value as DocumentType,
                          index,
                        )
                      }
                      onLongPress={() =>
                        deleteDocumentGroup(
                          docType.value as DocumentType,
                          index,
                        )
                      }
                    >
                      <View style={styles.buttonContent}>
                        <View style={styles.completedButtonContent}>
                          <Icon
                            name={iconInfo.icon}
                            size={20}
                            color={iconInfo.color}
                          />
                          <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonText}>
                              {docType.label} {index + 1}
                            </Text>
                            <Text style={styles.buttonSubText}>
                              {docType.value === 'airwaybill' ||
                              docType.value === 'bill-of-entry'
                                ? `${
                                    group.items[0]?.current || ''
                                  } ${group.totalValue.toLocaleString()}`
                                : `₹${group.totalValue.toLocaleString()}`}
                            </Text>
                            <Text style={styles.buttonQuantityText}>
                              {formatQuantityDisplay(group)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Reusable Document Modal */}
      <DocumentItemModal
        visible={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setTempItems([]);
          setEditingGroupIndex(null);
        }}
        documentType={selectedDocumentType}
        editingIndex={editingGroupIndex}
        tempItems={tempItems}
        setTempItems={setTempItems}
        onSubmit={handleSubmitDocument}
        onDeleteGroup={() => {
          // Delete the group when all items are removed
          if (editingGroupIndex !== null) {
            deleteDocumentGroup(selectedDocumentType, editingGroupIndex);
          }
        }}
      />

      {/* Bottom Modal for Package Type Selection */}
      <BottomModal
        ref={packageTypeModalRef}
        customHeight={300}
        backdropOpacity={0.6}
        preventSwipeClose={true}
      >
        <View style={styles.modalContentWrapper}>
          <Text style={styles.bottomModalTitle}>Select Package Type</Text>
          <View style={styles.bottomModalOptionsContainer}>
            {PACKAGE_TYPE_OPTIONS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.bottomModalOption,
                  values.packageType === item.value &&
                    styles.bottomModalOptionSelected,
                ]}
                onPress={() => handleSelectPackageType(item.value)}
              >
                <Text
                  style={[
                    styles.bottomModalOptionText,
                    values.packageType === item.value &&
                      styles.bottomModalOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {values.packageType === item.value && (
                  <Icon name="check" size={18} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomModal>
    </>
  );
}

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  // Compact Input Styles
  compactInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    height: 48,
  },
  inputOutline: {
    borderWidth: 1,
  },
  // Form Layout
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  formColumn: {
    flex: 1,
  },
  formColumnGap: {
    marginRight: 12,
  },
  // Document Type Grid Styles (2-column layout)
  documentTypeGrid: {
    gap: 12,
  },
  documentTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  documentTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  documentTypeButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  documentTypeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  documentTypeButtonTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Document List Styles
  buttonsGrid: {
    gap: 8,
  },
  documentButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonCompleted: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  buttonContent: {
    width: '100%',
  },
  completedButtonContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  buttonSubText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 2,
  },
  buttonQuantityText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Total Section
  totalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  // Bottom Modal Styles
  modalContentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  bottomModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomModalOptionsContainer: {
    flex: 1,
  },
  bottomModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  bottomModalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  bottomModalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  bottomModalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
