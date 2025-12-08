import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, RadioButton } from 'react-native-paper';

interface Props {
  values: any;
  setFieldValue: any;
}

export default function Step4_Weight({ values, setFieldValue }: Props) {
  const safeNetWeight = values?.netWeight ?? '';
  const safeGrossWeight = values?.grossWeight ?? '';
  const safeApplied = values?.labReportApplied ?? false;
  const safeAvailable = values?.labReportAvailable ?? false;
  const safeInsurance = values?.insurance ?? false;
  const safeTransitRisk = values?.transitRisk ?? '';

  return (
    <View style={styles.container}>
      {/* ---------------- NET WEIGHT ---------------- */}
      <Text style={styles.label}>Net Weight (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(safeNetWeight)}
        onChangeText={t =>
          setFieldValue('netWeight', t.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />
      <Text style={styles.label}>Approximate (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(safeNetWeight)}
        onChangeText={t =>
          setFieldValue('Approximate', t.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />
      {/* ---------------- GROSS WEIGHT ---------------- */}
      <Text style={styles.label}>Gross Weight (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(safeGrossWeight)}
        onChangeText={t =>
          setFieldValue('grossWeight', t.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />

      {/* ---------------- LAB REPORT APPLIED ---------------- */}
      <Text style={styles.label}>Lab Report Applied?</Text>
      <RadioButton.Group
        onValueChange={v => {
          const applied = v === 'yes';
          setFieldValue('labReportApplied', applied);
          if (!applied) setFieldValue('labReportAvailable', false);
        }}
        value={safeApplied ? 'yes' : 'no'}
      >
        <View style={styles.radioRow}>
          <RadioButton value="yes" />
          <Text>Yes</Text>
          <RadioButton value="no" />
          <Text>No</Text>
        </View>
      </RadioButton.Group>

      {safeApplied && (
        <>
          <Text style={styles.label}>Lab Report Available?</Text>
          <RadioButton.Group
            onValueChange={v =>
              setFieldValue('labReportAvailable', v === 'yes')
            }
            value={safeAvailable ? 'yes' : 'no'}
          >
            <View style={styles.radioRow}>
              <RadioButton value="yes" />
              <Text>Yes</Text>
              <RadioButton value="no" />
              <Text>No</Text>
            </View>
          </RadioButton.Group>
        </>
      )}

      {/* ---------------- INSURANCE ---------------- */}
      <Text style={styles.label}>Insurance?</Text>
      <RadioButton.Group
        onValueChange={v => {
          const insured = v === 'yes';
          setFieldValue('insurance', insured);
          if (!insured) setFieldValue('transitRisk', '');
        }}
        value={safeInsurance ? 'yes' : 'no'}
      >
        <View style={styles.radioRow}>
          <RadioButton value="yes" />
          <Text>Yes</Text>
          <RadioButton value="no" />
          <Text>No</Text>
        </View>
      </RadioButton.Group>

      {safeInsurance && (
        <>
          <Text style={styles.label}>Transit Risk</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter Transit Risk Details"
            value={safeTransitRisk}
            onChangeText={t => setFieldValue('transitRisk', t)}
            style={styles.input}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: -8,
  },
  input: {
    backgroundColor: '#fff',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
