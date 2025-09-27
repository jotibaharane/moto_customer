import { BlurView } from '@react-native-community/blur';
import colors from '@utils/colors';
import { fontSize, hp, wp } from '@utils/responsive';
import React, { useEffect } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoadConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loadDetails: {
    driverName: string;
    driverRating: number;
    vehicleType: string;
    licensePlate: string;
    pickupLocation: string;
    dropoffLocation: string;
    distance: string;
    estimatedFare: string;
    estimatedTime: string;
  };
}

const LoadConfirmationModal: React.FC<LoadConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  loadDetails,
}) => {
  const slideAnim = React.useRef(new Animated.Value(hp(100))).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values when modal becomes visible
      slideAnim.setValue(hp(100));
      fadeAnim.setValue(0);

      // Start entrance animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    Animated.timing(slideAnim, {
      toValue: hp(100),
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onConfirm();
    });
  };

  const handleCancel = () => {
    Animated.timing(slideAnim, {
      toValue: hp(100),
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onCancel();
    });
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={wp(14)}
          color={i <= rating ? colors.warning : colors.textSecondary}
          style={{ marginRight: wp(2) }}
        />,
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      {/* Blur Background */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={10}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.androidBackdrop]} />
      )}

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Load Confirmation</Text>
            <Text style={styles.headerSubtitle}>
              A driver has accepted your load request
            </Text>
          </View>

          {/* Driver Information */}
          <View style={styles.driverSection}>
            <View style={styles.driverHeader}>
              <View style={styles.avatarContainer}>
                <Icon name="account" size={wp(24)} color={colors.primary} />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{loadDetails.driverName}</Text>
                {renderStars(loadDetails.driverRating)}
                <View style={styles.driverMeta}>
                  <Text style={styles.driverMetaText}>
                    {loadDetails.vehicleType}
                  </Text>
                  <Text style={styles.driverMetaText}>•</Text>
                  <Text style={styles.driverMetaText}>
                    {loadDetails.licensePlate}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Route Information */}
          <View style={styles.routeSection}>
            <View style={styles.routeLine}>
              <View style={styles.routeDotStart}>
                <View style={styles.innerDot} />
              </View>
              <View style={styles.routePath} />
              <View style={styles.routeDotEnd}>
                <Icon name="flag" size={wp(12)} color={colors.textOnPrimary} />
              </View>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.routeDetail}>
                <Text style={styles.routeText} numberOfLines={2}>
                  {loadDetails.pickupLocation}
                </Text>
              </View>
              <View style={styles.routeDetail}>
                <Text style={styles.routeText} numberOfLines={2}>
                  {loadDetails.dropoffLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon
                name="road-variant"
                size={wp(18)}
                color={colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{loadDetails.distance}</Text>
            </View>

            <View style={styles.detailItem}>
              <Icon
                name="clock-outline"
                size={wp(18)}
                color={colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Est. Time</Text>
              <Text style={styles.detailValue}>
                {loadDetails.estimatedTime}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Icon
                name="currency-inr"
                size={wp(18)}
                color={colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Fare</Text>
              <Text style={styles.detailValue}>
                {loadDetails.estimatedFare}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
              activeOpacity={0.8}
            >
              <Icon
                name="check"
                size={wp(20)}
                color={colors.textOnPrimary}
                style={styles.buttonIcon}
              />
              <Text style={styles.confirmButtonText}>Confirm Load</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(16),
  },
  androidBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: wp(20),
    padding: wp(24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(20),
  },
  headerTitle: {
    fontSize: fontSize(20),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: hp(4),
  },
  headerSubtitle: {
    fontSize: fontSize(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  driverSection: {
    marginBottom: hp(24),
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(16),
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: hp(4),
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: hp(4),
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverMetaText: {
    fontSize: fontSize(12),
    color: colors.textSecondary,
    marginRight: wp(4),
  },
  routeSection: {
    flexDirection: 'row',
    marginBottom: hp(24),
  },
  routeLine: {
    width: wp(30),
    alignItems: 'center',
    marginRight: wp(12),
  },
  routeDotStart: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: colors.success + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: colors.success,
  },
  routePath: {
    width: wp(2),
    flex: 1,
    backgroundColor: colors.divider,
    marginVertical: hp(4),
  },
  routeDotEnd: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeDetail: {
    paddingVertical: hp(2),
  },
  routeText: {
    fontSize: fontSize(14),
    color: colors.textPrimary,
    lineHeight: hp(20),
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(24),
    paddingHorizontal: wp(8),
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize(12),
    color: colors.textSecondary,
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  detailValue: {
    fontSize: fontSize(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: hp(14),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize(16),
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: hp(14),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  confirmButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize(16),
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: wp(6),
  },
});

export default LoadConfirmationModal;
