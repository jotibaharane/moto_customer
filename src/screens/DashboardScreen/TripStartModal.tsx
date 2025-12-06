import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Icon } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DriverDetails {
  name: string;
  vehicle: string;
  regNo: string;
  phone: string;
  rating: string;
  tripsCompleted: number;
  vehicleType: string;
  capacity: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface TripStartModalProps {
  visible: boolean;
  onClose: () => void;
  driverDetails: DriverDetails | null;
  origin: Location | null;
  destination: Location | null;
  originAddress: string;
  destinationAddress: string;
  onOtpVerify: () => void;
  onCallDriver: () => void;
  onMessageDriver: () => void;
}

const TripStartModal: React.FC<TripStartModalProps> = ({
  visible,
  onClose,
  driverDetails,
  origin,
  destination,
  originAddress,
  destinationAddress,
  onOtpVerify,
  onCallDriver,
  onMessageDriver,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const [otpVerified, setOtpVerified] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [tripProgress, setTripProgress] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState('15 min');
  const [distanceRemaining, setDistanceRemaining] = useState('8.2 km');

  // Generate random OTP
  const generatedOtp = useRef(Math.random().toString().substring(2, 6)).current;

  // Animation when modal opens
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Initialize driver location near origin
      if (origin) {
        const initialDriverLocation = {
          latitude: origin.latitude - 0.01,
          longitude: origin.longitude - 0.01,
        };
        setDriverLocation(initialDriverLocation);
      }
    } else {
      // Reset states when modal closes
      setOtpVerified(false);
      setTripStarted(false);
      setTripProgress(0);
      setDriverLocation(null);
    }
  }, [visible]);

  // Fit map to show all markers
  useEffect(() => {
    if (mapRef.current && origin && destination && driverLocation) {
      const coordinates = [origin, destination, driverLocation];

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [origin, destination, driverLocation]);

  // Simulate driver movement when trip starts
  useEffect(() => {
    if (tripStarted && origin && destination) {
      const interval = setInterval(() => {
        setDriverLocation(current => {
          if (!current) return current;

          // Simple linear interpolation for demo
          const progress = Math.min(tripProgress + 0.1, 1);
          setTripProgress(progress);

          const newLat =
            origin.latitude +
            (destination.latitude - origin.latitude) * progress;
          const newLng =
            origin.longitude +
            (destination.longitude - origin.longitude) * progress;

          // Update ETA and distance
          const newEta = Math.max(1, Math.round(15 * (1 - progress)));
          setEstimatedArrival(`${newEta} min`);
          setDistanceRemaining(`${(8.2 * (1 - progress)).toFixed(1)} km`);

          return { latitude: newLat, longitude: newLng };
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [tripStarted, origin, destination, tripProgress]);

  const handleOtpVerification = () => {
    setOtpVerified(true);
    setTimeout(() => {
      setTripStarted(true);
      setTripProgress(0);
      onOtpVerify(); // Call parent callback if needed
    }, 1500);
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const routeCoordinates = origin && destination ? [origin, destination] : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
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
          {/* Header */}
          <View style={styles.header}>
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
                    ? 'Trip In Progress'
                    : otpVerified
                    ? 'OTP Verified'
                    : 'Driver Arrived'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>Trip Details</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Icon source="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Trip Map */}
          <View style={styles.mapSection}>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: origin?.latitude || 37.78825,
                  longitude: origin?.longitude || -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                {/* Route Line */}
                {routeCoordinates.length >= 2 && (
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#3B82F6"
                    strokeWidth={4}
                    lineDashPattern={[10, 10]}
                  />
                )}

                {/* Origin Marker */}
                {origin && (
                  <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={styles.markerContainer}>
                      <View style={[styles.markerIcon, styles.originMarker]}>
                        <Icon source="map-marker" size={20} color="#10B981" />
                      </View>
                      <View style={styles.markerLabel}>
                        <Text style={styles.markerLabelText}>Pickup</Text>
                      </View>
                    </View>
                  </Marker>
                )}

                {/* Destination Marker */}
                {destination && (
                  <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={styles.markerContainer}>
                      <View
                        style={[styles.markerIcon, styles.destinationMarker]}
                      >
                        <Icon source="map-marker" size={20} color="#EF4444" />
                      </View>
                      <View style={styles.markerLabel}>
                        <Text style={styles.markerLabelText}>Drop</Text>
                      </View>
                    </View>
                  </Marker>
                )}

                {/* Driver Marker */}
                {driverLocation && (
                  <Marker
                    coordinate={driverLocation}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View style={styles.markerContainer}>
                      <View style={[styles.markerIcon, styles.driverMarker]}>
                        <Icon source="car" size={20} color="#3B82F6" />
                      </View>
                      <View style={[styles.markerLabel, styles.driverLabel]}>
                        <Text style={styles.markerLabelText}>Driver</Text>
                      </View>
                    </View>
                  </Marker>
                )}
              </MapView>
            </View>

            {/* Trip Progress */}
            {tripStarted && (
              <View style={styles.tripProgressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Trip Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(tripProgress * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${tripProgress * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.tripStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{estimatedArrival}</Text>
                    <Text style={styles.statLabel}>ETA</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{distanceRemaining}</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {tripStarted ? 'Moving' : 'Waiting'}
                    </Text>
                    <Text style={styles.statLabel}>Status</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* OTP Section */}
            {!otpVerified && !tripStarted && (
              <View style={styles.otpSection}>
                <View style={styles.otpHeader}>
                  <Icon source="shield-check" size={20} color="#2D3748" />
                  <Text style={styles.otpTitle}>Verification Required</Text>
                </View>
                <Text style={styles.otpDescription}>
                  Share this OTP with your driver to start the trip
                </Text>
                <View style={styles.otpDisplay}>
                  <Text style={styles.otpCode}>{generatedOtp}</Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon source="content-copy" size={18} color="#2D3748" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Verified State */}
            {(otpVerified || tripStarted) && (
              <View style={styles.statusSection}>
                <View style={styles.statusIcon}>
                  <Icon
                    source={tripStarted ? 'check-circle' : 'shield-check'}
                    size={32}
                    color={tripStarted ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <Text style={styles.statusMessage}>
                  {tripStarted ? 'Trip Started Successfully' : 'OTP Verified'}
                </Text>
                <Text style={styles.statusSubtext}>
                  {tripStarted
                    ? 'Your trip is now in progress'
                    : 'Your identity has been verified'}
                </Text>
              </View>
            )}

            {/* Driver Information */}
            <View style={styles.driverSection}>
              <Text style={styles.sectionLabel}>Driver Information</Text>
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.avatarText}>
                    {driverDetails?.name?.charAt(0) || 'D'}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>
                    {driverDetails?.name || 'Driver Name'}
                  </Text>
                  <View style={styles.driverMeta}>
                    <View style={styles.ratingContainer}>
                      <Icon source="star" size={14} color="#F59E0B" />
                      <Text style={styles.rating}>
                        {driverDetails?.rating || '4.8'}
                      </Text>
                    </View>
                    <Text style={styles.vehicleInfo}>
                      {driverDetails?.vehicle || 'Vehicle'} •{' '}
                      {driverDetails?.regNo || 'Reg No'}
                    </Text>
                  </View>
                  <View style={styles.driverAdditionalInfo}>
                    <View style={styles.infoItem}>
                      <Icon source="car" size={12} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {driverDetails?.vehicleType || 'Vehicle Type'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon source="weight" size={12} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {driverDetails?.capacity || 'Capacity'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon source="check-circle" size={12} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {driverDetails?.tripsCompleted || 0} trips
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Trip Details */}
            <View style={styles.tripDetailsSection}>
              <Text style={styles.sectionLabel}>Trip Details</Text>
              <View style={styles.tripDetailsCard}>
                <View style={styles.locationDetail}>
                  <View style={[styles.locationIcon, styles.pickupIcon]}>
                    <Icon source="map-marker" size={16} color="#10B981" />
                  </View>
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationDetailTitle}>Pickup</Text>
                    <Text
                      style={styles.locationDetailAddress}
                      numberOfLines={2}
                    >
                      {originAddress || 'Pickup location'}
                    </Text>
                  </View>
                </View>
                <View style={styles.locationDetail}>
                  <View style={[styles.locationIcon, styles.dropoffIcon]}>
                    <Icon source="flag-checkered" size={16} color="#EF4444" />
                  </View>
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationDetailTitle}>Drop-off</Text>
                    <Text
                      style={styles.locationDetailAddress}
                      numberOfLines={2}
                    >
                      {destinationAddress || 'Drop-off location'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onCallDriver}
            >
              <Icon source="phone" size={18} color="#2D3748" />
              <Text style={styles.secondaryButtonText}>Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onMessageDriver}
            >
              <Icon source="message-text" size={18} color="#2D3748" />
              <Text style={styles.secondaryButtonText}>Message</Text>
            </TouchableOpacity>

            {!otpVerified && !tripStarted && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOtpVerification}
              >
                <Text style={styles.primaryButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
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
  mapSection: {
    padding: 20,
    paddingBottom: 0,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  map: {
    height: 200,
    width: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  originMarker: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
  },
  destinationMarker: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  driverMarker: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
  },
  markerLabel: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  driverLabel: {
    backgroundColor: '#3B82F6',
  },
  markerLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tripProgressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
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
  driverSection: {
    marginBottom: 16,
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
    alignItems: 'flex-start',
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
  driverAdditionalInfo: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  tripDetailsSection: {
    marginBottom: 8,
  },
  tripDetailsCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  pickupIcon: {
    backgroundColor: '#D1FAE5',
  },
  dropoffIcon: {
    backgroundColor: '#FEE2E2',
  },
  locationTexts: {
    flex: 1,
  },
  locationDetailTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  locationDetailAddress: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 18,
  },
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
});

export default TripStartModal;
