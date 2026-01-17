import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import DateInput from '@components/custumdate/DateInput';
import ImagePickerModal from '@components/custumcomponent/ImagePickerModal';

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
  materialType: string;
  packageType: string;
  poNo: string;
  poDate: string;
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
  materialType: string;
  packageType: string;
  documentno: string;
}

export interface BillOfEntryItem {
  id: string;
  billOfEntryNo: string;
  billOfEntryDate: string;
  shipperName: string;
  country: string;
  currency: string;
  value: string;
  image: string | null;
  materialType: string;
  packageType: string;
  buyerName: string;
  destination: string;
}

export type DocumentItem = InvoiceItem | ChallanItem | BillOfEntryItem;
export type DocumentType = 'invoice' | 'challan' | 'bill-of-entry';

interface DocumentItemModalProps {
  visible: boolean;
  onClose: () => void;
  documentType: DocumentType;
  editingIndex: number | null;
  tempItems: DocumentItem[];
  setTempItems: (items: DocumentItem[]) => void;
  onSubmit: () => void;
  onDeleteGroup?: () => void;
  loadpostid: string;
  vehicleno: string;
  driverName: string;
}

const UNIT_OPTIONS = [
  { id: 'kg', label: 'KG', value: 'kg' },
  { id: 'Qtl', label: 'Qtl', value: 'Qtl' },
  { id: 'Ton', label: 'Ton', value: 'Ton' },
  { id: 'pcs', label: 'PCS', value: 'pcs' },
  { id: 'litre', label: 'LITRE', value: 'litre' },
  { id: 'Meter', label: 'Meter', value: 'Meter' },
];

const PACKAGE_TYPE_OPTIONS = [
  { id: 'carton', label: 'Carton', value: 'carton' },
  { id: 'box', label: 'Box', value: 'box' },
  { id: 'pallet', label: 'Pallet', value: 'pallet' },
  { id: 'bag', label: 'Bag', value: 'bag' },
  { id: 'drum', label: 'Drum', value: 'drum' },
];

const CURRENCY_OPTIONS = [
  { id: 'usd', label: 'USD', value: 'USD' },
  { id: 'eur', label: 'EUR', value: 'EUR' },
  { id: 'gbp', label: 'GBP', value: 'GBP' },
  { id: 'inr', label: 'INR', value: 'INR' },
];

const COUNTRY_OPTIONS = [
  { id: 'india', label: 'India', value: 'India' },
  { id: 'usa', label: 'USA', value: 'USA' },
  { id: 'uk', label: 'UK', value: 'UK' },
  { id: 'germany', label: 'Germany', value: 'Germany' },
  { id: 'china', label: 'China', value: 'China' },
];

