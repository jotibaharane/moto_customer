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
// TYPES (Keep as is)
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
  gstType: 'GTA' | 'Exemption' | 'GST Applicable';
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
// CHARGES CARD COMPONENT
// ---------------------------------------------
interface ChargeCardProps {
  charge: ChargeItem;
  index: number;
  onRemove: (index: number) => void;
  onAmountChange: (index: number, amount: string) => void;
  onAddPress: () => void;
}

const ChargeCard: React.FC<ChargeCardProps> = ({
  charge,
  index,
  onRemove,
  onAmountChange,
  onAddPress,
}) => {
  return (
    <View style={chargeCardStyles.container}>
      <View style={chargeCardStyles.content}>
        <Text style={chargeCardStyles.label}>{charge.label}</Text>

        <TextInput
          mode="outlined"
          value={charge.amount}
          onChangeText={text => onAmountChange(index, text)}
          style={chargeCardStyles.amountInput}
          keyboardType="numeric"
          dense
          left={<TextInput.Affix text="₹" />}
          placeholder="0.00"
        />
      </View>

      {/* ACTION ICONS */}
      <View style={chargeCardStyles.actions}>
        <TouchableOpacity
          style={chargeCardStyles.iconBtn}
          onPress={() => onRemove(index)}
        >
          <Icon name="close" size={18} color="#D32F2F" />
        </TouchableOpacity>
        <TouchableOpacity style={chargeCardStyles.iconBtn} onPress={onAddPress}>
          <Icon name="add" size={18} color="#1976D2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const chargeCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  amountInput: {
    width: 120,
    height: 36,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
});

// ---------------------------------------------
// CHARGES DROPDOWN MODAL
// ---------------------------------------------
interface ChargesDropdownModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (chargeType: string) => void;
  availableCharges: Array<{ type: string; label: string }>;
}

