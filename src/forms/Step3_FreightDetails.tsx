import React, { useEffect, useState, useRef } from 'react';
import { Alert, Modal } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useFormikContext } from 'formik';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomModal, { BottomModalRef } from '@components/BottomModal'; // Your custom modal

// ---------------------------------------------
// TYPES (Updated)
// ---------------------------------------------
interface InvoiceItem {
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

interface InvoiceGroup {
  id: string;
  poNo: string;
  poDate: string;
  items: InvoiceItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

interface ChallanItem {
  id: string;
  challanNo: string;
  challanDate: string;
  unit: 'pcs' | 'kg' | 'litre';
  quantity: string;
  netWeight: string;
  value: string;
  image: string | null;
}

interface ChallanGroup {
  id: string;
  items: ChallanItem[];
  totalValue: number;
  totalQuantity: string;
  unitType: string;
}

interface FreightToDetails {
  type: 'Consigner' | 'Consignee' | 'Other';
  gstNo: string;
  name: string;
  contactNo: string;
  address1: string;
  address2: string;
  pincode: string;
  city: string;
  state: string;
}

interface ChargeItem {
  type:
    | 'Loading'
    | 'Unloading'
    | 'LR Charges'
    | 'Detention Charges'
    | 'Weight Charges'
    | 'FOV'
    | 'Other1'
    | 'Other2';
  amount: string;
  label: string;
}

interface GSTBreakup {
  sgst: string;
  cgst: string;
  igst: string;
}

interface FreightDetails {
  noOfPackages: string;
  netQuantity: string;
  grossWeight: string;
  freightTo: FreightToDetails;
  charges: ChargeItem[];
  freightAmount: string;
  gstBreakup: GSTBreakup;
  gstAmount: string;
  advance: string;
  balance: string;
}

interface FormValues {
  Packages: string;
  invoices: InvoiceGroup[];
  challans: ChallanGroup[];
  freightDetails: FreightDetails;
}

// ---------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------
const calculateTotalPackages = (packages: string): string => {
  return packages || '0';
};

const calculateTotalNetQuantity = (
  invoices: InvoiceGroup[],
  challans: ChallanGroup[],
): string => {
  let totalNetWeight = 0;

  invoices.forEach(invoiceGroup => {
    invoiceGroup.items.forEach(item => {
      if (item.unit === 'kg' || item.unit === 'litre') {
        totalNetWeight += parseFloat(item.netWeight || '0');
      }
    });
  });

  challans.forEach(challanGroup => {
    challanGroup.items.forEach(item => {
      if (item.unit === 'kg' || item.unit === 'litre') {
        totalNetWeight += parseFloat(item.netWeight || '0');
      }
    });
  });

  return totalNetWeight.toFixed(2);
};

const calculateTotalGrossWeight = (invoices: InvoiceGroup[]): string => {
  let totalGrossWeight = 0;

  invoices.forEach(invoiceGroup => {
    invoiceGroup.items.forEach(item => {
      if (item.unit === 'kg' || item.unit === 'litre') {
        totalGrossWeight += parseFloat(item.grossWeight || '0');
      }
    });
  });

  return totalGrossWeight.toFixed(2);
};

// ---------------------------------------------
// FREIGHT TO MODAL COMPONENT
// ---------------------------------------------
interface FreightToModalProps {
  visible: boolean;
  onClose: () => void;
  freightTo: FreightToDetails;
  onSave: (details: FreightToDetails) => void;
}

const FreightToModal: React.FC<FreightToModalProps> = ({
  visible,
  onClose,
  freightTo,
  onSave,
}) => {
  const [formData, setFormData] = useState<FreightToDetails>(freightTo);
  const [gstError, setGstError] = useState('');

  useEffect(() => {
    if (visible) {
      setFormData(freightTo);
      setGstError('');
    }
  }, [visible, freightTo]);

  const validateGST = () => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!formData.gstNo) {
      setGstError('GST number is required');
      return;
    }

    if (!gstRegex.test(formData.gstNo.toUpperCase())) {
      setGstError('Invalid GST number');
      return;
    }

