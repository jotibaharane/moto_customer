// navigation/drawer/CustomDrawer.tsx
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import { logout } from '@store/slices/authSlice';
import { routeName } from '@utils/navigationHelpers';
import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Portal,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

interface DrawerItem {
  icon: string;
  label: string;
  routeName: string;
  badgeCount?: number;
  onPress: () => void;
}

const CustomDrawer: React.FC<DrawerContentComponentProps> = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const auth = useSelector((state: RootState) => state.auth);

  const { customerDetails } = auth;
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    dispatch(logout());
    navigation.replace(routeName.LOGIN);
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@logisticsapp.com');
  };

  const drawerItems: DrawerItem[] = [
    {
      icon: 'view-dashboard',
      label: 'Dashboard',
      routeName: routeName.HOMESTACK,
      onPress: () => navigation.navigate(routeName.HOMESTACK),
    },
    {
      icon: 'truck-fast',
      label: 'Load Post',
      routeName: routeName.LOAD_POST,
      badgeCount: 3,
      onPress: () => navigation.navigate(routeName.LOAD_POST),
    },
    {
      icon: 'package-variant',
      label: 'My Loads',
      routeName: 'MY_LOADS',
      onPress: () => navigation.navigate('MY_LOADS'),
    },
    {
      icon: 'map-marker-path',
      label: 'Trip Management',
      routeName: 'TRIP_MANAGEMENT',
      badgeCount: 2,
      onPress: () => navigation.navigate('TRIP_MANAGEMENT'),
    },
    {
      icon: 'account-group',
      label: 'Driver Management',
      routeName: 'DRIVER_MANAGEMENT',
      onPress: () => navigation.navigate('DRIVER_MANAGEMENT'),
    },
    {
      icon: 'truck',
      label: 'Vehicle Management',
      routeName: 'VEHICLE_MANAGEMENT',
      onPress: () => navigation.navigate('VEHICLE_MANAGEMENT'),
    },
  ];

  const accountItems: DrawerItem[] = [
    {
      icon: 'cog',
      label: 'Settings',
      routeName: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'shield-key',
      label: 'MPIN Settings',
      routeName: routeName.SET_MPIN,
      onPress: () => navigation.navigate(routeName.SET_MPIN),
    },
    {
      icon: 'account-details',
      label: 'Profile',
      routeName: 'PROFILE',
      onPress: () => navigation.navigate('PROFILE'),
    },
  ];

  const CustomDrawerItem = ({
    icon,
    label,
    routeName,
    badgeCount,
    onPress,
  }: DrawerItem) => {
    const isActive = props.state.routes.some(route => route.name === routeName);

    return (
      <TouchableRipple
        onPress={onPress}
        style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
        rippleColor="rgba(99, 102, 241, 0.1)"
      >
        <View style={styles.drawerItemContent}>
          <View style={styles.drawerItemLeft}>
            <Avatar.Icon
              size={40}
              icon={icon}
              style={[styles.drawerIcon, isActive && styles.activeIcon]}
              theme={{ colors: { primary: isActive ? '#fff' : '#6366F1' } }}
            />
            <Text
              variant="titleMedium"
              style={[styles.drawerLabel, isActive && styles.activeLabel]}
            >
              {label}
            </Text>
          </View>

          {isActive && <View style={styles.activeIndicator} />}
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={cancelLogout}
          style={styles.dialog}
        >
          <Dialog.Icon icon="logout" size={32} color="#EF4444" />
          <Dialog.Title style={styles.dialogTitle}>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogMessage}>
              Are you sure you want to logout from your account?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelLogout} style={styles.dialogButton}>
              Cancel
            </Button>
            <Button
              onPress={confirmLogout}
              mode="contained"
              style={[styles.dialogButton, styles.logoutDialogButton]}
              textColor="#fff"
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Header Section */}
      <Surface style={styles.header} elevation={4}>
        <View style={styles.userInfo}>
          <Avatar.Text
            size={70}
            label={
              customerDetails?.CompanyName?.split(' ')
                .map(n => n[0])
                .join('') || 'C'
            }
            style={styles.avatar}
            theme={{ colors: { primary: '#fff' } }}
          />
          <View style={styles.userDetails}>
            <Text
              variant="titleLarge"
              style={styles.companyName}
              numberOfLines={1}
            >
              {customerDetails?.CompanyName || 'Company Name'}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.contactPerson}
              numberOfLines={1}
            >
              {customerDetails?.ContactPerson || 'Contact Person'}
            </Text>
            <Text
              variant="bodySmall"
              style={styles.contactInfo}
              numberOfLines={1}
            >
              {customerDetails?.ContactNo || 'Mobile Number'} •{' '}
              {customerDetails?.EmailID || 'email@company.com'}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Navigation Items */}
      <DrawerContentScrollView
        {...props}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Navigation Section */}
        <View style={styles.menuSection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            MAIN NAVIGATION
          </Text>
          {drawerItems.map((item, index) => (
            <CustomDrawerItem key={`main-${index}`} {...item} />
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Account Section */}
        <View style={styles.menuSection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            ACCOUNT SETTINGS
          </Text>
          {accountItems.map((item, index) => (
            <CustomDrawerItem key={`account-${index}`} {...item} />
          ))}
        </View>

        {/* Support Section */}
        <Surface style={styles.supportCard} elevation={1}>
          <View style={styles.supportContent}>
            <Avatar.Icon
              size={44}
              icon="help-circle"
              style={styles.supportIcon}
            />
            <View style={styles.supportText}>
              <Text variant="bodyLarge" style={styles.supportTitle}>
                Need Help?
              </Text>
              <Text variant="bodyMedium" style={styles.supportDescription}>
                Contact our support team for assistance
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={handleSupport}
            style={styles.supportButton}
            icon="email"
            compact
          >
            Contact
          </Button>
        </Surface>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <Surface style={styles.footer} elevation={3}>
        <Divider />
        <View style={styles.footerContent}>
          <View style={styles.versionInfo}>
            <Text variant="bodySmall" style={styles.versionText}>
              Logistics App v1.0.0
            </Text>
            <Text variant="bodySmall" style={styles.copyrightText}>
              © 2024 Logistics Solutions
            </Text>
          </View>

          <TouchableRipple
            onPress={handleLogout}
            style={styles.logoutButton}
            rippleColor="rgba(239, 68, 68, 0.1)"
          >
            <View style={styles.logoutContent}>
              <Avatar.Icon size={36} icon="logout" style={styles.logoutIcon} />
              <View style={styles.logoutTextContainer}>
                <Text variant="bodyLarge" style={styles.logoutText}>
                  Logout
                </Text>
                <Text variant="bodySmall" style={styles.logoutSubtext}>
                  {customerDetails?.ContactPerson || 'User'}
                </Text>
              </View>
            </View>
          </TouchableRipple>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  companyName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactPerson: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  contactInfo: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  drawerItem: {
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  activeDrawerItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    position: 'relative',
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerIcon: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginRight: 16,
  },
  activeIcon: {
    backgroundColor: '#6366F1',
  },
  drawerLabel: {
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  activeLabel: {
    color: '#6366F1',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    width: 4,
    height: 24,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  divider: {
    marginVertical: 12,
    marginHorizontal: 20,
    backgroundColor: '#E5E7EB',
  },
  supportCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportIcon: {
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 2,
  },
  supportDescription: {
    color: '#047857',
  },
  supportButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerContent: {
    padding: 16,
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    color: '#6B7280',
    marginBottom: 2,
  },
  copyrightText: {
    color: '#9CA3AF',
  },
  logoutButton: {
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutIcon: {
    backgroundColor: '#EF4444',
    marginRight: 12,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 2,
  },
  logoutSubtext: {
    color: '#EF4444',
  },
  // Dialog Styles
  dialog: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    textAlign: 'center',
    color: '#1F2937',
    fontWeight: '600',
  },
  dialogMessage: {
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
  dialogButton: {
    borderRadius: 8,
    minWidth: 80,
  },
  logoutDialogButton: {
    backgroundColor: '#EF4444',
  },
});

export default CustomDrawer;