const DESTINATION_OPTIONS = [
  { id: 'india', label: 'India', value: 'India' },
  { id: 'usa', label: 'USA', value: 'USA' },
  { id: 'uk', label: 'UK', value: 'UK' },
  { id: 'germany', label: 'Germany', value: 'Germany' },
  { id: 'china', label: 'China', value: 'China' },
  { id: 'uae', label: 'UAE', value: 'UAE' },
  { id: 'singapore', label: 'Singapore', value: 'Singapore' },
  { id: 'japan', label: 'Japan', value: 'Japan' },
];

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
const DocumentItemModal: React.FC<DocumentItemModalProps> = ({
  visible,
  onClose,
  documentType,
  editingIndex,
  tempItems,
  setTempItems,
  onSubmit,
  onDeleteGroup,
  loadpostid,
  vehicleno,
  driverName,
}) => {
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [currentTempItem, setCurrentTempItem] = useState<DocumentItem | null>(
    null,
  );
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [hasAddedItem, setHasAddedItem] = useState<boolean>(false);
  const unitModalRef = useRef<BottomModalRef>(null);
  const packageModalRef = useRef<BottomModalRef>(null);
  const currencyModalRef = useRef<BottomModalRef>(null);
  const countryModalRef = useRef<BottomModalRef>(null);
  const destinationModalRef = useRef<BottomModalRef>(null);

  useEffect(() => {
    if (visible) {
      resetFormState();
      if (!currentTempItem) {
        setCurrentTempItem(getEmptyItem());
      }
    }
  }, [visible, documentType]);

  const resetFormState = () => {
    setIsFormDirty(false);
    setHasAddedItem(false);
  };

  const hasFormData = useCallback(() => {
    if (!currentTempItem) return false;

    switch (documentType) {
      case 'invoice':
        const invoiceItem = currentTempItem as InvoiceItem;
        return !!(
          invoiceItem.invoiceNo ||
          invoiceItem.invoiceDate ||
          invoiceItem.quantity ||
          invoiceItem.netWeight ||
          invoiceItem.grossWeight ||
          invoiceItem.value ||
          invoiceItem.materialType ||
          invoiceItem.packageType ||
          invoiceItem.poNo ||
          invoiceItem.poDate ||
          invoiceItem.image
        );

      case 'challan':
        const challanItem = currentTempItem as ChallanItem;
        return !!(
          challanItem.challanNo ||
          challanItem.challanDate ||
          challanItem.quantity ||
          challanItem.netWeight ||
          challanItem.value ||
          challanItem.materialType ||
          challanItem.packageType ||
          challanItem.documentno ||
          challanItem.image
        );

      case 'bill-of-entry':
        const boeItem = currentTempItem as BillOfEntryItem;
        return !!(
          boeItem.billOfEntryNo ||
          boeItem.billOfEntryDate ||
          boeItem.shipperName ||
          boeItem.country ||
          boeItem.currency ||
          boeItem.value ||
          boeItem.materialType ||
          boeItem.packageType ||
          boeItem.buyerName ||
          boeItem.destination ||
          boeItem.image
        );
    }
  }, [currentTempItem, documentType]);

  // Helper function to format bill of entry number
  const formatBillOfEntryNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 16);
    const groups = [];
    for (let i = 0; i < limitedDigits.length; i += 4) {
      groups.push(limitedDigits.slice(i, i + 4));
    }
    return groups.join('-');
  };

  // Handle bill of entry number change
  const handleBillOfEntryChange = (text: string) => {
    if (!currentTempItem) return;

    const digits = text.replace(/\D/g, '');
    if (digits.length <= 16) {
      const updated = { ...currentTempItem, billOfEntryNo: digits };
      setCurrentTempItem(updated);
    }
  };

  // Get display value for bill of entry number
  const getDisplayValue = () => {
    const digits = (currentTempItem as BillOfEntryItem)?.billOfEntryNo || '';
    if (digits.length === 0) return '';

    const groups = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join('-');
  };

  // Initialize currentTempItem when modal opens
  useEffect(() => {
    if (visible && !currentTempItem) {
      setCurrentTempItem(getEmptyItem());
    }
  }, [visible]);

  // Initialize empty item based on document type
  const getEmptyItem = (): DocumentItem => {
    const baseId = `${documentType}-item-${Date.now()}-${Math.random()}`;

    switch (documentType) {
      case 'invoice':
        return {
          id: baseId,
          invoiceNo: '',
          invoiceDate: '',
          unit: 'kg',
          quantity: '',
          netWeight: '',
          grossWeight: '',
          value: '',
          image: null,
          materialType: '',
          packageType: '',
          poNo: '',
          poDate: '',
        };
      case 'challan':
        return {
          id: baseId,
          challanNo: '',
          challanDate: '',
          unit: 'kg',
          quantity: '',
          netWeight: '',
          value: '',
          image: null,
          materialType: '',
          packageType: '',
          documentno: '',
        };
      case 'bill-of-entry':
        return {
          id: baseId,
          billOfEntryNo: '',
          billOfEntryDate: '',
          shipperName: '',
          country: 'India',
          currency: 'INR',
          value: '',
          image: null,
          materialType: '',
          packageType: '',
          buyerName: '',
          destination: 'India',
        };
    }
  };

  // Handle field change in current temp item
  const handleItemChange = <K extends keyof DocumentItem>(
    key: K,
    value: DocumentItem[K],
  ) => {
    if (!currentTempItem) {
      const newItem = getEmptyItem();
      setCurrentTempItem({ ...newItem, [key]: value });
      setIsFormDirty(true);
      return;
    }

    const updated = { ...currentTempItem, [key]: value };

    // Handle unit-specific logic for invoice/challan
    if (
      key === 'unit' &&
      (documentType === 'invoice' || documentType === 'challan')
    ) {
      if (value === 'pcs') {
        updated.netWeight = '';
        if (documentType === 'invoice') {
          (updated as InvoiceItem).grossWeight = '';
        }
      } else {
        updated.quantity = '';
      }
    }

    setCurrentTempItem(updated);
    setIsFormDirty(true);
  };
  const handleInputFocus = () => {
    setIsFormDirty(true);
  };
  // Add new item to temp list
  const addItem = () => {
    if (!currentTempItem) return;

    // Validation based on document type
    let isValid = true;
    let errorMessage = '';

    switch (documentType) {
      case 'invoice':
        const invoiceItem = currentTempItem as InvoiceItem;
        if (!invoiceItem.invoiceNo || !invoiceItem.value) {
          isValid = false;
          errorMessage = 'Please fill Invoice No and Value!';
        } else if (invoiceItem.unit === 'pcs' && !invoiceItem.quantity) {
          isValid = false;
          errorMessage = 'Please enter quantity!';
        } else if (
          (invoiceItem.unit === 'kg' || invoiceItem.unit === 'litre') &&
          !invoiceItem.netWeight
        ) {
          isValid = false;
          errorMessage = 'Please enter net weight!';
        }
        break;
      case 'challan':
        const challanItem = currentTempItem as ChallanItem;
        if (!challanItem.challanNo || !challanItem.value) {
          isValid = false;
          errorMessage = 'Please fill Challan No and Value!';
        } else if (challanItem.unit === 'pcs' && !challanItem.quantity) {
          isValid = false;
          errorMessage = 'Please enter quantity!';
        } else if (
          (challanItem.unit === 'kg' || challanItem.unit === 'litre') &&
          !challanItem.netWeight
        ) {
          isValid = false;
          errorMessage = 'Please enter net weight!';
        }
        break;
      case 'bill-of-entry':
        const boeItem = currentTempItem as BillOfEntryItem;
        const cleanedBillNo = boeItem.billOfEntryNo.replace(/\D/g, '');

        if (cleanedBillNo.length !== 16) {
          isValid = false;
          errorMessage = 'Bill of Entry Number must be 16 digits!';
        } else if (
          !boeItem.value ||
          !boeItem.shipperName ||
          !boeItem.buyerName
        ) {
          isValid = false;
          errorMessage = 'Please fill all required fields!';
        }
        break;
    }

    if (!isValid) {
      Alert.alert('Error', errorMessage);
      return;
    }

    setTempItems([...tempItems, currentTempItem]);
    // Reset form for next item
    // setCurrentTempItem(getEmptyItem());
    setIsFormDirty(false);
    setHasAddedItem(true);
  };

  // Remove item from temp list
  const removeItem = (index: number) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const newItems = [...tempItems];
          newItems.splice(index, 1);
          setTempItems(newItems);

          // If all items are deleted and we're editing an existing group
          if (newItems.length === 0 && editingIndex !== null) {
            // Show confirmation for deleting the entire group
            Alert.alert(
              'Delete Group',
              'All items have been removed. Do you want to delete this group?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Group',
                  style: 'destructive',
                  onPress: () => {
                    if (onDeleteGroup) {
                      onDeleteGroup();
                    }
                    onClose();
                  },
                },
              ],
            );
          }
        },
      },
    ]);
  };

  // Handle image selection
  const handleImageSelected = (uri: string) => {
    if (currentTempItem) {
      handleItemChange('image', uri);
    }
  };
  const isAddButtonDisabled = () => {
    // If user has added an item and form is not dirty, disable button
    if (hasAddedItem && !isFormDirty) {
      return true;
    }
    // If form has no data at all, disable button
    if (!hasFormData()) {
      return true;
    }
    return false;
  };
  // Get modal title
  const getModalTitle = () => {
    switch (documentType) {
      case 'invoice':
        return 'Invoice Details';
      case 'challan':
        return 'Challan Details';
      case 'bill-of-entry':
        return 'Bill of Entry Details';
    }
  };

  // Get table headers
  const getTableHeaders = () => {
    switch (documentType) {
      case 'invoice':
        if (tempItems.length === 0)
          return ['Invoice No', 'Qty/Weight', 'Value', 'Action'];
        const firstItem = tempItems[0] as InvoiceItem;
        return [
          'Invoice No',
          firstItem.unit === 'pcs' ? 'Quantity' : 'Weight',
          'Value',
          'Action',
        ];
      case 'challan':
        if (tempItems.length === 0)
          return ['Challan No', 'Qty/Weight', 'Value', 'Action'];
        const firstChallan = tempItems[0] as ChallanItem;
        return [
          'Challan No',
          firstChallan.unit === 'pcs' ? 'Quantity' : 'Weight',
          'Value',
          'Action',
        ];
      case 'bill-of-entry':
        return ['BOE No', 'Currency', 'Value', 'Action'];
    }
  };
  const getAddButtonText = () => {
    switch (documentType) {
      case 'invoice':
        return 'Add Invoice';
      case 'challan':
        return 'Add Challan';
      case 'bill-of-entry':
        return 'Add Bill of Entry';
    }
  };
  // const getTablebtton = () => {
  //   switch (documentType) {
  //     case 'invoice':
  //       return ['Invoice No'];
  //     case 'challan':
  //       return ['Challan No'];

  //     case 'bill-of-entry':
  //       return ['BOE No'];
  //   }
  // };

  // Format table cell data
  const formatTableCell = (item: DocumentItem, cellIndex: number): string => {
    switch (documentType) {
      case 'invoice':
        const invoiceItem = item as InvoiceItem;
        if (cellIndex === 0) return invoiceItem.invoiceNo;
        if (cellIndex === 1) {
          return invoiceItem.unit === 'pcs'
            ? `${invoiceItem.quantity} pcs`
            : `${invoiceItem.netWeight} ${invoiceItem.unit}`;
        }
        if (cellIndex === 2)
          return `₹${Number(invoiceItem.value || 0).toLocaleString()}`;
        return '';
      case 'challan':
        const challanItem = item as ChallanItem;
        if (cellIndex === 0) return challanItem.challanNo;
        if (cellIndex === 1) {
          return challanItem.unit === 'pcs'
            ? `${challanItem.quantity} pcs`
            : `${challanItem.netWeight} ${challanItem.unit}`;
        }
        if (cellIndex === 2)
          return `₹${Number(challanItem.value || 0).toLocaleString()}`;
        return '';
      case 'bill-of-entry':
        const boeItem = item as BillOfEntryItem;
        if (cellIndex === 0) return boeItem.billOfEntryNo;
        if (cellIndex === 1) return boeItem.currency;
        if (cellIndex === 2)
          return `${boeItem.currency} ${Number(
            boeItem.value || 0,
          ).toLocaleString()}`;
        return '';
    }
  };

  const calculateTotal = () => {
    return tempItems.reduce((sum, item) => {
      return sum + Number(item.value || 0);
    }, 0);
  };

  // Handle save button press
  const handleSave = () => {
    if (tempItems.length === 0) {
      if (editingIndex !== null) {
        // If editing and no items, ask to delete the group
        Alert.alert(
          'Delete Group',
          'No items added. Do you want to delete this group?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Group',
              style: 'destructive',
              onPress: () => {
                if (onDeleteGroup) {
                  onDeleteGroup();
                }
                onClose();
              },
            },
          ],
        );
      } else {
        Alert.alert('Error', 'Please add at least one item!');
      }
      return;
    }
    onSubmit();
  };

  // Render form fields based on document type
  const renderFormFields = () => {
    switch (documentType) {
      case 'invoice': {
        const invoiceItem = currentTempItem as InvoiceItem;

        return (
          <>
            {/* Invoice No + Invoice Date */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Invoice Number"
                  value={invoiceItem?.invoiceNo || ''}
                  onChangeText={t => handleItemChange('invoiceNo', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.formColumn}>
                <DateInput
                  label="Invoice Date"
                  value={invoiceItem?.invoiceDate || ''}
                  onChange={date => {
                    handleItemChange('invoiceDate', date);
                    setIsFormDirty(true);
                  }}
                  onFocus={handleInputFocus}
                />
              </View>
            </View>

            {/* Unit + Net Weight / Qty + Gross Weight (same row) */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Unit"
                  value={invoiceItem?.unit?.toUpperCase() || 'PCS'}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => unitModalRef.current?.open()}
                    />
                  }
                />
              </View>

              <View style={[styles.formColumn, styles.formColumnGap]}>
                {invoiceItem?.unit === 'pcs' ? (
                  <TextInput
                    label="Quantity"
                    value={invoiceItem?.quantity || ''}
                    onChangeText={t => handleItemChange('quantity', t)}
                    mode="outlined"
                    style={styles.compactInput}
                    outlineStyle={styles.inputOutline}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                  />
                ) : (
                  <TextInput
                    label="Net Weight"
                    value={invoiceItem?.netWeight || ''}
                    onChangeText={t => handleItemChange('netWeight', t)}
                    mode="outlined"
                    style={styles.compactInput}
                    outlineStyle={styles.inputOutline}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    right={
                      <TextInput.Affix
                        text={invoiceItem?.unit === 'kg' ? 'kg' : 'L'}
                      />
                    }
                  />
                )}
              </View>

              {invoiceItem?.unit !== 'pcs' && (
                <View style={styles.formColumn}>
                  <TextInput
                    label="Gross Weight"
                    value={invoiceItem?.grossWeight || ''}
                    onChangeText={t => handleItemChange('grossWeight', t)}
                    mode="outlined"
                    style={styles.compactInput}
                    outlineStyle={styles.inputOutline}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    right={<TextInput.Affix text="kg" />}
                  />
                </View>
              )}
            </View>

            {/* Invoice Value + Package Type */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Invoice Value"
                  value={invoiceItem?.value || ''}
                  onChangeText={t => handleItemChange('value', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  onFocus={handleInputFocus}
                  outlineStyle={styles.inputOutline}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="₹" />}
                />
              </View>

              <View style={styles.formColumn}>
                <TextInput
                  label="Package Type"
                  value={invoiceItem?.packageType || ''}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => packageModalRef.current?.open()}
                    />
                  }
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.fullWidthColumn}>
                <TextInput
                  label="Material Type"
                  value={invoiceItem?.materialType || ''}
                  onChangeText={t => handleItemChange('materialType', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
            </View>
            {/* PO No + PO Date */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="PO Number"
                  value={invoiceItem?.poNo || ''}
                  onChangeText={t => handleItemChange('poNo', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.formColumn}>
                <DateInput
                  label="PO Date"
                  value={invoiceItem?.poDate || ''}
                  onChange={date => {
                    handleItemChange('poDate', date);
                    setIsFormDirty(true);
                  }}
                />
              </View>
            </View>

            {/* Material Type */}
          </>
        );
      }
      case 'challan':
        const challanItem = currentTempItem as ChallanItem;
        return (
          <>
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Challan Number"
                  value={challanItem?.challanNo || ''}
                  onChangeText={t => handleItemChange('challanNo', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.formColumn}>
                <DateInput
                  label="Challan Date"
                  value={challanItem?.challanDate || ''}
                  onFocus={handleInputFocus}
                  onChange={date => {
                    handleItemChange('challanDate', date);
                    setIsFormDirty(true);
                  }}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Unit"
                  value={challanItem?.unit?.toUpperCase() || 'PCS'}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  editable={false}
                  onFocus={handleInputFocus}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => unitModalRef.current?.open()}
                    />
                  }
                />
              </View>
              <View style={styles.formColumn}>
                {challanItem?.unit === 'pcs' ? (
                  <TextInput
                    label="Quantity"
                    value={challanItem?.quantity || ''}
                    onChangeText={t => handleItemChange('quantity', t)}
                    mode="outlined"
                    style={styles.compactInput}
                    onFocus={handleInputFocus}
                    outlineStyle={styles.inputOutline}
                    keyboardType="numeric"
                  />
                ) : (
                  <TextInput
                    label="Net Weight"
                    value={challanItem?.netWeight || ''}
                    onChangeText={t => handleItemChange('netWeight', t)}
                    mode="outlined"
                    style={styles.compactInput}
                    outlineStyle={styles.inputOutline}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    right={
                      <TextInput.Affix
                        text={challanItem?.unit === 'kg' ? 'kg' : 'L'}
                      />
                    }
                  />
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Value"
                  value={challanItem?.value || ''}
                  onChangeText={t => handleItemChange('value', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="₹" />}
                />
              </View>
              <View style={styles.formColumn}>
                <TextInput
                  label="Package Type"
                  value={challanItem?.packageType || ''}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => packageModalRef.current?.open()}
                    />
                  }
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Material Type"
                  value={challanItem?.materialType || ''}
                  onChangeText={t => handleItemChange('materialType', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Document No"
                  value={challanItem?.documentno || ''}
                  onChangeText={t => handleItemChange('documentno', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formColumn, styles.formColumnGap]}>
                <TextInput
                  label="Po No"
                  value={challanItem?.value || ''}
                  onChangeText={t => handleItemChange('value', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="₹" />}
                />
              </View>
              <View style={styles.formColumn}>
                <DateInput
                  label="PO Date"
                  // value={invoiceItem?.poDate || ''}
                  onChange={date => {
                    handleItemChange('poDate', date);
                    setIsFormDirty(true);
                  }}
                />
              </View>
            </View>
          </>
        );

      case 'bill-of-entry':
        const boeItem = currentTempItem as BillOfEntryItem;
        const billOfEntryDigits = boeItem?.billOfEntryNo || '';

        return (
          <>
            <View style={styles.formRow}>
              <View style={[styles.formColumn70, styles.formColumnGap]}>
                <View style={styles.billEntryContainer}>
                  {/* <Text style={styles.inputLabel}>Bill of Entry Number</Text> */}
                  <TextInput
                    label="Bill-Of-Entry-No"
                    value={getDisplayValue()}
                    onChangeText={handleBillOfEntryChange}
                    mode="outlined"
                    style={[styles.compactInput, styles.billEntryInput]}
                    outlineStyle={styles.inputOutline}
                    keyboardType="numeric"
                    onFocus={handleInputFocus}
                    maxLength={19} // 16 digits + 3 hyphens
                    placeholder="0000-0000-0000-0000"
                    // left={<TextInput.Affix text="BOE" />}
                  />

                  {/* Segmented visual indicator */}
                  {/* <View style={styles.segmentsContainer}>
                    {[0, 1, 2, 3].map(segmentIndex => {
                      const segmentStart = segmentIndex * 4;
                      const segmentEnd = segmentStart + 4;
                      const segmentDigits = billOfEntryDigits.slice(
                        segmentStart,
                        segmentEnd,
                      );
                      const isComplete = segmentDigits.length === 4;

                      return (
                        <View key={segmentIndex} style={styles.segmentWrapper}>
                          <View
                            style={[
                              styles.segmentBox,
                              isComplete && styles.segmentBoxFilled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.segmentText,
                                isComplete && styles.segmentTextFilled,
                              ]}
                            >
                              {segmentDigits ||
                                (segmentIndex === 0 ? 'XXXX' : '')}
                            </Text>
                          </View>
                          {segmentIndex < 3 && (
                            <Text style={styles.separator}>-</Text>
                          )}
                        </View>
                      );
                    })}
                  </View> */}

                  {/* Character count */}
                  <View style={styles.charCountContainer}>
                    <Text
                      style={[
                        styles.charCountText,
                        billOfEntryDigits.length === 16 &&
                          styles.charCountComplete,
                      ]}
                    >
                      {billOfEntryDigits.length}/16 digits
                    </Text>
                    {billOfEntryDigits.length === 16 && (
                      <Icon
                        name="check-circle"
                        size={16}
                        color="#10B981"
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.formColumn30}>
                <DateInput
                  label="Date"
                  value={boeItem?.billOfEntryDate || ''}
                  onChange={date => {
                    handleItemChange('billOfEntryDate', date);
                    setIsFormDirty(true);
                  }}
                />
              </View>
            </View>

            {/* Shipper Name | Country - 70/30 */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn70, styles.formColumnGap]}>
                <TextInput
                  label="Shipper Name"
                  value={boeItem?.shipperName || ''}
                  onChangeText={t => handleItemChange('shipperName', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.formColumn30}>
                <TextInput
                  label="Country"
                  value={boeItem?.country || 'India'}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => countryModalRef.current?.open()}
                    />
                  }
                />
              </View>
            </View>

            {/* Buyer Name | Destination - 70/30 */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn70, styles.formColumnGap]}>
                <TextInput
                  label="Buyer Name"
                  value={boeItem?.buyerName || ''}
                  onChangeText={t => handleItemChange('buyerName', t)}
                  mode="outlined"
                  onFocus={handleInputFocus}
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                />
              </View>
              <View style={styles.formColumn30}>
                <TextInput
                  label="Destination"
                  value={boeItem?.destination || 'India'}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => destinationModalRef.current?.open()}
                    />
                  }
                />
              </View>
            </View>

            {/* Currency | Value - 70/30 */}
            <View style={styles.formRow}>
              <View style={[styles.formColumn70, styles.formColumnGap]}>
                <TextInput
                  label="Currency"
                  value={boeItem?.currency || 'INR'}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  editable={false}
                  onFocus={handleInputFocus}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => currencyModalRef.current?.open()}
                    />
                  }
                />
              </View>
              <View style={styles.formColumn30}>
                <TextInput
                  label="Value"
                  value={boeItem?.value || ''}
                  onChangeText={t => handleItemChange('value', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  left={<TextInput.Affix text={boeItem?.currency || '$'} />}
                />
              </View>
            </View>

            {/* Package Type (Full Width) */}
            <View style={styles.formRow}>
              <View style={styles.fullWidthColumn}>
                <TextInput
                  label="Package Type"
                  value={boeItem?.packageType || ''}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  editable={false}
                  onFocus={handleInputFocus}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="menu-down"
                      onPress={() => packageModalRef.current?.open()}
                    />
                  }
                />
              </View>
            </View>

            {/* Material Details (Full Width) */}
            <View style={styles.formRow}>
              <View style={styles.fullWidthColumn}>
                <TextInput
                  label="Material Details"
                  value={boeItem?.materialType || ''}
                  onChangeText={t => handleItemChange('materialType', t)}
                  mode="outlined"
                  style={styles.compactInput}
                  outlineStyle={styles.inputOutline}
                  onFocus={handleInputFocus}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </View>
          </>
        );
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          {/* Professional Header with Loadpost Details */}
          <View style={styles.infoHeader}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="identifier" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Loadpost ID:</Text>
                <Text style={styles.infoValue}>{loadpostid}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="truck" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Vehicle No:</Text>
                <Text style={styles.infoValue}>{vehicleno}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="account" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Driver:</Text>
                <Text style={styles.infoValue}>{driverName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="calendar" size={16} color="#6B7280" />
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Icon name="close" size={20} color="#374151" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {editingIndex !== null ? 'Edit' : ''} {getModalTitle()}
            </Text>

            <View style={styles.modalHeaderPlaceholder} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.invoiceForm}>
              {/* Add New Item Form */}
              <View style={styles.addItemForm}>
                {/* <Text style={styles.addItemTitle}>Add New Item</Text> */}

                <View style={styles.formGrid}>
                  {renderFormFields()}

                  {/* Image Picker */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      {getModalTitle()} Image (Optional)
                    </Text>
                    {currentTempItem?.image ? (
                      <View style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: currentTempItem.image }}
                          style={styles.imagePreview}
                        />
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.imageActionButton}
                            onPress={() => setShowImagePicker(true)}
                          >
                            <Text style={styles.imageActionText}>Change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.imageActionButton,
                              styles.removeButton,
                            ]}
                            onPress={() => handleItemChange('image', null)}
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
                        onPress={() => setShowImagePicker(true)}
                      >
                        <Icon name="camera" size={20} color="#3B82F6" />
                        <Text style={styles.imageUploadText}>
                          Upload {getModalTitle()} Image
                        </Text>
                        <Text style={styles.imageUploadSubtext}>Optional</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Add Item Button */}
                  <TouchableOpacity
                    style={[
                      styles.addItemButton,
                      isAddButtonDisabled() && styles.addItemButtonDisabled,
                    ]}
                    onPress={addItem}
                    disabled={isAddButtonDisabled()}
                  >
                    <Icon
                      name="plus"
                      size={18}
                      color={isAddButtonDisabled() ? '#9CA3AF' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.addItemButtonText,
                        isAddButtonDisabled() &&
                          styles.addItemButtonTextDisabled,
                      ]}
                    >
                      {getAddButtonText()} {/* Changed from "Add Items" */}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Items Table */}
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableTitle}>{getModalTitle()} Items</Text>
                  {tempItems.length > 0 && (
                    <View style={styles.tableSummary}>
                      <Text style={styles.itemCountText}>
                        {tempItems.length} item
                        {tempItems.length !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.tableSummaryText}>
                        Total:{' '}
                        {documentType === 'bill-of-entry'
                          ? `${
                              (tempItems[0] as BillOfEntryItem)?.currency || ''
                            } `
                          : '₹'}
                        {calculateTotal().toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Table Header */}
                {tempItems.length > 0 && (
                  <View style={styles.tableHeader}>
                    {getTableHeaders().map((header, index) => (
                      <View
                        key={index}
                        style={[
                          styles.tableHeaderCellWrapper,
                          index === getTableHeaders().length - 1 &&
                            styles.actionColumn,
                        ]}
                      >
                        <Text style={styles.tableHeaderCell}>{header}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Table Rows */}
                {tempItems.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    {getTableHeaders().map((_, cellIndex) => {
                      // Skip Action column in mapping
                      if (cellIndex === getTableHeaders().length - 1) {
                        return (
                          <View
                            key={cellIndex}
                            style={[
                              styles.tableCellWrapper,
                              styles.actionColumn,
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.deleteRowButton}
                              onPress={() => removeItem(index)}
                            >
                              <Icon
                                name="delete-outline"
                                size={18}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      }

                      return (
                        <View key={cellIndex} style={styles.tableCellWrapper}>
                          <Text style={styles.tableCell} numberOfLines={1}>
                            {formatTableCell(item, cellIndex)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}

                {tempItems.length === 0 && (
                  <View style={styles.emptyTable}>
                    <Icon
                      name={
                        documentType === 'challan'
                          ? 'truck-outline'
                          : documentType === 'bill-of-entry'
                          ? 'ship-wheel'
                          : 'file-document-outline'
                      }
                      size={32}
                      color="#9CA3AF"
                    />
                    <Text style={styles.emptyTableText}>
                      No items added yet
                    </Text>
                    {editingIndex !== null && (
                      <Text style={styles.emptyTableSubtext}>
                        Save will delete this group
                      </Text>
                    )}
                  </View>
                )}

                {/* Table Total */}
                {tempItems.length > 0 && (
                  <View style={styles.tableTotal}>
                    <Text style={styles.tableTotalLabel}>Total Value:</Text>
                    <Text style={styles.tableTotalValue}>
                      {documentType === 'bill-of-entry'
                        ? `${
                            (tempItems[0] as BillOfEntryItem)?.currency || ''
                          } `
                        : '₹'}
                      {calculateTotal().toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Icon
                  name={tempItems.length === 0 ? 'delete' : 'check'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.saveButtonText}>
                  {tempItems.length === 0 && editingIndex !== null
                    ? 'Delete Group'
                    : `Save ${getModalTitle()}`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        title={`Upload ${getModalTitle()} Image`}
      />

      {/* Bottom Modal for Unit Selection (Invoice/Challan) */}
      {(documentType === 'invoice' || documentType === 'challan') && (
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
                    (currentTempItem as InvoiceItem)?.unit === item.value &&
                      styles.bottomModalOptionSelected,
                  ]}
                  onPress={() => {
                    handleItemChange('unit', item.value);
                    unitModalRef.current?.close();
                  }}
                >
                  <Text
                    style={[
                      styles.bottomModalOptionText,
                      (currentTempItem as InvoiceItem)?.unit === item.value &&
                        styles.bottomModalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {(currentTempItem as InvoiceItem)?.unit === item.value && (
                    <Icon name="check" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomModal>
      )}

      {/* Bottom Modal for Package Type Selection */}
      <BottomModal
        ref={packageModalRef}
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
                  (currentTempItem as any)?.packageType === item.value &&
                    styles.bottomModalOptionSelected,
                ]}
                onPress={() => {
                  handleItemChange('packageType', item.value);
                  packageModalRef.current?.close();
                }}
              >
                <Text
                  style={[
                    styles.bottomModalOptionText,
                    (currentTempItem as any)?.packageType === item.value &&
                      styles.bottomModalOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {(currentTempItem as any)?.packageType === item.value && (
                  <Icon name="check" size={18} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomModal>

      {/* Bottom Modal for Currency Selection (Bill of Entry) */}
      {documentType === 'bill-of-entry' && (
        <BottomModal
          ref={currencyModalRef}
          customHeight={260}
          backdropOpacity={0.6}
          preventSwipeClose={true}
        >
          <View style={styles.modalContentWrapper}>
            <Text style={styles.bottomModalTitle}>Select Currency</Text>
            <View style={styles.bottomModalOptionsContainer}>
              {CURRENCY_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.bottomModalOption,
                    (currentTempItem as BillOfEntryItem)?.currency ===
                      item.value && styles.bottomModalOptionSelected,
                  ]}
                  onPress={() => {
                    handleItemChange('currency', item.value);
                    currencyModalRef.current?.close();
                  }}
                >
                  <Text
                    style={[
                      styles.bottomModalOptionText,
                      (currentTempItem as BillOfEntryItem)?.currency ===
                        item.value && styles.bottomModalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {(currentTempItem as BillOfEntryItem)?.currency ===
                    item.value && (
                    <Icon name="check" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomModal>
      )}

      {/* Bottom Modal for Country Selection (Bill of Entry) */}
      {documentType === 'bill-of-entry' && (
        <BottomModal
          ref={countryModalRef}
          customHeight={300}
          backdropOpacity={0.6}
          preventSwipeClose={true}
        >
          <View style={styles.modalContentWrapper}>
            <Text style={styles.bottomModalTitle}>Select Country</Text>
            <View style={styles.bottomModalOptionsContainer}>
              {COUNTRY_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.bottomModalOption,
                    (currentTempItem as BillOfEntryItem)?.country ===
                      item.value && styles.bottomModalOptionSelected,
                  ]}
                  onPress={() => {
                    handleItemChange('country', item.value);
                    countryModalRef.current?.close();
                  }}
                >
                  <Text
                    style={[
                      styles.bottomModalOptionText,
                      (currentTempItem as BillOfEntryItem)?.country ===
                        item.value && styles.bottomModalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {(currentTempItem as BillOfEntryItem)?.country ===
                    item.value && (
                    <Icon name="check" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomModal>
      )}

      {/* Bottom Modal for Destination Selection (Bill of Entry) */}
      {documentType === 'bill-of-entry' && (
        <BottomModal
          ref={destinationModalRef}
          customHeight={350}
          backdropOpacity={0.6}
          preventSwipeClose={true}
        >
          <View style={styles.modalContentWrapper}>
            <Text style={styles.bottomModalTitle}>Select Destination</Text>
            <View style={styles.bottomModalOptionsContainer}>
              {DESTINATION_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.bottomModalOption,
                    (currentTempItem as BillOfEntryItem)?.destination ===
                      item.value && styles.bottomModalOptionSelected,
                  ]}
                  onPress={() => {
                    handleItemChange('destination', item.value);
                    destinationModalRef.current?.close();
                  }}
                >
                  <Text
                    style={[
                      styles.bottomModalOptionText,
                      (currentTempItem as BillOfEntryItem)?.destination ===
                        item.value && styles.bottomModalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {(currentTempItem as BillOfEntryItem)?.destination ===
                    item.value && (
                    <Icon name="check" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomModal>
      )}
    </>
  );
};

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Professional Info Header
  infoHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
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
  modalHeaderPlaceholder: {
    width: 40,
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
  addItemForm: {
    marginBottom: 20,
  },
  addItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formGrid: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  compactInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    height: 48,
  },
  inputOutline: {
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
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
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 20,
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
  emptyTableSubtext: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontStyle: 'italic',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
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
  // Bill of Entry specific styles
  billEntryContainer: {
    marginBottom: 4,
  },
  billEntryInput: {
    marginBottom: 8,
  },
  segmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  segmentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentBox: {
    width: 60,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentBoxFilled: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  segmentTextFilled: {
    color: '#1E40AF',
  },
  separator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCountText: {
    fontSize: 11,
    color: '#6B7280',
  },
  charCountComplete: {
    color: '#10B981',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 4,
  },
  formColumn70: {
    flex: 7, // Takes 70% of the row
  },
  formColumn30: {
    flex: 3, // Takes 30% of the row
  },
  addItemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  addItemButtonTextDisabled: {
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default DocumentItemModal;
