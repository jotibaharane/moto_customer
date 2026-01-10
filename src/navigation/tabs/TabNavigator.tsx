import { FloatingActionButton } from '@components/DashboardComponents/FloatingButtons';
import Icon from '@react-native-vector-icons/material-design-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Dashboard from '@screens/DashboardScreen';
import LoadPostForm from '@screens/LoadPostScreen';
import colors from '@utils/colors';
import { routeName } from '@utils/navigationHelpers';
import { hp, wp } from '@utils/responsive';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Profile from '@screens/ProfileScreen/Profile';
import MultiStepForm from './../../forms/MultiStepForm';

export type TabParamList = {
  [routeName.HOME]: undefined;
  Profile: undefined;
  MyPost: undefined;
  History: undefined;
};

// Mock Components for other tabs
const MyPostScreen = () => <View style={styles.tabScreen} />;
const HistoryScreen = () => (
  <View style={styles.tabScreen}>
    <MultiStepForm />
    <FloatingActionButton />
  </View>
);
// const ProfileScreen = () => <View style={styles.tabScreen} />;

const Tab = createBottomTabNavigator<TabParamList>();

// Icon name mapping for better maintainability
const ICON_MAP = {
  [routeName.HOME]: {
    focused: 'home',
    default: 'home-outline',
  },
  MyPost: {
    focused: 'radar',
    default: 'radar',
  },
  History: {
    focused: 'history',
    default: 'history',
  },
  Profile: {
    focused: 'account-circle',
    default: 'account-circle-outline',
  },
} as const;

const TabNavigator = () => {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const screenOptions = useMemo(
    () =>
      ({ route }: { route: { name: keyof typeof ICON_MAP } }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          const iconConfig = ICON_MAP[route.name];
          const iconName = focused ? iconConfig.focused : iconConfig.default;

          return (
            <View
              style={
                focused
                  ? styles.tabIconContainerActive
                  : styles.tabIconContainer
              }
            >
              <Icon
                name={iconName}
                size={wp(24)}
                color={focused ? colors.primary : colors.textSecondary}
              />
            </View>
          );
        },
        tabBarLabel: ({ focused }: { focused: boolean }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          height: hp(80),
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          paddingBottom: Platform.OS === 'ios' ? hp(10) : 0,
        },
        headerShown: false,
      }),
    [],
  );

  return (
    <>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name={routeName.HOME} component={Dashboard} />
        <Tab.Screen name="MyPost" component={LoadPostForm} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </>
  );
};

export default TabNavigator;

// Extracted only necessary styles for the TabNavigator
const styles = StyleSheet.create({
  tabScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 2,
    // alignItems: 'center',
  },
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabIconContainerActive: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderTopWidth: hp(3),
    borderTopColor: colors.primary,
  },
  tabLabel: {
    fontSize: wp(11),
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: hp(4),
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
