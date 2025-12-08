import { useGetCustomerPostsQuery } from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@store/index';
import {
  selectDriver,
  setCustomerMap,
  setDestination,
  setDestinationAddress,
  setOrigin,
  setOriginAddress,
  setPostId,
} from '@store/slices/mapSlice';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingActionButton } from './component/FloatingButtons';
import MapComponent from './component/MapComponent';
import { routeName } from '@utils/navigationHelpers';
import MapView, { Marker } from 'react-native-maps';
import { socket } from '@utils/socketUtils';
import Notification from './Notification';

const ORIGIN_MARKER_IMG = require('@assets/icons/origin-marker.png');

const NotificationAlerts = ({ visible, onClose, notifications }: any) => (
  <Modal transparent visible={visible} animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notifications</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon source="close" size={22} />
          </TouchableOpacity>
        </View>
        {notifications?.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <Text style={styles.notificationText}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No new notifications</Text>
          </View>
        )}
      </View>
    </View>
  </Modal>
);

const Dashboard: React.FC = () => {
  const { origin, postId } = useSelector((state: RootState) => state.map);
  const location = useSelector((state: RootState) => state?.map?.origin);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const [showDriverArrivedDialog, setShowDriverArrivedDialog] = useState(false);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { message: 'Your driver is on the way', time: '2m ago' },
    { message: 'Delivery completed successfully', time: '1h ago' },
  ]);
  const [driverAlertData, setDriverAlertData] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: customerPosts, isLoading } = useGetCustomerPostsQuery(
    { CustomerID },
    { skip: !CustomerID },
  );

  const { originAddress } = useSelector((state: RootState) => state.map);

  // Default driver location (Mumbai)
  const [driverLocation, setDriverLocation] = useState({
    latitude: 19.076,
    longitude: 72.8777,
  });

  // Handle incoming socket event
  const handleDriverNearbyAlert = (data: any) => {
    if (data?.driver?.Lat && data?.driver?.Lng) {
      setDriverLocation({
        latitude: data.driver.Lat,
        longitude: data.driver.Lng,
      });
    }
  };

  // 🔗 Socket setup
  useEffect(() => {
    if (!CustomerID) return;

    socket.off('driverNearbyAlert');
    socket.on('driverNearbyAlert', handleDriverNearbyAlert);

    socket.emit('CustomerDetails', { customerId: CustomerID });

    return () => socket.off('driverNearbyAlert', handleDriverNearbyAlert);
  }, [CustomerID]);

  // 🗺️ Fetch customer posts when CustomerID is ready
  // useEffect(() => {
  //   if (CustomerID) customerPosts({ CustomerID });
  // }, [CustomerID]);
  useEffect(() => {
    if (!CustomerID) return;
    -(
      // 🟢 Log when connected
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
      })
    );

    // 🔴 Log when disconnected
    socket.on('disconnect', reason => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    // 📩 Log when your event comes in
    socket.off('driverNearbyAlert'); // remove old listeners first
    socket.on('driverNearbyAlert', data => {
      console.log('📡 Driver Nearby Alert Received:', data);
      // your existing logic here
      if (data?.driver?.Lat && data?.driver?.Lng) {
        setDriverLocation({
          latitude: data.driver.Lat,
          longitude: data.driver.Lng,
        });
        setDriverAlertData(data);
      }
    });

    // Emit CustomerID to backend
    console.log('📤 Sending CustomerID to server:', CustomerID);
    socket.emit('CustomerDetails', { customerId: CustomerID });

    // Cleanup
    return () => {
      socket.off('driverNearbyAlert');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [CustomerID]);

  // 📍 Populate Redux store from customerPosts
  useEffect(() => {
    if (!postId && customerPosts?.data?.length) {
      const firstPost = customerPosts.data[0];
      if (firstPost) {
        dispatch(setCustomerMap('Load'));
        dispatch(selectDriver(null));
        dispatch(setPostId(firstPost.LoadPostID));
        dispatch(
          setOrigin({
            latitude: firstPost.Origin_Lat,
            longitude: firstPost.Origin_Lng,
          }),
        );
        dispatch(setOriginAddress(firstPost.Origin));
        dispatch(setDestinationAddress(''));
        dispatch(setDestination(null));
      }
    }
  }, [customerPosts, postId]);

  // 🧩 Show driver arrived popup (simulate event)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDriverDetails({
        name: 'Rajesh Kumar',
        vehicle: 'Tata Ace',
        regNo: 'MH12 AB 1234',
        phone: '+91 9876543210',
        rating: '4.8',
      });
      setShowDriverArrivedDialog(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Animation effect
  useEffect(() => {
    if (showDriverArrivedDialog) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showDriverArrivedDialog, fadeAnim]);

  const closeDialog = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDriverArrivedDialog(false);
      setOtpVerified(false);
      setTripStarted(false);
    });
  };

  const toggleDrawer = () => navigation.openDrawer();
  const openNotifications = () => {
    navigation.navigate(routeName.NOTIFICATION);
  };
  const openProfile = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* 🔹 Header */}
      <View style={styles.header}>
        {/* Menu Button */}
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Icon source="menu" size={24} />
        </TouchableOpacity>

        {/* Location Section */}
        <View style={styles.locationContainer}>
          <Image
            source={ORIGIN_MARKER_IMG}
            style={styles.originIcon}
            resizeMode="contain"
          />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationText} numberOfLines={1}>
              {originAddress
                ? originAddress // 1. user selected address
                : location?.address
                ? location?.address // 2. reverse geocode current location
                : 'Set Pickup Location'}
            </Text>
          </View>
        </View>

        {/* Right Section (Notifications + Profile) */}
        <View style={styles.rightIcons}>
          {/* Notification Bell */}
          <TouchableOpacity
            onPress={openNotifications}
            style={styles.bellButton}
          >
            <Icon source="bell-outline" size={24} />
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity onPress={openProfile} style={styles.profileButton}>
            <Icon source="account-circle" size={26} color="#2D3748" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Map + Floating Button */}
      <View style={styles.mapContainer}>
        <MapComponent liveDriverLocation={driverLocation} />
        <FloatingActionButton />
      </View>

      {/* 🔹 Notifications Modal */}
      <NotificationAlerts
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      {/* 🔹 Driver Arrived Modal */}
      <Modal
        visible={showDriverArrivedDialog}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDialog}
      >
        <View style={styles.professionalModalOverlay}>
          <Animated.View
            style={[
              styles.professionalModal,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.professionalHeader}>
              <View style={styles.headerContent}>
                <View style={styles.statusIndicator}>
                  <View
                    style={[
                      styles.statusDot,
                      tripStarted
                        ? styles.statusActive
                        : otpVerified
                        ? styles.statusVerified
                        : styles.statusPending,
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {tripStarted
                      ? 'Trip Started'
                      : otpVerified
                      ? 'Verified'
                      : 'Driver Arrived'}
                  </Text>
                </View>
                <Text style={styles.headerTitle}>Trip Update</Text>
              </View>
              <TouchableOpacity onPress={closeDialog} style={styles.closeBtn}>
                <Icon source="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Driver Location Mini Map */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionLabel}>Driver Current Location</Text>
              <View style={styles.miniMapContainer}>
                <MapView
                  style={styles.miniMap}
                  initialRegion={{
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker coordinate={driverLocation}>
                    <View style={styles.driverMarker}>
                      <Icon source="car" size={20} color="#FFFFFF" />
                    </View>
                  </Marker>
                </MapView>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Trip Details</Text>
              <Text style={styles.tripText}>
                <Icon source="map-marker-radius" size={16} color="#ff0000ff" />{' '}
                <Text style={styles.tripLabel}>Origin: </Text>
                {driverAlertData?.allData?.[0]?.Origin} Kamraj Nagar Ghatkopar
                East
              </Text>
              <Text style={styles.tripText}>
                <Icon source="map-marker-radius" size={16} color="#008000ff" />{' '}
                <Text style={styles.tripLabel}>Destination: </Text>
                {driverAlertData?.allData?.[0]?.Destination} Ramabai Nagar
                Ghatkopar East
              </Text>
            </View>
            <Text></Text>
            {/* OTP Section */}
            {!otpVerified && !tripStarted && (
              <View style={styles.modalContent}>
                <View style={styles.otpHeader}>
                  <Icon source="shield-check" size={20} color="#2D3748" />
                  <Text style={styles.otpTitle}>Verification Required</Text>
                </View>
                <Text style={styles.otpDescription}>
                  Share this OTP with your driver to start the trip
                </Text>
                <View style={styles.otpDisplay}>
                  <Text style={styles.otpCode}>
                    {driverAlertData?.allData?.[0]?.verification_code}{' '}
                  </Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon source="content-copy" size={18} color="#2D3748" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Call Button */}
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Icon source="phone" size={18} color="#2D3748" />
                <Text style={styles.secondaryButtonText}>Call Driver</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuButton: {
    padding: 8,
  },
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  originIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  // Professional Modal Styles
  professionalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  professionalModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  professionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusVerified: {
    backgroundColor: '#3B82F6',
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  },
  modalContent: {
    padding: 20,
  },
  // Map Section Styles
  mapSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  miniMapContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  miniMap: {
    flex: 1,
    width: '100%',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 8,
  },
  mapLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  driverColor: {
    backgroundColor: '#3B82F6',
  },
  legendText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  // OTP Section
  otpSection: {
    marginBottom: 24,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  otpDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  otpCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 4,
  },
  iconButton: {
    padding: 8,
  },
  // Status Section
  statusSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  statusIcon: {
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Driver Section
  driverSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  vehicleInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Action Section
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#2D3748',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  // Existing notification styles (keep these as they are)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
  },
  tripText: { marginBottom: 4, color: '#4B5563' },
  section: { marginVertical: 5, paddingHorizontal: 20 },
  tripLabel: { fontWeight: '500', color: '#374151' },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  profileButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
