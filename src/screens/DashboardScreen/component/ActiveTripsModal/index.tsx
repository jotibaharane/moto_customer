import { useGetActiveTripsQuery } from '@api/hooks_api';
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
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SCREEN_HEIGHT } from '../LoadPostModal/helper';
import { formatDate, getStatusColor, getTimeElapsed } from './helper';

interface ActiveTrip {
  ActiveTripID: string;
  Customer_LoadPostID: string;
  Driver_LoadPostID: string;
  CustomerID: string;
  DriverID: string;
  VendorID: string;
  DriverMobile: string;
  VehicleNumber: string;
  VehicleType: string;
  Customer_Origin: string;
  Customer_Origin_Lat: number;
  Customer_Origin_Lng: number;
  Customer_Destination: string;
  Customer_Destination_Lat: number;
  Customer_Destination_Lng: number;
  Driver_Lat: number;
  Driver_Lng: number;
  Driver_Status: string;
  Vendor_Status: string;
  Customer_Status: string;
  Trip_Status: string;
  AcceptDate: string;
  CloseDate: string | null;
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
  const {
    data: activeTrips,
    refetch: refetchActiveTrips,
    isLoading,
  } = useGetActiveTripsQuery({ CustomerID });

  const bottomModalRef = useRef<BottomModalRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => bottomModalRef.current?.open(),
    close: () => bottomModalRef.current?.close(),
  }));

  const callDriver = (phoneNumber: string) => {
    console.log('Calling driver:', phoneNumber);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchActiveTrips();
    setRefreshing(false);
  };

  const handleModalClose = () => {
    bottomModalRef.current?.close();
  };

  const handleTripPress = (item: ActiveTrip) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setCustomerMap('Active'));
    dispatch(setPostId(item?.Customer_LoadPostID));
    dispatch(
      setOrigin({
        latitude: item?.Customer_Origin_Lat,
        longitude: item?.Customer_Origin_Lng,
      }),
    );
    dispatch(setOriginAddress(item?.Customer_Origin));
    dispatch(setDestinationAddress(item?.Customer_Destination));
    dispatch(
      selectDriver({
        latitude: item?.Driver_Lat,
        longitude: item?.Driver_Lng,
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
        latitude: item?.Customer_Destination_Lat,
        longitude: item?.Customer_Destination_Lng,
      }),
    );
    handleModalClose();
  };

  const renderTripCard = ({ item }: { item: ActiveTrip }) => (
    <TouchableOpacity
      style={activeTripStyles.cardContainer}
      onPress={() => handleTripPress(item)}
    >
      <View style={activeTripStyles.cardHeader}>
        <View style={activeTripStyles.idContainer}>
          <Icon source="identifier" size={14} color="#666" />
          <Text style={activeTripStyles.cardId}>ID: {item.ActiveTripID}</Text>
        </View>
        <View
          style={[
            activeTripStyles.statusBadge,
            { backgroundColor: getStatusColor(item.Trip_Status) },
          ]}
        >
          <Text style={activeTripStyles.statusText}>
            {item.Trip_Status?.toUpperCase() || 'ACTIVE'}
          </Text>
        </View>
      </View>

      <View style={activeTripStyles.routeContainer}>
        <View style={activeTripStyles.routeIndicator}>
          <View style={activeTripStyles.originDot} />
          <View style={activeTripStyles.routeLine} />
          <View style={activeTripStyles.destinationDot} />
        </View>
        <View style={activeTripStyles.routeDetails}>
          <View style={activeTripStyles.locationRow}>
            <Text style={activeTripStyles.originText} numberOfLines={1}>
              {item.Customer_Origin}
            </Text>
            <Icon source="arrow-right" size={16} color="#999" />
            <Text style={activeTripStyles.destinationText} numberOfLines={1}>
              {item.Customer_Destination}
            </Text>
          </View>
        </View>
      </View>

      <View style={activeTripStyles.detailsContainer}>
        <View style={activeTripStyles.detailItem}>
          <Icon source="truck" size={16} color="#5e6bff" />
          <Text style={activeTripStyles.detailText}>{item.VehicleType}</Text>
        </View>
        <View style={activeTripStyles.detailItem}>
          <Icon source="card-text" size={16} color="#5e6bff" />
          <Text style={activeTripStyles.detailText}>{item.VehicleNumber}</Text>
        </View>
        <View style={activeTripStyles.detailItem}>
          <Icon source="calendar" size={16} color="#5e6bff" />
          <Text style={activeTripStyles.detailText}>
            {formatDate(item.AcceptDate)}
          </Text>
        </View>
      </View>

      <View style={activeTripStyles.driverContainer}>
        <View style={activeTripStyles.driverInfo}>
          <Icon source="account" size={14} color="#666" />
          <Text style={activeTripStyles.driverText}>Driver Assigned</Text>
        </View>
        {item.DriverMobile && (
          <TouchableOpacity
            style={activeTripStyles.callButton}
            onPress={() => callDriver(item.DriverMobile)}
          >
            <Icon source="phone" size={16} color="#5e6bff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={activeTripStyles.cardFooter}>
        <Text style={activeTripStyles.timeText}>
          Accepted {getTimeElapsed(item.AcceptDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <View style={activeTripStyles.listContainer}>
      <View style={activeTripStyles.listHeader}>
        <Text style={activeTripStyles.listTitle}>Active Trips</Text>
        <View style={activeTripStyles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={activeTripStyles.refreshButton}
          >
            <Icon source="refresh" size={22} color="#5e6bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleModalClose}
            style={{ padding: 4, marginLeft: 16 }}
          >
            <Icon source="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={activeTripStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e6bff" />
          <Text style={activeTripStyles.loadingText}>
            Loading active trips...
          </Text>
        </View>
      ) : activeTrips?.data?.length === 0 ? (
        <View style={activeTripStyles.emptyContainer}>
          <View style={activeTripStyles.emptyContent}>
            <Icon source="truck" size={64} color="#E0E0E0" />
            <Text style={activeTripStyles.emptyText}>
              No active trips found
            </Text>
            <Text style={activeTripStyles.emptySubText}>
              Your ongoing trips will appear here
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={activeTrips?.data || []}
          renderItem={renderTripCard}
          keyExtractor={item => item.ActiveTripID}
          contentContainerStyle={activeTripStyles.listContent}
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
      ref={bottomModalRef}
      customHeight="90%"
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  listContainer: { flex: 1 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  listTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerActions: { flexDirection: 'row' },
  refreshButton: { padding: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  emptyContainer: { flexGrow: 1 },
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
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
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
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardId: { fontSize: 12, color: '#666', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  routeContainer: { flexDirection: 'row', marginBottom: 16 },
  routeIndicator: { alignItems: 'center', marginRight: 16, width: 20 },
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
  routeDetails: { flex: 1 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  originText: { fontSize: 16, fontWeight: '600', color: '#5e6bff', flex: 1 },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: '#555', fontWeight: '500' },
  driverContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  driverText: { fontSize: 14, color: '#28A745', fontWeight: '500' },
  callButton: { padding: 6, borderRadius: 20, backgroundColor: '#F0F5FF' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: { fontSize: 12, color: '#999' },
});
export default ActiveTripsModal;
