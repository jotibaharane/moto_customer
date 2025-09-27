import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabToggleProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabToggle: React.FC<TabToggleProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.toggleButton,
              activeTab === tab.key && styles.toggleButtonActive,
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleButtonText,
                activeTab === tab.key && styles.toggleButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(25),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDarker,
    borderRadius: wp(12),
    padding: wp(4),
    marginHorizontal: wp(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp(12),
    borderRadius: wp(8),
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: wp(14),
    fontWeight: '600',
    color: colors.textOnDark,
  },
  toggleButtonTextActive: {
    color: colors.primary,
  },
});

export default TabToggle;
