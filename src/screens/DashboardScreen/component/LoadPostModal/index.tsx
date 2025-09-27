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
import React, { useState } from 'react';
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

const LoadPostModal = React.forwardRef<BottomModalRef>((_, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const dispatch = useDispatch();
  const {
    data: customerPosts,
    refetch: refetchPosts,
    isLoading,
  } = useGetCustomerPostsQuery({ CustomerID });

  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchPosts();
    setRefreshing(false);
  };

  const handlePostPress = (item: CustomerLoadPost) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setPostId(item?.LoadPostID));
    dispatch(
      setOrigin({ latitude: item?.Origin_Lat, longitude: item?.Origin_Lng }),
    );
    dispatch(setOriginAddress(item?.Origin_City));
    dispatch(setDestinationAddress(item?.Destination_City));
    dispatch(
      setDestination({
        latitude: item?.Destination_Lat,
        longitude: item?.Destination_Lng,
      }),
    );
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.close();
    }
  };
  const handleModalClose = () => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.close();
    }
  };
  // Render list item - ENHANCED CARD DESIGN
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

      {/* Route Information */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.locationRow}>
            <Text style={styles.originText} numberOfLines={1}>
              {item.Origin_City}
            </Text>
            <Icon source="arrow-right" size={16} color="#999" />
            <Text style={styles.destinationText} numberOfLines={1}>
              {item.Destination_City}
            </Text>
          </View>
        </View>
      </View>

      {/* Load Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon source="truck" size={16} color="#5e6bff" />
          <Text style={styles.detailText}>{item.VehicleType}</Text>
        </View>

        <View style={styles.detailItem}>
          <Icon source="weight" size={16} color="#5e6bff" />
          <Text style={styles.detailText}>{item.Weight}</Text>
        </View>

        <View style={styles.detailItem}>
          <Icon source="calendar" size={16} color="#5e6bff" />
          <Text style={styles.detailText}>
            {formatDate(item?.PostInsertDate || '')}
          </Text>
        </View>
      </View>

      {/* Verification Code Section */}
      {item.verify_flag === 'N' && (
        <View style={styles.verificationCodeContainer}>
          <View style={styles.verificationHeader}>
            <Icon source="shield-alert" size={16} color="#FF9800" />
            <Text style={styles.verificationTitle}>Verification Required</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Use this code when contacted:</Text>
            <Text style={styles.verificationCode}>
              {item.verification_code}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render list view
  const renderListView = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Load Posts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <Icon source="refresh" size={22} color="#5e6bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleModalClose}
            style={{
              padding: 4,
              marginLeft: 16,
            }}
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  refreshButton: {
    padding: 8,
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    height: 30,
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
  locationRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  originText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5e6bff',
    flex: 1,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#888',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },

  // Verification Code Styles
  verificationCodeContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  codeContainer: {
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 6,
  },
  verificationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: '#FFEAA7',
    padding: 8,
    borderRadius: 8,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FFF9E6',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LoadPostModal;
