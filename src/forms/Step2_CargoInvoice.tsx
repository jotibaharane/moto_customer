import React, { useState, useRef, useEffect } from 'react';
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
import { Checkbox } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setIsDocumentsAvailable } from '@store/slices/VehicleSheet';
import DeclarationModal from '@modal/DeclarationModal';

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
  StockTransfers: InvoiceGroup[];

  // Shipment Documents
  shipmentDocumentType?: 'domestic' | 'international' | null;
  domesticDocuments?: string[];
  internationalDocuments?: string[];
  declarationImages?: [];

  // Additional fields for context
  loadpostid?: string;
  vehicleno?: string;
  driverName?: string;
  isDeclared?: string;
}

// Document Type Radio Options
const DOCUMENT_TYPES = [
  {
    id: 'invoice',
    label: 'Commercial Invoice ',
    value: 'invoice',
    icon: 'file-document-outline',
    color: '#10B981',
    bgColor: '#F0FDF4',
  },
  {
    id: 'bill-of-entry',
    label: 'Bill of Entry / AirwayBill',
    value: 'bill-of-entry',
    icon: 'ship-wheel',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 'challan',
    label: 'Challan',
    value: 'challan',
    icon: 'truck-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'Stock-transfer',
    label: 'Stock Transfer',
    value: 'Stock-transfer',
    icon: 'package-variant',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
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
// SHIPMENT TYPE SELECTION COMPONENT
// ---------------------------------------------
interface ShipmentTypeSelectorProps {
  selectedType: 'domestic' | 'international' | null;
  onSelectType: (type: 'domestic' | 'international' | null) => void;
}

const ShipmentTypeSelector: React.FC<ShipmentTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <View style={styles.shipmentTypeContainer}>
      {/* <Text style={styles.shipmentTypeTitle}>Select Shipment Type</Text> */}

      <View style={styles.shipmentTypeButtons}>
        <TouchableOpacity
          style={[
            styles.shipmentTypeButton,
            selectedType === 'domestic' && styles.shipmentTypeButtonActive,
          ]}
          onPress={() => onSelectType('domestic')}
        >
          <View style={styles.shipmentTypeButtonContent}>
            <Icon
              name="truck-fast-outline"
              size={20}
              color={selectedType === 'domestic' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.shipmentTypeButtonText,
                selectedType === 'domestic' &&
                  styles.shipmentTypeButtonTextActive,
              ]}
            >
              Domestic
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.shipmentTypeButton,
            selectedType === 'international' && styles.shipmentTypeButtonActive,
          ]}
          onPress={() => onSelectType('international')}
        >
          <View style={styles.shipmentTypeButtonContent}>
            <Icon
              name="earth"
              size={20}
              color={selectedType === 'international' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.shipmentTypeButtonText,
                selectedType === 'international' &&
                  styles.shipmentTypeButtonTextActive,
              ]}
            >
              International
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
export default function Step2_InvoiceDetails() {
  const dispatch = useDispatch();
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
  const [modalVisible, setModalVisible] = useState(false);

  // Handle shipment document type selection
  const handleShipmentTypeSelect = (type: 'domestic' | 'international') => {
    const newType = values.shipmentDocumentType === type ? null : type;

    setFieldValue('shipmentDocumentType', newType);
  };
  // const [checked, setChecked] = useState(false);

  const checked = values?.isDeclared;

  // Filter document types based on shipment type
  const getFilteredDocumentTypes = () => {
    if (values.shipmentDocumentType === 'domestic') {
      return DOCUMENT_TYPES.filter(
        doc =>
          doc.value === 'invoice' ||
          doc.value === 'Stock-transfer' ||
          doc.value === 'challan',
      );
    } else if (values.shipmentDocumentType === 'international') {
      return DOCUMENT_TYPES.filter(
        doc => doc.value === 'challan' || doc.value === 'bill-of-entry',
      );
    }
    return DOCUMENT_TYPES; // Show all when no type selected
  };
  useEffect(() => {
    // Set default shipment type to 'domestic' if not already set
    if (!values.shipmentDocumentType) {
      setFieldValue('shipmentDocumentType', 'domestic');
    }
  }, []);
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

  // const hasAnyDocument = () => {
  //   return (values.invoices?.length || 0) > 0 ||
  //     (values.challans?.length || 0) > 0 ||
  //     (values.billOfEntries?.length || 0) > 0 ||
  //     (values.StockTransfers?.length || 0) > 0;
  // };

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

  // Submit document group
  const handleSubmitDocument = () => {
    if (tempItems.length === 0) {
      if (editingGroupIndex !== null && editingDocumentType) {
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

      case 'Stock-transfer':
        const updatedStockTransfers = [...(values.StockTransfers || [])];
        if (editingGroupIndex !== null) {
          updatedStockTransfers[editingGroupIndex] = baseGroup;
        } else {
          updatedStockTransfers.push(baseGroup);
        }
        setFieldValue('StockTransfers', updatedStockTransfers);
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
              case 'Stock-transfer':
                const updatedStockTransfers = (
                  values.StockTransfers || []
                ).filter((_, i) => i !== index);
                setFieldValue('StockTransfers', updatedStockTransfers);
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
      case 'Stock-transfer':
        return values.StockTransfers?.[index]?.id || '';
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
      case 'Stock-transfer':
        return values.StockTransfers || [];
    }
  };

  // Calculate totals for summary
  const calculateTotals = () => {
    let totalInvoiceValue = 0;
    let totalChallanValue = 0;
    let totalBillOfEntryValue = 0;
    let totalStockTransferValue = 0;

    (values.invoices || []).forEach(
      group => (totalInvoiceValue += group.totalValue),
    );
    (values.challans || []).forEach(
      group => (totalChallanValue += group.totalValue),
    );
    (values.billOfEntries || []).forEach(
      group => (totalBillOfEntryValue += group.totalValue),
    );
    (values.StockTransfers || []).forEach(
      group => (totalStockTransferValue += group.totalValue),
    );

    return {
      totalInvoiceValue,
      totalChallanValue,
      totalBillOfEntryValue,
      totalStockTransferValue,
      grandTotalValue:
        totalInvoiceValue +
        totalChallanValue +
        totalBillOfEntryValue +
        totalStockTransferValue,
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
      (values.billOfEntries?.length || 0) > 0 ||
      (values.StockTransfers?.length || 0) > 0
    );
  };
  const isDisabled = hasAnyDocument();

  useEffect(() => {
    dispatch(setIsDocumentsAvailable(hasAnyDocument()));
  }, [
    values.invoices,
    values.challans,
    values.billOfEntries,
    values.StockTransfers,
  ]);
  const handleSaveDeclaration = (data: any) => {
    setFieldValue('isDeclared', true); // ✅ single source of truth
  };
  useEffect(() => {
    const hasDeclarationText =
      Array.isArray(values?.declarationTextList) &&
      values?.declarationTextList.some(text => text?.trim().length > 0);

    const hasImages =
      Array.isArray(values.declarationImages) &&
      values.declarationImages.length > 0;

    const shouldBeDeclared = hasDeclarationText && hasImages;

    if (values.isDeclared !== shouldBeDeclared) {
      setFieldValue('isDeclared', shouldBeDeclared);
    }
  }, [values?.declarationTextList, values.declarationImages]);

  const filteredDocumentTypes = getFilteredDocumentTypes();

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Shipment Type Selector */}
        <View style={styles.section}>
          <ShipmentTypeSelector
            selectedType={values.shipmentDocumentType || null}
            onSelectType={handleShipmentTypeSelect}
          />
        </View>

        {/* Add Documents Section - Professional Cards Layout */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Add Documents</Text> */}

          {!values.shipmentDocumentType && (
            <Text style={styles.sectionDescription}>
              Please select a shipment type above to see available document
              options
            </Text>
          )}

          {/* {values.shipmentDocumentType === 'domestic' && (
            <Text style={styles.sectionDescription}>
              Available for Domestic Shipments
            </Text>
          )} */}

          {/* {values.shipmentDocumentType === 'international' && (
            <Text style={styles.sectionDescription}>
              Available for International Shipments
            </Text>
          )} */}

          <View style={styles.documentTypeGrid}>
            {filteredDocumentTypes.map(docType => (
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

        {/* Documents List - Show ALL document groups */}
        {hasAnyDocument() && (
          <View style={styles.section}>
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
        <View style={[styles.Document, isDisabled && { opacity: 0.5 }]}>
          <TouchableOpacity
            onPress={() => {
              if (values.isDeclared) {
                Alert.alert(
                  'Reset Declaration',
                  'This will clear all declaration checkboxes and images. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: () => {
                        setFieldValue('isDeclared', false);
                        setFieldValue('declaration', {
                          checkbox1: false,
                          checkbox2: false,
                          checkbox3: false,
                          checkbox4: false,
                          checkbox5: false,
                        });
                        setFieldValue('declarationImages', []);
                      },
                    },
                  ],
                );
              } else {
                setModalVisible(true);
              }
            }}
          >
            <Checkbox status={values.isDeclared ? 'checked' : 'unchecked'} />
            <Text>Documents are not available for the goods</Text>
          </TouchableOpacity>
        </View>
        <DeclarationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveDeclaration}
        />
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
    // padding: 16,
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
    marginBottom: 16,
  },
  // Shipment Type Selector
  shipmentTypeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shipmentTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  shipmentTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shipmentTypeButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shipmentTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  shipmentTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shipmentTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  shipmentTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  // Document Type Cards
  documentTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
    marginBottom: 16,
  },
  documentTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 60,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentTypeIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  documentTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 14,
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
  Document: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
