import React, { useEffect } from 'react';
import { View } from 'react-native';
import TimePicker from './TimePicker24Hr';

interface NextDatePickerProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  disabled?: boolean;
}

const NextDatePicker = ({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  disabled = false,
}: NextDatePickerProps) => {
  // auto-set tomorrow date if empty
  useEffect(() => {
    if (!dateValue) {
      const t = new Date();
      t.setDate(t.getDate() + 1);

      const formatted = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(t.getDate()).padStart(2, '0')}`;

      onDateChange(formatted);
    }
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {/* Tomorrow Date */}
      <View style={{ flex: 1 }}>
        <TimePicker
          mode="date"
          value={dateValue}
          onChange={onDateChange}
          disabled={disabled}
          isNextDay={true} // enables next-day rules
        />
      </View>

      {/* Tomorrow Time */}
      <View style={{ flex: 1 }}>
        <TimePicker
          mode="time"
          value={timeValue}
          onChange={onTimeChange}
          disabled={disabled}
          isNextDay={true} // enables next-day logic: 00:00 – 15:00 only
        />
      </View>
    </View>
  );
};

export default NextDatePicker;
