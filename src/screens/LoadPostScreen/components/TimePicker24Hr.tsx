import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  mode?: 'date' | 'time';
  testID?: string;
  iconColor?: string;
  iconSize?: number;
  loading?: boolean;
  isNextDay?: boolean; // controlled by parent
  onNextDayChange?: (next: boolean) => void; // notify parent
}

const TimePicker = ({
  value,
  onChange,
  placeholder = 'Select',
  error,
  disabled,
  mode = 'date',
  testID = 'picker',
  iconColor = '#666',
  iconSize = 20,
  loading = false,
  isNextDay = false,
  onNextDayChange,
}: PickerProps) => {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localNextDay, setLocalNextDay] = useState(isNextDay);

  // Format
  const formatValue = useCallback(
    (date: Date) => {
      if (mode === 'date') {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        return `${String(date.getHours()).padStart(2, '0')}:${String(
          date.getMinutes(),
        ).padStart(2, '0')}`;
      }
    },
    [mode],
  );

  // Sync localNextDay with parent
  useEffect(() => {
    setLocalNextDay(isNextDay);
  }, [isNextDay]);

  // Initialize default date/time
  useEffect(() => {
    const now = new Date();
    let defaultDate = now;

    if (mode === 'time' && localNextDay) {
      defaultDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
      );
    }

    setSelectedDate(defaultDate);
    if (!value) onChange(formatValue(defaultDate));
  }, [localNextDay, mode]);

  // Handle change
  const handleChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (event.type !== 'set' || !date) {
        setShow(false);
        return;
      }

      const now = new Date();
      let newDate = new Date(date);

      if (mode === 'time') {
        if (localNextDay) {
          // force the date to next day
          newDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            date.getHours(),
            date.getMinutes(),
          );

          const min = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
          );
          const max = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            15,
            0,
          );

          if (newDate < min || newDate > max) {
            Alert.alert(
              'Invalid Time',
              'Select time between 00:00 and 15:00 for next day.',
            );
            newDate = min;
          }
        } else {
          // TODAY → time only
          newDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            date.getHours(),
            date.getMinutes(),
          );

          const min = now;
          const max = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
          );

          if (newDate < min) {
            Alert.alert('Invalid Time', 'Cannot select past time today.');
            newDate = min;
          } else if (newDate > max) {
            newDate = max;
          }
        }
      } else if (mode === 'date') {
        const minDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const maxDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
        if (newDate < minDate) {
          Alert.alert('Invalid Date', 'Cannot select past date.');
          newDate = minDate;
        } else if (newDate > maxDate) {
          Alert.alert('Invalid Date', 'Cannot select date after next day.');
          newDate = maxDate;
        }
      }

      setSelectedDate(newDate);
      setShow(Platform.OS === 'ios');
      onChange(formatValue(newDate));
    },
    [formatValue, mode, localNextDay, onChange],
  );

  // Toggle Next Day
  const handleNextDay = useCallback(() => {
    const now = new Date();
    const newNextDay = !localNextDay;
    const nextDate = newNextDay
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);

    setLocalNextDay(newNextDay);
    setSelectedDate(nextDate);
    onChange(formatValue(nextDate));
    if (onNextDayChange) onNextDayChange(newNextDay);
  }, [localNextDay, formatValue, onChange, onNextDayChange]);

  const displayText = useMemo(
    () => value || formatValue(selectedDate),
    [value, selectedDate, formatValue],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && { backgroundColor: '#eee', opacity: 0.6 },
        ]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        testID={testID}
      >
        <Text style={[styles.text, disabled && { color: '#888' }]}>
          {displayText || placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <Icon
            name={mode === 'time' ? 'access-time' : 'calendar-today'}
            size={iconSize}
            color={disabled ? '#aaa' : iconColor}
          />
        )}
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          is24Hour
          display="spinner"
          onChange={handleChange}
          testID={`${testID}-picker`}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TimePicker;

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: '100%' },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { fontSize: 16, color: '#333', flexShrink: 1 },
  nextButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  nextText: { color: '#fff', fontWeight: '600' },
  error: { color: '#FF3B30', fontSize: 14, marginTop: 4 },
});