    setGstError('');
    Alert.alert('GST number is valid');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={centerModal.overlay}>
        <View style={centerModal.card}>
          <Text style={centerModal.title}>Other Party Details</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* GST + Validate */}
            <View style={centerModal.gstRow}>
              <TextInput
                label="GST No"
                mode="outlined"
                value={formData?.gstNo}
                onChangeText={t =>
                  setFormData({ ...formData, gstNo: t.toUpperCase() })
                }
                style={centerModal.gstInput}
              />

              <TouchableOpacity
                style={centerModal.validateBtn}
                onPress={validateGST}
              >
                <Text style={centerModal.validateText}>Validate</Text>
              </TouchableOpacity>
            </View>

            {!!gstError && (
              <Text style={centerModal.errorText}>{gstError}</Text>
            )}

            <TextInput
              label="Name"
              mode="outlined"
              value={formData?.name}
              onChangeText={t => setFormData({ ...formData, name: t })}
              style={centerModal.input}
            />

            <TextInput
              label="Contact No"
              mode="outlined"
              keyboardType="phone-pad"
              value={formData?.contactNo}
              onChangeText={t => setFormData({ ...formData, contactNo: t })}
              style={centerModal.input}
            />

            <TextInput
              label="Address Line 1"
              mode="outlined"
              value={formData?.address1}
              onChangeText={t => setFormData({ ...formData, address1: t })}
              style={centerModal.input}
            />

            <TextInput
              label="Address Line 2"
              mode="outlined"
              value={formData?.address2}
              onChangeText={t => setFormData({ ...formData, address2: t })}
              style={centerModal.input}
            />

            <View style={centerModal.row}>
              <TextInput
                label="Pincode"
                mode="outlined"
                keyboardType="number-pad"
                value={formData?.pincode}
                onChangeText={t => setFormData({ ...formData, pincode: t })}
                style={[centerModal.input, centerModal.half]}
              />

              <TextInput
                label="City"
                mode="outlined"
                value={formData?.city}
                onChangeText={t => setFormData({ ...formData, city: t })}
                style={[centerModal.input, centerModal.half]}
              />
            </View>

            <TextInput
              label="State"
              mode="outlined"
              value={formData?.state}
              onChangeText={t => setFormData({ ...formData, state: t })}
              style={centerModal.input}
            />
          </ScrollView>

