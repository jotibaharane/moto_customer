// LocationHistoryModal.tsx
import tw from '@utils/tw';
import React from 'react';
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LocationHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: any) => void;
  locations: any[];
}

const LocationHistoryModal: React.FC<LocationHistoryModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  locations,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredLocations = locations.filter(location =>
    location.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black bg-opacity-50 justify-center p-4`}>
        <View style={tw`bg-white rounded-2xl p-6 max-h-96`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Select from History
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={tw`border border-gray-300 rounded-lg px-4 py-2 mb-4`}
            placeholder="Search history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={filteredLocations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={tw`p-4 border-b border-gray-200`}
                onPress={() => onSelectLocation(item)}
              >
                <Text style={tw`text-gray-800 font-medium`}>
                  {item.address}
                </Text>
                {item.area && (
                  <Text style={tw`text-gray-600 text-sm mt-1`}>
                    {item.area}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={tw`text-center text-gray-500 py-8`}>
                No location history found
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default LocationHistoryModal;
