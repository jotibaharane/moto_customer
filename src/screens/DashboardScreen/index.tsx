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
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingActionButton } from './component/FloatingButtons';
import MapComponent from './component/MapComponent';
import { routeName } from '@utils/navigationHelpers';
import MapView, { Marker } from 'react-native-maps';
import { socket } from '@utils/socketUtils';
import DriverArrivalModal from './component/DriverArrivalModal';

const ORIGIN_MARKER_IMG = require('@assets/icons/origin-marker.png');

// Dummy loads data
const DUMMY_LOADS = [
  {
    LoadPostID: 1001,
    Status: 'Active',
    PickupAddress: 'Saki Vihar Road, Powai, Mumbai',
    DestinationAddress: 'Bandra Kurla Complex, Bandra East, Mumbai',
    MaterialType: 'Electronics',
    Weight: '1500',
    PickupLat: 19.107,
    PickupLng: 72.905,
    DestinationLat: 19.06,
    DestinationLng: 72.88,
    LoadType: 'FTL',
    VehicleType: 'Truck',
    Price: '₹12,500',
    Distance: '25 km',
    EstimatedTime: '2 hours',
    CreatedDate: '2024-01-15',
    CustomerName: 'Tech Electronics Ltd.',
    ContactPerson: 'Rajesh Kumar',
    Phone: '+91 9876543210',
    Notes: 'Fragile items, handle with care',
    Driverlat: 19.1,
    Driverlng: 72.89,
  },
  {
    LoadPostID: 1002,
    Status: 'In Transit',
    PickupAddress: 'Jawaharlal Nehru Port, Navi Mumbai',
    DestinationAddress: 'MIDC Industrial Area, Andheri East, Mumbai',
    MaterialType: 'Machinery Parts',
    Weight: '3500',
    PickupLat: 18.951,
    PickupLng: 72.951,
    DestinationLat: 19.12,
    DestinationLng: 72.866,
    LoadType: 'LTL',
    VehicleType: 'Tempo',
    Price: '₹8,200',
    Distance: '40 km',
    EstimatedTime: '3 hours',
    CreatedDate: '2024-01-14',
    CustomerName: 'Industrial Machinery Corp',
    ContactPerson: 'Suresh Patel',
    Phone: '+91 8765432109',
    Notes: 'Heavy machinery parts, need proper securing',
  },
  {
    LoadPostID: 1003,
    Status: 'Pending',
    PickupAddress: 'Chhatrapati Shivaji Terminus, Fort, Mumbai',
    DestinationAddress: 'Thane Station, Thane West',
    MaterialType: 'Documents',
    Weight: '50',
    PickupLat: 18.94,
    PickupLng: 72.835,
    DestinationLat: 19.218,
    DestinationLng: 72.978,
    LoadType: 'Parcel',
    VehicleType: 'Bike',
    Price: '₹750',
    Distance: '30 km',
    EstimatedTime: '1.5 hours',
    CreatedDate: '2024-01-16',
    CustomerName: 'Legal Documents Services',
    ContactPerson: 'Priya Sharma',
    Phone: '+91 7654321098',
    Notes: 'Urgent legal documents delivery',
  },
  {
    LoadPostID: 1004,
    Status: 'Completed',
    PickupAddress: 'Dadar Flower Market, Dadar West',
    DestinationAddress: 'Colaba Market, Colaba, Mumbai',
    MaterialType: 'Flowers',
    Weight: '800',
    PickupLat: 19.018,
    PickupLng: 72.842,
    DestinationLat: 18.912,
    DestinationLng: 72.811,
    LoadType: 'FTL',
    VehicleType: 'Mini Truck',
    Price: '₹3,200',
    Distance: '18 km',
    EstimatedTime: '1 hour',
    CreatedDate: '2024-01-13',
    CustomerName: 'Florist Paradise',
    ContactPerson: 'Anita Desai',
    Phone: '+91 6543210987',
    Notes: 'Fresh flowers, handle carefully',
  },
  {
    LoadPostID: 1005,
    Status: 'Active',
    PickupAddress: 'Malad Warehouse, Malad West, Mumbai',
    DestinationAddress: 'Kandivali Industrial Area, Kandivali East',
    MaterialType: 'Textiles',
    Weight: '2000',
    PickupLat: 19.186,
    PickupLng: 72.848,
    DestinationLat: 19.21,
    DestinationLng: 72.868,
    LoadType: 'LTL',
    VehicleType: 'Truck',
    Price: '₹5,800',
    Distance: '12 km',
    EstimatedTime: '45 minutes',
    CreatedDate: '2024-01-16',
    CustomerName: 'Textile Manufacturing Co.',
    ContactPerson: 'Vikram Singh',
    Phone: '+91 5432109876',
    Notes: 'Textile rolls, waterproof packaging needed',
  },
  {
    LoadPostID: 1006,
    Status: 'Cancelled',
    PickupAddress: 'Borivali National Park, Borivali East',
    DestinationAddress: 'Sanjay Gandhi National Park, Borivali',
    MaterialType: 'Food Supplies',
    Weight: '1200',
    PickupLat: 19.23,
    PickupLng: 72.858,
    DestinationLat: 19.214,
    DestinationLng: 72.912,
    LoadType: 'FTL',
    VehicleType: 'Van',
    Price: '₹4,500',
    Distance: '8 km',
    EstimatedTime: '30 minutes',
    CreatedDate: '2024-01-12',
    CustomerName: 'Catering Services India',
    ContactPerson: 'Meena Iyer',
    Phone: '+91 4321098765',
    Notes: 'Perishable items, refrigerated transport required',
  },
  {
    LoadPostID: 1007,
    Status: 'Active',
    PickupAddress: 'Vashi APMC Market, Navi Mumbai',
    DestinationAddress: 'Byculla Market, Byculla, Mumbai',
    MaterialType: 'Vegetables & Fruits',
    Weight: '3000',
    PickupLat: 19.072,
    PickupLng: 73.016,
    DestinationLat: 18.975,
    DestinationLng: 72.83,
    LoadType: 'FTL',
    VehicleType: 'Truck',
    Price: '₹6,800',
    Distance: '35 km',
    EstimatedTime: '2.5 hours',
    CreatedDate: '2024-01-15',
    CustomerName: 'Fresh Farm Produce',
    ContactPerson: 'Ajay Verma',
    Phone: '+91 3210987654',
    Notes: 'Daily fresh vegetables delivery',
  },
];

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

