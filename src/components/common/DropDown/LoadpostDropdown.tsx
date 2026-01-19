import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import BottomSheetModal from '@modal/BottomSheetModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* -------------------------------- TYPES -------------------------------- */

type LoadPostItem = {
  loadPostId: string | number;
  pickupCity?: string;
  dropCity?: string;
  pickupName?: string;
  vehicleNo?: string;
};

type Props = {
  allData: LoadPostItem[];
  selected?: string | number;
  onSelect: (id: string | number) => void;

  /* Freight Inputs (Formik Controlled) */
  freightAmount: string;
  onFreightChange: (value: string) => void;

  exclGstAmount?: string;
  onExclGstChange?: (value: string) => void;
};

/* ----------------------------- COMPONENT ----------------------------- */

export default function LoadpostDropdown({
  allData = [],
  selected,
  onSelect,
  freightAmount,
  onFreightChange,
  exclGstAmount,
  onExclGstChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = allData.filter(item =>
    `${item.loadPostId} ${item.vehicleNo ?? ''} ${item.pickupName ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selectedItem = allData.find(item => item.loadPostId === selected);

  return (
    <>
      {/* ---------------- SELECTOR ---------------- */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedItem
            ? `🏷️ ${selectedItem.loadPostId} | 🚚 ${selectedItem.vehicleNo} | 👤 ${selectedItem.pickupName}`
            : 'Select Driver Details'}
        </Text>
        <Icon name="chevron-down" size={22} color="#444" />
      </TouchableOpacity>

      {/* ---------------- FREIGHT INPUTS ---------------- */}
      <View style={styles.freightRow}>
        {/* Freight Amount */}
        <View style={styles.freightColumn}>
          <PaperTextInput
            mode="outlined"
            label="Freight Amount Excluding GST"
            value={freightAmount}
            onChangeText={onFreightChange}
            disabled={true}
            keyboardType="numeric"
            style={styles.paperInput}
            outlineStyle={styles.inputOutline}
            activeOutlineColor="#3b82f6"
            left={<PaperTextInput.Icon icon="currency-inr" size={20} />}
          />
        </View>

        {/* Excluding GST */}
        {exclGstAmount !== undefined && (
          <View style={styles.freightColumn}>
            <PaperTextInput
              mode="outlined"
              label="Excluding GST"
              value={exclGstAmount}
              editable={false}
              keyboardType="numeric"
              style={styles.paperInput}
              outlineStyle={[styles.inputOutline, styles.disabledOutline]}
              theme={{ colors: { background: '#f9fafb' } }}
              left={<PaperTextInput.Icon icon="calculator" size={20} />}
            />
            {/* Text showing "Excludes GST" */}
            <Text style={styles.excludesGstText}>Excludes GST</Text>
          </View>
        )}
      </View>

      {/* ---------------- BOTTOM SHEET ---------------- */}
      <BottomSheetModal
        visible={open}
        onClose={() => setOpen(false)}
        width="100%"
      >
        <View style={styles.bottomSheetContent}>
          {/* SEARCH */}
          <PaperTextInput
            mode="outlined"
            placeholder="Search load ID, vehicle no, driver..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            outlineStyle={styles.searchOutline}
            left={<PaperTextInput.Icon icon="magnify" />}
          />

          {/* LIST */}
          <ScrollView style={styles.listContainer}>
            {filtered.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemRow}
                onPress={() => {
                  onSelect(item.loadPostId);
                  setOpen(false);
                }}
              >
                <Text style={styles.itemLabel}>
                  🏷️ {item.loadPostId} | 🚚 {item.vehicleNo} | 👤{' '}
                  {item.pickupName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BottomSheetModal>
    </>
  );
}

/* ----------------------------- STYLES ----------------------------- */

const styles = StyleSheet.create({
  selectorButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  searchBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  itemRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
  },
  itemLabel: {
    fontSize: 15,
    color: '#222',
  },
  freightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  freightColumn: {
    flex: 1,
  },
  paperInput: {
    backgroundColor: 'white',
    fontSize: 14,
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1.5,
  },
  disabledOutline: {
    borderColor: '#d1d5db',
  },
  excludesGstText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  bottomSheetContent: {
    paddingHorizontal: 4,
  },
  searchInput: {
    backgroundColor: 'white',
    marginBottom: 12,
    fontSize: 14,
  },
  searchOutline: {
    borderRadius: 8,
  },
  listContainer: {
    maxHeight: 350,
  },
});
