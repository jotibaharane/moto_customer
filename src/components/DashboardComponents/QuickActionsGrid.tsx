import Icon from '@react-native-vector-icons/material-design-icons';
import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  icon: string;
  label: string;
  color: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
  columns?: number;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  onActionPress,
  columns = 4,
}) => {
  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.actionCard, { width: `${100 / columns}%` }]}
          onPress={() => onActionPress(action)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
            <Icon
              name={action.icon as any}
              size={wp(20)}
              color={colors.textOnPrimary}
            />
          </View>
          <Text style={styles.actionLabel} numberOfLines={1}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    alignItems: 'center',
    marginBottom: hp(15),
    paddingHorizontal: wp(5),
  },
  actionIcon: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionLabel: {
    fontSize: wp(12),
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuickActionsGrid;
