import { useGetActiveTripsMutation } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import { RootState } from '@store/index';
import {
  addOrUpdateDriver,
  selectDriver,
  setCustomerMap,
  setDestination,
  setDestinationAddress,
  setOrigin,
  setOriginAddress,
  setPostId,
} from '@store/slices/mapSlice';
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Icon, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate, getStatusColor } from './helper';

interface ActiveTrip {
  LoadPostID: string;
  CustomerID: string;
  DriverID: string;
  Origin: string;
  Destination: string;
  VehicleType: string;
  VehicleNumber?: string;
  DriverMobile: string;
  Origin_Lat: number;
  Origin_Lng: number;
  Destination_Lat: number;
  Destination_Lng: number;
  DriverLat: number;
  DriverLng: number;
  Trip_Status: string;
  AcceptDate: string;
  Weight?: string;
  BodyType?: string;
  CargoContent?: string;
  Origin_City: string;
  Origin_State: string;
  Destination_City: string;
  Destination_State: string;
  DriverStatus: string;
}

interface ActiveTripsModalRef {
  open: () => void;
  close: () => void;
}

const ActiveTripsModal = forwardRef<ActiveTripsModalRef>((_, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const dispatch = useDispatch();
  const [getActiveTrips, { data: activeTrips, isLoading }] =
    useGetActiveTripsMutation();
  const bottomModalRef = useRef<BottomModalRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  console.log('Active Trips:', activeTrips);
  useImperativeHandle(ref, () => ({
    open: () => bottomModalRef.current?.open(),
    close: () => bottomModalRef.current?.close(),
  }));

  const callDriver = (phoneNumber: string) => {
    console.log('Calling driver:', phoneNumber);
    // Implement actual call functionality
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getActiveTrips({ CustomerID });
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    handleRefresh();
  }, []);
  const handleModalClose = () => {
    bottomModalRef.current?.close();
  };

  const handleTripPress = (item: ActiveTrip) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setCustomerMap('Active'));
    dispatch(setPostId(item?.LoadPostID));
    dispatch(
      setOrigin({
        latitude: item?.Origin_Lat,
        longitude: item?.Origin_Lng,
      }),
    );
    dispatch(setOriginAddress(item?.Origin));
    dispatch(setDestinationAddress(item?.Destination));
    dispatch(
      selectDriver({
        latitude: item?.DriverLat,
        longitude: item?.DriverLng,
        available: true,
        driver: item?.DriverID,
        id: item?.DriverID,
        licensePlate: item?.VehicleNumber,
        type: 'medium',
        rotation: 0,
      }),
    );
    dispatch(
      setDestination({
        latitude: item?.Destination_Lat,
        longitude: item?.Destination_Lng,
      }),
    );
    handleModalClose();
  };

  const renderTripCard = ({ item }: { item: ActiveTrip }) => (
    <TouchableOpacity
      style={activeTripStyles.cardContainer}
      onPress={() => handleTripPress(item)}
    >
      {/* Card Header with ID and Status */}
      <View style={activeTripStyles.cardHeader}>
        <View style={activeTripStyles.idContainer}>
          <Icon source="identifier" size={16} color="#5e6bff" />
          <Text style={activeTripStyles.cardId}>ID: {item.LoadPostID}</Text>
        </View>
        <View
          style={[
            activeTripStyles.statusBadge,
            { backgroundColor: getStatusColor(item.Trip_Status) },
          ]}
        >
          <Text style={activeTripStyles.statusText}>
            {item.Trip_Status?.toUpperCase() || 'UNKNOWN'}
          </Text>
        </View>
      </View>

      {/* Route Information */}
      <View style={activeTripStyles.routeContainer}>
        <View style={activeTripStyles.routeIndicator}>
          <View style={activeTripStyles.originDot} />
          <View style={activeTripStyles.routeLine} />
          <View style={activeTripStyles.destinationDot} />
        </View>

        <View style={activeTripStyles.routeDetails}>
          {/* Origin */}
          <View style={activeTripStyles.locationSection}>
            <View style={activeTripStyles.locationHeader}>
              <Icon source="map-marker" size={16} color="#5e6bff" />
              <Text style={activeTripStyles.locationLabel}>Pickup</Text>
            </View>
            <Text style={activeTripStyles.locationText} numberOfLines={3}>
              {item.Origin}
            </Text>
            <Text style={activeTripStyles.locationSubtext}>
              {item.Origin_State}
            </Text>
          </View>

          {/* Destination */}
          <View style={activeTripStyles.locationSection}>
            <View style={activeTripStyles.locationHeader}>
              <Icon source="map-marker-check" size={16} color="#FF6B6B" />
              <Text style={activeTripStyles.locationLabel}>Delivery</Text>
            </View>
            <Text style={activeTripStyles.locationText} numberOfLines={3}>
              {item.Destination}
            </Text>
            <Text style={activeTripStyles.locationSubtext}>
              {item.Destination_State}
            </Text>
          </View>
        </View>
      </View>

      {/* Trip Details Grid - 2 boxes per row */}
      <View style={activeTripStyles.detailsGrid}>
        {/* First Row */}
        <View style={activeTripStyles.gridRow}>
          <View style={activeTripStyles.detailBox}>
            <View style={activeTripStyles.detailIconContainer}>
              <Icon source="truck" size={16} color="#5e6bff" />
            </View>
            <Text style={activeTripStyles.detailLabel}>Vehicle</Text>
            <Text style={activeTripStyles.detailValue} numberOfLines={1}>
              {item.VehicleType}
            </Text>
          </View>

          <View style={activeTripStyles.detailBox}>
            <View style={activeTripStyles.detailIconContainer}>
              <Icon source="package-variant" size={16} color="#5e6bff" />
            </View>
            <Text style={activeTripStyles.detailLabel}>Body Type</Text>
            <Text style={activeTripStyles.detailValue} numberOfLines={1}>
              {item.BodyType}
            </Text>
          </View>
        </View>

        {/* Second Row */}
        <View style={activeTripStyles.gridRow}>
          <View style={activeTripStyles.detailBox}>
            <View style={activeTripStyles.detailIconContainer}>
              <Icon source="weight" size={16} color="#5e6bff" />
            </View>
            <Text style={activeTripStyles.detailLabel}>Weight</Text>
            <Text style={activeTripStyles.detailValue} numberOfLines={1}>
              {item.Weight}
            </Text>
          </View>

          <View style={activeTripStyles.detailBox}>
            <View style={activeTripStyles.detailIconContainer}>
              <Icon source="calendar" size={16} color="#5e6bff" />
            </View>
            <Text style={activeTripStyles.detailLabel}>Date</Text>
            <Text style={activeTripStyles.detailValue} numberOfLines={1}>
              {formatDate(item.AcceptDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Cargo Information */}
      {(item.CargoContent || item.CargoPackageType) && (
        <View style={activeTripStyles.cargoContainer}>
          {item.CargoContent && (
            <View style={activeTripStyles.cargoItem}>
              <Icon source="cube-outline" size={14} color="#666" />
              <Text style={activeTripStyles.cargoText} numberOfLines={1}>
                {item.CargoContent}
              </Text>
            </View>
          )}
          {item.CargoPackageType && (
            <View style={activeTripStyles.cargoItem}>
              <Icon source="palette" size={14} color="#666" />
              <Text style={activeTripStyles.cargoText} numberOfLines={1}>
                {item.CargoPackageType}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Driver Contact Section */}
      <View style={activeTripStyles.driverSection}>
        <View style={activeTripStyles.driverInfo}>
          <View style={activeTripStyles.driverStatusIndicator} />
          <View>
            <Text style={activeTripStyles.driverLabel}>Driver Assigned</Text>
            <Text style={activeTripStyles.driverStatus}>
              {item.DriverStatus || 'In Transit'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={activeTripStyles.callButton}
          onPress={() => callDriver(item.DriverMobile)}
        >
          <Icon source="phone" size={16} color="#FFFFFF" />
          <Text style={activeTripStyles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <View style={activeTripStyles.listContainer}>
      {/* Header */}
      <View style={activeTripStyles.header}>
        <View style={activeTripStyles.headerContent}>
          <Text variant="titleLarge" style={activeTripStyles.listTitle}>
            Active Trips
          </Text>
          {activeTrips?.data && activeTrips.data.length > 0 && (
            <Text variant="labelSmall" style={activeTripStyles.tripCount}>
              {activeTrips.data.length} trip
              {activeTrips.data.length !== 1 ? 's' : ''} in progress
            </Text>
          )}
        </View>
        <View style={activeTripStyles.headerActions}>
          <IconButton
            icon="refresh"
            size={20}
            iconColor="#5e6bff"
            onPress={handleRefresh}
          />
          <IconButton
            icon="close"
            size={20}
            iconColor="#666"
            onPress={handleModalClose}
          />
        </View>
      </View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={activeTripStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e6bff" />
          <Text variant="bodyMedium" style={activeTripStyles.loadingText}>
            Loading active trips...
          </Text>
        </View>
      ) : activeTrips?.data?.length === 0 ? (
        <View style={activeTripStyles.emptyContainer}>
          <View style={activeTripStyles.emptyIconContainer}>
            <Icon source="truck" size={64} color="#E0E0E0" />
          </View>
          <Text variant="titleMedium" style={activeTripStyles.emptyText}>
            No Active Trips
          </Text>
          <Text variant="bodyMedium" style={activeTripStyles.emptySubText}>
            Your ongoing trips will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTrips?.data || []}
          renderItem={renderTripCard}
          keyExtractor={item => item?.LoadPostID}
          contentContainerStyle={activeTripStyles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#5e6bff']}
              tintColor="#5e6bff"
            />
          }
        />
      )}
    </View>
  );

  return (
    <BottomModal
      ref={bottomModalRef}
      customHeight="85%"
      backdropOpacity={0.8}
      animationDuration={400}
      swipeThreshold={50}
      disableSwipe
    >
      <View style={activeTripStyles.container}>{renderListView()}</View>
    </BottomModal>
  );
});

const activeTripStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
  },
  listTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    fontSize: 22,
  },
  tripCount: {
    color: '#666',
    fontWeight: '500',
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Card Styles
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardId: {
    fontSize: 14,
    color: '#5e6bff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Route Styles
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#5e6bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
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
    gap: 8,
    marginBottom: 6,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  locationSubtext: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },

  // Details Grid - 2 boxes per row
  detailsGrid: {
    marginBottom: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F2FF',
    minHeight: 80,
    justifyContent: 'center',
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Cargo Styles
  cargoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cargoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cargoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
    flex: 1,
  },

  // Driver Section
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  driverStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28A745',
  },
  driverLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  driverStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#28A745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ActiveTripsModal;
