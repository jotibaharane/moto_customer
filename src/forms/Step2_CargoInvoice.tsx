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
  BillOfEntryItem,
  ChallanItem,
  InvoiceItem,
} from './DocumentItemModal';
import CustomRadioButton from '@components/common/CustomRadioButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------
// TYPES
// ---------------------------------------------
export interface InvoiceGroup {
  id: string;
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

export interface BillOfEntryGroup {
  id: string;
  items: BillOfEntryItem[];
  totalValue: number;
  totalQuantity: string;
}

interface FormValues {
  // Main form fields
  cargoContent?: string;
  packageType?: string;
  Packages?: string;
  poNo?: string;
  poDate?: string;

  // Document groups
  invoices: InvoiceGroup[];
  challans: ChallanGroup[];
  billOfEntries: BillOfEntryGroup[];

  // Additional fields for context
  loadpostid?: string;
  vehicleno?: string;
  driverName?: string;
}

// Document Type Radio Options
const DOCUMENT_TYPES = [
  {
    id: 'invoice',
    label: 'Invoice Details',
    value: 'invoice',
    icon: 'file-document-outline',
    color: '#10B981',
    bgColor: '#F0FDF4',
  },
  {
    id: 'bill-of-entry',
    label: 'Bill of Entry Details',
    value: 'bill-of-entry',
    icon: 'ship-wheel',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },

  {
    id: 'challan',
    label: 'Challan Details',
    value: 'challan',
    icon: 'truck-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
];

// Helper function to calculate total quantity
const calculateTotalQuantity = (
  items: DocumentItem[],
): { total: string; unitType?: string } => {
  if (items.length === 0) return { total: '0' };

  if (items[0] && 'unit' in items[0]) {
    const firstUnit = (items[0] as any).unit;
    let total = 0;

    items.forEach(item => {
      const typedItem = item as any;
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
      const typedItem = item as any;
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

// Format currency display
const formatCurrencyDisplay = (group: any, type: DocumentType): string => {
  if (type === 'bill-of-entry') {
    return `${
      group.items[0]?.currency || 'INR'
    } ${group.totalValue.toLocaleString()}`;
  }
  return `₹${group.totalValue.toLocaleString()}`;
};

// ---------------------------------------------
// MAIN COMPONENT - FIXED VERSION
// ---------------------------------------------
export default function Step2_InvoiceDetails() {
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>('invoice');

  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(
    null,
  );
  const [editingDocumentType, setEditingDocumentType] =
    useState<DocumentType | null>(null);
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
    setEditingDocumentType(null);
    setShowDocumentModal(true);
  };

  // Open document modal for editing existing group
  const openEditDocumentModal = (type: DocumentType, index: number) => {
    setSelectedDocumentType(type);
    setEditingDocumentType(type);

    switch (type) {
      case 'invoice':
        if (values.invoices?.[index]) {
          setTempItems([...values.invoices[index].items]);
        }
        break;
      case 'challan':
        if (values.challans?.[index]) {
          setTempItems([...values.challans[index].items]);
        }
        break;
      case 'bill-of-entry':
        if (values.billOfEntries?.[index]) {
          setTempItems([...values.billOfEntries[index].items]);
        }
        break;
    }

    setEditingGroupIndex(index);
    setShowDocumentModal(true);
  };

  // Submit document group - FIXED: Now preserves all document types
  const handleSubmitDocument = () => {
    if (tempItems.length === 0) {
      if (editingGroupIndex !== null && editingDocumentType) {
        // If editing and no items, delete the group
        deleteDocumentGroup(editingDocumentType, editingGroupIndex);
        setShowDocumentModal(false);
        return;
      }
      Alert.alert('Error', 'Please add at least one item!');
      return;
    }

    const totalValue = tempItems.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0,
    );
    const quantityData = calculateTotalQuantity(tempItems);

    const baseGroup = {
      id:
        editingGroupIndex !== null && editingDocumentType
          ? getGroupId(editingDocumentType, editingGroupIndex)
          : `${selectedDocumentType}-group-${Date.now()}-${Math.random()}`,
      items: [...tempItems],
      totalValue: totalValue,
      totalQuantity: quantityData.total,
      ...(quantityData.unitType && { unitType: quantityData.unitType }),
    };

    // Use editingDocumentType if editing, otherwise use selectedDocumentType
    const targetType = editingDocumentType || selectedDocumentType;

    switch (targetType) {
      case 'invoice':
        const updatedInvoices = [...(values.invoices || [])];
        if (editingGroupIndex !== null) {
          updatedInvoices[editingGroupIndex] = baseGroup;
        } else {
          updatedInvoices.push(baseGroup);
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
    setEditingDocumentType(null);
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
        return values.invoices?.[index]?.id || '';
      case 'challan':
        return values.challans?.[index]?.id || '';
      case 'bill-of-entry':
        return values.billOfEntries?.[index]?.id || '';
    }
  };

  // Get groups by type
  const getGroupsByType = (type: DocumentType): any[] => {
    switch (type) {
      case 'invoice':
        return values.invoices || [];
      case 'challan':
        return values.challans || [];
      case 'bill-of-entry':
        return values.billOfEntries || [];
    }
  };

  // Calculate totals for summary
  const calculateTotals = () => {
    let totalInvoiceValue = 0;
    let totalChallanValue = 0;
    let totalBillOfEntryValue = 0;

    (values.invoices || []).forEach(
      group => (totalInvoiceValue += group.totalValue),
    );
    (values.challans || []).forEach(
      group => (totalChallanValue += group.totalValue),
    );
    (values.billOfEntries || []).forEach(
      group => (totalBillOfEntryValue += group.totalValue),
    );

    return {
      totalInvoiceValue,
      totalChallanValue,
      totalBillOfEntryValue,
      grandTotalValue:
        totalInvoiceValue + totalChallanValue + totalBillOfEntryValue,
    };
  };

  const {
    totalInvoiceValue,
    totalChallanValue,
    totalBillOfEntryValue,
    grandTotalValue,
  } = calculateTotals();

  // Check if any document exists
  const hasAnyDocument = () => {
    return (
      (values.invoices?.length || 0) > 0 ||
      (values.challans?.length || 0) > 0 ||
      (values.billOfEntries?.length || 0) > 0
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        {/* <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Document Management</Text>
          <Text style={styles.headerSubtitle}>
            Add and manage invoices, challans, and bill of entries
          </Text>
        </View> */}

        {/* Add Documents Section - Professional Cards Layout */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <Text style={styles.sectionTitle}>Add New Document</Text> */}
            {/* <Text style={styles.sectionDescription}>
              Select document type to add
            </Text> */}
          </View>

          <View style={styles.documentTypeGrid}>
            {DOCUMENT_TYPES.map(docType => (
              <TouchableOpacity
                key={docType.id}
                style={[
                  styles.documentTypeCard,
                  { backgroundColor: docType.bgColor },
                ]}
                onPress={() =>
                  openAddDocumentModal(docType.value as DocumentType)
                }
              >
                <View style={styles.documentTypeIconContainer}>
                  <Icon name={docType.icon} size={24} color={docType.color} />
                </View>
                <Text style={styles.documentTypeLabel}>{docType.label}</Text>
                <View style={styles.documentCountBadge}>
                  <Text style={styles.documentCountText}>
                    {getGroupsByType(docType.value as DocumentType).length}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Document Summary Section */}
        {/* {hasAnyDocument() && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Document Summary</Text>
            <View style={styles.summaryCards}>
              {totalInvoiceValue > 0 && (
                <View
                  style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}
                >
                  <View style={styles.summaryCardHeader}>
                    <Icon
                      name="file-document-outline"
                      size={16}
                      color="#10B981"
                    />
                    <Text
                      style={[styles.summaryCardTitle, { color: '#10B981' }]}
                    >
                      Invoices
                    </Text>
                  </View>
                  <Text style={styles.summaryCardValue}>
                    ₹{totalInvoiceValue.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryCardCount}>
                    {values.invoices?.length || 0} groups
                  </Text>
                </View>
              )}

              {totalChallanValue > 0 && (
                <View
                  style={[styles.summaryCard, { backgroundColor: '#EFF6FF' }]}
                >
                  <View style={styles.summaryCardHeader}>
                    <Icon name="truck-outline" size={16} color="#3B82F6" />
                    <Text
                      style={[styles.summaryCardTitle, { color: '#3B82F6' }]}
                    >
                      Challans
                    </Text>
                  </View>
                  <Text style={styles.summaryCardValue}>
                    ₹{totalChallanValue.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryCardCount}>
                    {values.challans?.length || 0} groups
                  </Text>
                </View>
              )}

              {totalBillOfEntryValue > 0 && (
                <View
                  style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}
                >
                  <View style={styles.summaryCardHeader}>
                    <Icon name="ship-wheel" size={16} color="#F59E0B" />
                    <Text
                      style={[styles.summaryCardTitle, { color: '#F59E0B' }]}
                    >
                      Bill of Entries
                    </Text>
                  </View>
                  <Text style={styles.summaryCardValue}>
                    ${totalBillOfEntryValue.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryCardCount}>
                    {values.billOfEntries?.length || 0} groups
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.grandTotalCard}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                ₹{grandTotalValue.toLocaleString()}
              </Text>
            </View>
          </View>
        )} */}

        {/* Documents List - Show ALL document groups */}
        {hasAnyDocument() && (
          <View style={styles.section}>
            {/* <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Documents</Text>
              <Text style={styles.sectionDescription}>
                Tap to edit, long press to delete
              </Text>
            </View> */}

            {/* Show ALL document groups from ALL types */}
            {DOCUMENT_TYPES.map(docType => {
              const groups = getGroupsByType(docType.value as DocumentType);
              if (groups.length === 0) return null;

              return (
                <View key={docType.id} style={styles.documentTypeSection}>
                  <View style={styles.documentTypeHeader}>
                    <View style={styles.documentTypeTitleRow}>
                      <Icon
                        name={docType.icon}
                        size={18}
                        color={docType.color}
                      />
                      <Text style={styles.documentTypeSectionTitle}>
                        {docType.label}s ({groups.length})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addMoreButton}
                      onPress={() =>
                        openAddDocumentModal(docType.value as DocumentType)
                      }
                    >
                      <Icon name="plus" size={16} color={docType.color} />
                      <Text
                        style={[styles.addMoreText, { color: docType.color }]}
                      >
                        Add More
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.documentGroupsList}>
                    {groups.map((group, index) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.documentGroupCard,
                          { borderLeftColor: docType.color },
                        ]}
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
                        <View style={styles.documentGroupHeader}>
                          {/* <View style={styles.documentGroupTitle}>
                            <Icon
                              name={docType.icon}
                              size={16}
                              color={docType.color}
                            />
                            <Text style={styles.documentGroupName}>
                              {docType.label} {index + 1}
                            </Text>
                          </View> */}
                          {/* <Icon
                              name="chevron-right"
                              size={18}
                              color="#9CA3AF"
                            /> */}
                        </View>

                        <View style={styles.documentGroupDetails}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Value:</Text>
                            <Text style={styles.detailValue}>
                              {formatCurrencyDisplay(
                                group,
                                docType.value as DocumentType,
                              )}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Quantity:</Text>
                            <Text style={styles.detailValue}>
                              {formatQuantityDisplay(group)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Items:</Text>
                            <Text style={styles.detailValue}>
                              {group.items.length} item
                              {group.items.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.documentGroupFooter}>
                          <View style={styles.statusBadge}>
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: docType.color },
                              ]}
                            />
                            <Text style={styles.statusText}>Active</Text>
                          </View>
                          <Text style={styles.editHint}>
                            Tap to edit • Long press to delete
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Reusable Document Modal */}
      <DocumentItemModal
        visible={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setTempItems([]);
          setEditingGroupIndex(null);
          setEditingDocumentType(null);
        }}
        documentType={editingDocumentType || selectedDocumentType}
        editingIndex={editingGroupIndex}
        tempItems={tempItems}
        setTempItems={setTempItems}
        onSubmit={handleSubmitDocument}
        onDeleteGroup={() => {
          // Delete the group when all items are removed
          if (editingGroupIndex !== null && editingDocumentType) {
            deleteDocumentGroup(editingDocumentType, editingGroupIndex);
          }
        }}
        loadpostid={values.loadpostid || 'LP12345'}
        vehicleno={values.vehicleno || 'MH12AB1234'}
        driverName={values.driverName || 'John Doe'}
      />
    </>
  );
}

// ---------------------------------------------
// PROFESSIONAL STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  // Header Section
  headerSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Document Type Cards
  documentTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  documentTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 100,
  },
  documentTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  documentTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    marginLeft: 4,
  },
  documentCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  // Summary Section
  summarySection: {
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryCardCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  grandTotalCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Document Groups List
  documentTypeSection: {
    marginBottom: 20,
  },
  documentTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTypeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentTypeSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentGroupsList: {
    gap: 12,
  },
  documentGroupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  documentGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentGroupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentGroupName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  documentGroupDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  documentGroupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  editHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
