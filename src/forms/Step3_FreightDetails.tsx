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
import BottomModal, { BottomModalRef } from '@components/BottomModal';

// ---------------------------------------------
// TYPES
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
// NEW: CHARGE SELECTOR COMPONENT (Updated)
// ---------------------------------------------
interface ChargeSelectorProps {
  selectedCharges: ChargeItem[];
  onChargesChange: (charges: ChargeItem[]) => void;
}

const ChargeSelector: React.FC<ChargeSelectorProps> = ({
  selectedCharges,
  onChargesChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableCharges, setAvailableCharges] = useState([
    { type: 'Loading', label: 'Loading' },
    { type: 'Unloading', label: 'Unloading' },
    { type: 'LR Charges', label: 'LR Charges' },
    { type: 'Detention Charges', label: 'Detention Charges' },
    { type: 'Weight Charges', label: 'Weight Charges' },
    { type: 'FOV', label: 'FOV' },
    { type: 'Other1', label: 'Other1' },
    { type: 'Other2', label: 'Other2' },
  ]);

  // Filter out already selected charges
  const getAvailableOptions = () => {
    const selectedTypes = selectedCharges.map(charge => charge.type);
    return availableCharges.filter(
      charge => !selectedTypes.includes(charge.type),
    );
  };

  const handleAddCharge = (chargeType: string) => {
    const charge = availableCharges.find(c => c.type === chargeType);
    if (charge) {
      const newCharge: ChargeItem = {
        type: charge.type as any,
        amount: '',
        label: charge.label,
      };
      const updatedCharges = [...selectedCharges, newCharge];
      onChargesChange(updatedCharges);
    }
    setShowDropdown(false);
  };

  const handleRemoveCharge = (index: number) => {
    const updatedCharges = selectedCharges.filter((_, i) => i !== index);
    onChargesChange(updatedCharges);
  };

  const handleAmountChange = (index: number, amount: string) => {
    const updatedCharges = [...selectedCharges];
    updatedCharges[index].amount = amount;
    onChargesChange(updatedCharges);
  };

  const handleLabelChange = (index: number, label: string) => {
    const updatedCharges = [...selectedCharges];
    updatedCharges[index].label = label;
    onChargesChange(updatedCharges);
  };

  return (
    <View style={chargeSelectorStyles.container}>
      {/* Selected Charges List */}
      {selectedCharges.map((charge, index) => (
        <View
          key={`${charge.type}-${index}`}
          style={chargeSelectorStyles.chargeRow}
        >
          <View style={chargeSelectorStyles.chargeInputContainer}>
            <TextInput
              label="Type"
              mode="outlined"
              value={charge.label}
              onChangeText={text => handleLabelChange(index, text)}
              style={chargeSelectorStyles.labelInput}
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              dense={true}
              theme={{ roundness: 4 }}
            />
            <TextInput
              label="Amount"
              mode="outlined"
              value={charge.amount}
              onChangeText={text => handleAmountChange(index, text)}
              style={chargeSelectorStyles.amountInput}
              keyboardType="numeric"
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              dense={true}
              theme={{ roundness: 4 }}
              left={<TextInput.Affix text="₹" />}
              placeholder="0.00"
            />
          </View>
          <TouchableOpacity
            style={chargeSelectorStyles.removeButton}
            onPress={() => handleRemoveCharge(index)}
          >
            <Icon name="close" size={16} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add More Button and Dropdown */}
      {getAvailableOptions().length > 0 && (
        <View>
          <TouchableOpacity
            style={chargeSelectorStyles.addButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Icon name="add" size={16} color="#1976D2" />
            <Text style={chargeSelectorStyles.addButtonText}>Add Charge</Text>
            <Icon
              name={showDropdown ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={chargeSelectorStyles.dropdown}>
              <ScrollView style={{ maxHeight: 150 }}>
                {getAvailableOptions().map(charge => (
                  <TouchableOpacity
                    key={charge.type}
                    style={chargeSelectorStyles.dropdownItem}
                    onPress={() => handleAddCharge(charge.type)}
                  >
                    <Text style={chargeSelectorStyles.dropdownText}>
                      {charge.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const chargeSelectorStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  chargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  chargeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  labelInput: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  removeButton: {
    padding: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 12,
    color: '#333',
  },
});

// ---------------------------------------------
// FREIGHT TO MODAL COMPONENT (unchanged)
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
            <View style={centerModal.gstRow}>
              <TextInput
                label="GST No"
                mode="outlined"
                value={formData?.gstNo}
                onChangeText={t =>
                  setFormData({ ...formData, gstNo: t.toUpperCase() })
                }
                style={centerModal.gstInput}
                dense={true}
                theme={{ roundness: 4 }}
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
              dense={true}
              theme={{ roundness: 4 }}
            />

            <TextInput
              label="Contact No"
              mode="outlined"
              keyboardType="phone-pad"
              value={formData?.contactNo}
              onChangeText={t => setFormData({ ...formData, contactNo: t })}
              style={centerModal.input}
              dense={true}
              theme={{ roundness: 4 }}
            />

            <TextInput
              label="Address Line 1"
              mode="outlined"
              value={formData?.address1}
              onChangeText={t => setFormData({ ...formData, address1: t })}
              style={centerModal.input}
              dense={true}
              theme={{ roundness: 4 }}
            />

            <TextInput
              label="Address Line 2"
              mode="outlined"
              value={formData?.address2}
              onChangeText={t => setFormData({ ...formData, address2: t })}
              style={centerModal.input}
              dense={true}
              theme={{ roundness: 4 }}
            />

            <View style={centerModal.row}>
              <TextInput
                label="Pincode"
                mode="outlined"
                keyboardType="number-pad"
                value={formData?.pincode}
                onChangeText={t => setFormData({ ...formData, pincode: t })}
                style={[centerModal.input, centerModal.half]}
                dense={true}
                theme={{ roundness: 4 }}
              />

              <TextInput
                label="City"
                mode="outlined"
                value={formData?.city}
                onChangeText={t => setFormData({ ...formData, city: t })}
                style={[centerModal.input, centerModal.half]}
                dense={true}
                theme={{ roundness: 4 }}
              />
            </View>

            <TextInput
              label="State"
              mode="outlined"
              value={formData?.state}
              onChangeText={t => setFormData({ ...formData, state: t })}
              style={centerModal.input}
              dense={true}
              theme={{ roundness: 4 }}
            />
          </ScrollView>

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
          dense={true}
          theme={{ roundness: 4 }}
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
          dense={true}
          theme={{ roundness: 4 }}
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
          dense={true}
          theme={{ roundness: 4 }}
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
    <BottomModal ref={modalRef} onClose={onClose} customHeight={350}>
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
              <Icon name="check" size={18} color="#1976D2" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <BottomModal ref={modalRef} onClose={onClose} customHeight={200}>
      <ModalContent />
    </BottomModal>
  );
};

// ---------------------------------------------
// MAIN COMPONENT (Updated with compact layout)
// ---------------------------------------------
export default function Step3_FreightDetails() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // State for dropdown modals
  const [freightToModalVisible, setFreightToModalVisible] = useState(false);
  const [freightToDetailsModalVisible, setFreightToDetailsModalVisible] =
    useState(false);
  const [gstModalVisible, setGstModalVisible] = useState(false);

  // Initialize freight details if not present
  useEffect(() => {
    if (!values.freightDetails) {
      setFieldValue('freightDetails', {
        noOfPackages: values.Packages || '0',
        netQuantity: '0',
        grossWeight: '0',
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
    }
  }, []);

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

  // Handle charges change
  const handleChargesChange = (charges: ChargeItem[]) => {
    setFieldValue('freightDetails.charges', charges);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Single Card Container */}
      <View style={styles.mainCard}>
        {/* Auto-calculated Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitleSmall}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Icon name="inventory" size={14} color="#3B82F6" />
                <Text style={styles.summaryLabel}>Packages</Text>
              </View>
              <Text style={styles.summaryValue}>
                {freightDetails.noOfPackages} pcs
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Icon name="scale" size={14} color="#10B981" />
                <Text style={styles.summaryLabel}>Net Qty</Text>
              </View>
              <Text style={styles.summaryValue}>
                {freightDetails.netQuantity} kg
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Icon name="fitness-center" size={14} color="#EF4444" />
                <Text style={styles.summaryLabel}>Gross Wt</Text>
              </View>
              <Text style={styles.summaryValue}>
                {freightDetails.grossWeight} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Freight To Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitleSmall}>Freight To</Text>
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
            <Icon name="arrow-drop-down" size={20} color="#666" />
          </TouchableOpacity>

          {freightDetails.freightTo?.type === 'Other' && (
            <TouchableOpacity
              style={styles.otherDetailsButton}
              onPress={() => setFreightToDetailsModalVisible(true)}
            >
              <Icon name="edit" size={14} color="#1976D2" />
              <Text style={styles.otherDetailsButtonText}>
                Enter Other Party Details
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Freight Amount Input */}
        <View style={styles.inputSection}>
          {/* <Text style={styles.sectionTitleSmall}>Freight Amount</Text> */}
          <TextInput
            label=" Freight Amount"
            mode="outlined"
            keyboardType="numeric"
            value={freightDetails.freightAmount}
            onChangeText={t => setFieldValue('freightDetails.freightAmount', t)}
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#1976D2"
            dense={true}
            theme={{ roundness: 4 }}
            left={<TextInput.Affix text="₹" />}
            placeholder="0.00"
          />
        </View>

        {/* Charges Section */}
        <View style={styles.inputSection}>
          {/* <Text style={styles.sectionTitleSmall}>Additional Charges</Text> */}
          <ChargeSelector
            selectedCharges={freightDetails.charges || []}
            onChargesChange={handleChargesChange}
          />
        </View>

        {/* Totals Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitleSmall}>Total Calculation</Text>
          <View style={styles.totalsGrid}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.totalRow}>
              <View style={styles.totalLabelContainer}>
                <Text style={styles.totalLabel}>GST Amount</Text>
                <TouchableOpacity
                  onPress={() => setGstModalVisible(true)}
                  style={styles.gstEditButton}
                >
                  <Icon name="edit" size={14} color="#1976D2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalValue}>
                ₹{parseFloat(freightDetails.gstAmount || '0').toFixed(2)}
              </Text>
            </View>

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                ₹{grandTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Advance</Text>
              <TextInput
                mode="outlined"
                value={freightDetails.advance}
                onChangeText={handleAdvanceChange}
                style={styles.advanceInput}
                keyboardType="numeric"
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                dense={true}
                theme={{ roundness: 4 }}
                left={<TextInput.Affix text="₹" />}
              />
            </View>

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
// STYLES (Updated for compact design)
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 0,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 2,
  },
  summarySection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitleSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#757575',
    marginLeft: 4,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  inputSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    height: 40,
  },
  dropdownButtonText: {
    fontSize: 12,
    color: '#212121',
  },
  dropdownButtonPlaceholder: {
    color: '#9E9E9E',
  },
  otherDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  otherDetailsButtonText: {
    fontSize: 11,
    color: '#1976D2',
    marginLeft: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  totalsGrid: {
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  gstEditButton: {
    marginLeft: 6,
    padding: 2,
  },
  grandTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 0,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
  },
  advanceInput: {
    width: 120,
    height: 36,
    backgroundColor: '#FFFFFF',
  },
  balanceRow: {
    paddingTop: 8,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    height: 40,
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1976D2',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 12,
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
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFF',
    height: 40,
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gstInput: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 40,
  },
  validateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1976D2',
    borderRadius: 6,
  },
  validateText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 11,
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
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  save: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1976D2',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 12,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 12,
  },
});

const dropdownModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  optionsContainer: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  optionText: {
    fontSize: 13,
    color: '#424242',
  },
  optionTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1976D2',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
});
