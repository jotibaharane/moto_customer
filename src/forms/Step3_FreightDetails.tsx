import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useFormikContext } from 'formik';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ---------------------------------------------
// TYPES (Updated to include Step2 data)
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

interface FreightDetails {
  noOfPackages: string;
  netQuantity: string;
  grossWeight: string;
  freightAmount: string;
  loading: string;
  unloading: string;
  lrCharges: string;
  otherCharges: string;
  otherChargesLabel: string;
  advance: string;
  balance: string;
}

interface FormValues {
  // From Step2
  Packages: string;
  invoices: InvoiceGroup[];
  challans: ChallanGroup[];
  // Step3
  freightDetails: FreightDetails;
}

// ---------------------------------------------
// HELPER FUNCTIONS FOR CALCULATION
// ---------------------------------------------

// Calculate total number of packages (sum from Step2's Packages field)
const calculateTotalPackages = (packages: string): string => {
  return packages || '0';
};

// Calculate total net quantity/weight
const calculateTotalNetQuantity = (
  invoices: InvoiceGroup[],
  challans: ChallanGroup[],
): string => {
  let totalNetWeight = 0;

  // Calculate from invoices
  invoices.forEach(invoiceGroup => {
    invoiceGroup.items.forEach(item => {
      if (item.unit === 'kg' || item.unit === 'litre') {
        totalNetWeight += parseFloat(item.netWeight || '0');
      } else if (item.unit === 'pcs') {
        // If unit is pcs, we might want to convert to weight or keep as is
        // For now, we'll skip pcs for net weight calculation
      }
    });
  });

  // Calculate from challans
  challans.forEach(challanGroup => {
    challanGroup.items.forEach(item => {
      if (item.unit === 'kg' || item.unit === 'litre') {
        totalNetWeight += parseFloat(item.netWeight || '0');
      } else if (item.unit === 'pcs') {
        // Skip pcs for net weight
      }
    });
  });

  return totalNetWeight.toFixed(2);
};

// Calculate total gross weight (only from invoices, as challans don't have gross weight)
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

