import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFormikContext } from 'formik';

export default function Step2_InvoiceDetails() {
  const emptyForm = {
    poNo: '',
    date: '',
    invoiceNo: '',
    quantity: '',
    value: '',
    image: null,
  };

  const [form, setForm] = useState(emptyForm);
  const [invoiceTable, setInvoiceTable] = useState([]);
  const [showDate, setShowDate] = useState(false);
  const { values, setFieldValue } = useFormikContext();

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, response => {
      if (response?.assets && response.assets.length > 0) {
        setForm({ ...form, image: response.assets[0].uri });
      }
    });
  };
  const handleDelete = (index: number) => {
    const updated = invoiceTable.filter((_, i) => i !== index);
    setInvoiceTable(updated);
  };
  const handleAddToTable = () => {
    if (!form.poNo || !form.invoiceNo) {
      Alert.alert('Please fill required fields!');
      return;
    }
    setInvoiceTable([...invoiceTable, form]);
    setForm(emptyForm);
  };

  // Calculate totals
  const totalQty = invoiceTable.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
  const totalValue = invoiceTable.reduce(
    (sum, item) => sum + Number(item?.value || 0),
    0,
  );

  return (
    <ScrollView style={styles.container}>
      <Section title="Invoice Details" color="#3366FF">
        <EditCard>
          <View style={styles.invoiceCard}>
            {/* ------------------ FORM ------------------ */}
            <View style={styles.row}>
              <TextInput
                label="PO No."
                mode="outlined"
                style={styles.input}
                value={form.poNo}
                onChangeText={t => handleChange('poNo', t)}
                // left={
                //   <TextInput.Icon
                //     icon={() => <Icon name="file-document-outline" size={20} />}
                //   />
                // }
              />
              <TouchableOpacity onPress={() => setShowDate(true)}>
                <TextInput
                  label="Date"
                  mode="outlined"
                  style={styles.input}
                  value={form.date}
                  editable={false} // Disable typing
                  pointerEvents="none" // Prevent cursor
                  left={
                    <TextInput.Icon
                      icon={() => <Icon name="calendar-month" size={20} />}
                    />
                  }
                />
                {showDate && (
                  <DateTimePicker
                    value={form.date ? new Date(form.date) : new Date()}
                    mode="date"
                    display="spinner" // or "calendar", "default"
                    onChange={(event, selectedDate) => {
                      setShowDate(false);
                      if (selectedDate) {
                        const d = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
                        handleChange('date', d);
                      }
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Invoice No."
                mode="outlined"
                style={styles.input}
                value={form.invoiceNo}
                onChangeText={t => handleChange('invoiceNo', t)}
                // left={
                //   <TextInput.Icon
                //     icon={() => <Icon name="file-invoice-outline" size={20} />}
                //   />
                // }
              />
              <TextInput
                label="Quantity"
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                value={form.quantity}
                onChangeText={t => handleChange('quantity', t)}
                // left={
                //   <TextInput.Icon
                //     icon={() => <Icon name="counter" size={20} />}
                //   />
                // }
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Value"
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                value={form.value}
                onChangeText={t => handleChange('value', t)}
                // left={
                //   <TextInput.Icon
                //     icon={() => <Icon name="currency-inr" size={20} />}
                //   />
                // }
              />

              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {form.image ? (
                  <Image
                    source={{ uri: form.image }}
                    style={{ width: 55, height: 55, borderRadius: 8 }}
                  />
                ) : (
                  <Icon name="image-plus" size={28} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addInsideCard}
              onPress={handleAddToTable}
            >
              <Icon name="plus" size={18} color="#fff" />
              <Text style={styles.addInsideCardText}>Add Invoice</Text>
            </TouchableOpacity>

            {/* ------------------ SUMMARY TABLE ------------------ */}
            {invoiceTable.length > 0 && (
              <View style={styles.summaryBox}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {/* <Text style={[styles.tableCell, { flex: 1 }]}>PO No</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Date</Text> */}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Invoice No
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}
                  >
                    Qty
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}
                  >
                    Value (₹)
                  </Text>
                </View>

                {invoiceTable.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colInvoice]}>
                      {item?.invoiceNo}
                    </Text>

                    <Text style={[styles.tableCell, styles.colQty]}>
                      {item?.quantity}
                    </Text>

                    <Text style={[styles.tableCell, styles.colValue]}>
                      {item?.value}
                    </Text>

                    <TouchableOpacity
                      style={styles.deleteCell}
                      onPress={() => handleDelete(index)}
                    >
                      <Icon name="delete" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={[styles.tableRow, styles.tableFooter]}>
                  <Text
                    style={[styles.tableCell, { flex: 3, fontWeight: 'bold' }]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1, textAlign: 'right', fontWeight: 'bold' },
                    ]}
                  >
                    {totalQty}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1, textAlign: 'right', fontWeight: 'bold' },
                    ]}
                  >
                    {totalValue}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </EditCard>
      </Section>
    </ScrollView>
  );
}

/* ----------------- SECTION & CARD ----------------- */
const Section = ({ title, color, children }) => (
  <View style={{ marginBottom: 24 }}>
    <View style={styles.titleRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const EditCard = ({ children }) => (
  <View style={styles.card}>
    <View style={styles.editIcon}>
      <Icon name="pencil" size={18} color="#666" />
    </View>
    {children}
  </View>
);

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  container: { padding: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111' },

  card: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CFCFCF',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },

  editIcon: { position: 'absolute', right: 12, top: 10 },

  invoiceCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: { flex: 1 },

  imagePicker: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addInsideCard: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#3366FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addInsideCardText: { color: '#fff', marginLeft: 6, fontWeight: '600' },

  summaryBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D6DEFF',
    borderRadius: 10,
    backgroundColor: '#F5F7FF',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  tableHeader: { backgroundColor: '#E0E5FF' },
  tableFooter: { backgroundColor: '#D6DEFF' },
  tableCell: { fontSize: 14, color: '#111' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },

  tableCell: {
    fontSize: 14,
    color: '#111',
  },

  colInvoice: {
    flex: 2,
  },

  colQty: {
    flex: 1,
    textAlign: 'right',
  },

  colValue: {
    flex: 1.3,
    textAlign: 'right',
  },

  deleteCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
