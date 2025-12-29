// Step2_CargoInvoice.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFormikContext } from 'formik';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import DateInput from '@components/custumdate/DateInput';
import ImagePickerModal from '@components/custumcomponent/ImagePickerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------
// TYPES
// ---------------------------------------------
export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  unit: 'pcs' | 'kg' | 'litre';
  quantity: string;
  netWeight: string;
  grossWeight: string;
  value: string;
  image: string | null;
}

export interface InvoiceGroup {
  id: string;
  poNo: string;
  poDate: string;
  items: InvoiceItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

export interface ChallanItem {
  id: string;
  challanNo: string;
  challanDate: string;
  unit: 'pcs' | 'kg' | 'litre';
  quantity: string;
  netWeight: string;
  value: string;
  image: string | null;
}

export interface ChallanGroup {
  id: string;
  items: ChallanItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

interface FormValues {
  cargoContent: string;
  packageType: string;
  Packages: string;
  poNo: string;
  poDate: string;
  invoices: InvoiceGroup[];
  challans: ChallanGroup[];
}

// Unit Options (common for both Invoice and Challan)
const UNIT_OPTIONS = [
  { id: 'pcs', label: 'PCS', value: 'pcs' },
  { id: 'kg', label: 'KG', value: 'kg' },
  { id: 'litre', label: 'LITRE', value: 'litre' },
];

// Package Type Options
const PACKAGE_TYPE_OPTIONS = [
  { id: 'carton', label: 'Carton', value: 'carton' },
  { id: 'box', label: 'Box', value: 'box' },
  { id: 'pallet', label: 'Pallet', value: 'pallet' },
  { id: 'bag', label: 'Bag', value: 'bag' },
  { id: 'drum', label: 'Drum', value: 'drum' },
];

// Helper function to calculate total quantity/weight
const calculateTotalQuantity = (
  items: InvoiceItem[] | ChallanItem[],
): { total: string; unitType: string } => {
  if (items.length === 0) return { total: '0', unitType: 'pcs' };

  const firstUnit = items[0].unit;
  let total = 0;

  items.forEach(item => {
    if (item.unit === 'pcs') {
      total += parseFloat(item.quantity || '0');
    } else {
      total += parseFloat(item.netWeight || '0');
    }
  });

  return {
    total: total.toString(),
    unitType: firstUnit === 'pcs' ? 'pcs' : items[0].unit,
  };
};

// Format quantity display
const formatQuantityDisplay = (total: string, unitType: string): string => {
  if (unitType === 'pcs') {
    return `${total} PCS`;
  } else if (unitType === 'kg') {
    return `${total} KG`;
  } else if (unitType === 'litre') {
    return `${total} L`;
  }
  return '0 PCS';
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
export default function Step2_InvoiceDetails() {
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [showChallanModal, setShowChallanModal] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [currentImagePickerType, setCurrentImagePickerType] = useState<
    'invoice' | 'challan' | null
  >(null);
  const [editingInvoiceIndex, setEditingInvoiceIndex] = useState<number | null>(
    null,
  );
  const [editingChallanIndex, setEditingChallanIndex] = useState<number | null>(
    null,
  );
  const [tempInvoiceItems, setTempInvoiceItems] = useState<InvoiceItem[]>([]);
  const [tempChallanItems, setTempChallanItems] = useState<ChallanItem[]>([]);
  const [currentTempInvoiceItem, setCurrentTempInvoiceItem] =
    useState<InvoiceItem | null>(null);
  const [currentTempChallanItem, setCurrentTempChallanItem] =
    useState<ChallanItem | null>(null);

  const unitModalRef = useRef<BottomModalRef>(null);
  const packageTypeModalRef = useRef<BottomModalRef>(null);

  const { values, setFieldValue } = useFormikContext<FormValues>();

  // Initialize empty invoice item
  const getEmptyInvoiceItem = (): InvoiceItem => ({
    id: `invoice-item-${Date.now()}-${Math.random()}`,
    invoiceNo: '',
    invoiceDate: '',
    unit: 'pcs',
    quantity: '',
    netWeight: '',
    grossWeight: '',
    value: '',
    image: null,
  });

  // Initialize empty challan item
  const getEmptyChallanItem = (): ChallanItem => ({
    id: `challan-item-${Date.now()}-${Math.random()}`,
    challanNo: '',
    challanDate: '',
    unit: 'pcs',
    quantity: '',
    netWeight: '',
    value: '',
    image: null,
  });

  // Handle field change in current temp invoice item
  const handleInvoiceItemChange = <K extends keyof InvoiceItem>(
    key: K,
    value: InvoiceItem[K],
  ) => {
    if (!currentTempInvoiceItem) return;

    const updated = { ...currentTempInvoiceItem, [key]: value };

    if (key === 'unit') {
      if (value === 'pcs') {
        updated.netWeight = '';
        updated.grossWeight = '';
      } else {
        updated.quantity = '';
      }
    }

    setCurrentTempInvoiceItem(updated);
  };

  // Handle field change in current temp challan item
  const handleChallanItemChange = <K extends keyof ChallanItem>(
    key: K,
    value: ChallanItem[K],
  ) => {
    if (!currentTempChallanItem) return;

    const updated = { ...currentTempChallanItem, [key]: value };

    if (key === 'unit') {
      if (value === 'pcs') {
        updated.netWeight = '';
      } else {
        updated.quantity = '';
      }
    }

    setCurrentTempChallanItem(updated);
  };

  // Add new invoice item to temp list
  const addInvoiceItem = () => {
    if (!currentTempInvoiceItem) return;

    // Validation
    if (!currentTempInvoiceItem.invoiceNo || !currentTempInvoiceItem.value) {
      Alert.alert('Error', 'Please fill Invoice No and Value!');
      return;
    }

    if (
      currentTempInvoiceItem.unit === 'pcs' &&
      !currentTempInvoiceItem.quantity
    ) {
      Alert.alert('Error', 'Please enter quantity!');
      return;
    }

    if (
      (currentTempInvoiceItem.unit === 'kg' ||
        currentTempInvoiceItem.unit === 'litre') &&
      !currentTempInvoiceItem.netWeight
    ) {
      Alert.alert('Error', 'Please enter net weight!');
      return;
    }

    setTempInvoiceItems([...tempInvoiceItems, currentTempInvoiceItem]);
    setCurrentTempInvoiceItem(getEmptyInvoiceItem());
  };

  // Add new challan item to temp list
  const addChallanItem = () => {
    if (!currentTempChallanItem) return;

    // Validation
    if (!currentTempChallanItem.challanNo || !currentTempChallanItem.value) {
      Alert.alert('Error', 'Please fill Challan No and Value!');
      return;
    }

    if (
      currentTempChallanItem.unit === 'pcs' &&
      !currentTempChallanItem.quantity
    ) {
      Alert.alert('Error', 'Please enter quantity!');
      return;
    }

    if (
      (currentTempChallanItem.unit === 'kg' ||
        currentTempChallanItem.unit === 'litre') &&
      !currentTempChallanItem.netWeight
    ) {
      Alert.alert('Error', 'Please enter net weight!');
      return;
    }

    setTempChallanItems([...tempChallanItems, currentTempChallanItem]);
    setCurrentTempChallanItem(getEmptyChallanItem());
  };

  // Remove invoice item from temp list and update main invoice group if editing
  const removeInvoiceItem = (index: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this invoice item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newItems = [...tempInvoiceItems];
            newItems.splice(index, 1);
            setTempInvoiceItems(newItems);

            if (
              editingInvoiceIndex !== null &&
              values.invoices?.[editingInvoiceIndex]
            ) {
              if (newItems.length === 0) {
                const updatedInvoices = [...(values.invoices || [])];
                updatedInvoices.splice(editingInvoiceIndex, 1);
                setFieldValue('invoices', updatedInvoices);
                setShowInvoiceModal(false);
                setEditingInvoiceIndex(null);
              } else {
                const totalValue = newItems.reduce(
                  (sum, item) => sum + Number(item.value || 0),
                  0,
                );
                const quantityData = calculateTotalQuantity(newItems);

                const updatedInvoices = [...(values.invoices || [])];
                updatedInvoices[editingInvoiceIndex] = {
                  ...updatedInvoices[editingInvoiceIndex],
                  items: newItems,
                  totalValue: totalValue,
                  totalQuantity: quantityData.total,
                  unitType: quantityData.unitType,
                };
                setFieldValue('invoices', updatedInvoices);
              }
            }
          },
        },
      ],
    );
  };

  // Remove challan item from temp list and update main challan group if editing
  const removeChallanItem = (index: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this challan item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newItems = [...tempChallanItems];
            newItems.splice(index, 1);
            setTempChallanItems(newItems);

            if (
              editingChallanIndex !== null &&
              values.challans?.[editingChallanIndex]
            ) {
              if (newItems.length === 0) {
                const updatedChallans = [...(values.challans || [])];
                updatedChallans.splice(editingChallanIndex, 1);
                setFieldValue('challans', updatedChallans);
                setShowChallanModal(false);
                setEditingChallanIndex(null);
              } else {
                const totalValue = newItems.reduce(
                  (sum, item) => sum + Number(item.value || 0),
                  0,
                );
                const quantityData = calculateTotalQuantity(newItems);

                const updatedChallans = [...(values.challans || [])];
                updatedChallans[editingChallanIndex] = {
                  ...updatedChallans[editingChallanIndex],
                  items: newItems,
                  totalValue: totalValue,
                  totalQuantity: quantityData.total,
                  unitType: quantityData.unitType,
                };
                setFieldValue('challans', updatedChallans);
              }
            }
          },
        },
      ],
    );
  };

  // Open invoice modal for adding new invoice group
  const openAddInvoiceModal = () => {
    setTempInvoiceItems([]);
    setCurrentTempInvoiceItem(getEmptyInvoiceItem());
    setEditingInvoiceIndex(null);
    setShowInvoiceModal(true);
  };

  // Open invoice modal for editing existing invoice group
  const openEditInvoiceModal = (index: number) => {
    const existingInvoiceGroup = values.invoices?.[index] || null;
    if (existingInvoiceGroup) {
      setTempInvoiceItems(existingInvoiceGroup.items);
      setCurrentTempInvoiceItem(getEmptyInvoiceItem());
      setEditingInvoiceIndex(index);
      setShowInvoiceModal(true);
    }
  };

  // Open challan modal for adding new challan group
  const openAddChallanModal = () => {
    setTempChallanItems([]);
    setCurrentTempChallanItem(getEmptyChallanItem());
    setEditingChallanIndex(null);
    setShowChallanModal(true);
  };

  // Open challan modal for editing existing challan group
  const openEditChallanModal = (index: number) => {
    const existingChallanGroup = values.challans?.[index] || null;
    if (existingChallanGroup) {
      setTempChallanItems(existingChallanGroup.items);
      setCurrentTempChallanItem(getEmptyChallanItem());
      setEditingChallanIndex(index);
      setShowChallanModal(true);
    }
  };

  // Submit invoice group (save all items)
  const handleSubmitInvoice = () => {
    if (tempInvoiceItems.length === 0) {
      if (editingInvoiceIndex === null) {
        Alert.alert('Error', 'Please add at least one invoice item!');
        return;
      }
      setShowInvoiceModal(false);
      setTempInvoiceItems([]);
      setCurrentTempInvoiceItem(null);
      setEditingInvoiceIndex(null);
      return;
    }

    const totalValue = tempInvoiceItems.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0,
    );
    const quantityData = calculateTotalQuantity(tempInvoiceItems);

    const invoiceGroup: InvoiceGroup = {
      id:
        editingInvoiceIndex !== null
          ? values.invoices[editingInvoiceIndex].id
          : `invoice-group-${Date.now()}-${Math.random()}`,
      poNo: values.poNo,
      poDate: values.poDate,
      items: tempInvoiceItems,
      totalValue: totalValue,
      totalQuantity: quantityData.total,
      unitType: quantityData.unitType,
    };

    const updatedInvoices = [...(values.invoices || [])];

    if (editingInvoiceIndex !== null) {
      updatedInvoices[editingInvoiceIndex] = invoiceGroup;
    } else {
      updatedInvoices.push(invoiceGroup);
    }

    setFieldValue('invoices', updatedInvoices);
    setShowInvoiceModal(false);
    setTempInvoiceItems([]);
    setCurrentTempInvoiceItem(null);
    setEditingInvoiceIndex(null);
  };

  // Submit challan group (save all items)
  const handleSubmitChallan = () => {
    if (tempChallanItems.length === 0) {
      if (editingChallanIndex === null) {
        Alert.alert('Error', 'Please add at least one challan item!');
        return;
      }
      setShowChallanModal(false);
      setTempChallanItems([]);
      setCurrentTempChallanItem(null);
      setEditingChallanIndex(null);
      return;
    }

    const totalValue = tempChallanItems.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0,
    );
    const quantityData = calculateTotalQuantity(tempChallanItems);

    const challanGroup: ChallanGroup = {
      id:
        editingChallanIndex !== null
          ? values.challans[editingChallanIndex].id
          : `challan-group-${Date.now()}-${Math.random()}`,
      items: tempChallanItems,
      totalValue: totalValue,
      totalQuantity: quantityData.total,
      unitType: quantityData.unitType,
    };

    const updatedChallans = [...(values.challans || [])];

    if (editingChallanIndex !== null) {
      updatedChallans[editingChallanIndex] = challanGroup;
    } else {
      updatedChallans.push(challanGroup);
    }

    setFieldValue('challans', updatedChallans);
    setShowChallanModal(false);
    setTempChallanItems([]);
    setCurrentTempChallanItem(null);
    setEditingChallanIndex(null);
  };

  // Delete invoice group
  const handleDeleteInvoice = (index: number) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = (values.invoices || []).filter(
              (_, i) => i !== index,
            );
            setFieldValue('invoices', updated);
          },
        },
      ],
    );
  };

  // Delete challan group
  const handleDeleteChallan = (index: number) => {
    Alert.alert(
      'Delete Challan',
      'Are you sure you want to delete this challan group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = (values.challans || []).filter(
              (_, i) => i !== index,
            );
            setFieldValue('challans', updated);
          },
        },
      ],
    );
  };

  // Open image picker for invoice or challan
  const handleOpenImagePicker = (type: 'invoice' | 'challan') => {
    setCurrentImagePickerType(type);
    setShowImagePicker(true);
  };

  // Handle image selection
  const handleImageSelected = (uri: string) => {
    if (currentImagePickerType === 'invoice' && currentTempInvoiceItem) {
      handleInvoiceItemChange('image', uri);
    } else if (currentImagePickerType === 'challan' && currentTempChallanItem) {
      handleChallanItemChange('image', uri);
    }
  };

  // Handle unit selection for invoice item
  const handleSelectInvoiceUnit = (unit: 'pcs' | 'kg' | 'litre') => {
    handleInvoiceItemChange('unit', unit);
    unitModalRef.current?.close();
  };

  // Handle unit selection for challan item
  const handleSelectChallanUnit = (unit: 'pcs' | 'kg' | 'litre') => {
    handleChallanItemChange('unit', unit);
    unitModalRef.current?.close();
  };

  // Handle package type selection
  const handleSelectPackageType = (type: string) => {
    setFieldValue('packageType', type);
    packageTypeModalRef.current?.close();
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalInvoiceValue = 0;
    let totalChallanValue = 0;
    let totalInvoiceQuantity = 0;
    let totalChallanQuantity = 0;

    // Invoice totals
    (values.invoices || []).forEach(group => {
      totalInvoiceValue += group.totalValue;
      totalInvoiceQuantity += parseFloat(group.totalQuantity || '0');
    });

    // Challan totals
    (values.challans || []).forEach(group => {
      totalChallanValue += group.totalValue;
      totalChallanQuantity += parseFloat(group.totalQuantity || '0');
    });

    return {
      totalInvoiceValue,
      totalChallanValue,
      totalInvoiceQuantity,
      totalChallanQuantity,
      grandTotalValue: totalInvoiceValue + totalChallanValue,
    };
  };

  const {
    totalInvoiceValue,
    totalChallanValue,
    totalInvoiceQuantity,
    totalChallanQuantity,
    grandTotalValue,
  } = calculateTotals();

  // Calculate temp invoice total
  const tempInvoiceTotal = tempInvoiceItems.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0,
  );

  // Calculate temp challan total
  const tempChallanTotal = tempChallanItems.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0,
  );

  // Get invoice table header based on unit
  const getInvoiceTableHeaders = () => {
    if (tempInvoiceItems.length === 0) {
      return ['Invoice No', 'Qty/Weight', 'Value', 'Action'];
    }

    const firstItemUnit = tempInvoiceItems[0]?.unit;
    return [
      'Invoice No',
      firstItemUnit === 'pcs' ? 'Quantity' : 'Weight',
      'Value',
      'Action',
    ];
  };

  // Get challan table header based on unit
  const getChallanTableHeaders = () => {
    if (tempChallanItems.length === 0) {
      return ['Challan No', 'Qty/Weight', 'Value', 'Action'];
    }

    const firstItemUnit = tempChallanItems[0]?.unit;
    return [
      'Challan No',
      firstItemUnit === 'pcs' ? 'Quantity' : 'Weight',
      'Value',
      'Action',
    ];
  };

  // Format invoice table cell data
  const formatInvoiceTableCell = (item: InvoiceItem) => {
    if (item.unit === 'pcs') {
      return `${item.quantity} pcs`;
    } else {
      return `${item.netWeight} ${item.unit}`;
    }
  };

  // Format challan table cell data
  const formatChallanTableCell = (item: ChallanItem) => {
    if (item.unit === 'pcs') {
      return `${item.quantity} pcs`;
    } else {
      return `${item.netWeight} ${item.unit}`;
    }
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

        {/* Invoices Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoices</Text>
          {/* Invoice List */}
          {(values.invoices || []).length > 0 ? (
            <View style={styles.buttonsGrid}>
              {(values.invoices || []).map((invoiceGroup, index) => (
                <TouchableOpacity
                  key={invoiceGroup.id}
                  style={[styles.invoiceButton, styles.buttonCompleted]}
                  onPress={() => openEditInvoiceModal(index)}
                  onLongPress={() => handleDeleteInvoice(index)}
                >
                  <View style={styles.buttonContent}>
                    <View style={styles.completedButtonContent}>
                      <Icon
                        name="file-document-outline"
                        size={20}
                        color="#10B981"
                      />
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.buttonText}>
                          Invoice {index + 1}
                        </Text>
                        <Text style={styles.buttonSubText}>
                          ₹{invoiceGroup.totalValue.toLocaleString()}
                        </Text>
                        <Text style={styles.buttonQuantityText}>
                          {formatQuantityDisplay(
                            invoiceGroup.totalQuantity,
                            invoiceGroup.unitType,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddInvoiceModal}
            >
              <Icon name="plus-circle-outline" size={24} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Invoice</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Challans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challans</Text>
          {/* Challan List */}
          {(values.challans || []).length > 0 ? (
            <View style={styles.buttonsGrid}>
              {(values.challans || []).map((challanGroup, index) => (
                <TouchableOpacity
                  key={challanGroup.id}
                  style={[styles.challanButton, styles.buttonCompleted]}
                  onPress={() => openEditChallanModal(index)}
                  onLongPress={() => handleDeleteChallan(index)}
                >
                  <View style={styles.buttonContent}>
                    <View style={styles.completedButtonContent}>
                      <Icon name="truck-outline" size={20} color="#10B981" />
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.buttonText}>
                          Challan {index + 1}
                        </Text>
                        <Text style={styles.buttonSubText}>
                          ₹{challanGroup.totalValue.toLocaleString()}
                        </Text>
                        <Text style={styles.buttonQuantityText}>
                          {formatQuantityDisplay(
                            challanGroup.totalQuantity,
                            challanGroup.unitType,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddChallanModal}
            >
              <Icon name="plus-circle-outline" size={24} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Challan</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Invoice Form Modal */}
      <Modal
        visible={showInvoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvoiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInvoiceModal(false)}
            >
              <Icon name="close" size={20} color="#374151" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {editingInvoiceIndex !== null
                ? 'Edit Invoice'
                : 'Add New Invoice'}
            </Text>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSubmitInvoice}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.invoiceForm}>
              {/* Add New Invoice Item Form */}
              <View style={styles.addItemForm}>
                <Text style={styles.addItemTitle}>Add New Item</Text>

                <View style={styles.formGrid}>
                  <View style={styles.formRow}>
                    <View style={[styles.formColumn, styles.formColumnGap]}>
                      <TextInput
                        label="Invoice Number"
                        value={currentTempInvoiceItem?.invoiceNo || ''}
                        onChangeText={t =>
                          handleInvoiceItemChange('invoiceNo', t)
                        }
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
                        value={currentTempInvoiceItem?.invoiceDate || ''}
                        onChange={date =>
                          handleInvoiceItemChange('invoiceDate', date)
                        }
                        label="Invoice Date"
                      />
                    </View>
                  </View>

                  {/* Unit and Quantity */}
                  <View style={styles.formRow}>
                    <View style={[styles.formColumn, styles.formColumnGap]}>
                      <TextInput
                        label="Unit"
                        value={
                          currentTempInvoiceItem?.unit.toUpperCase() || 'PCS'
                        }
                        mode="outlined"
                        style={styles.compactInput}
                        outlineStyle={styles.inputOutline}
                        editable={false}
                        pointerEvents="none"
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
                            onPress={() => unitModalRef.current?.open()}
                          />
                        }
                      />
                    </View>
                    <View style={styles.formColumn}>
                      {currentTempInvoiceItem?.unit === 'pcs' ? (
                        <TextInput
                          label="Quantity"
                          value={currentTempInvoiceItem?.quantity || ''}
                          onChangeText={t =>
                            handleInvoiceItemChange('quantity', t)
                          }
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
                      ) : (
                        <TextInput
                          label="Net Weight"
                          value={currentTempInvoiceItem?.netWeight || ''}
                          onChangeText={t =>
                            handleInvoiceItemChange('netWeight', t)
                          }
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
                          right={
                            <TextInput.Affix
                              text={
                                currentTempInvoiceItem?.unit === 'kg'
                                  ? 'kg'
                                  : 'L'
                              }
                            />
                          }
                        />
                      )}
                    </View>
                  </View>

                  {/* Gross Weight and Value */}
                  <View style={styles.formRow}>
                    {currentTempInvoiceItem?.unit !== 'pcs' && (
                      <View style={[styles.formColumn, styles.formColumnGap]}>
                        <TextInput
                          label="Gross Weight"
                          value={currentTempInvoiceItem?.grossWeight || ''}
                          onChangeText={t =>
                            handleInvoiceItemChange('grossWeight', t)
                          }
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
                          right={<TextInput.Affix text="kg" />}
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.formColumn,
                        currentTempInvoiceItem?.unit === 'pcs' &&
                          styles.fullWidthColumn,
                      ]}
                    >
                      <TextInput
                        label="Invoice Value"
                        value={currentTempInvoiceItem?.value || ''}
                        onChangeText={t => handleInvoiceItemChange('value', t)}
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
                        left={<TextInput.Affix text="₹" />}
                      />
                    </View>
                  </View>

                  {/* Professional Image Picker */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      Invoice Image (Optional)
                    </Text>
                    {currentTempInvoiceItem?.image ? (
                      <View style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: currentTempInvoiceItem.image }}
                          style={styles.imagePreview}
                        />
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.imageActionButton}
                            onPress={() => handleOpenImagePicker('invoice')}
                          >
                            <Text style={styles.imageActionText}>Change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.imageActionButton,
                              styles.removeButton,
                            ]}
                            onPress={() =>
                              handleInvoiceItemChange('image', null)
                            }
                          >
                            <Text
                              style={[
                                styles.imageActionText,
                                styles.removeText,
                              ]}
                            >
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.imageUploadButton}
                        onPress={() => handleOpenImagePicker('invoice')}
                      >
                        <Icon name="camera" size={20} color="#3B82F6" />
                        <Text style={styles.imageUploadText}>
                          Upload Invoice Image
                        </Text>
                        <Text style={styles.imageUploadSubtext}>Optional</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Add Item Button */}
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={addInvoiceItem}
                  >
                    <Icon name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.addItemButtonText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Invoice Items Table */}
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableTitle}>Invoice Items</Text>
                  {tempInvoiceItems.length > 0 && (
                    <View style={styles.tableSummary}>
                      <Text style={styles.itemCountText}>
                        {tempInvoiceItems.length} item
                        {tempInvoiceItems.length !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.tableSummaryText}>
                        Total: ₹{tempInvoiceTotal.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                  {getInvoiceTableHeaders().map((header, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tableHeaderCellWrapper,
                        index === getInvoiceTableHeaders().length - 1 &&
                          styles.actionColumn,
                      ]}
                    >
                      <Text style={styles.tableHeaderCell}>{header}</Text>
                    </View>
                  ))}
                </View>

                {/* Table Rows */}
                {tempInvoiceItems.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {item.invoiceNo}
                      </Text>
                    </View>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {formatInvoiceTableCell(item)}
                      </Text>
                    </View>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        ₹{Number(item.value || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={[styles.tableCellWrapper, styles.actionColumn]}
                    >
                      <TouchableOpacity
                        style={styles.deleteRowButton}
                        onPress={() => removeInvoiceItem(index)}
                      >
                        <Icon name="delete-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {tempInvoiceItems.length === 0 && (
                  <View style={styles.emptyTable}>
                    <Icon
                      name="file-document-outline"
                      size={32}
                      color="#9CA3AF"
                    />
                    <Text style={styles.emptyTableText}>
                      No invoice items added yet
                    </Text>
                  </View>
                )}

                {/* Table Total */}
                {tempInvoiceItems.length > 0 && (
                  <View style={styles.tableTotal}>
                    <Text style={styles.tableTotalLabel}>Total Value:</Text>
                    <Text style={styles.tableTotalValue}>
                      ₹{tempInvoiceTotal.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Challan Form Modal */}
      <Modal
        visible={showChallanModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChallanModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowChallanModal(false)}
            >
              <Icon name="close" size={20} color="#374151" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {editingChallanIndex !== null
                ? 'Edit Challan'
                : 'Add New Challan'}
            </Text>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSubmitChallan}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.invoiceForm}>
              {/* Add New Challan Item Form */}
              <View style={styles.addItemForm}>
                <Text style={styles.addItemTitle}>Add New Item</Text>

                <View style={styles.formGrid}>
                  <View style={styles.formRow}>
                    <View style={[styles.formColumn, styles.formColumnGap]}>
                      <TextInput
                        label="Challan Number"
                        value={currentTempChallanItem?.challanNo || ''}
                        onChangeText={t =>
                          handleChallanItemChange('challanNo', t)
                        }
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
                        label="Challan Date"
                        value={currentTempChallanItem?.challanDate || ''}
                        onChange={date =>
                          handleChallanItemChange('challanDate', date)
                        }
                        style={styles.compactInput}
                      />
                    </View>
                  </View>

                  {/* Unit and Quantity */}
                  <View style={styles.formRow}>
                    <View style={[styles.formColumn, styles.formColumnGap]}>
                      <TextInput
                        label="Unit"
                        value={
                          currentTempChallanItem?.unit.toUpperCase() || 'PCS'
                        }
                        mode="outlined"
                        style={styles.compactInput}
                        outlineStyle={styles.inputOutline}
                        editable={false}
                        pointerEvents="none"
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
                            onPress={() => unitModalRef.current?.open()}
                          />
                        }
                      />
                    </View>
                    <View style={styles.formColumn}>
                      {currentTempChallanItem?.unit === 'pcs' ? (
                        <TextInput
                          label="Quantity"
                          value={currentTempChallanItem?.quantity || ''}
                          onChangeText={t =>
                            handleChallanItemChange('quantity', t)
                          }
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
                      ) : (
                        <TextInput
                          label="Net Weight"
                          value={currentTempChallanItem?.netWeight || ''}
                          onChangeText={t =>
                            handleChallanItemChange('netWeight', t)
                          }
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
                          right={
                            <TextInput.Affix
                              text={
                                currentTempChallanItem?.unit === 'kg'
                                  ? 'kg'
                                  : 'L'
                              }
                            />
                          }
                        />
                      )}
                    </View>
                  </View>

                  {/* Challan Value */}
                  <View style={styles.formRow}>
                    <View style={styles.fullWidthColumn}>
                      <TextInput
                        label="Value"
                        value={currentTempChallanItem?.value || ''}
                        onChangeText={t => handleChallanItemChange('value', t)}
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
                        left={<TextInput.Affix text="₹" />}
                      />
                    </View>
                  </View>

                  {/* Professional Image Picker */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      Challan Image (Optional)
                    </Text>
                    {currentTempChallanItem?.image ? (
                      <View style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: currentTempChallanItem.image }}
                          style={styles.imagePreview}
                        />
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.imageActionButton}
                            onPress={() => handleOpenImagePicker('challan')}
                          >
                            <Text style={styles.imageActionText}>Change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.imageActionButton,
                              styles.removeButton,
                            ]}
                            onPress={() =>
                              handleChallanItemChange('image', null)
                            }
                          >
                            <Text
                              style={[
                                styles.imageActionText,
                                styles.removeText,
                              ]}
                            >
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.imageUploadButton}
                        onPress={() => handleOpenImagePicker('challan')}
                      >
                        <Icon name="camera" size={20} color="#3B82F6" />
                        <Text style={styles.imageUploadText}>
                          Upload Challan Image
                        </Text>
                        <Text style={styles.imageUploadSubtext}>Optional</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Add Item Button */}
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={addChallanItem}
                  >
                    <Icon name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.addItemButtonText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Challan Items Table */}
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableTitle}>Challan Items</Text>
                  {tempChallanItems.length > 0 && (
                    <View style={styles.tableSummary}>
                      <Text style={styles.itemCountText}>
                        {tempChallanItems.length} item
                        {tempChallanItems.length !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.tableSummaryText}>
                        Total: ₹{tempChallanTotal.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                  {getChallanTableHeaders().map((header, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tableHeaderCellWrapper,
                        index === getChallanTableHeaders().length - 1 &&
                          styles.actionColumn,
                      ]}
                    >
                      <Text style={styles.tableHeaderCell}>{header}</Text>
                    </View>
                  ))}
                </View>

                {/* Table Rows */}
                {tempChallanItems.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {item.challanNo}
                      </Text>
                    </View>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {formatChallanTableCell(item)}
                      </Text>
                    </View>
                    <View style={styles.tableCellWrapper}>
                      <Text style={styles.tableCell} numberOfLines={1}>
                        ₹{Number(item.value || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={[styles.tableCellWrapper, styles.actionColumn]}
                    >
                      <TouchableOpacity
                        style={styles.deleteRowButton}
                        onPress={() => removeChallanItem(index)}
                      >
                        <Icon name="delete-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {tempChallanItems.length === 0 && (
                  <View style={styles.emptyTable}>
                    <Icon name="truck-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.emptyTableText}>
                      No challan items added yet
                    </Text>
                  </View>
                )}

                {/* Table Total */}
                {tempChallanItems.length > 0 && (
                  <View style={styles.tableTotal}>
                    <Text style={styles.tableTotalLabel}>Total Value:</Text>
                    <Text style={styles.tableTotalValue}>
                      ₹{tempChallanTotal.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Custom Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => {
          setShowImagePicker(false);
          setCurrentImagePickerType(null);
        }}
        onImageSelected={handleImageSelected}
        title={
          currentImagePickerType === 'invoice'
            ? 'Upload Invoice Image'
            : 'Upload Challan Image'
        }
      />

      {/* Bottom Modal for Unit Selection */}
      <BottomModal
        ref={unitModalRef}
        customHeight={260}
        backdropOpacity={0.6}
        preventSwipeClose={true}
      >
        <View style={styles.modalContentWrapper}>
          <Text style={styles.bottomModalTitle}>Select Unit</Text>
          <View style={styles.bottomModalOptionsContainer}>
            {UNIT_OPTIONS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.bottomModalOption,
                  (currentTempInvoiceItem?.unit === item.value ||
                    currentTempChallanItem?.unit === item.value) &&
                    styles.bottomModalOptionSelected,
                ]}
                onPress={() => {
                  if (showInvoiceModal && currentTempInvoiceItem) {
                    handleSelectInvoiceUnit(item.value);
                  } else if (showChallanModal && currentTempChallanItem) {
                    handleSelectChallanUnit(item.value);
                  }
                }}
              >
                <Text
                  style={[
                    styles.bottomModalOptionText,
                    (currentTempInvoiceItem?.unit === item.value ||
                      currentTempChallanItem?.unit === item.value) &&
                      styles.bottomModalOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {(currentTempInvoiceItem?.unit === item.value ||
                  currentTempChallanItem?.unit === item.value) && (
                  <Icon name="check" size={18} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomModal>

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
// STYLES - Updated with new styles for quantity display
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  fullWidthColumn: {
    width: '100%',
  },
  // Button Styles
  addButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addMoreButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonsGrid: {
    gap: 8,
  },
  invoiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challanButton: {
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

  // Professional Image Upload Styles
  imagePreviewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
    resizeMode: 'cover',
    marginRight: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
  },
  imageActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  removeText: {
    color: '#DC2626',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Input Label
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  // Add Item Form
  addItemForm: {
    marginBottom: 20,
  },
  addItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Table Styles
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tableSummary: {
    alignItems: 'flex-end',
  },
  itemCountText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  tableSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCellWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  actionColumn: {
    flex: 0.6,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 44,
  },
  tableCellWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 13,
    color: '#374151',
  },
  deleteRowButton: {
    padding: 4,
  },
  emptyTable: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  tableTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  tableTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  tableTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
  },
  invoiceForm: {
    width: '100%',
  },
  formGrid: {
    width: '100%',
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
