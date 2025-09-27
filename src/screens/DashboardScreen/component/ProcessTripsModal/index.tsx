import { useGetProcessTripsQuery } from '@api/hooks_api';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate, getStatusColor, SCREEN_HEIGHT } from './helper';

interface CustomerProcess {
  LoadPostID: string;
  CustomerID: string;
  Origin: string;
  Destination: string;
  VehicleType: string;
  Weight: string;
  DhalaLength: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string;
  PostInsertDate: string;
  PostUpdateDate: string | null;
  Origin_Lat: number;
  Origin_Lng: number;
  Origin_City: string;
  Origin_District: string;
  Origin_Taluka: string;
  Origin_State: string;
  Origin_Pincode: string;
  Destination_Lat: number;
  Destination_Lng: number;
  Destination_City: string;
  Destination_District: string;
  Destination_Taluka: string;
  Destination_State: string;
  Destination_Pincode: string;
  AddressInsertDate: string;
  AddressUpdateDate: string | null;
  CustomerPostID: string;
  cpsCustomerID: string;
  VendorID: string | null;
  DriverID: string | null;
  CustomerStatus: string;
  VendorStatus: string | null;
  DriverStatus: string | null;
  tripStatus: string;
  DriverLat: number | null;
  DriverLng: number | null;
  dllDriverID: string | null;
  MobileNo: string;
}

interface ProcessTripsModalRef {
  open: () => void;
  close: () => void;
}

const ProcessTripsModal = forwardRef<ProcessTripsModalRef>((_, ref) => {
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );
  const dispatch = useDispatch();
  const {
    data: processTrips,
    refetch: refetchProcessTrips,
    isLoading,
  } = useGetProcessTripsQuery({ CustomerID });

  const bottomModalRef = useRef<BottomModalRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => bottomModalRef.current?.open(),
    close: () => bottomModalRef.current?.close(),
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchProcessTrips();
    setRefreshing(false);
  };

  const handleModalClose = () => {
    bottomModalRef.current?.close();
  };

  const handleTripPress = (item: CustomerProcess) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setCustomerMap('Active'));
    dispatch(setPostId(item?.LoadPostID));
    dispatch(
      setOrigin({
        latitude: item?.Origin_Lat,
        longitude: item?.Origin_Lng,
      }),
    );
    dispatch(setOriginAddress(item?.Origin_City));
    dispatch(setDestinationAddress(item?.Destination_City));
    if (item.DriverLat && item.DriverLng) {
      dispatch(
        selectDriver({
          latitude: item.DriverLat,
          longitude: item.DriverLng,
          available: true,
          driver: item.DriverID || '',
          id: item.DriverID || '',
          licensePlate: item.DriverID || '',
          type: 'medium',
          rotation: 0,
        }),
      );
    }
    dispatch(
      setDestination({
        latitude: item?.Destination_Lat,
        longitude: item?.Destination_Lng,
      }),
    );
    handleModalClose();
  };

  const renderTripCard = ({ item }: { item: CustomerProcess }) => (
    <TouchableOpacity
      style={processTripStyles.cardContainer}
      onPress={() => handleTripPress(item)}
    >
      <View style={processTripStyles.cardHeader}>
        <View style={processTripStyles.idContainer}>
          <Icon source="identifier" size={14} color="#666" />
          <Text style={processTripStyles.cardId}>ID: {item.LoadPostID}</Text>
        </View>
        <View
          style={[
            processTripStyles.statusBadge,
            { backgroundColor: getStatusColor(item.tripStatus) },
          ]}
        >
          <Text style={processTripStyles.statusText}>
            {item.tripStatus?.toUpperCase() || 'UNKNOWN'}
          </Text>
        </View>
      </View>

      <View style={processTripStyles.routeContainer}>
        <View style={processTripStyles.routeIndicator}>
          <View style={processTripStyles.originDot} />
          <View style={processTripStyles.routeLine} />
          <View style={processTripStyles.destinationDot} />
        </View>
        <View style={processTripStyles.routeDetails}>
          <View style={processTripStyles.locationRow}>
            <Text style={processTripStyles.originText} numberOfLines={1}>
              {item.Origin_City}
            </Text>
            <Icon source="arrow-right" size={16} color="#999" />
            <Text style={processTripStyles.destinationText} numberOfLines={1}>
              {item.Destination_City}
            </Text>
          </View>
        </View>
      </View>

      <View style={processTripStyles.detailsContainer}>
        <View style={processTripStyles.detailItem}>
          <Icon source="truck" size={16} color="#5e6bff" />
          <Text style={processTripStyles.detailText}>{item.VehicleType}</Text>
        </View>
        <View style={processTripStyles.detailItem}>
          <Icon source="weight" size={16} color="#5e6bff" />
          <Text style={processTripStyles.detailText}>{item.Weight}</Text>
        </View>
        <View style={processTripStyles.detailItem}>
          <Icon source="calendar" size={16} color="#5e6bff" />
          <Text style={processTripStyles.detailText}>
            {formatDate(item.PostInsertDate)}
          </Text>
        </View>
      </View>

      {item.DriverID && (
        <View style={processTripStyles.driverContainer}>
          <View style={processTripStyles.driverInfo}>
            <Icon source="account" size={14} color="#666" />
            <Text style={processTripStyles.driverText}>Driver Assigned</Text>
          </View>
        </View>
      )}

      <View style={processTripStyles.cardFooter}>
        <View style={processTripStyles.statusContainer}>
          <Text style={processTripStyles.statusLabel}>Customer: </Text>
          <View
            style={[
              processTripStyles.statusPill,
              { backgroundColor: getStatusColor(item.CustomerStatus) },
            ]}
          >
            <Text style={processTripStyles.statusPillText}>
              {item.CustomerStatus || 'N/A'}
            </Text>
          </View>
        </View>
        {item.VendorStatus && (
          <View style={processTripStyles.statusContainer}>
            <Text style={processTripStyles.statusLabel}>Vendor: </Text>
            <View
              style={[
                processTripStyles.statusPill,
                { backgroundColor: getStatusColor(item.VendorStatus) },
              ]}
            >
              <Text style={processTripStyles.statusPillText}>
                {item.VendorStatus}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <View style={processTripStyles.listContainer}>
      <View style={processTripStyles.listHeader}>
        <Text style={processTripStyles.listTitle}>Process Trips</Text>
        <View style={processTripStyles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={processTripStyles.refreshButton}
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
        <View style={processTripStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e6bff" />
          <Text style={processTripStyles.loadingText}>Loading trips...</Text>
        </View>
      ) : processTrips?.data?.length === 0 ? (
        <View style={processTripStyles.emptyContainer}>
          <View style={processTripStyles.emptyContent}>
            <Icon source="truck" size={64} color="#E0E0E0" />
            <Text style={processTripStyles.emptyText}>
              No process trips found
            </Text>
            <Text style={processTripStyles.emptySubText}>
              Your active trips will appear here
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={processTrips?.data || []}
          renderItem={renderTripCard}
          keyExtractor={item => item.CustomerPostID}
          contentContainerStyle={processTripStyles.listContent}
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
      <View style={processTripStyles.container}>{renderListView()}</View>
    </BottomModal>
  );
});

const processTripStyles = StyleSheet.create({
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontSize: 12, color: '#666' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '500' },
});

export default ProcessTripsModal;
