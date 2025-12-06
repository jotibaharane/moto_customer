import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SelectList } from '@components/common/Select';
import { useGooglePlacesSelect } from '../../../hooks/useGooglePlaces';

type AddressSearchProps = {
  onSelect: (placeId: string, description: string) => void;
  initialAddress?: string;
};

export default function AddressSearch({
  onSelect,
  initialAddress,
}: AddressSearchProps) {
  const {
    inputValue,
    suggestions,
    isLoading,
    handleInputChange,
    getPlaceDetails,
    setInputValue,
  } = useGooglePlacesSelect();

  useEffect(() => {
    if (initialAddress) {
      setInputValue(initialAddress);
    }
  }, [initialAddress]);
  // When an item is selected from dropdown
  const handleSelect = async (selectedItem: any) => {
    const placeId = selectedItem.key;
    const description = selectedItem.value;

    onSelect(placeId, description); // Pass to parent

    handleInputChange(description); // Update input text

    await getPlaceDetails(placeId); // Fetch details
  };

  return (
    <View style={{ padding: 5 }}>
      <SelectList
        label="Registered Address (Google)"
        placeholder="Search Address"
        value={inputValue}
        displayKey="value"
        data={suggestions}
        search={true}
        isLoading={isLoading}
        setSelected={() => {}} // not needed but required
        onSelect={handleSelect}
        onSearchChange={handleInputChange}
        searchValue={inputValue}
        boxStyles={{ marginBottom: 10 }}
        // iconLeft={<TextInput.Icon icon="map-marker" />}
      />
    </View>
  );
}
