import { ActiveTrip } from '@api/ApiResponseType';
import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TripCard: React.FC<{
  trip: ActiveTrip;
  onPress: (trip: any) => void;
}> = ({ trip, onPress }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  // Extract just the numeric part of the ID
  const getShortId = (id: string) => {
    return id.substring(2);
  };

  return (
    <Card style={localStyles.card} onPress={() => onPress(trip)} elevation={2}>
      <Card.Content style={localStyles.cardContent}>
        {/* Header with ID and Status */}
        <View style={localStyles.cardHeader}>
          <View style={localStyles.idContainer}>
            <MaterialIcons
              name="local-shipping"
              size={18}
              color={colors.primary}
            />
            <Title style={localStyles.tripId}>
              #{getShortId(trip.LoadPostID || trip.CustomerPostID)}
            </Title>
          </View>

          {/* Status Badge */}
          <View
            style={[
              localStyles.statusBadge,
              {
                backgroundColor:
                  trip.tripStatus === 'Active'
                    ? colors.success
                    : colors.warning,
              },
            ]}
          >
            <MaterialIcons
              name="circle"
              size={8}
              color={colors.surface}
              style={localStyles.statusIcon}
            />
            <Paragraph style={localStyles.statusText}>
              {trip.tripStatus || 'Pending'}
            </Paragraph>
          </View>
        </View>

        {/* Route Information */}
        <View style={localStyles.routeContainer}>
          <View style={localStyles.routePoint}>
            <View style={localStyles.originDot} />
            <Paragraph style={localStyles.routeText} numberOfLines={1}>
              {trip.Origin || 'Origin not specified'}
            </Paragraph>
          </View>
          <View style={localStyles.routeLine} />
          <View style={localStyles.routePoint}>
            <View style={localStyles.destinationDot} />
            <Paragraph style={localStyles.routeText} numberOfLines={1}>
              {trip.Destination || 'Destination not specified'}
            </Paragraph>
          </View>
        </View>

        {/* Details Row */}
        <View style={localStyles.detailsRow}>
          {/* Vehicle Info */}
          <View style={localStyles.detailItem}>
            <MaterialIcons
              name="directions-car"
              size={14}
              color={colors.textPrimary}
            />
            <Paragraph style={localStyles.detailText} numberOfLines={1}>
              {trip.VehicleType || 'N/A'}
            </Paragraph>
          </View>

          {/* Driver Info */}
          <View style={localStyles.detailItem}>
            <MaterialIcons name="person" size={14} color={colors.textPrimary} />
            <Paragraph style={localStyles.detailText} numberOfLines={1}>
              {trip.DriverID ? getShortId(trip.DriverID) : 'N/A'}
            </Paragraph>
          </View>

          {/* Weight Info */}
          <View style={localStyles.detailItem}>
            <MaterialIcons
              name="fitness-center"
              size={14}
              color={colors.textPrimary}
            />
            <Paragraph style={localStyles.detailText} numberOfLines={1}>
              {trip.Weight || 'N/A'}
            </Paragraph>
          </View>
        </View>

        {/* Additional Info Row */}
        <View style={localStyles.detailsRow}>
          {/* Cargo Info */}
          <View style={localStyles.detailItem}>
            <MaterialIcons
              name="inventory"
              size={14}
              color={colors.textPrimary}
            />
            <Paragraph style={localStyles.detailText} numberOfLines={1}>
              {trip.CargoContent || 'N/A'}
            </Paragraph>
          </View>

          {/* Date Info */}
          <View style={localStyles.detailItem}>
            <MaterialIcons
              name="access-time"
              size={14}
              color={colors.textPrimary}
            />
            <Paragraph style={localStyles.detailText} numberOfLines={1}>
              {trip.PostInsertDate
                ? formatDate(trip.PostInsertDate).split(',')[0]
                : 'N/A'}
            </Paragraph>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const localStyles = StyleSheet.create({
  card: {
    marginHorizontal: wp(16),
    marginVertical: hp(6),
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
  },
  cardContent: {
    paddingVertical: hp(12),
    paddingHorizontal: wp(14),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(10),
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripId: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.backgroundDarkBlue,
    marginLeft: wp(5),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
    borderRadius: 10,
  },
  statusIcon: {
    marginRight: wp(3),
  },
  statusText: {
    fontSize: 11,
    color: colors.surface,
    fontWeight: '600',
    includeFontPadding: false,
  },
  routeContainer: {
    marginBottom: hp(12),
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  originDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: wp(6),
  },
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: wp(6),
  },
  routeLine: {
    width: 1,
    height: 8,
    backgroundColor: colors.backgroundDark,
    marginLeft: wp(3),
    marginBottom: hp(2),
  },
  routeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(6),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(8),
  },
  detailText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: wp(4),
    flexShrink: 1,
  },
});

export default TripCard;
