import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Icon } from 'react-native-paper';

interface Props {
  visible: boolean;
  fadeAnim: Animated.Value;
  onClose: () => void;
  driverLocation: {
    latitude: number;
    longitude: number;
  };
  driverDetails: any;
  driverAlertData: any;
  otpVerified: boolean;
  tripStarted: boolean;
}

const DriverArrivalModal: React.FC<Props> = ({
  visible,
  fadeAnim,
  onClose,
  driverLocation,
  driverDetails,
  driverAlertData,
  otpVerified,
  tripStarted,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
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
            <View>
              <Text style={styles.title}>Driver Arrived</Text>
              <Text style={styles.subTitle}>
                {driverDetails?.name} • {driverDetails?.vehicle}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Icon source="close" size={20} />
            </TouchableOpacity>
          </View>

          {/* Mini Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={driverLocation}>
                <View style={styles.driverMarker}>
                  <Icon source="car" size={18} color="#fff" />
                </View>
              </Marker>
            </MapView>
          </View>

          {/* Trip Info */}
          <View style={styles.info}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Origin: </Text>
              {driverAlertData?.allData?.[0]?.Origin}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Destination: </Text>
              {driverAlertData?.allData?.[0]?.Destination}
            </Text>
          </View>

          {/* OTP */}
          {!otpVerified && !tripStarted && (
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>Trip OTP</Text>
              <Text style={styles.otpCode}>
                {driverAlertData?.allData?.[0]?.verification_code}
              </Text>
            </View>
          )}

          {/* Call Button */}
          <TouchableOpacity style={styles.callBtn}>
            <Icon source="phone" size={18} color="#fff" />
            <Text style={styles.callText}>Call Driver</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  subTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  /* ---------- MAP ---------- */
  mapContainer: {
    height: 160,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  map: {
    flex: 1,
  },

  driverMarker: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* ---------- INFO ---------- */
  info: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },

  label: {
    fontWeight: '600',
    color: '#374151',
  },

  /* ---------- OTP ---------- */
  otpBox: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  otpLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  otpCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 4,
  },

  /* ---------- ACTION ---------- */
  callBtn: {
    margin: 20,
    marginTop: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  callText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DriverArrivalModal;
