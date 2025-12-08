import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import BottomSheetModal from '@modal/BottomSheetModal'; // your modal
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoadpostDropdown({ allData, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = allData.filter(item =>
    `${item.loadPostId} ${item.pickupCity} ${item.dropCity} ${item.pickupName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      {/* SELECTOR BUTTON */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.selectorText}>
          {selected
            ? (() => {
                const sel = allData.find(i => i.loadPostId === selected);
                return sel
                  ? `🏷️ ${sel.loadPostId} | 📍 ${sel.pickupCity} → ${sel.dropCity} | 👤 ${sel.pickupName}`
                  : 'Select Driver Details';
              })()
            : 'Select Driver Details'}
        </Text>
        <Icon name="chevron-down" size={22} color="#444" />
      </TouchableOpacity>

      {/* BOTTOM SHEET */}
      <BottomSheetModal
        visible={open}
        onClose={() => setOpen(false)}
        width="90%"
      >
        <View>
          {/* SEARCH INPUT */}
          <View style={styles.searchBox}>
            <Icon name="magnify" size={22} color="#666" />
            <TextInput
              placeholder="Search driver, city, load ID..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* SCROLLABLE DROPDOWN LIST */}
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
                  🏷️ {item.loadPostId} &nbsp;|&nbsp; 📍 {item.pickupCity} →{' '}
                  {item.dropCity} &nbsp;|&nbsp; 👤 {item.pickupName}
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
    fontSize: 15,
    color: '#333',
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
  itemRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemLabel: {
    fontSize: 15,
    color: '#222',
  },
  subLabel: {
    fontSize: 13,
    color: '#444',
    marginLeft: 6,
  },
});
