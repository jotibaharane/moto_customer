import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

const ProcessTripCard = ({ trip, onPress }: { trip: any; onPress: any }) => {
  // Determine status color based on trip status
  const getStatusColor = () => {
    const status = trip.tripStatus || trip.CustomerStatus || '';

    if (status.includes('Pending') || status.includes('Waiting'))
      return colors.warning;
    if (status.includes('Process') || status.includes('Active'))
      return colors.info;
    if (status.includes('Complete') || status.includes('Success'))
      return colors.success;
    if (status.includes('Cancel') || status.includes('Reject'))
      return colors.error;

    return colors.primary;
  };

  // Get appropriate icon based on status
  const getStatusIcon = () => {
    const status = trip.tripStatus || trip.CustomerStatus || '';

    if (status.includes('Pending') || status.includes('Waiting'))
      return 'clock-alert';
    if (status.includes('Process') || status.includes('Active'))
      return 'progress-clock';
    if (status.includes('Complete') || status.includes('Success'))
      return 'check-circle';
    if (status.includes('Cancel') || status.includes('Reject'))
      return 'close-circle';

    return 'truck';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Extract location details
  const getOriginDetails = () => {
    const parts = trip.Origin.split(',');
    return parts.length > 1 ? `${parts[0]}, ${parts[1]}` : trip.Origin;
  };

  const getDestinationDetails = () => {
    const parts = trip.Destination.split(',');
    return parts.length > 1 ? `${parts[0]}, ${parts[1]}` : trip.Destination;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Header with route and status */}
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <View style={styles.locationRow}>
            <View style={[styles.markerDot, styles.originDot]} />
            <Text style={styles.originText} numberOfLines={1}>
              {getOriginDetails()}
            </Text>
          </View>

          <View style={styles.arrowSeparator}>
            <View style={styles.arrowLine} />
            <IconButton
              icon="arrow-right"
              size={12}
              iconColor={colors.primary}
              style={styles.arrowIcon}
            />
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.markerDot, styles.destinationDot]} />
            <Text style={styles.destinationText} numberOfLines={1}>
              {getDestinationDetails()}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor()}15` },
          ]}
        >
          <IconButton
            icon={getStatusIcon()}
            size={12}
            iconColor={getStatusColor()}
            style={styles.statusIcon}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor() }]}
            numberOfLines={1}
          >
            {trip.tripStatus || trip.CustomerStatus}
          </Text>
        </View>
      </View>

      {/* Trip details in compact grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <IconButton
            icon="truck"
            size={14}
            iconColor={colors.primary}
            style={styles.detailIcon}
          />
          <View>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {trip.VehicleType}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <IconButton
            icon="weight"
            size={14}
            iconColor={colors.primary}
            style={styles.detailIcon}
          />
          <View>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{trip.Weight}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <IconButton
            icon="package-variant"
            size={14}
            iconColor={colors.primary}
            style={styles.detailIcon}
          />
          <View>
            <Text style={styles.detailLabel}>Cargo</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {trip.CargoContent}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <IconButton
            icon="calendar"
            size={14}
            iconColor={colors.primary}
            style={styles.detailIcon}
          />
          <View>
            <Text style={styles.detailLabel}>Posted</Text>
            <Text style={styles.detailValue}>
              {formatDate(trip.PostInsertDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Verification Code (if available) */}
      {trip.verification_code && (
        <View style={styles.verificationContainer}>
          <IconButton
            icon="shield-check"
            size={14}
            iconColor={colors.primary}
            style={styles.detailIcon}
          />
          <View>
            <Text style={styles.detailLabel}>Verification Code</Text>
            <Text style={styles.verificationCode}>
              {trip.verification_code}
            </Text>
          </View>
        </View>
      )}

      {/* Footer with price and action */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimated Price</Text>
          <Text style={styles.priceValue}>${trip.BidAmount || '1,200'}</Text>
        </View>

        <View style={styles.actionContainer}>
          <Text style={styles.viewDetailsText}>Navigate</Text>
          <View style={styles.arrowCircle}>
            <IconButton
              icon="chevron-right"
              size={14}
              iconColor={colors.surface}
              style={styles.actionIcon}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: wp(12),
    padding: wp(12),
    marginBottom: hp(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.textPrimary + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(8),
  },
  routeContainer: {
    flex: 1,
    marginRight: wp(8),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  markerDot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(6),
  },
  originDot: {
    backgroundColor: colors.primary,
  },
  destinationDot: {
    backgroundColor: colors.success,
  },
  originText: {
    fontSize: wp(13),
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  destinationText: {
    fontSize: wp(13),
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  arrowSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2),
    marginLeft: wp(5),
  },
  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textPrimary + '40',
  },
  arrowIcon: {
    margin: 0,
    marginHorizontal: wp(4),
    backgroundColor: colors.surface,
    borderRadius: wp(10),
    width: wp(20),
    height: wp(20),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: wp(16),
    marginLeft: wp(6),
  },
  statusIcon: {
    margin: 0,
    marginRight: wp(2),
  },
  statusText: {
    fontSize: wp(10),
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(8),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: hp(6),
  },
  detailIcon: {
    margin: 0,
    marginRight: wp(4),
    width: wp(24),
    height: wp(24),
  },
  detailLabel: {
    fontSize: wp(10),
    color: colors.textSecondary,
    marginBottom: hp(1),
    fontWeight: '500',
  },
  detailValue: {
    fontSize: wp(11),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(8),
    paddingTop: hp(6),
    borderTopWidth: 1,
    borderTopColor: colors.textPrimary + '20',
  },
  verificationCode: {
    fontSize: wp(12),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: wp(1),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.textPrimary + '20',
    paddingTop: hp(8),
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: wp(10),
    color: colors.textSecondary,
    marginBottom: hp(1),
    fontWeight: '500',
  },
  priceValue: {
    fontSize: wp(14),
    fontWeight: '800',
    color: colors.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: wp(11),
    color: colors.primary,
    fontWeight: '600',
    marginRight: wp(6),
  },
  arrowCircle: {
    backgroundColor: colors.primary,
    borderRadius: wp(14),
    width: wp(24),
    height: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    margin: 0,
  },
});

export default ProcessTripCard;