// Calculate total pieces count (for pcs unit)
const calculateTotalPieces = (
  invoices: InvoiceGroup[],
  challans: ChallanGroup[],
): string => {
  let totalPieces = 0;

  // Count from invoices
  invoices.forEach(invoiceGroup => {
    invoiceGroup.items.forEach(item => {
      if (item.unit === 'pcs') {
        totalPieces += parseFloat(item.quantity || '0');
      }
    });
  });

  // Count from challans
  challans.forEach(challanGroup => {
    challanGroup.items.forEach(item => {
      if (item.unit === 'pcs') {
        totalPieces += parseFloat(item.quantity || '0');
      }
    });
  });

  return totalPieces.toString();
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
export default function Step3_FreightDetails() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // Auto-calculate totals whenever Step2 data changes
  useEffect(() => {
    const calculatedPackages = calculateTotalPackages(values.Packages);
    const calculatedNetQuantity = calculateTotalNetQuantity(
      values.invoices || [],
      values.challans || [],
    );
    const calculatedGrossWeight = calculateTotalGrossWeight(
      values.invoices || [],
    );
    const calculatedPieces = calculateTotalPieces(
      values.invoices || [],
      values.challans || [],
    );

    // Initialize freight details if not present
    const currentDetails = values.freightDetails || {
      noOfPackages: calculatedPackages,
      netQuantity: calculatedNetQuantity,
      grossWeight: calculatedGrossWeight,
      freightAmount: '',
      loading: '',
      unloading: '',
      lrCharges: '',
      otherCharges: '',
      otherChargesLabel: '',
      advance: '',
      balance: '0',
    };

    // Only update if values have changed
    if (
      currentDetails.noOfPackages !== calculatedPackages ||
      currentDetails.netQuantity !== calculatedNetQuantity ||
      currentDetails.grossWeight !== calculatedGrossWeight
    ) {
      setFieldValue('freightDetails', {
        ...currentDetails,
        noOfPackages: calculatedPackages,
        netQuantity: calculatedNetQuantity,
        grossWeight: calculatedGrossWeight,
      });
    }
  }, [
    values.Packages,
    values.invoices,
    values.challans,
    values.freightDetails,
    setFieldValue,
  ]);

  // Handle field change
  const handleFreightChange = (key: keyof FreightDetails, value: string) => {
    if (!values.freightDetails) return;

    const updatedDetails = { ...values.freightDetails, [key]: value };

    // Auto-calculate balance if advance is updated
    if (key === 'advance') {
      const freightAmount = parseFloat(updatedDetails.freightAmount || '0');
      const loading = parseFloat(updatedDetails.loading || '0');
      const unloading = parseFloat(updatedDetails.unloading || '0');
      const lrCharges = parseFloat(updatedDetails.lrCharges || '0');
      const otherCharges = parseFloat(updatedDetails.otherCharges || '0');
      const advance = parseFloat(value || '0');

      const totalCharges =
        freightAmount + loading + unloading + lrCharges + otherCharges;
      const balance = totalCharges - advance;
      updatedDetails.balance = balance > 0 ? balance.toFixed(2) : '0.00';
    }

    // Auto-calculate balance if any charge field is updated
    if (
      [
        'freightAmount',
        'loading',
        'unloading',
        'lrCharges',
        'otherCharges',
      ].includes(key)
    ) {
      const freightAmount = parseFloat(
        key === 'freightAmount'
          ? value || '0'
          : updatedDetails.freightAmount || '0',
      );
      const loading = parseFloat(
        key === 'loading' ? value || '0' : updatedDetails.loading || '0',
      );
      const unloading = parseFloat(
        key === 'unloading' ? value || '0' : updatedDetails.unloading || '0',
      );
      const lrCharges = parseFloat(
        key === 'lrCharges' ? value || '0' : updatedDetails.lrCharges || '0',
      );
      const otherCharges = parseFloat(
        key === 'otherCharges'
          ? value || '0'
          : updatedDetails.otherCharges || '0',
      );
      const advance = parseFloat(updatedDetails.advance || '0');

      const totalCharges =
        freightAmount + loading + unloading + lrCharges + otherCharges;
      const balance = totalCharges - advance;
      updatedDetails.balance = balance > 0 ? balance.toFixed(2) : '0.00';
    }

    setFieldValue('freightDetails', updatedDetails);
  };

  if (!values.freightDetails) {
    return null;
  }

  const freightDetails = values.freightDetails;

  // Calculate totals
  const calculateTotalCharges = () => {
    const freightAmount = parseFloat(freightDetails.freightAmount || '0');
    const loading = parseFloat(freightDetails.loading || '0');
    const unloading = parseFloat(freightDetails.unloading || '0');
    const lrCharges = parseFloat(freightDetails.lrCharges || '0');
    const otherCharges = parseFloat(freightDetails.otherCharges || '0');

    return freightAmount + loading + unloading + lrCharges + otherCharges;
  };

  const totalCharges = calculateTotalCharges();
  const balance = parseFloat(freightDetails.balance || '0');

  // Add a summary of what's being calculated
  const summaryInfo = {
    packagesFromStep2: values.Packages || '0',
    invoiceCount: (values.invoices || []).length,
    challanCount: (values.challans || []).length,
    totalInvoiceItems: (values.invoices || []).reduce(
      (total, inv) => total + inv.items.length,
      0,
    ),
    totalChallanItems: (values.challans || []).reduce(
      (total, chal) => total + chal.items.length,
      0,
    ),
  };

  return (
    <View style={styles.container}>
      {/* Auto-calculated Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>
              {summaryInfo.invoiceCount} invoices, {summaryInfo.challanCount}{' '}
              challans
            </Text>
          </View>
        </View>

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
            <Text style={styles.summarySourceText}>
              From Step2 Packages field
            </Text>
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
            <Text style={styles.summarySourceText}>Sum of all net weights</Text>
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
            <Text style={styles.summarySourceText}>
              Sum of all gross weights
            </Text>
          </View>
        </View>
      </View>

      {/* Charges & Payments */}
      <View style={styles.chargesSection}>
        <View style={styles.chargesGrid}>
          {/* Row 1 */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Freight Amount"
                mode="outlined"
                keyboardType="numeric"
                value={freightDetails.freightAmount}
                onChangeText={t => handleFreightChange('freightAmount', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                left={<TextInput.Affix text="₹" />}
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={freightDetails.loading}
                onChangeText={t => handleFreightChange('loading', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                left={<TextInput.Affix text="₹" />}
                placeholder="0.00"
                label="Loading Charges"
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={freightDetails.unloading}
                onChangeText={t => handleFreightChange('unloading', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                left={<TextInput.Affix text="₹" />}
                placeholder="0.00"
                label="Unloading Charges"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={freightDetails.lrCharges}
                onChangeText={t => handleFreightChange('lrCharges', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                left={<TextInput.Affix text="₹" />}
                placeholder="0.00"
                label="LR Charges"
              />
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={freightDetails.otherCharges}
                onChangeText={t => handleFreightChange('otherCharges', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                left={<TextInput.Affix text="₹" />}
                placeholder="0.00"
                label="Other Charges"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                value={freightDetails.otherChargesLabel}
                onChangeText={t => handleFreightChange('otherChargesLabel', t)}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
                theme={{ roundness: 6 }}
                placeholder="e.g., Handling Charges, Tax, etc."
                label="Other Charges Label "
              />
            </View>
          </View>

          {/* Other Charges Label - Full Width */}
          <View style={styles.fullWidthWrapper}>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={freightDetails.advance}
              onChangeText={t => handleFreightChange('advance', t)}
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              theme={{ roundness: 6 }}
              left={<TextInput.Affix text="₹" />}
              placeholder="0.00"
              label="Advance"
            />
          </View>
        </View>
      </View>

      {/* Totals Section */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <View style={styles.totalLabelWrapper}>
            <Icon
              name="receipt"
              size={20}
              color="#424242"
              style={styles.totalIcon}
            />
            <Text style={styles.totalLabel}>Total Charges</Text>
          </View>
          <Text style={styles.totalAmount}>₹{totalCharges.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <View style={styles.totalLabelWrapper}>
            <Icon
              name={balance > 0 ? 'money-off' : 'check-circle'}
              size={20}
              color={balance > 0 ? '#D32F2F' : '#2E7D32'}
              style={styles.totalIcon}
            />
            <Text style={styles.totalLabel}>Balance</Text>
          </View>
          <Text
            style={[
              styles.totalAmount,
              { color: balance > 0 ? '#D32F2F' : '#2E7D32' },
            ]}
          >
            ₹{balance.toFixed(2)}
          </Text>
        </View>

        <View style={styles.infoNote}>
          <Icon name="info" size={16} color="#5D4037" />
          <Text style={styles.infoText}>
            Package count, net quantity, and gross weight are automatically
            calculated from your invoices and challans in Step 2. Total items:{' '}
            {summaryInfo.totalInvoiceItems + summaryInfo.totalChallanItems}{' '}
            across {summaryInfo.invoiceCount + summaryInfo.challanCount}{' '}
            documents.
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------
// STYLES (Updated)
// ---------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Summary Section
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'System',
  },
  summaryBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBadgeText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '500',
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
    fontFamily: 'System',
  },
  summarySourceText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontFamily: 'System',
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
  // Charges Section
  chargesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  chargesGrid: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  fullWidthWrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    height: 46,
  },
  // Totals Section
  totalsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  totalLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalIcon: {
    marginRight: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#424242',
    fontFamily: 'System',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    fontFamily: 'System',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#5D4037',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    fontFamily: 'System',
  },
});