          {/* Footer */}
          <View style={centerModal.footer}>
            <TouchableOpacity style={centerModal.cancel} onPress={onClose}>
              <Text style={centerModal.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={centerModal.save}
              onPress={() => {
                onSave(formData);
                onClose();
              }}
            >
              <Text style={centerModal.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// GST Breakup Modal
interface GSTModalProps {
  visible: boolean;
  onClose: () => void;
  gstBreakup: GSTBreakup;
  onSave: (breakup: GSTBreakup) => void;
}

const GSTModal: React.FC<GSTModalProps> = ({
  visible,
  onClose,
  gstBreakup,
  onSave,
}) => {
  const [formData, setFormData] = useState<GSTBreakup>(gstBreakup);
  const modalRef = useRef<BottomModalRef>(null);

  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const ModalContent = () => (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.title}>GST Breakup</Text>
      </View>

      <View style={modalStyles.content}>
        <TextInput
          label="SGST Amount"
          mode="outlined"
          value={formData?.sgst}
          onChangeText={t => setFormData({ ...formData, sgst: t })}
          style={modalStyles.input}
          keyboardType="numeric"
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          left={<TextInput.Affix text="₹" />}
        />

        <TextInput
          label="CGST Amount"
          mode="outlined"
          value={formData?.cgst}
          onChangeText={t => setFormData({ ...formData, cgst: t })}
          style={modalStyles.input}
          keyboardType="numeric"
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          left={<TextInput.Affix text="₹" />}
        />

        <TextInput
          label="IGST Amount"
          mode="outlined"
          value={formData?.igst}
          onChangeText={t => setFormData({ ...formData, igst: t })}
          style={modalStyles.input}
          keyboardType="numeric"
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          left={<TextInput.Affix text="₹" />}
        />
      </View>

      <View style={modalStyles.footer}>
        <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
          <Text style={modalStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
          <Text style={modalStyles.saveButtonText}>Save GST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BottomModal ref={modalRef} onClose={onClose} customHeight={400}>
      <ModalContent />
    </BottomModal>
  );
};

// Freight To Dropdown Modal
interface FreightToDropdownModalProps {
  visible: boolean;
  onClose: () => void;
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

const FreightToDropdownModal: React.FC<FreightToDropdownModalProps> = ({
  visible,
  onClose,
  selectedValue,
  onSelect,
}) => {
  const modalRef = useRef<BottomModalRef>(null);
  const options = ['Consigner', 'Consignee', 'Other'];

  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  const ModalContent = () => (
    <View style={dropdownModalStyles.container}>
      <View style={dropdownModalStyles.header}>
        <Text style={dropdownModalStyles.title}>Select Freight To</Text>
      </View>

      <View style={dropdownModalStyles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              dropdownModalStyles.option,
              selectedValue === option && dropdownModalStyles.optionSelected,
            ]}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
          >
            <Text
              style={[
                dropdownModalStyles.optionText,
                selectedValue === option &&
                  dropdownModalStyles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
            {selectedValue === option && (
              <Icon name="check" size={20} color="#1976D2" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <BottomModal ref={modalRef} onClose={onClose} customHeight={250}>
      <ModalContent />
    </BottomModal>
  );
};

// Charges Dropdown Modal
interface ChargesDropdownModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCharges: string[];
  onSelect: (charges: string[]) => void;
}

const ChargesDropdownModal: React.FC<ChargesDropdownModalProps> = ({
  visible,
  onClose,
  selectedCharges,
  onSelect,
}) => {
  const modalRef = useRef<BottomModalRef>(null);
  const [tempSelectedCharges, setTempSelectedCharges] =
    useState<string[]>(selectedCharges);

  useEffect(() => {
    if (visible) {
      setTempSelectedCharges(selectedCharges);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible, selectedCharges]);

  const chargeOptions = [
    'Loading',
    'Unloading',
    'LR Charges',
    'Detention Charges',
    'Weight Charges',
    'FOV',
    'Other1',
    'Other2',
  ];

  const toggleCharge = (charge: string) => {
    if (tempSelectedCharges.includes(charge)) {
      setTempSelectedCharges(tempSelectedCharges.filter(c => c !== charge));
    } else {
      setTempSelectedCharges([...tempSelectedCharges, charge]);
    }
  };

  const handleSave = () => {
    onSelect(tempSelectedCharges);
    onClose();
  };

  const ModalContent = () => (
    <View style={dropdownModalStyles.container}>
      <View style={dropdownModalStyles.header}>
        <Text style={dropdownModalStyles.title}>Select Additional Charges</Text>
      </View>

      <View style={dropdownModalStyles.optionsContainer}>
        {chargeOptions.map(charge => (
          <TouchableOpacity
            key={charge}
            style={[
              dropdownModalStyles.option,
              tempSelectedCharges.includes(charge) &&
                dropdownModalStyles.optionSelected,
            ]}
            onPress={() => toggleCharge(charge)}
          >
            <Text
              style={[
                dropdownModalStyles.optionText,
                tempSelectedCharges.includes(charge) &&
                  dropdownModalStyles.optionTextSelected,
              ]}
            >
              {charge}
            </Text>
            {tempSelectedCharges.includes(charge) && (
              <Icon name="check" size={20} color="#1976D2" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={dropdownModalStyles.footer}>
        <TouchableOpacity
          style={dropdownModalStyles.cancelButton}
          onPress={onClose}
        >
          <Text style={dropdownModalStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dropdownModalStyles.saveButton}
          onPress={handleSave}
        >
          <Text style={dropdownModalStyles.saveButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BottomModal ref={modalRef} onClose={onClose} customHeight={450}>
      <ModalContent />
    </BottomModal>
  );
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
export default function Step3_FreightDetails() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // State for dropdown modals
  const [freightToModalVisible, setFreightToModalVisible] = useState(false);
  const [freightToDetailsModalVisible, setFreightToDetailsModalVisible] =
    useState(false);
  const [chargesModalVisible, setChargesModalVisible] = useState(false);
  const [gstModalVisible, setGstModalVisible] = useState(false);

  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);

  // Initialize freight details if not present
  useEffect(() => {
    if (!values.freightDetails) {
      const calculatedPackages = calculateTotalPackages(values.Packages);
      const calculatedNetQuantity = calculateTotalNetQuantity(
        values.invoices || [],
        values.challans || [],
      );
      const calculatedGrossWeight = calculateTotalGrossWeight(
        values.invoices || [],
      );

      setFieldValue('freightDetails', {
        noOfPackages: calculatedPackages,
        netQuantity: calculatedNetQuantity,
        grossWeight: calculatedGrossWeight,
        freightTo: {
          type: 'Consigner',
          gstNo: '',
          name: '',
          contactNo: '',
          address1: '',
          address2: '',
          pincode: '',
          city: '',
          state: '',
        },
        charges: [],
        freightAmount: '',
        gstBreakup: {
          sgst: '',
          cgst: '',
          igst: '',
        },
        gstAmount: '',
        advance: '',
        balance: '0',
      });
    } else {
      // Initialize selected charges from existing data
      const existingCharges = values.freightDetails.charges || [];
      setSelectedCharges(existingCharges.map(c => c.type));
    }
  }, []);

  useEffect(() => {
    if (!values.freightDetails) return;

    const calculatedPackages = calculateTotalPackages(values.Packages);
    const calculatedNetQuantity = calculateTotalNetQuantity(
      values.invoices || [],
      values.challans || [],
    );
    const calculatedGrossWeight = calculateTotalGrossWeight(
      values.invoices || [],
    );

    setFieldValue('freightDetails', {
      ...values.freightDetails,
      noOfPackages: calculatedPackages,
      netQuantity: calculatedNetQuantity,
      grossWeight: calculatedGrossWeight,
    });
  }, [values.Packages, values.invoices, values.challans]);

  // Handle freight to selection
  const handleFreightToSelect = (value: string) => {
    const updatedFreightTo = {
      ...values.freightDetails.freightTo,
      type: value as 'Consigner' | 'Consignee' | 'Other',
    };

    setFieldValue('freightDetails.freightTo', updatedFreightTo);

    if (value === 'Other') {
      setTimeout(() => {
        setFreightToDetailsModalVisible(true);
      }, 300);
    }
  };

  // Handle save freight to details
  const handleSaveFreightTo = (details: FreightToDetails) => {
    setFieldValue('freightDetails.freightTo', details);
  };

  // Handle charge selection from modal
  const handleChargesSelect = (charges: string[]) => {
    setSelectedCharges(charges);

    // Update charges in form data
    const updatedCharges = charges.map(chargeType => {
      const existingCharge = values?.freightDetails?.charges?.find(
        c => c.type === chargeType,
      );
      return (
        existingCharge || {
          type: chargeType as any,
          amount: '',
          label: chargeType,
        }
      );
    });

    setFieldValue('freightDetails.charges', updatedCharges);
  };

  // Handle charge amount change
  const handleChargeAmountChange = (chargeType: string, amount: string) => {
    const updatedCharges = values.freightDetails.charges.map(charge =>
      charge.type === chargeType ? { ...charge, amount } : charge,
    );
    setFieldValue('freightDetails.charges', updatedCharges);
  };

  // Handle charge label change
  const handleChargeLabelChange = (chargeType: string, label: string) => {
    const updatedCharges = values.freightDetails.charges.map(charge =>
      charge.type === chargeType ? { ...charge, label } : charge,
    );
    setFieldValue('freightDetails.charges', updatedCharges);
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    const freightAmount = parseFloat(
      values.freightDetails?.freightAmount || '0',
    );
    const chargesTotal =
      values.freightDetails?.charges?.reduce(
        (sum, charge) => sum + parseFloat(charge.amount || '0'),
        0,
      ) || 0;

    return freightAmount + chargesTotal;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const gstAmount = parseFloat(values.freightDetails?.gstAmount || '0');
    return subtotal + gstAmount;
  };

  // Update balance when advance changes
  const handleAdvanceChange = (advance: string) => {
    const grandTotal = calculateGrandTotal();
    const advanceAmount = parseFloat(advance || '0');
    const balance = grandTotal - advanceAmount;

    setFieldValue('freightDetails.advance', advance);
    setFieldValue('freightDetails.balance', Math.max(0, balance).toFixed(2));
  };

  // Handle GST breakup save
  const handleGSTBreakupSave = (breakup: GSTBreakup) => {
    const total =
      parseFloat(breakup.sgst || '0') +
      parseFloat(breakup.cgst || '0') +
      parseFloat(breakup.igst || '0');

    setFieldValue('freightDetails.gstBreakup', breakup);
    setFieldValue('freightDetails.gstAmount', total.toFixed(2));
  };

  if (!values.freightDetails) {
    return null;
  }

  const freightDetails = values.freightDetails;
  const subtotal = calculateSubtotal();
  const grandTotal = calculateGrandTotal();

  return (
    <ScrollView style={styles.container}>
      {/* Auto-calculated Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Icon name="inventory" size={16} color="#3B82F6" />
              <Text style={styles.summaryLabel}>No. of Packages</Text>
            </View>
            <TextInput
              mode="flat"
              value={freightDetails.noOfPackages}
              editable={false}
              style={styles.summaryInput}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ roundness: 4 }}
              right={<TextInput.Affix text="pcs" />}
              contentStyle={styles.summaryInputContent}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Icon name="scale" size={16} color="#10B981" />
              <Text style={styles.summaryLabel}>Net Quantity</Text>
            </View>
            <TextInput
              mode="flat"
              value={freightDetails.netQuantity}
              editable={false}
              style={styles.summaryInput}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ roundness: 4 }}
              right={<TextInput.Affix text="kg" />}
              contentStyle={styles.summaryInputContent}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Icon name="fitness-center" size={16} color="#EF4444" />
              <Text style={styles.summaryLabel}>Gross Weight</Text>
            </View>
            <TextInput
              mode="flat"
              value={freightDetails.grossWeight}
              editable={false}
              style={styles.summaryInput}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ roundness: 4 }}
              right={<TextInput.Affix text="kg" />}
              contentStyle={styles.summaryInputContent}
            />
          </View>
        </View>
      </View>

      {/* Freight To Section */}
      <View style={styles.section}>
        {/* <View style={styles.sectionHeader}>
          <Icon name="location-on" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Freight To</Text>
        </View> */}

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setFreightToModalVisible(true)}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              !freightDetails.freightTo?.type &&
                styles.dropdownButtonPlaceholder,
            ]}
          >
            {freightDetails.freightTo?.type || 'Select Freight To'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>

        {freightDetails.freightTo?.type === 'Other' && (
          <TouchableOpacity
            style={styles.otherDetailsButton}
            onPress={() => setFreightToDetailsModalVisible(true)}
          >
            <Icon name="edit" size={18} color="#1976D2" />
            <Text style={styles.otherDetailsButtonText}>
              Enter Other Party Details
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Charges Section */}
      <View style={styles.section}>
        {/* <View style={styles.sectionHeader}>
          <Icon name="attach-money" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Additional Charges</Text>
        </View> */}

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setChargesModalVisible(true)}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              selectedCharges.length === 0 && styles.dropdownButtonPlaceholder,
            ]}
          >
            {selectedCharges.length === 0
              ? 'Select Additional Charges'
              : `${selectedCharges.length} charges selected`}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>

        {/* Selected Charges Inputs */}
        {selectedCharges.map(chargeType => {
          const charge = freightDetails?.charges?.find(
            c => c.type === chargeType,
          );
          return (
            <View key={chargeType} style={styles.chargeInputRow}>
              <TextInput
                label={`${chargeType} Label`}
                mode="outlined"
                value={charge?.label || chargeType}
                onChangeText={t => handleChargeLabelChange(chargeType, t)}
                style={[styles.input, styles.chargeLabelInput]}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
              />
              <TextInput
                label="Amount"
                mode="outlined"
                value={charge?.amount || ''}
                onChangeText={t => handleChargeAmountChange(chargeType, t)}
                style={[styles.input, styles.chargeAmountInput]}
                keyboardType="numeric"
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                left={<TextInput.Affix text="₹" />}
              />
            </View>
          );
        })}
      </View>

      {/* Freight Amount Input */}
      <View style={styles.section}>
        <TextInput
          label="Freight Amount"
          mode="outlined"
          keyboardType="numeric"
          value={freightDetails.freightAmount}
          onChangeText={t => setFieldValue('freightDetails.freightAmount', t)}
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          left={<TextInput.Affix text="₹" />}
          placeholder="0.00"
        />
      </View>

      {/* Totals Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calculate" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Total Calculation</Text>
        </View>

        <View style={styles.totalsGrid}>
          {/* Subtotal */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          {/* GST Amount */}
          <View style={styles.totalRow}>
            <View style={styles.totalLabelContainer}>
              <Text style={styles.totalLabel}>GST Amount</Text>
              <TouchableOpacity
                onPress={() => setGstModalVisible(true)}
                style={styles.gstEditButton}
              >
                <Icon name="edit" size={16} color="#1976D2" />
              </TouchableOpacity>
            </View>
            <Text style={styles.totalValue}>
              ₹{parseFloat(freightDetails.gstAmount || '0').toFixed(2)}
            </Text>
          </View>

          {/* Grand Total */}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          {/* Advance */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Advance</Text>
            <TextInput
              mode="outlined"
              value={freightDetails.advance}
              onChangeText={handleAdvanceChange}
              style={[styles.input, styles.advanceInput]}
              keyboardType="numeric"
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              left={<TextInput.Affix text="₹" />}
            />
          </View>

          {/* Balance */}
          <View style={[styles.totalRow, styles.balanceRow]}>
            <Text style={styles.totalLabel}>Balance Amount</Text>
            <Text
              style={[
                styles.totalValue,
                {
                  color:
                    parseFloat(freightDetails.balance || '0') > 0
                      ? '#D32F2F'
                      : '#2E7D32',
                },
              ]}
            >
              ₹{parseFloat(freightDetails.balance || '0').toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Modals */}
      <FreightToDropdownModal
        visible={freightToModalVisible}
        onClose={() => setFreightToModalVisible(false)}
        selectedValue={freightDetails.freightTo?.type || null}
        onSelect={handleFreightToSelect}
      />

      <FreightToModal
        visible={freightToDetailsModalVisible}
        onClose={() => setFreightToDetailsModalVisible(false)}
        freightTo={freightDetails.freightTo}
        onSave={handleSaveFreightTo}
      />

      <ChargesDropdownModal
        visible={chargesModalVisible}
        onClose={() => setChargesModalVisible(false)}
        selectedCharges={selectedCharges}
        onSelect={handleChargesSelect}
      />

      <GSTModal
        visible={gstModalVisible}
        onClose={() => setGstModalVisible(false)}
        gstBreakup={freightDetails.gstBreakup}
        onSave={handleGSTBreakupSave}
      />
    </ScrollView>
  );
}

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    marginLeft: 4,
  },
  summaryInput: {
    backgroundColor: '#FAFAFA',
    height: 42,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  summaryInputContent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'right',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#212121',
  },
  dropdownButtonPlaceholder: {
    color: '#9E9E9E',
  },
  otherDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  otherDetailsButtonText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    fontWeight: '500',
  },
  chargeInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  chargeLabelInput: {
    flex: 2,
  },
  chargeAmountInput: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  totalsGrid: {
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  gstEditButton: {
    marginLeft: 8,
  },
  grandTotalRow: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 0,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  advanceInput: {
    width: 150,
  },
  balanceRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});
const centerModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gstInput: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  validateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
  },
  validateText: {
    color: '#FFF',
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancel: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  save: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
  },
  saveText: {
    color: '#FFF',
    fontWeight: '500',
  },
});

const dropdownModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  optionsContainer: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  optionText: {
    fontSize: 16,
    color: '#424242',
  },
  optionTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});
