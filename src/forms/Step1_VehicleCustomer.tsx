import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Divider,
  TextInput,
  Modal,
  Portal,
  Button,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import LoadpostDropdown from '@components/common/DropDown/LoadpostDropdown';
import { useFormikContext } from 'formik';

export default function Step1_VehicleCustomer() {
  const { values, setFieldValue } = useFormikContext();
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [selectedLoadPost, setSelectedLoadPost] = useState('');

  const allData = [
    {
      loadPostId: 'LP001',
      pickupName: 'Abhishek',
      pickupPhone: '9899999999',
      pickupAddress1: 'Address Line 1',
      pickupAddress2: 'Address Line 2',
      pickupGoogle: 'Google Address',
      pickupCity: 'Mumbai',
      pickupState: 'Maharashtra',
      pickupPincode: '400001',
      dropName: 'Ramesh',
      dropPhone: '9876543210',
      dropAddress1: 'Drop Address 1',
      dropAddress2: 'Drop Address 2',
      dropGoogle: 'Google Drop Address',
      dropCity: 'Varanasi',
      dropState: 'Uttar Pradesh',
      dropPincode: '221001',
    },

    {
      loadPostId: 'LP002',
      pickupName: 'Suresh',
      pickupPhone: '9123456780',
      pickupAddress1: 'Same Building',
      pickupAddress2: '3rd Floor',
      pickupGoogle: 'Google Address 2',
      pickupCity: 'Pune',
      pickupState: 'Maharashtra',
      pickupPincode: '411001',
      dropName: 'Mahesh',
      dropPhone: '9988776655',
      dropAddress1: 'Drop Area 2',
      dropAddress2: 'Near Market',
      dropGoogle: 'Google Drop 2',
      dropCity: 'Delhi',
      dropState: 'Delhi',
      dropPincode: '110001',
    },

    {
      loadPostId: 'LP003',
      pickupName: 'Vikas',
      pickupPhone: '9000000000',
      pickupAddress1: 'Pickup Street 3',
      pickupAddress2: 'Landmark XYZ',
      pickupGoogle: 'Google Address 3',
      pickupCity: 'Nashik',
      pickupState: 'Maharashtra',
      pickupPincode: '422001',
      dropName: 'Amit',
      dropPhone: '9090909090',
      dropAddress1: 'Drop Road 3',
      dropAddress2: 'Opposite Temple',
      dropGoogle: 'Google Drop 3',
      dropCity: 'Indore',
      dropState: 'Madhya Pradesh',
      dropPincode: '452001',
    },
  ];

  const [filters, setFilters] = useState({
    loadPostId: '',
    origin: '',
    destination: '',
  });

  const [pickupForm, setPickupForm] = useState({
    name: '',
    mobile: '',
    address1: '',
    address2: '',
    googleAddress: '',
    state: '',
    city: '',
    taluka: '',
    pincode: '',
  });

  const [dropForm, setDropForm] = useState({
    ConsigneeName: '',
    Consigneemobileno: '',
    address1: '',
    address2: '',
    state: '',
    city: '',
    taluka: '',
    pincode: '',
  });

  const showModal = (values: {
    loadPostId?: string;
    pickupName: any;
    pickupPhone: any;
    pickupAddress1: any;
    pickupAddress2: any;
    pickupGoogle: any;
    pickupCity: any;
    pickupState: any;
    pickupPincode: any;
    dropName?: string;
    dropPhone?: string;
    dropAddress1?: string;
    dropAddress2?: string;
    dropGoogle?: string;
    dropCity?: string;
    dropState?: string;
    dropPincode?: string;
  }) => {
    setPickupForm({
      name: values.pickupName,
      mobile: values.pickupPhone,
      address1: values.pickupAddress1,
      address2: values.pickupAddress2,
      googleAddress: values.pickupGoogle,
      state: values.pickupState,
      city: values.pickupCity,
      taluka: '',
      pincode: values.pickupPincode,
    });
    setPickupOpen(true);
  };

  const hideModal = () => setPickupOpen(false);

  const containerStyle = {
    backgroundColor: 'white',
    padding: 18,
    margin: 10,
    borderRadius: 12,
  };

  const handleFilterChange = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const filteredData = allData.filter(item => {
    return (
      (!filters.loadPostId || item.loadPostId === filters.loadPostId) &&
      (!filters.origin || item.pickupCity === filters.origin) &&
      (!filters.destination || item.dropCity === filters.destination)
    );
  });

  const uniqueOptions = (field: string) => [
    ...new Set(allData.map(item => item[field])),
  ];
  const showDropModal = (values: {
    loadPostId?: string;
    pickupName?: string;
    pickupPhone?: string;
    pickupAddress1?: string;
    pickupAddress2?: string;
    pickupGoogle?: string;
    pickupCity?: string;
    pickupState?: string;
    pickupPincode?: string;
    dropName: any;
    dropPhone: any;
    dropAddress1: any;
    dropAddress2: any;
    dropGoogle?: string;
    dropCity: any;
    dropState: any;
    dropPincode: any;
  }) => {
    setDropForm({
      ConsigneeName: values.dropName,
      Consigneemobileno: values.dropPhone,
      address1: values.dropAddress1,
      address2: values.dropAddress2,
      state: values.dropState,
      city: values.dropCity,
      taluka: '',
      pincode: values.dropPincode,
    });

    setDropOpen(true);
  };
  return (
    <ScrollView style={styles.container}>
      {/* ---------------- FILTERS ---------------- */}
      <View style={styles.filterContainer}>
        <LoadpostDropdown
          allData={allData}
          selected={filters.loadPostId}
          onSelect={(value: string) => handleFilterChange('loadPostId', value)}
        />
      </View>

      {/* ---------------- CARDS ---------------- */}
      {filteredData.map((values, index) => (
        <View key={index}>
          {/* PICKUP CARD */}
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Pickup Location</Text>
              <IconButton icon="pencil" onPress={() => showModal(values)} />
            </View>

            <Divider />

            <View style={styles.content}>
              <Text style={styles.value}>
                {values.pickupName} · {values.pickupPhone}
              </Text>
              <Text style={styles.value}>
                {values.pickupAddress1}, {values.pickupAddress2}
              </Text>
              <Text style={styles.value}>{values.pickupGoogle}</Text>
              <Text style={styles.value}>
                {values.pickupCity}, {values.pickupState} -{' '}
                {values.pickupPincode}
              </Text>
            </View>
          </Card>

          {/* ---------------- MODAL FORM ---------------- */}
          <Portal>
            <Modal
              visible={pickupOpen}
              onDismiss={hideModal}
              contentContainerStyle={containerStyle}
            >
              <Text style={styles.formTitle}>Update Pickup Location</Text>

              <View style={styles.formContainer}>
                {/* Row 1 — Name + Mobile */}
                <View style={styles.row}>
                  <TextInput
                    label="Name"
                    value={pickupForm.name}
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, name: t })
                    }
                    style={styles.input}
                  />
                  <TextInput
                    label="Mobile"
                    keyboardType="number-pad"
                    value={pickupForm.mobile}
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, mobile: t })
                    }
                    style={styles.input}
                  />
                </View>

                {/* Address 1 */}
                <TextInput
                  label="Address Line 1"
                  value={pickupForm.address1}
                  onChangeText={t =>
                    setPickupForm({ ...pickupForm, address1: t })
                  }
                  style={styles.fullInput}
                />

                {/* Address 2 */}
                <TextInput
                  label="Address Line 2"
                  value={pickupForm.address2}
                  onChangeText={t =>
                    setPickupForm({ ...pickupForm, address2: t })
                  }
                  style={styles.fullInput}
                />

                {/* Google Address */}
                <TextInput
                  label="Google Address"
                  disabled
                  value={pickupForm.googleAddress}
                  onChangeText={t =>
                    setPickupForm({ ...pickupForm, googleAddress: t })
                  }
                  style={styles.fullInput}
                />

                {/* State + City */}
                <View style={styles.row}>
                  <TextInput
                    label="State"
                    value={pickupForm.state}
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, state: t })
                    }
                    disabled
                    style={styles.input}
                  />
                  <TextInput
                    label="City"
                    disabled
                    value={pickupForm.city}
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, city: t })
                    }
                    style={styles.input}
                  />
                </View>

                {/* Taluka + Pincode */}
                <View style={styles.row}>
                  <TextInput
                    label="Taluka"
                    value={pickupForm.taluka}
                    disabled
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, taluka: t })
                    }
                    style={styles.input}
                  />
                  <TextInput
                    label="Pincode"
                    keyboardType="number-pad"
                    value={pickupForm.pincode}
                    disabled
                    onChangeText={t =>
                      setPickupForm({ ...pickupForm, pincode: t })
                    }
                    style={styles.input}
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <Button mode="outlined" onPress={hideModal}>
                    <Text> Cancel</Text>
                  </Button>
                  <Button mode="contained" onPress={() => hideModal()}>
                    <Text> Update</Text>
                  </Button>
                </View>
              </View>
            </Modal>
          </Portal>

          {/* DROP CARD */}
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Drop Location</Text>
              <IconButton icon="pencil" onPress={() => showDropModal(values)} />
            </View>
            <Divider />
            <View style={styles.content}>
              <Text style={styles.value}>
                {values.dropName} · {values.dropPhone}
              </Text>
              <Text style={styles.value}>
                {values.dropAddress1}, {values.dropAddress2}
              </Text>
              <Text style={styles.value}>{values.dropGoogle}</Text>
              <Text style={styles.value}>
                {values.dropCity}, {values.dropState} - {values.dropPincode}
              </Text>
            </View>
          </Card>
          {/* ---------------- DROP MODAL ---------------- */}
          <Portal>
            <Modal
              visible={dropOpen}
              onDismiss={() => setDropOpen(false)}
              contentContainerStyle={containerStyle}
            >
              <Text style={styles.formTitle}>Update Drop Location</Text>

              <View style={styles.formContainer}>
                {/* Row 1 — Consignee Name + Mobile */}
                <View style={styles.row}>
                  <TextInput
                    label="Consignee Name"
                    value={dropForm.ConsigneeName}
                    onChangeText={t =>
                      setDropForm({ ...dropForm, ConsigneeName: t })
                    }
                    style={styles.input}
                  />
                  <TextInput
                    label="Consignee Mobile"
                    keyboardType="number-pad"
                    value={dropForm.Consigneemobileno}
                    onChangeText={t =>
                      setDropForm({ ...dropForm, Consigneemobileno: t })
                    }
                    style={styles.input}
                  />
                </View>

                {/* Address 1 */}
                <TextInput
                  label="Address Line 1"
                  value={dropForm.address1}
                  onChangeText={t => setDropForm({ ...dropForm, address1: t })}
                  style={styles.fullInput}
                />

                {/* Address 2 */}
                <TextInput
                  label="Address Line 2"
                  value={dropForm.address2}
                  onChangeText={t => setDropForm({ ...dropForm, address2: t })}
                  style={styles.fullInput}
                />

                {/* State + City */}
                <View style={styles.row}>
                  <TextInput
                    label="State"
                    value={dropForm.state}
                    onChangeText={t => setDropForm({ ...dropForm, state: t })}
                    style={styles.input}
                    disabled
                  />

                  <TextInput
                    label="City"
                    value={dropForm.city}
                    onChangeText={t => setDropForm({ ...dropForm, city: t })}
                    style={styles.input}
                    disabled
                  />
                </View>

                {/* Taluka + Pincode */}
                <View style={styles.row}>
                  <TextInput
                    label="Taluka"
                    value={dropForm.taluka}
                    onChangeText={t => setDropForm({ ...dropForm, taluka: t })}
                    style={styles.input}
                    disabled
                  />
                  <TextInput
                    label="Pincode"
                    keyboardType="number-pad"
                    value={dropForm.pincode}
                    onChangeText={t => setDropForm({ ...dropForm, pincode: t })}
                    style={styles.input}
                    disabled
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <Button mode="outlined" onPress={() => setDropOpen(false)}>
                    <Text> Cancel</Text>
                  </Button>
                  <Button mode="contained" onPress={() => setDropOpen(false)}>
                    <Text> Update</Text>
                  </Button>
                </View>
              </View>
            </Modal>
          </Portal>

          {/* ---------------- DROP MODAL ---------------- */}
          <Portal>
            <Modal
              visible={dropOpen}
              onDismiss={() => setDropOpen(false)}
              contentContainerStyle={containerStyle}
            >
              <Text style={styles.formTitle}>Update Drop Location</Text>

              <View style={styles.formContainer}>
                {/* Row 1 — Consignee Name + Mobile */}
                <View style={styles.row}>
                  <TextInput
                    label="Consignee Name"
                    value={dropForm.ConsigneeName}
                    onChangeText={t =>
                      setDropForm({ ...dropForm, ConsigneeName: t })
                    }
                    style={styles.input}
                  />
                  <TextInput
                    label="Consignee Mobile"
                    keyboardType="number-pad"
                    value={dropForm.Consigneemobileno}
                    onChangeText={t =>
                      setDropForm({ ...dropForm, Consigneemobileno: t })
                    }
                    style={styles.input}
                  />
                </View>

                {/* Address 1 */}
                <TextInput
                  label="Address Line 1"
                  value={dropForm.address1}
                  onChangeText={t => setDropForm({ ...dropForm, address1: t })}
                  style={styles.fullInput}
                />

                {/* Address 2 */}
                <TextInput
                  label="Address Line 2"
                  value={dropForm.address2}
                  onChangeText={t => setDropForm({ ...dropForm, address2: t })}
                  style={styles.fullInput}
                />

                {/* State + City */}
                <View style={styles.row}>
                  <TextInput
                    label="State"
                    value={dropForm.state}
                    onChangeText={t => setDropForm({ ...dropForm, state: t })}
                    style={styles.input}
                    disabled
                  />

                  <TextInput
                    label="City"
                    value={dropForm.city}
                    onChangeText={t => setDropForm({ ...dropForm, city: t })}
                    style={styles.input}
                    disabled
                  />
                </View>

                {/* Taluka + Pincode */}
                <View style={styles.row}>
                  <TextInput
                    label="Taluka"
                    value={dropForm.taluka}
                    onChangeText={t => setDropForm({ ...dropForm, taluka: t })}
                    style={styles.input}
                    disabled
                  />
                  <TextInput
                    label="Pincode"
                    keyboardType="number-pad"
                    value={dropForm.pincode}
                    onChangeText={t => setDropForm({ ...dropForm, pincode: t })}
                    style={styles.input}
                    disabled
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <Button mode="outlined" onPress={() => setDropOpen(false)}>
                    Cancel
                  </Button>
                  <Button mode="contained" onPress={() => setDropOpen(false)}>
                    Update
                  </Button>
                </View>
              </View>
            </Modal>
          </Portal>
        </View>
      ))}
    </ScrollView>
  );
}

/* --------------------------- STYLES ------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  filterScroll: {
    marginBottom: 10,
  },
  picker: {
    width: 150,
    height: 50,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 14,
    elevation: 2,
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 14,
    gap: 6,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },

  /* FORM */
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  formContainer: {
    marginTop: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  fullInput: {
    width: '100%',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  filterContainer: {
    width: '100%',
    // paddingHorizontal: 10, // small space on left/right
    // marginBottom: 10,
  },
  fullPicker: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