// Loads Bottom Sheet Component
const LoadsBottomSheet = ({
  visible,
  onClose,
  loads,
  isLoading,
  onSelectLoad,
  selectedPostId,
}: any) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'in transit':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getLoadTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'ftl':
        return '#8B5CF6';
      case 'ltl':
        return '#EC4899';
      case 'parcel':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.bottomSheetOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.bottomSheetHandle}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.handleBar} />
          </TouchableOpacity>

          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetTitleContainer}>
              <Text style={styles.bottomSheetTitle}>Available Loads</Text>
              <View style={styles.loadCountBadge}>
                <Text style={styles.loadCountText}>{loads.length} Loads</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon source="close" size={24} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading your loads...</Text>
            </View>
          ) : (
            <FlatList
              data={loads}
              keyExtractor={item => item.LoadPostID?.toString()}
              contentContainerStyle={styles.loadsList}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>
                    Select a load to view details and manage
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.loadItem,
                    selectedPostId === item.LoadPostID &&
                      styles.selectedLoadItem,
                  ]}
                  onPress={() => onSelectLoad(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.loadItemContent}>
                    <View style={styles.loadItemHeader}>
                      <View style={styles.loadIdContainer}>
                        <Icon
                          source="package-variant"
                          size={16}
                          color="#3B82F6"
                        />
                        <Text style={styles.loadId}>
                          Load #{item.LoadPostID}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.Status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{item.Status}</Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <View style={styles.locationIconContainer}>
                        <Icon
                          source="map-marker-outline"
                          size={14}
                          color="#EF4444"
                        />
                      </View>
                      <Text style={styles.locationText} numberOfLines={2}>
                        {item.PickupAddress}
                      </Text>
                    </View>

                    <View style={styles.locationRow}>
                      <View style={styles.locationIconContainer}>
                        <Icon
                          source="map-marker-check"
                          size={14}
                          color="#10B981"
                        />
                      </View>
                      <Text style={styles.locationText} numberOfLines={2}>
                        {item.DestinationAddress}
                      </Text>
                    </View>

                    <View style={styles.loadDetails}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Icon
                            source="package-variant"
                            size={12}
                            color="#6B7280"
                          />
                          <Text style={styles.detailText}>
                            {item.MaterialType}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Icon source="weight" size={12} color="#6B7280" />
                          <Text style={styles.detailText}>
                            {item.Weight} kg
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.detailItem,
                            {
                              backgroundColor:
                                getLoadTypeColor(item.LoadType) + '15',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.loadTypeText,
                              { color: getLoadTypeColor(item.LoadType) },
                            ]}
                          >
                            {item.LoadType}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceText}>{item.Price}</Text>
                          <Text style={styles.distanceText}>
                            • {item.Distance} • {item.EstimatedTime}
                          </Text>
                        </View>
                        <View style={styles.vehicleContainer}>
                          <Icon source="truck" size={12} color="#6B7280" />
                          <Text style={styles.vehicleText}>
                            {item.VehicleType}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Icon
                    source="chevron-right"
                    size={20}
                    color={
                      selectedPostId === item.LoadPostID ? '#3B82F6' : '#9CA3AF'
                    }
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon
                    source="package-variant-closed"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text style={styles.emptyText}>No loads available</Text>
                  <Text style={styles.emptySubText}>
                    Create a new load to get started with shipments
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.bottomSheetFooter}>
            <TouchableOpacity style={styles.createLoadButton}>
              <Icon source="plus" size={20} color="#FFFFFF" />
              <Text style={styles.createLoadButtonText}>Create New Load</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

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

  // New state for loads bottom sheet
  const [showLoadsBottomSheet, setShowLoadsBottomSheet] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);

  const { data: customerPosts, isLoading } = useGetCustomerPostsQuery(
    { CustomerID },
    { skip: !CustomerID },
  );
  const ARRIVAL_DISTANCE = 100; // meters
  const arrivalTriggered = useRef(false);
  const { originAddress } = useSelector((state: RootState) => state.map);

  // Default driver location (Mumbai)
  const [driverLocation, setDriverLocation] = useState({
    latitude: 19.076,
    longitude: 72.8777,
  });
  const getDistanceInMeters = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;

    const dLat = toRad(a.latitude - b.latitude);
    const dLng = toRad(a.longitude - b.longitude);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(b.latitude)) *
        Math.cos(toRad(a.latitude)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(x));
  };

  // Combine real data with dummy data
  useEffect(() => {
    if (customerPosts?.data?.length) {
      // Use real data if available
      setLoads(customerPosts.data);
    } else {
      // Use dummy data when no real data
      setLoads(DUMMY_LOADS);
    }
  }, [customerPosts]);

  console.log({ customerPosts });

  // Set initial selected load
  useEffect(() => {
    if (loads.length > 0 && !selectedLoad) {
      const activeLoad =
        loads.find(load => load.Status === 'Active') || loads[0];
      setSelectedLoad(activeLoad);

      // Update Redux store with selected load
      if (activeLoad) {
        dispatch(setPostId(activeLoad.LoadPostID));
        dispatch(
          setOrigin({
            latitude: activeLoad.PickupLat,
            longitude: activeLoad.PickupLng,
          }),
        );
        dispatch(setOriginAddress(activeLoad.PickupAddress));
      }
    }
  }, [loads]);

  // Handle incoming socket event
  // const handleDriverNearbyAlert = (data: any) => {
  //   if (data?.driver?.Lat && data?.driver?.Lng) {
  //     setDriverLocation({
  //       latitude: data.driver.Lat,
  //       longitude: data.driver.Lng,
  //     });
  //   }
  // };

  useEffect(() => {
    if (!CustomerID || !selectedLoad || !origin) return;

    socket.off('driverNearbyAlert');

    socket.on('driverNearbyAlert', data => {
      // 🔐 Ignore other loads
      if (data?.LoadPostID !== selectedLoad.LoadPostID) return;

      if (!data?.driver?.Lat || !data?.driver?.Lng) return;

      const driverLoc = {
        latitude: data.driver.Lat,
        longitude: data.driver.Lng,
      };

      setDriverLocation(driverLoc);
      setDriverAlertData(data);

      const distance = getDistanceInMeters(origin, driverLoc);

      if (distance <= ARRIVAL_DISTANCE && !arrivalTriggered.current) {
        arrivalTriggered.current = true;

        setDriverDetails(data.driver);
        setShowDriverArrivedDialog(true);
      }
    });

    socket.emit('CustomerDetails', {
      customerId: CustomerID,
      loadPostId: selectedLoad.LoadPostID,
    });

    return () => {
      socket.off('driverNearbyAlert');
      arrivalTriggered.current = false;
    };
  }, [CustomerID, selectedLoad, origin]);

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

  // Handle load selection from bottom sheet
  const handleSelectLoad = (load: any) => {
    console.log('this is loadddd', { load });
    setSelectedLoad(load);

    // Update Redux store with selected load
    dispatch(setCustomerMap('Load'));
    dispatch(selectDriver(null));
    dispatch(setPostId(load.LoadPostID));
    dispatch(
      setOrigin({
        latitude: load.PickupLat,
        longitude: load.PickupLng,
      }),
    );
    dispatch(setOriginAddress(load.PickupAddress));
    // dispatch(
    //   setDriverLocation({
    //     latitude: load.Driverlat,
    //     longitude: load.Driverlng,
    //   }),
    // );
    dispatch(
      setDestination({
        latitude: load.DestinationLat,
        longitude: load.DestinationLng,
      }),
    );
    dispatch(setDestinationAddress(load.DestinationAddress));

    // Navigate to Load Detail Screen (replace 'LoadDetail' with your actual screen name)
    // Example: navigation.navigate('LoadDetail', { load });
    // Example: navigation.navigate(routeName.LOAD_DETAIL, { loadId: load.LoadPostID });

    // For now, let's assume we navigate to a screen called 'LoadDetail'
    // You can comment this out if you don't want navigation
    // navigation.navigate('LoadDetail', {
    //   loadData: load,
    //   loadId: load.LoadPostID,
    // });

    // Close the bottom sheet
    setShowLoadsBottomSheet(false);
  };

  // Open loads bottom sheet
  const openLoadsBottomSheet = () => {
    setShowLoadsBottomSheet(true);
  };

  // Get status color for header
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'in transit':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
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

        {/* Location Section - Now clickable to show loads */}
        <TouchableOpacity
          onPress={openLoadsBottomSheet}
          style={styles.locationContainer}
          activeOpacity={0.8}
        >
          <Image
            source={ORIGIN_MARKER_IMG}
            style={styles.originIcon}
            resizeMode="contain"
          />
          <View style={styles.locationTextContainer}>
            <View style={styles.locationHeader}>
              <View style={styles.currentLoadInfo}>
                <Text style={styles.locationLabel}>Current Load</Text>
                {selectedLoad && (
                  <View
                    style={[
                      styles.headerStatusBadge,
                      { backgroundColor: getStatusColor(selectedLoad.Status) },
                    ]}
                  >
                    <Text style={styles.headerStatusText}>
                      {selectedLoad.Status}
                    </Text>
                  </View>
                )}
              </View>
              <Icon source="chevron-down" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLoad?.PickupAddress
                ? selectedLoad.PickupAddress
                : originAddress
                ? originAddress
                : location?.address
                ? location?.address
                : 'Select a load'}
            </Text>
            {selectedLoad && (
              <View style={styles.loadInfoContainer}>
                <Text style={styles.loadInfo}>
                  Load #{selectedLoad.LoadPostID} • {selectedLoad.MaterialType}{' '}
                  • {selectedLoad.Weight} kg
                </Text>
                <Text style={styles.loadPrice}>{selectedLoad.Price}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

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
        <MapComponent />
        <FloatingActionButton />
      </View>

      {/* 🔹 Loads Bottom Sheet */}
      <LoadsBottomSheet
        visible={showLoadsBottomSheet}
        onClose={() => setShowLoadsBottomSheet(false)}
        loads={loads}
        isLoading={isLoading}
        onSelectLoad={handleSelectLoad}
        selectedPostId={selectedLoad?.LoadPostID}
      />

      {/* 🔹 Notifications Modal */}
      <NotificationAlerts
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />
      <DriverArrivalModal
        visible={showDriverArrivedDialog}
        fadeAnim={fadeAnim}
        onClose={closeDialog}
        driverLocation={driverLocation}
        driverDetails={driverDetails}
        driverAlertData={driverAlertData}
        otpVerified={otpVerified}
        tripStarted={tripStarted}
      />
      {/* 🔹 Driver Arrived Modal */}
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
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  originIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  currentLoadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
  },
  headerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  loadInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadInfo: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  loadPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bottomSheetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  loadCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLoadItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  loadItemContent: {
    flex: 1,
    marginRight: 12,
  },
  loadItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 16,
    alignItems: 'center',
    marginTop: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  loadDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadTypeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomSheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  createLoadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createLoadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
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
  // ... rest of your existing styles ...
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

  // Existing notification styles
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tripText: { marginBottom: 4, color: '#4B5563' },
  section: { marginVertical: 5, paddingHorizontal: 20 },
  tripLabel: { fontWeight: '500', color: '#374151' },
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
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
});

export default Dashboard;
