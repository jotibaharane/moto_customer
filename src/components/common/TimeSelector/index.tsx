import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard, Text, TouchableOpacity, View} from 'react-native';
import {Button, Modal, Portal, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';

interface TimeSelectorProps {
  value?: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
  mode?: '24h' | '12h';
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value = '',
  onChange,
  label = 'Select Time',
  disabled = false,
  mode = '24h',
}) => {
  const [visible, setVisible] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [hourInput, setHourInput] = useState('00');
  const [minuteInput, setMinuteInput] = useState('00');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (mode === '12h') {
        setIsAM(h < 12);
        setHours(h % 12 || 12); // Convert 0 to 12 for 12h format
        setHourInput(String(h % 12 || 12).padStart(2, '0'));
      } else {
        setHours(h);
        setHourInput(String(h).padStart(2, '0'));
      }
      setMinutes(m);
      setMinuteInput(String(m).padStart(2, '0'));
    } else {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (mode === '12h') {
        setIsAM(h < 12);
        setHours(h % 12 || 12);
        setHourInput(String(h % 12 || 12).padStart(2, '0'));
      } else {
        setHours(h);
        setHourInput(String(h).padStart(2, '0'));
      }
      setMinutes(m);
      setMinuteInput(String(m).padStart(2, '0'));
    }
  }, [value, mode]);

  const showModal = () => {
    Keyboard.dismiss();
    setVisible(true);
  };

  const hideModal = () => setVisible(false);

  const handleConfirm = () => {
    let finalHours = hours;
    if (mode === '12h') {
      finalHours = isAM ? hours % 12 : (hours % 12) + 12;
      if (hours === 12) finalHours = isAM ? 0 : 12;
    }
    const timeString = `${String(finalHours).padStart(2, '0')}:${String(
      minutes,
    ).padStart(2, '0')}`;
    onChange(timeString);
    hideModal();
  };

  const handleHourChange = (text: string) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = text.replace(/[^0-9]/g, '');
    setHourInput(numericValue);

    if (numericValue === '') {
      setHours(0);
      return;
    }

    let num = parseInt(numericValue, 10);
    const max = mode === '12h' ? 12 : 23;

    if (num > max) {
      num = max;
      setHourInput(String(max));
    }

    setHours(num);
  };

  const handleMinuteChange = (text: string) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = text.replace(/[^0-9]/g, '');
    setMinuteInput(numericValue);

    if (numericValue === '') {
      setMinutes(0);
      return;
    }

    let num = parseInt(numericValue, 10);
    if (num > 59) {
      num = 59;
      setMinuteInput('59');
    }

    setMinutes(num);
  };

  const handleHourBlur = () => {
    // Format hours when input loses focus
    setHourInput(String(hours).padStart(2, '0'));
  };

  const handleMinuteBlur = () => {
    // Format minutes when input loses focus
    setMinuteInput(String(minutes).padStart(2, '0'));
  };

  const incrementHours = () => {
    const max = mode === '12h' ? 12 : 23;
    const newHours = (hours + 1) % (max + 1) || (mode === '12h' ? 1 : 0);
    setHours(newHours);
    setHourInput(String(newHours).padStart(2, '0'));
  };

  const decrementHours = () => {
    const max = mode === '12h' ? 12 : 23;
    const newHours = (hours - 1 + (max + 1)) % (max + 1) || max;
    setHours(newHours);
    setHourInput(String(newHours).padStart(2, '0'));
  };

  const incrementMinutes = () => {
    const newMinutes = (minutes + 1) % 60;
    setMinutes(newMinutes);
    setMinuteInput(String(newMinutes).padStart(2, '0'));
  };

  const decrementMinutes = () => {
    const newMinutes = (minutes - 1 + 60) % 60;
    setMinutes(newMinutes);
    setMinuteInput(String(newMinutes).padStart(2, '0'));
  };

  const toggleAMPM = () => {
    setIsAM(prev => !prev);
  };

  const displayValue = useMemo(() => {
    if (!value) return '';
    const [h, m] = value.split(':').map(Number);
    if (mode === '12h') {
      const ampm = h < 12 ? 'AM' : 'PM';
      const displayH = h % 12 || 12;
      return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    return value;
  }, [value, mode]);

  return (
    <View style={tw`mb-4`}>
      {label && <Text style={tw`text-gray-700 font-bold mb-1`}>{label}</Text>}

      <TouchableOpacity
        onPress={showModal}
        disabled={disabled}
        style={[
          tw`border rounded-lg p-3 flex-row justify-between items-center`,
          disabled
            ? tw`bg-gray-100 border-gray-200`
            : tw`bg-white border-gray-300`,
        ]}>
        <Text style={[tw`text-gray-700`, disabled && tw`text-gray-400`]}>
          {displayValue || label}
        </Text>
        <Icon
          name="access-time"
          size={20}
          color={disabled ? tw.color('gray-400') : tw.color('gray-600')}
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={tw`bg-white p-6 mx-5 rounded-lg`}>
          <View style={tw`items-center mb-4`}>
            <Text style={tw`text-lg font-medium text-gray-800`}>{label}</Text>
          </View>

          <View style={tw`flex-row justify-center items-center mb-6`}>
            {/* Hours */}
            <View style={tw`items-center mx-2`}>
              <TouchableOpacity
                onPress={incrementHours}
                style={tw`p-2 rounded-full bg-gray-100`}>
                <Icon
                  name="keyboard-arrow-up"
                  size={24}
                  color={tw.color('blue-600')}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  tw`text-3xl font-bold text-gray-800 my-2 text-center`,
                  {width: 60},
                ]}
                value={hourInput}
                onChangeText={handleHourChange}
                onBlur={handleHourBlur}
                keyboardType="number-pad"
                maxLength={2}
                textAlign="center"
                theme={{colors: {primary: tw.color('blue-600')}}}
              />

              <TouchableOpacity
                onPress={decrementHours}
                style={tw`p-2 rounded-full bg-gray-100`}>
                <Icon
                  name="keyboard-arrow-down"
                  size={24}
                  color={tw.color('blue-600')}
                />
              </TouchableOpacity>
            </View>

            <Text style={tw`text-3xl font-bold text-gray-800 mb-6`}>:</Text>

            {/* Minutes */}
            <View style={tw`items-center mx-2`}>
              <TouchableOpacity
                onPress={incrementMinutes}
                style={tw`p-2 rounded-full bg-gray-100`}>
                <Icon
                  name="keyboard-arrow-up"
                  size={24}
                  color={tw.color('blue-600')}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  tw`text-3xl font-bold text-gray-800 my-2 text-center`,
                  {width: 60},
                ]}
                value={minuteInput}
                onChangeText={handleMinuteChange}
                onBlur={handleMinuteBlur}
                keyboardType="number-pad"
                maxLength={2}
                textAlign="center"
                theme={{colors: {primary: tw.color('blue-600')}}}
              />

              <TouchableOpacity
                onPress={decrementMinutes}
                style={tw`p-2 rounded-full bg-gray-100`}>
                <Icon
                  name="keyboard-arrow-down"
                  size={24}
                  color={tw.color('blue-600')}
                />
              </TouchableOpacity>
            </View>

            {/* AM/PM Selector (only for 12h mode) */}
            {mode === '12h' && (
              <View style={tw`items-center ml-4`}>
                <TouchableOpacity
                  onPress={toggleAMPM}
                  style={[
                    tw`px-4 py-2 rounded-lg`,
                    isAM ? tw`bg-blue-100` : tw`bg-gray-100`,
                  ]}>
                  <Text
                    style={[
                      tw`font-medium`,
                      isAM ? tw`text-blue-600` : tw`text-gray-600`,
                    ]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <View style={tw`h-2`} />
                <TouchableOpacity
                  onPress={toggleAMPM}
                  style={[
                    tw`px-4 py-2 rounded-lg`,
                    !isAM ? tw`bg-blue-100` : tw`bg-gray-100`,
                  ]}>
                  <Text
                    style={[
                      tw`font-medium`,
                      !isAM ? tw`text-blue-600` : tw`text-gray-600`,
                    ]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={tw`flex-row justify-between mt-4`}>
            <Button
              mode="outlined"
              onPress={hideModal}
              style={tw`flex-1 mr-2`}
              labelStyle={tw`text-gray-700`}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={tw`flex-1 ml-2`}
              labelStyle={tw`text-white`}
              theme={{colors: {primary: tw.color('blue-600')}}}>
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default TimeSelector;
