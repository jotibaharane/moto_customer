import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface DateInputProps {
  value?: string;
  onChange: (date: string) => void;
  label?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  label = 'Date (DD/MM/YYYY)',
}) => {
  const formatDate = (text: string) => {
    // remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4,
      )}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  const handleChange = (text: string) => {
    const formatted = formatDate(text);
    onChange(formatted);
  };

  return (
    <TextInput
      label={label}
      value={value}
      mode="outlined"
      keyboardType="number-pad"
      maxLength={10}
      placeholder="DD/MM/YYYY"
      onChangeText={handleChange}
    />
  );
};

export default DateInput;
