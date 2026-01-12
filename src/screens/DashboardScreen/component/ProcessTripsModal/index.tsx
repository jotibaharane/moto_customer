import { useGetProcessTripsQuery } from '@api/hooks_api';
import BottomModal, { BottomModalRef } from '@components/BottomModal';
import { useRefreshOnFocus } from '@hooks/onFocusevent';
import { RootState } from '@store/index';
import { setLocatation } from '@store/slices/map.slice';
import { selectDriver } from '@store/slices/mapSlice';
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

  DriverLat?: number;
  DriverLng?: number;
  // Pickup Details
  PickupContactPerson: string;
  PickupCompanyName: string;
  PickupContactNumber: string;
  PickupPlotBuilding: string;
  PickupStreetArea: string;
  PickupAddress: string;

  // Delivery Details
  DeliveryContactPerson: string;
  DeliveryCompanyName: string;
  DeliveryContactNumber: string;
  DeliveryPlotBuilding: string;
  DeliveryStreetArea: string;
  DeliveryAddress: string;

  // Vehicle & Cargo
  VehicleType: string;
  Weight: string;
  Approximate_weight: number;
  cargo_type: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;

  // Schedule & Flags
  ExpectedAvailableTime: string;
  ScheduleDate: string | null;
  ScheduleTime: string | null;
  isVolumetric: boolean;
  DhalaLength: number | null;
  cost: number;
  master_status: string;

  // Verification
  verification_code: string;
  verify_flag: boolean;

  // Dates
  LoadPost_InsertDate: string | null;
  LoadPost_UpdateDate: string | null;
  Address_InsertDate: string | null;
  Address_UpdateDate: string | null;

  // Pickup Location
  PickupCity: string;
  PickupDistrict: string;
  PickupTaluka: string;
  PickupState: string;
  PickupPincode: string;
  PickupLat: number;
  PickupLng: number;

  // Delivery Location
  DeliveryCity: string;
  DeliveryDistrict: string;
  DeliveryTaluka: string;
  DeliveryState: string;
  DeliveryPincode: string;
  DeliveryLat: number;
  DeliveryLng: number;

  // Status & Relations
  CustomerPostID: string;
  VendorID: string | null;
  DriverID: string | null;
  CustomerStatus: string;
  VendorStatus: string | null;
  DriverStatus: string | null;
  LP_Status: string;
}
// ===== MULTIPLE DUMMY PROCESS TRIPS =====
const DUMMY_PROCESS_TRIPS: CustomerProcess[] = [
  {
    LoadPostID: 'PROC-001',
    CustomerID: 'CUST-001',

    PickupContactPerson: 'Ravi Kumar',
    PickupCompanyName: 'ABC Electronics',
    PickupContactNumber: '9876543210',
    PickupPlotBuilding: 'Plot 21',
    PickupStreetArea: 'Industrial Area',
    PickupAddress: 'Okhla Phase 2, New Delhi',

    DeliveryContactPerson: 'Amit Shah',
    DeliveryCompanyName: 'XYZ Warehousing',
    DeliveryContactNumber: '9123456789',
    DeliveryPlotBuilding: 'Warehouse 7',
    DeliveryStreetArea: 'MIDC',
    DeliveryAddress: 'Andheri East, Mumbai',

    VehicleType: 'Container',
    Weight: '10 MT',
    Approximate_weight: 9.8,
    cargo_type: 'General',
    BodyType: 'Closed',
    CargoContent: 'Electronics',
    CargoPackageType: 'Box',

    ExpectedAvailableTime: '',
    ScheduleDate: null,
    ScheduleTime: null,
    isVolumetric: false,
    DhalaLength: null,
    cost: 45000,
    master_status: 'PROCESS',

    verification_code: '4589',
    verify_flag: 'N',

    LoadPost_InsertDate: new Date().toISOString(),
    LoadPost_UpdateDate: null,
    Address_InsertDate: null,
    Address_UpdateDate: null,

    PickupCity: 'New Delhi',
    PickupDistrict: 'Delhi',
    PickupTaluka: '',
    PickupState: 'Delhi',
    PickupPincode: '110020',
    PickupLat: 28.5244,
    PickupLng: 77.2606,

    DeliveryCity: 'Mumbai',
    DeliveryDistrict: 'Mumbai',
    DeliveryTaluka: '',
    DeliveryState: 'Maharashtra',
    DeliveryPincode: '400069',
    DeliveryLat: 19.076,
    DeliveryLng: 72.8777,

    CustomerPostID: 'CP-001',
    VendorID: null,
    DriverID: null,
    CustomerStatus: 'PROCESS',
    VendorStatus: null,
    DriverStatus: null,
    LP_Status: 'PROCESS',
  },

  {
    LoadPostID: 'PROC-002',
    CustomerID: 'CUST-001',

    PickupContactPerson: 'Suresh Patel',
    PickupCompanyName: 'Steel Works Ltd',
    PickupContactNumber: '9000000001',
    PickupPlotBuilding: 'Plot 88',
    PickupStreetArea: 'GIDC',
    PickupAddress: 'Vatva GIDC, Ahmedabad',

    DeliveryContactPerson: 'Nikhil Jain',
    DeliveryCompanyName: 'Metro Infra',
    DeliveryContactNumber: '9000000002',
    DeliveryPlotBuilding: 'Yard 3',
    DeliveryStreetArea: 'Industrial Zone',
    DeliveryAddress: 'Bhiwandi Logistics Hub',

    VehicleType: 'Trailer',
    Weight: '18 MT',
    Approximate_weight: 17.5,
    cargo_type: 'Heavy',
    BodyType: 'Open',
    CargoContent: 'Steel Rods',
    CargoPackageType: 'Loose',

    ExpectedAvailableTime: '',
    ScheduleDate: null,
    ScheduleTime: null,
    isVolumetric: false,
    DhalaLength: null,
    cost: 68000,
    master_status: 'PROCESS',

    verification_code: '',
    verify_flag: 'Y',

    LoadPost_InsertDate: new Date(Date.now() - 86400000).toISOString(),
    LoadPost_UpdateDate: null,
    Address_InsertDate: null,
    Address_UpdateDate: null,

    PickupCity: 'Ahmedabad',
    PickupDistrict: 'Ahmedabad',
    PickupTaluka: '',
    PickupState: 'Gujarat',
    PickupPincode: '382445',
    PickupLat: 22.966,
    PickupLng: 72.633,

    DeliveryCity: 'Bhiwandi',
    DeliveryDistrict: 'Thane',
    DeliveryTaluka: '',
    DeliveryState: 'Maharashtra',
    DeliveryPincode: '421302',
    DeliveryLat: 19.2813,
    DeliveryLng: 73.0483,

    CustomerPostID: 'CP-002',
    VendorID: 'VEND-01',
    DriverID: null,
    CustomerStatus: 'PROCESS',
    VendorStatus: 'ASSIGNED',
    DriverStatus: null,
    LP_Status: 'PROCESS',
  },
];

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
    isLoading,
    refetch,
  } = useGetProcessTripsQuery(
    { CustomerID },
    {
      skip: !CustomerID, // Skip until CustomerID is available
      refetchOnMountOrArgChange: true, // optional
    },
  );

  const tripsData: CustomerProcess[] =
    Array.isArray(processTrips?.data) && processTrips.data.length > 0
      ? processTrips.data
      : DUMMY_PROCESS_TRIPS;
  // useRefreshOnFocus(() => getProcesTrips({ CustomerID }), true);

  const bottomModalRef = useRef<BottomModalRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => bottomModalRef.current?.open(),
    close: () => bottomModalRef.current?.close(),
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch(); // ⬅️ RTK Query refetch
    setRefreshing(false);
  };

  useRefreshOnFocus(refetch, true);
  const handleModalClose = () => {
    bottomModalRef.current?.close();
  };

  useLayoutEffect(() => {
    // const interval = setInterval(() => {
    dispatch(
      selectDriver({
        id: 'DRV-101',
        driver: 'DRV-101',
        latitude: 28.5355 + Math.random() * 0.01,
        longitude: 77.391 + Math.random() * 0.01,
        available: true,
        licensePlate: 'DRV-101',
        type: 'medium',
        rotation: 0,
      }),
    );
    // }, 3000);

    // return () => clearInterval(interval);
  }, []);

  const handleTripPress = (item: CustomerProcess) => {
    dispatch(
      setLocatation({
        map_state: 'process',
        selectedDriver: {
          latitude: item.DriverLat ?? 0,
          longitude: item.DriverLng ?? 0,
          rotation: 0,
        },
        destinationLocation: {
          latitude: item?.DeliveryLat,
          longitude: item?.DeliveryLng,
          rotation: 0,
        },
        pickupLocation: {
          latitude: item?.PickupLat,
          longitude: item?.PickupLng,
          rotation: 0,
        },
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
        <View>
          <Text> {formatDate(item?.LoadPost_InsertDate || '')}</Text>
        </View>
        <View
          style={[
            processTripStyles.statusBadge,
            { backgroundColor: getStatusColor(item?.LP_Status) },
          ]}
        >
          <Text style={processTripStyles.statusText}>
            {item?.LP_Status?.toUpperCase() || 'UNKNOWN'}
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
              {item.PickupAddress}
            </Text>
            <Text style={processTripStyles.locationSubtext}>
              {item.PickupState} • {item.PickupPincode}
            </Text>
          </View>

          {/* Destination Address */}
          <View style={processTripStyles.locationSection}>
            <View style={processTripStyles.locationHeader}>
              <Icon source="map-marker-check" size={14} color="#FF6B6B" />
              <Text style={processTripStyles.locationLabel}>To</Text>
            </View>
            <Text style={processTripStyles.locationText} numberOfLines={2}>
              {item.DeliveryAddress}
            </Text>
            <Text style={processTripStyles.locationSubtext}>
              {item.DeliveryState} • {item.DeliveryPincode}
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
              {item?.Approximate_weight}
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
      {item?.verify_flag === 'N' && item.verification_code && (
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
          <Text style={processTripStyles.tripCount}>
            {tripsData.length} trip{tripsData.length !== 1 ? 's' : ''}
          </Text>
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
      ) : tripsData.length === 0 ? (
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
          data={tripsData}
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
      onOpen={() => {
        if (CustomerID) refetch(); // Ensure latest data
      }}
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
