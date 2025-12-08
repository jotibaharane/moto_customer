import React from 'react';
import { View } from 'react-native';
import TimePicker from './TimePicker24Hr';

interface CurrentDatePickerProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  disabled?: boolean;
}

const CurrentDatePicker = ({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  disabled = false,
}: CurrentDatePickerProps) => {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {/* Today Date */}
      <View style={{ flex: 1 }}>
        <TimePicker
          mode="date"
          value={dateValue}
          onChange={onDateChange}
          disabled={disabled}
          isNextDay={false} // important
        />
      </View>

      {/* Today Time */}
      <View style={{ flex: 1 }}>
        <TimePicker
          mode="time"
          value={timeValue}
          onChange={onTimeChange}
          disabled={disabled}
          isNextDay={false} // important
        />
      </View>
    </View>
  );
};

export default CurrentDatePicker;
