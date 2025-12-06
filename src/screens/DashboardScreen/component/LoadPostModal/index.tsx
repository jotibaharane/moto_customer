// components/LoadPostModal.tsx
import { CustomerLoadPost } from '@api/api.type';
import { useGetCustomerPostsQuery } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import { RootState } from '@store/index';
import {
  addOrUpdateDriver,
  setDestination,
  setDestinationAddress,
  setOrigin,
  setOriginAddress,
  setPostId,
} from '@store/slices/mapSlice';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate, getStatusColor, SCREEN_HEIGHT } from './helper';
import { useRefreshOnFocus } from '@hooks/useRefreshOnFocus';

const LoadPostModal = React.forwardRef<BottomModalRef>((_, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const dispatch = useDispatch();

  // Query hook (auto-fetches). refetch is used for manual refresh.
  const {
    data: customerPosts,
    isLoading,
    refetch,
  } = useGetCustomerPostsQuery(
    { CustomerID },
    {
      refetchOnMountOrArgChange: true,
      keepUnusedDataFor: 0,
    },
  );

  console.log(customerPosts, 'this is from loadpost');

  const [refreshing, setRefreshing] = useState(false);
  useRefreshOnFocus(refetch);
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // refetch returns a Promise-like object; awaiting ensures the UI waits
      await refetch();
    } catch (e) {
      // optionally handle/log error
      // console.warn('Failed to refresh customer posts', e);
    } finally {
      setRefreshing(false);
    }
  };

  // If you want to fetch when CustomerID changes, RTK Query already re-runs query,
  // but if you need an immediate manual refetch when CustomerID becomes available:

  const handlePostPress = (item: CustomerLoadPost) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setPostId(item?.LoadPostID));
    dispatch(
      setOrigin({ latitude: item?.Origin_Lat, longitude: item?.Origin_Lng }),
    );
    dispatch(setOriginAddress(item?.Origin));
    dispatch(setDestinationAddress(item?.Destination));
    dispatch(setDestination(null));
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.close();
    }
  };

  const handleModalClose = () => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.close();
    }
  };

  const renderPostItem = ({ item }: { item: CustomerLoadPost }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handlePostPress(item)}
    >
      {/* Card Header with ID and Status */}
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Icon source="identifier" size={14} color="#666" />
          <Text style={styles.cardId}>ID: {item.LoadPostID}</Text>
        </View>

        <View>
          <Text> {formatDate(item?.PostInsertDate || '')}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.trip_status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.trip_status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Route Information - VERTICAL STACK */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.routeDetails}>
          {/* Origin Address - Top */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Icon source="map-marker" size={14} color="#5e6bff" />
              <Text style={styles.locationLabel}>From</Text>
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.Origin}
            </Text>
            <Text style={styles.locationSubtext}>
              {item.Origin_State} • {item.Origin_Pincode}
            </Text>
          </View>

          {/* Destination Address - Bottom */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Icon source="map-marker-check" size={14} color="#FF6B6B" />
              <Text style={styles.locationLabel}>To</Text>
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.Destination}
            </Text>
            <Text style={styles.locationSubtext}>
              {item.Destination_State} • {item.Destination_Pincode}
            </Text>
          </View>
        </View>
      </View>

      {/* Load Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailColumn}>
          <View style={styles.detailItem}>
            <Icon source="truck" size={16} color="#5e6bff" />
            <Text style={styles.detailText}>{item.VehicleType}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon source="package-variant" size={16} color="#5e6bff" />
            <Text style={styles.detailText}>{item.BodyType}</Text>
          </View>
        </View>

        <View style={styles.detailColumn}>
          <View style={styles.detailItem}>
            <Icon source="weight" size={16} color="#5e6bff" />
            <Text style={styles.detailText}>{item.Weight}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon source="weight" size={16} color="#5e6bff" />
            <Text style={styles.detailText}>{item?.Approximate_weight}</Text>
          </View>
        </View>
      </View>

      {/* Cargo Information */}
      <View style={styles.cargoContainer}>
        <View style={styles.cargoItem}>
          <Icon source="cube-outline" size={14} color="#666" />
          <Text style={styles.cargoText}>{item.CargoContent}</Text>
        </View>
        <View style={styles.cargoItem}>
          <Icon source="palette" size={14} color="#666" />
          <Text style={styles.cargoText}>{item.CargoPackageType}</Text>
        </View>
      </View>

      {/* Pending Status Indicator */}
      {item.trip_status === 'Pending' && (
        <View style={styles.pendingContainer}>
          <Icon source="clock-outline" size={14} color="#FF9800" />
          <Text style={styles.pendingText}>Awaiting driver assignment</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.listTitle}>My Load Posts</Text>
          {customerPosts?.data && customerPosts.data.length > 0 && (
            <Text style={styles.postCount}>
              {customerPosts.data.length} post
              {customerPosts.data.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <Icon source="refresh" size={22} color="#5e6bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeButton}
          >
            <Icon source="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e6bff" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : customerPosts?.data?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Icon source="package-variant" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No load posts found</Text>
            <Text style={styles.emptySubText}>
              Create your first load post to get started
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={customerPosts?.data || []}
          renderItem={renderPostItem}
          keyExtractor={item => item.LoadPostID}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          // scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );

  return (
    <BottomModal
      ref={ref}
      customHeight="90%"
      backdropOpacity={0.8}
      animationDuration={400}
      swipeThreshold={50}
      onOpen={handleRefresh}
      disableSwipe
    >
      <View style={styles.container}>{renderListView()}</View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // List View Styles
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  titleContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  postCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Enhanced Card Styles
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5e6bff',
  },
  routeLine: {
    width: 2,
    height: 50,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  routeDetails: {
    flex: 1,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  detailColumn: {
    flex: 1,
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  cargoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cargoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cargoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
    flexShrink: 1,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  pendingText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
});

export default LoadPostModal;
