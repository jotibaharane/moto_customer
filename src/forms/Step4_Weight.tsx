import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, RadioButton } from 'react-native-paper';

interface Props {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

export default function Step4_Weight({ values, setFieldValue }: Props) {
  const netWeight = values?.netWeight ?? '';
  const approximateWeight = values?.ApproximateWeight ?? '';
  const grossWeight = values?.grossWeight ?? '';

  return (
    <View style={styles.container}>
      {/* NET WEIGHT */}
      <Text style={styles.label}>Net Weight (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(netWeight)}
        onChangeText={text =>
          setFieldValue('netWeight', text.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />

      {/* APPROXIMATE WEIGHT */}
      <Text style={styles.label}>Approximate Weight (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(approximateWeight)}
        onChangeText={text =>
          setFieldValue('ApproximateWeight', text.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />

      {/* GROSS WEIGHT */}
      <Text style={styles.label}>Gross Weight (Kg)</Text>
      <TextInput
        mode="outlined"
        keyboardType="numeric"
        value={String(grossWeight)}
        onChangeText={text =>
          setFieldValue('grossWeight', text.replace(/[^0-9.]/g, ''))
        }
        style={styles.input}
      />

      {/* LAB REPORT APPLIED */}
      <Text style={styles.label}>Lab Report Applied?</Text>
      <RadioButton.Group
        onValueChange={v => {
          const applied = v === 'yes';
          setFieldValue('labReportApplied', applied);
          if (!applied) setFieldValue('labReportAvailable', false);
        }}
        value={labReportApplied ? 'yes' : 'no'}
      >
        <View style={styles.radioRow}>
          <RadioButton value="yes" />
          <Text>Yes</Text>
          <RadioButton value="no" />
          <Text>No</Text>
        </View>
      </RadioButton.Group>

      {labReportApplied && (
        <>
          <Text style={styles.label}>Lab Report Available?</Text>
          <RadioButton.Group
            onValueChange={v =>
              setFieldValue('labReportAvailable', v === 'yes')
            }
            value={labReportAvailable ? 'yes' : 'no'}
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

      {/* INSURANCE */}
      <Text style={styles.label}>Insurance?</Text>
      <RadioButton.Group
        onValueChange={v => {
          const insured = v === 'yes';
          setFieldValue('insurance', insured);
          if (!insured) setFieldValue('transitRisk', '');
        }}
        value={insurance ? 'yes' : 'no'}
      >
        <View style={styles.radioRow}>
          <RadioButton value="yes" />
          <Text>Yes</Text>
          <RadioButton value="no" />
          <Text>No</Text>
        </View>
      </RadioButton.Group>

      {insurance && (
        <>
          <Text style={styles.label}>Transit Risk</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter Transit Risk Details"
            value={transitRisk}
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
});
