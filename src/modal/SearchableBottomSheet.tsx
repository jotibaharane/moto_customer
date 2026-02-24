import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '@utils/tw';
import BottomSheetModal from './BottomSheetModal';

const SearchableBottomSheet = ({
  visible,
  onClose,
  title,
  data,
  selectedValue,
  onSelect,
}: any) => {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item: any) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, data]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text style={tw`text-lg font-bold`}>{title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 mb-3`}>
        <Icon name="search" size={20} color="#6B7280" />
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={tw`flex-1 p-2`}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`flex-row items-center p-3 border-b border-gray-100`}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
          >
            <Text style={tw`flex-1 text-gray-700`}>{item.label}</Text>
            {selectedValue === item.id && (
              <Icon name="check" size={20} color="#10B981" />
            )}
          </TouchableOpacity>
        )}
      />
    </BottomSheetModal>
  );
};

export default SearchableBottomSheet;