const ChargesDropdownModal: React.FC<ChargesDropdownModalProps> = ({
  visible,
  onClose,
  onSelect,
  availableCharges,
}) => {
  const modalRef = useRef<BottomModalRef>(null);

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
        <Text style={dropdownModalStyles.title}>Add Additional Charges</Text>
      </View>

      <View style={dropdownModalStyles.optionsContainer}>
        {availableCharges.length > 0 ? (
          <ScrollView style={{ maxHeight: 200 }}>
            {availableCharges.map(charge => (
              <TouchableOpacity
                key={charge.type}
                style={dropdownModalStyles.option}
                onPress={() => {
                  onSelect(charge.type);
                  onClose();
                }}
              >
                <Text style={dropdownModalStyles.optionText}>
                  {charge.label}
                </Text>
                <Icon name="add" size={18} color="#1976D2" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={dropdownModalStyles.emptyText}>
            All charges have been added
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <BottomModal ref={modalRef} onClose={onClose} customHeight={250}>
      <ModalContent />
    </BottomModal>
  );
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

// ---------------------------------------------
// GST CHARGES MODAL (CENTER MODAL)
// ---------------------------------------------
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

  useEffect(() => {
    if (visible) {
      setFormData(gstBreakup);
    }
  }, [visible, gstBreakup]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={gstModalStyles.overlay}>
        <View style={gstModalStyles.card}>
          <Text style={gstModalStyles.title}>GST Charges</Text>

          <View style={gstModalStyles.content}>
            <TextInput
              label="SGST Amount"
              mode="outlined"
              value={formData?.sgst}
              onChangeText={t => setFormData({ ...formData, sgst: t })}
              style={gstModalStyles.input}
              keyboardType="numeric"
              dense={true}
              theme={{ roundness: 4 }}
              left={<TextInput.Affix text="₹" />}
            />

            <TextInput
              label="CGST Amount"
              mode="outlined"
              value={formData?.cgst}
              onChangeText={t => setFormData({ ...formData, cgst: t })}
              style={gstModalStyles.input}
              keyboardType="numeric"
              dense={true}
              theme={{ roundness: 4 }}
              left={<TextInput.Affix text="₹" />}
            />

            <TextInput
              label="IGST Amount"
              mode="outlined"
              value={formData?.igst}
              onChangeText={t => setFormData({ ...formData, igst: t })}
              style={gstModalStyles.input}
              keyboardType="numeric"
              dense={true}
              theme={{ roundness: 4 }}
              left={<TextInput.Affix text="₹" />}
            />
          </View>

          <View style={gstModalStyles.footer}>
            <TouchableOpacity style={gstModalStyles.cancel} onPress={onClose}>
              <Text style={gstModalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={gstModalStyles.save} onPress={handleSave}>
              <Text style={gstModalStyles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const gstModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#212121',
  },
  content: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancel: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  save: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1976D2',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

// ---------------------------------------------
// FREIGHT TO DROPDOWN MODAL
// ---------------------------------------------
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
// MAIN COMPONENT
// ---------------------------------------------
export default function Step3_FreightDetails() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // State for modals
  const [freightToModalVisible, setFreightToModalVisible] = useState(false);
  const [freightToDetailsModalVisible, setFreightToDetailsModalVisible] =
    useState(false);
  const [gstModalVisible, setGstModalVisible] = useState(false);
  const [chargesDropdownVisible, setChargesDropdownVisible] = useState(false);
  const [showGstDropdown, setShowGstDropdown] = useState(false);

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
        gstType: 'GTA',
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

  // Available charges options
  const availableCharges = [
    { type: 'Loading', label: 'Loading Charges' },
    { type: 'Unloading', label: 'Unloading Charges' },
    { type: 'LR Charges', label: 'LR Charges' },
    { type: 'Detention Charges', label: 'Detention Charges' },
    { type: 'Weight Charges', label: 'Weight Charges' },
    { type: 'FOV', label: 'FOV' },
    { type: 'Other1', label: 'Other 1' },
    { type: 'Other2', label: 'Other 2' },
  ].filter(
    charge =>
      !(values.freightDetails?.charges || []).some(c => c.type === charge.type),
  );

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

  // Handle add charge
  const handleAddCharge = (chargeType: string) => {
    const charge = availableCharges.find(c => c.type === chargeType);
    if (charge) {
      const newCharge: ChargeItem = {
        type: charge.type as any,
        amount: '',
        label: charge.label,
      };
      const updatedCharges = [
        ...(values.freightDetails?.charges || []),
        newCharge,
      ];
      setFieldValue('freightDetails.charges', updatedCharges);
    }
  };

  // Handle remove charge
  const handleRemoveCharge = (index: number) => {
    const updatedCharges = (values.freightDetails?.charges || []).filter(
      (_, i) => i !== index,
    );
    setFieldValue('freightDetails.charges', updatedCharges);
  };

  // Handle amount change for charge
  const handleAmountChange = (index: number, amount: string) => {
    const updatedCharges = [...(values.freightDetails?.charges || [])];
    updatedCharges[index].amount = amount;
    setFieldValue('freightDetails.charges', updatedCharges);
  };

  // Handle GST type change
  const handleGstTypeChange = (
    type: 'GTA' | 'Exemption' | 'GST Applicable',
  ) => {
    setFieldValue('freightDetails.gstType', type);
    setShowGstDropdown(false);

    // Clear GST amount if not GST Applicable
    if (type !== 'GST Applicable') {
      setFieldValue('freightDetails.gstBreakup', {
        sgst: '',
        cgst: '',
        igst: '',
      });
      setFieldValue('freightDetails.gstAmount', '');
    } else {
      // Open GST modal when GST Applicable is selected
      setTimeout(() => {
        setGstModalVisible(true);
      }, 100);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const freightAmount = parseFloat(
      values.freightDetails?.freightAmount || '0',
    );
    const chargesTotal =
      values.freightDetails?.charges?.reduce(
        (sum, charge) => sum + parseFloat(charge.amount || '0'),
        0,
      ) || 0;
    const gstAmount = parseFloat(values.freightDetails?.gstAmount || '0');
    const subtotal = freightAmount + chargesTotal;
    const grandTotal = subtotal + gstAmount;
    const advance = parseFloat(values.freightDetails?.advance || '0');
    const balance = grandTotal - advance;

    return {
      freightAmount,
      chargesTotal,
      gstAmount,
      subtotal,
      grandTotal,
      advance,
      balance: Math.max(0, balance),
    };
  };

  // Update balance when advance changes
  const handleAdvanceChange = (advance: string) => {
    const { grandTotal } = calculateTotals();
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
  const isOtherSelected = freightDetails.freightTo?.type === 'Other';
  const hasOtherDetails = isOtherSelected && freightDetails.freightTo?.name;
  const totals = calculateTotals();

  // Format freight to display text
  const getFreightToDisplay = () => {
    if (isOtherSelected && hasOtherDetails) {
      return `${freightDetails.freightTo.name}`;
    }
    return freightDetails.freightTo?.type || 'Select Freight To';
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

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
          <View style={styles.summaryGrid}>
            {/* Quantity */}
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Icon name="scale" size={14} color="#10B981" />
                <Text style={styles.summaryLabel}>Qty / Kgs</Text>
              </View>
              <Text style={styles.summaryValue}>
                {freightDetails.netQuantity}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* Gross Weight Input */}
            <TextInput
              mode="outlined"
              label="Charged weight"
              value={freightDetails.grossWeight?.toString() || ''}
              onChangeText={value =>
                setFieldValue('freightDetails.grossWeight', value)
              }
              keyboardType="numeric"
              placeholder="Enter weight (kg)"
              style={styles.summaryInput}
            />
          </View>
        </View>

        {/* Freight To Section */}
        <View style={styles.inputSection}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setFreightToModalVisible(true)}
          >
            <View style={styles.freightToContent}>
              <Text
                style={[
                  styles.dropdownButtonText,
                  !freightDetails.freightTo?.type &&
                    styles.dropdownButtonPlaceholder,
                ]}
                numberOfLines={1}
              >
                {getFreightToDisplay()}
              </Text>
              {isOtherSelected && hasOtherDetails && (
                <Text style={styles.otherDetailsText} numberOfLines={1}>
                  {freightDetails.freightTo.gstNo || 'No GST'}
                </Text>
              )}
            </View>
            <View style={styles.dropdownRightContent}>
              {isOtherSelected && (
                <TouchableOpacity
                  onPress={() => setFreightToDetailsModalVisible(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="edit" size={16} color="#1976D2" />
                </TouchableOpacity>
              )}
              <Icon name="arrow-drop-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Freight Amount Input with Add Charges Button */}
        <View style={styles.inputSection}>
          <View style={styles.freightAmountRow}>
            <TextInput
              label="Freight Amount"
              mode="outlined"
              keyboardType="numeric"
              value={freightDetails.freightAmount}
              onChangeText={t =>
                setFieldValue('freightDetails.freightAmount', t)
              }
              style={styles.freightAmountInput}
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              dense={true}
              theme={{ roundness: 4 }}
              left={<TextInput.Affix text="₹" />}
              placeholder="0.00"
            />
            {availableCharges.length > 0 && (
              <TouchableOpacity
                style={styles.addChargeButton}
                onPress={() => setChargesDropdownVisible(true)}
              >
                <Icon name="add" size={20} color="#1976D2" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Additional Charges as Cards */}
        {(freightDetails.charges || []).length > 0 && (
          <View style={styles.chargesSection}>
            <Text style={styles.sectionLabel}>Additional Charges</Text>
            {(freightDetails.charges || []).map((charge, index) => (
              <ChargeCard
                key={`${charge.type}-${index}`}
                charge={charge}
                index={index}
                onRemove={handleRemoveCharge}
                onAmountChange={handleAmountChange}
                onAddPress={() => setChargesDropdownVisible(true)}
              />
            ))}
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Subtotal</Text>
            <Text style={styles.summaryRowValue}>
              ₹{formatNumber(totals.subtotal)}
            </Text>
          </View>

          {/* GST Row - Label on left, Dropdown and Amount on right */}
          <View style={styles.gstRow}>
            <View style={styles.gstLabelContainer}>
              <Text style={styles.gstLabel}>GST</Text>
              {freightDetails.gstType === 'GST Applicable' &&
                totals.gstAmount > 0 && (
                  <TouchableOpacity
                    onPress={() => setGstModalVisible(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon
                      name="edit"
                      size={14}
                      color="#1976D2"
                      style={styles.gstEditIcon}
                    />
                  </TouchableOpacity>
                )}
            </View>

            <View style={styles.gstRightContainer}>
              {/* GST Type Dropdown */}
              <View style={styles.gstDropdownContainer}>
                <TouchableOpacity
                  style={styles.gstDropdownButton}
                  onPress={() => setShowGstDropdown(!showGstDropdown)}
                >
                  <Text style={styles.gstDropdownText}>
                    {freightDetails.gstType}
                  </Text>
                  <Icon name="arrow-drop-down" size={16} color="#666" />
                </TouchableOpacity>

                {showGstDropdown && (
                  <View style={styles.gstDropdownMenu}>
                    {['GTA', 'Exemption', 'GST Applicable'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.gstDropdownItem,
                          freightDetails.gstType === type &&
                            styles.gstDropdownItemSelected,
                        ]}
                        onPress={() =>
                          handleGstTypeChange(
                            type as 'GTA' | 'Exemption' | 'GST Applicable',
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.gstDropdownItemText,
                            freightDetails.gstType === type &&
                              styles.gstDropdownItemTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                        {freightDetails.gstType === type && (
                          <Icon name="check" size={14} color="#1976D2" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* GST Amount */}
              <View style={styles.gstAmountContainer}>
                {freightDetails.gstType === 'GST Applicable' &&
                totals.gstAmount > 0 ? (
                  <Text style={styles.gstAmountValue}>
                    ₹{formatNumber(totals.gstAmount)}
                  </Text>
                ) : freightDetails.gstType !== 'Exemption' ? (
                  <Text style={styles.gstAmountValue}>₹0.00</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* GST Breakdown (if applicable) */}
          {freightDetails.gstType === 'GST Applicable' &&
            totals.gstAmount > 0 && (
              <View style={styles.gstBreakdown}>
                <Text style={styles.gstBreakdownTitle}>GST Breakdown:</Text>
                <View style={styles.gstBreakdownRow}>
                  <Text style={styles.gstBreakdownLabel}>SGST:</Text>
                  <Text style={styles.gstBreakdownValue}>
                    ₹
                    {parseFloat(freightDetails.gstBreakup.sgst || '0').toFixed(
                      2,
                    )}
                  </Text>
                </View>
                <View style={styles.gstBreakdownRow}>
                  <Text style={styles.gstBreakdownLabel}>CGST:</Text>
                  <Text style={styles.gstBreakdownValue}>
                    ₹
                    {parseFloat(freightDetails.gstBreakup.cgst || '0').toFixed(
                      2,
                    )}
                  </Text>
                </View>
                <View style={styles.gstBreakdownRow}>
                  <Text style={styles.gstBreakdownLabel}>IGST:</Text>
                  <Text style={styles.gstBreakdownValue}>
                    ₹
                    {parseFloat(freightDetails.gstBreakup.igst || '0').toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>
            )}

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{formatNumber(totals.grandTotal)}
            </Text>
          </View>

          {/* Advance Input */}
          <View style={styles.advanceRow}>
            <Text style={styles.advanceLabel}>Advance</Text>
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
              placeholder="0.00"
            />
          </View>

          {/* Balance Amount */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Balance Amount</Text>
            <Text
              style={[
                styles.balanceValue,
                {
                  color: totals.balance > 0 ? '#D32F2F' : '#2E7D32',
                },
              ]}
            >
              ₹{formatNumber(totals.balance)}
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

      <GSTModal
        visible={gstModalVisible}
        onClose={() => setGstModalVisible(false)}
        gstBreakup={freightDetails.gstBreakup}
        onSave={handleGSTBreakupSave}
      />

      <ChargesDropdownModal
        visible={chargesDropdownVisible}
        onClose={() => setChargesDropdownVisible(false)}
        onSelect={handleAddCharge}
        availableCharges={availableCharges}
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
  contentContainer: {
    padding: 0,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summarySection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#757575',
    marginLeft: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  summaryInput: {
    flex: 1,
    height: 40,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
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
    borderRadius: 6,
    height: 52,
  },
  freightToContent: {
    flex: 1,
    marginRight: 8,
  },
  dropdownRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '500',
  },
  dropdownButtonPlaceholder: {
    color: '#9E9E9E',
    fontWeight: '400',
  },
  otherDetailsText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  freightAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freightAmountInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 44,
  },
  addChargeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
  },
  chargesSection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryRowLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  summaryRowValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  // GST Row Styles
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'relative',
  },
  gstLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gstLabel: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  gstEditIcon: {
    marginLeft: 6,
  },
  gstRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gstDropdownContainer: {
    position: 'relative',
  },
  gstDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    minHeight: 32,
    width: 110,
  },
  gstDropdownText: {
    fontSize: 12,
    color: '#212121',
    fontWeight: '500',
  },
  gstDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 2,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gstDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  gstDropdownItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  gstDropdownItemText: {
    fontSize: 12,
    color: '#424242',
  },
  gstDropdownItemTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  gstAmountContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  gstAmountValue: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
  gstBreakdown: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  gstBreakdownTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  gstBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  gstBreakdownLabel: {
    fontSize: 11,
    color: '#666',
  },
  gstBreakdownValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 8,
    marginBottom: 12,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
  },
  advanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  advanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  advanceInput: {
    width: 140,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    paddingVertical: 20,
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
    height: 44,
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gstInput: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 44,
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
