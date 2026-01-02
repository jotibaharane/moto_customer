import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

const CustomRadioButton = ({ options, selectedOption, onSelect }: any) => {
  return (
    <View style={tw`flex-row items-center gap-6`}>
      {options.map((option: any) => (
        <TouchableOpacity
          key={option.value}
          style={tw`flex-row items-center`}
          onPress={() => onSelect(option.value)}
        >
          <View
            style={tw`w-5 h-5 rounded-full border-2 ${
              selectedOption === option.value
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-400'
            } mr-2 justify-center items-center`}
          >
            {selectedOption === option.value && (
              <View style={tw`w-2 h-2 rounded-full bg-white`} />
            )}
          </View>
          <Text style={tw`text-gray-700`}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomRadioButton;
