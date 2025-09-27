import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TimePickerProps {
  value?: string | null; // time as string like "20:20"
  onChange: (time: string | null) => void; // callback with HH:mm or null
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  mode?: 'time' | 'date' | 'datetime';
  is24Hour?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: number;
  testID?: string;
  iconColor?: string;
  iconSize?: number;
  clearable?: boolean;
  loading?: boolean;
  formatDisplayText?: (date: Date) => string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value = null,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  disabled = false,
  required = false,
  containerStyle,
  buttonStyle,
  buttonTextStyle,
  labelStyle,
  errorStyle,
  placeholderStyle,
  mode = 'time',
  is24Hour = true,
  minimumDate,
  maximumDate,
  minuteInterval,
  testID = 'time-picker',
  iconColor = '#666',
  iconSize = 20,
  clearable = true,
  loading = false,
  formatDisplayText,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Parse time string to Date for picker initialization
  const getInitialDate = useCallback((): Date => {
    if (value && value.length === 5) {
      const [hours, minutes] = value.split(':').map(Number);
      const now = new Date();
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
      );
      return date;
    }
    return new Date();
  }, [value]);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShow(Platform.OS === 'ios'); // Keep visible on iOS, hide on Android

      if (event.type === 'set' && selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        onChange(formattedTime);
      } else if (event.type === 'dismissed') {
        // Don't change value on dismiss, only when explicitly set
      }
    },
    [onChange],
  );

  const handleButtonPress = useCallback(() => {
    if (!disabled && !loading) {
      setShow(true);
    }
  }, [disabled, loading]);

  const handleClear = useCallback(() => {
    if (!disabled && !loading) {
      onChange(null);
      // Animate the clear action
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        fadeAnim.setValue(0);
      });
    }
  }, [disabled, loading, onChange, fadeAnim]);

  const displayText = useMemo(() => {
    if (value) {
      if (formatDisplayText && value.length === 5) {
        const [hours, minutes] = value.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return formatDisplayText(date);
      }
      return value;
    }
    return placeholder;
  }, [value, placeholder, formatDisplayText]);

  const displayStyle = useMemo(() => {
    if (!value) {
      return [
        styles.buttonText,
        styles.placeholderText,
        placeholderStyle,
      ] as TextStyle[];
    }
    return [styles.buttonText, buttonTextStyle] as TextStyle[];
  }, [value, buttonTextStyle, placeholderStyle]);

  const buttonStateStyle = useMemo<TouchableOpacityProps['style']>(
    () => [
      styles.button,
      disabled && styles.buttonDisabled,
      error && styles.buttonError,
      buttonStyle,
    ],
    [disabled, error, buttonStyle],
  );

  const pickerProps = useMemo(
    () => ({
      value: getInitialDate(),
      mode,
      is24Hour,
      display: Platform.OS === 'ios' ? 'spinner' : 'default',
      minimumDate,
      maximumDate,
      minuteInterval,
      textColor: Platform.OS === 'ios' ? '#007AFF' : undefined,
    }),
    [getInitialDate, mode, is24Hour, minimumDate, maximumDate, minuteInterval],
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={[styles.label, labelStyle]} testID={`${testID}-label`}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[buttonStateStyle, styles.buttonInner]}
          onPress={handleButtonPress}
          disabled={disabled}
          testID={`${testID}-button`}
          accessibilityRole="button"
          accessibilityLabel={value || placeholder}
        >
          <Animated.View style={styles.textContainer}>
            <Text style={displayStyle} numberOfLines={1}>
              {displayText}
            </Text>
          </Animated.View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={iconColor}
              style={styles.icon}
            />
          ) : (
            <Icon
              name="access-time"
              size={iconSize}
              color={disabled ? '#999' : iconColor}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>

        {clearable && value && !disabled && !loading && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            testID={`${testID}-clear`}
          >
            <Icon name="close" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.error, errorStyle]} testID={`${testID}-error`}>
          {error}
        </Text>
      )}

      {show && (
        <DateTimePicker
          {...pickerProps}
          onChange={handleChange}
          display="spinner"
          testID={`${testID}-picker`}
        />
      )}
    </View>
  );
};

TimePicker.displayName = 'TimePicker';

export default TimePicker;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  required: {
    color: '#FF3B30',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  buttonError: {
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  icon: {
    marginLeft: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  textContainer: {
    flex: 1,
  },
});
