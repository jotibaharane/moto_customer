import Icon from '@react-native-vector-icons/material-design-icons';
import colors from '@utils/colors';
import { wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  size?: number;
  color?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  position,
  size = wp(24),
  color = colors.textPrimary,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, position]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={icon as any} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    backgroundColor: colors.surface,
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default FloatingActionButton;
