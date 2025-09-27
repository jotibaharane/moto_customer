import { useNavigation } from '@react-navigation/native';
import { routeName } from '@utils/navigationHelpers';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  surface: '#FFFFFF',
  backgroundDarker: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
};

const hp = (percentage: number) =>
  Dimensions.get('window').height * (percentage / 100);
const wp = (percentage: number) =>
  Dimensions.get('window').width * (percentage / 100);
export type FloatingButtonTab =
  | 'load-posts'
  | 'process-trips'
  | 'active-trips'
  | 'completed-trips';

export interface DashboardButton {
  id: FloatingButtonTab;
  icon: string;
  label: string;
  color: string;
  routeName: string;
}
// Button Data Configuration
export const DASHBOARD_BUTTONS: DashboardButton[] = [
  {
    id: 'load-posts',
    icon: 'map-marker-path',
    label: 'Load Posts',
    color: colors.primary,
    routeName: 'BID_CUSTOMER_LIST',
  },
  {
    id: 'process-trips',
    icon: 'calculator',
    label: 'Process Trips',
    color: colors.success,
    routeName: 'ACTIVE_TRIPS',
  },
  {
    id: 'active-trips',
    icon: 'file-document',
    label: 'Active Trips',
    color: colors.success,
    routeName: 'DRIVER_OPERATIONS',
  },
  {
    id: 'completed-trips',
    icon: 'headset',
    label: 'Completed Trips',
    color: colors.warning,
    routeName: 'ACTIVE_TRIPS',
  },
];

// Individual Button Component
interface DashboardButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  isActive: boolean;
  animation: Animated.Value;
  index: number;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  icon,
  label,
  color,
  onPress,
  isActive,
  animation,
  index,
}) => {
  const scaleAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const opacityAnim = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const translateYAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60 * (index + 1), 0],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[buttonStyles.buttonContainer, animatedStyle]}>
      <TouchableOpacity
        style={[buttonStyles.button, isActive && buttonStyles.buttonActive]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={buttonStyles.buttonContent}>
          <View
            style={[buttonStyles.iconContainer, { backgroundColor: color }]}
          >
            <IconButton
              icon={icon}
              size={18}
              iconColor={colors.surface}
              style={buttonStyles.icon}
            />
          </View>
          <Text
            style={[buttonStyles.label, isActive && buttonStyles.labelActive]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Floating Action Button Component
export const FloatingActionButton = () => {
  const navigation = useNavigation<any>();
  const [isOpen, setIsOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleButtonPress = (button: DashboardButton) => {
    toggleMenu();

    navigation.navigate('Authenticated', {
      screen: routeName.DASHBOARD, // DrawerNavigator
      params: {
        screen: routeName.HOMESTACK, // TabNavigator
        params: {
          screen: routeName.HOME, // DashboardScreen
          params: {
            activeTab: button.id,
          },
        },
      },
    });
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  return (
    <View style={buttonStyles.container}>
      {isOpen && (
        <View style={buttonStyles.buttonsContainer}>
          <Animated.View
            style={[
              buttonStyles.titleContainer,
              {
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={buttonStyles.title}>Quick Actions</Text>
          </Animated.View>
          {DASHBOARD_BUTTONS.map((button, index) => (
            <DashboardButton
              key={button.id}
              icon={button.icon}
              label={button.label}
              color={button.color}
              onPress={() => handleButtonPress(button)}
              isActive={false}
              animation={animation}
              index={index}
            />
          ))}
        </View>
      )}

      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <TouchableOpacity
          style={buttonStyles.mainButton}
          onPress={toggleMenu}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Toggle action menu"
        >
          <IconButton
            icon={isOpen ? 'close' : 'plus'}
            size={24}
            iconColor={colors.surface}
            style={buttonStyles.mainIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Enhanced Styles
const buttonStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(15),
    right: wp(5),
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  buttonsContainer: {
    alignItems: 'flex-end',
    marginBottom: hp(2),
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: wp(50),
    minWidth: wp(20),
  },
  titleContainer: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: hp(1.5),
    alignSelf: 'center',
  },
  title: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: colors.backgroundDarker,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginVertical: hp(0.8),
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 12,
    width: '100%',
  },
  buttonActive: {
    backgroundColor: '#F3F4F6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    margin: 0,
  },
  label: {
    fontSize: wp(3.8),
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  labelActive: {
    color: colors.backgroundDarker,
    fontWeight: '700',
  },
  mainButton: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainIcon: {
    margin: 0,
  },
});
