// Dashboard.tsx
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
import React, { useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingActionButton } from './component/FloatingButtons';
import MapComponent from './component/MapComponent';
const ORIGIN_MARKER_IMG = require('@assets/icons/origin-marker.png');
const Dashboard: React.FC = () => {
  const { origin, postId } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );

  const { data: customerPosts, refetch: refetchPosts } =
    useGetCustomerPostsQuery({ CustomerID });
  const { originAddress, destinationAddress } = useSelector(
    (state: RootState) => state.map,
  );

  // Toggle drawer
  const toggleDrawer = () => {
    navigation.openDrawer();
  };

  useEffect(() => {
    console.log({ customerPosts });
    if (!postId && !origin?.latitude && customerPosts) {
      dispatch(setCustomerMap('Load'));
      dispatch(selectDriver(null));
      dispatch(setPostId(customerPosts?.data?.[0]?.LoadPostID));
      dispatch(
        setOrigin({
          latitude: customerPosts?.data?.[0]?.Origin_Lat,
          longitude: customerPosts?.data?.[0]?.Origin_Lng,
        }),
      );
      dispatch(setOriginAddress(customerPosts?.data?.[0]?.Origin));
      dispatch(setDestinationAddress(customerPosts?.data?.[0]?.Destination));
      dispatch(
        setDestination({
          latitude: customerPosts?.data?.[0]?.Destination_Lat,
          longitude: customerPosts?.data?.[0]?.Destination_Lng,
        }),
      );
    }
  }, [customerPosts]);
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Icon source="menu" size={24} />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Image
            source={ORIGIN_MARKER_IMG}
            style={styles.originIcon}
            resizeMode="contain"
          />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationText} numberOfLines={1}>
              {originAddress}
            </Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {destinationAddress}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapComponent />
        <FloatingActionButton />
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same
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
    tintColor: '#4285F4',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  addressText: {
    fontSize: 12,
    color: '#666666',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default Dashboard;
