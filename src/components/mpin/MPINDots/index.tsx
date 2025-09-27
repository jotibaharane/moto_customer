import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MPINDotsProps {
  value: string;
}

const MPINDots: React.FC<MPINDotsProps> = ({ value }) => {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[styles.dot, i < value.length ? styles.dotFilled : null]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
  dot: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: wp(10),
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
});

export default MPINDots;
