import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import BottomSheetModal from '@modal/BottomSheetModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type LoadPostItem = {
  loadPostId: string | number;
  pickupCity?: string;
  dropCity?: string;
  pickupName?: string;
  vehicleNo?: string; // ✅ vehicle number
};

export default function LoadpostDropdown({
  allData = [],
  selected,
  onSelect,
}: {
  allData: LoadPostItem[];
  selected?: string | number;
  onSelect: (id: string | number) => void;
}) {
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
      {/* SELECTOR BUTTON */}
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

      {/* BOTTOM SHEET */}
      <BottomSheetModal
        visible={open}
        onClose={() => setOpen(false)}
        width="100%"
      >
        <View>
          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Icon name="magnify" size={22} color="#666" />
            <TextInput
              placeholder="Search load ID, vehicle no, driver..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* LIST */}
          <ScrollView style={{ maxHeight: 350 }}>
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
  searchInput: {
    flex: 1,
    padding: 10,
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
});
