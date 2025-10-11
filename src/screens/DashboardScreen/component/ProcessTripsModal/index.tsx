import { useGetProcessTripsMutation } from '@api/hooks_api';
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
  verify_flag: string;
  verification_code: string;
  trip_status: string;
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
  const [getProcesTrips, { data: processTrips, isLoading }] =
    useGetProcessTripsMutation();
  console.log({ processTrips });
  const bottomModalRef = useRef<BottomModalRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => bottomModalRef.current?.open(),
    close: () => bottomModalRef.current?.close(),
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await getProcesTrips({ CustomerID });
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    handleRefresh();
  }, [ref]);
  const handleModalClose = () => {
    bottomModalRef.current?.close();
  };

  const handleTripPress = (item: CustomerProcess) => {
    dispatch(addOrUpdateDriver([]));
    dispatch(setCustomerMap('Process'));
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
      {/* Card Header with ID and Status */}
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

      {/* Route Information - Vertical Stack */}
      <View style={processTripStyles.routeContainer}>
        <View style={processTripStyles.routeIndicator}>
          <View style={processTripStyles.originDot} />
          <View style={processTripStyles.routeLine} />
          <View style={processTripStyles.destinationDot} />
        </View>

        <View style={processTripStyles.routeDetails}>
          {/* Origin Address */}
          <View style={processTripStyles.locationSection}>
            <View style={processTripStyles.locationHeader}>
              <Icon source="map-marker" size={14} color="#5e6bff" />
              <Text style={processTripStyles.locationLabel}>From</Text>
            </View>
            <Text style={processTripStyles.locationText} numberOfLines={2}>
              {item.Origin_City}
            </Text>
            <Text style={processTripStyles.locationSubtext}>
              {item.Origin_State} • {item.Origin_Pincode}
            </Text>
          </View>

          {/* Destination Address */}
          <View style={processTripStyles.locationSection}>
            <View style={processTripStyles.locationHeader}>
              <Icon source="map-marker-check" size={14} color="#FF6B6B" />
              <Text style={processTripStyles.locationLabel}>To</Text>
            </View>
            <Text style={processTripStyles.locationText} numberOfLines={2}>
              {item.Destination_City}
            </Text>
            <Text style={processTripStyles.locationSubtext}>
              {item.Destination_State} • {item.Destination_Pincode}
            </Text>
          </View>
        </View>
      </View>

      {/* Load Details Grid */}
      <View style={processTripStyles.detailsGrid}>
        <View style={processTripStyles.detailColumn}>
          <View style={processTripStyles.detailItem}>
            <Icon source="truck" size={16} color="#5e6bff" />
            <Text style={processTripStyles.detailText}>{item.VehicleType}</Text>
          </View>

          <View style={processTripStyles.detailItem}>
            <Icon source="package-variant" size={16} color="#5e6bff" />
            <Text style={processTripStyles.detailText}>{item.BodyType}</Text>
          </View>
        </View>

        <View style={processTripStyles.detailColumn}>
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
      </View>

      {/* Cargo Information */}
      <View style={processTripStyles.cargoContainer}>
        <View style={processTripStyles.cargoItem}>
          <Icon source="cube-outline" size={14} color="#666" />
          <Text style={processTripStyles.cargoText}>{item.CargoContent}</Text>
        </View>
        <View style={processTripStyles.cargoItem}>
          <Icon source="palette" size={14} color="#666" />
          <Text style={processTripStyles.cargoText}>
            {item.CargoPackageType}
          </Text>
        </View>
      </View>

      {/* Verification Code Section */}
      {item.verify_flag === 'N' && item.verification_code && (
        <View style={processTripStyles.verificationContainer}>
          <View style={processTripStyles.verificationHeader}>
            <Icon source="shield-alert" size={16} color="#FF9800" />
            <Text style={processTripStyles.verificationTitle}>
              Verification Required
            </Text>
          </View>
          <View style={processTripStyles.codeContainer}>
            <Text style={processTripStyles.codeLabel}>
              Share this code with driver:
            </Text>
            <Text style={processTripStyles.verificationCode}>
              {item.verification_code}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListView = () => (
    <View style={processTripStyles.listContainer}>
      <View style={processTripStyles.listHeader}>
        <View style={processTripStyles.titleContainer}>
          <Text style={processTripStyles.listTitle}>Process Trips</Text>
          {processTrips?.data && processTrips.data.length > 0 && (
            <Text style={processTripStyles.tripCount}>
              {processTrips.data.length} trip
              {processTrips.data.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={processTripStyles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={processTripStyles.refreshButton}
          >
            <Icon source="refresh" size={22} color="#5e6bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleModalClose}
            style={processTripStyles.closeButton}
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
              No active trips found
            </Text>
            <Text style={processTripStyles.emptySubText}>
              Your ongoing trips will appear here
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
  tripCount: {
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

  // Route Styles
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

  // Details Grid
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

  // Cargo Information
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

  // Verification Code Styles
  verificationContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  // Driver Information
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverDetails: {
    flexDirection: 'column',
  },
  driverText: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  driverId: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
  },

  // Status Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default ProcessTripsModal;
