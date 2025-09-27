import colors from '@utils/colors';
import { fontSize, hp, wp } from '@utils/responsive';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MPINKeypadProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
}

const MPINKeypad: React.FC<MPINKeypadProps> = ({
  onNumberPress,
  onBackspace,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'backspace'];

  return (
    <View style={styles.keypad}>
      {numbers.map((num, index) => (
        <TouchableOpacity
          key={index}
          style={styles.key}
          onPress={() => {
            if (num === 'backspace') {
              onBackspace();
            } else if (num !== '') {
              onNumberPress(num.toString());
            }
          }}
          disabled={num === ''}
        >
          {num === 'backspace' ? (
            <Image source={undefined} style={styles.backspaceIcon} />
          ) : (
            <Text style={styles.keyText}>{num}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: wp(24),
    marginBottom: hp(20),
  },
  key: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(36),
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp(8),
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyText: {
    fontSize: fontSize(24),
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  backspaceIcon: {
    width: wp(24),
    height: hp(24),
    tintColor: colors.textPrimary,
  },
});

export default MPINKeypad;
