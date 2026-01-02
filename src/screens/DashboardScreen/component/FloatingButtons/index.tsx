import {
  useGetActiveTripsMutation,
  useGetCustomerPostsQuery,
  useGetProcessTripsQuery,
} from '@api/hooks_api';
import { RootState } from '@store/index';
import {
  addOrUpdateDriver,
  resetMap,
  selectDriver,
  setCustomerMap,
  setDestination,
  setDestinationAddress,
  setOrigin,
  setOriginAddress,
  setPostId,
} from '@store/slices/mapSlice';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import ActiveTripsModal from '../ActiveTripsModal';
import LoadPostModal from '../LoadPostModal';
import ProcessTripsModal from '../ProcessTripsModal';
import { ProcessTripsModalRef } from '../ProcessTripsModal/helper';
import {
  colors,
  DASHBOARD_BUTTONS,
  DashboardButton as DashboardButtonProp,
  hp,
  wp,
} from './helper';

// Individual Button Component
interface DashboardButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  isActive: boolean;
  animation: Animated.Value;
  index: number;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  icon,
  label,
  color,
  onPress,
  isActive,
  animation,
  index,
}) => {
  const scaleAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const opacityAnim = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const translateYAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60 * (index + 1), 0],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[buttonStyles.buttonContainer, animatedStyle]}>
      <TouchableOpacity
        style={[buttonStyles.button, isActive && buttonStyles.buttonActive]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={buttonStyles.buttonContent}>
          <View
            style={[buttonStyles.iconContainer, { backgroundColor: color }]}
          >
            <IconButton
              icon={icon}
              size={18}
              iconColor={colors.surface}
              style={buttonStyles.icon}
            />
          </View>
          <Text
            style={[buttonStyles.label, isActive && buttonStyles.labelActive]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
// ===== DUMMY DATA =====
const DUMMY_LOAD_POSTS = {
  data: [
    {
      LoadPostID: 'LP001',
      PickupLat: 28.6139,
      PickupLng: 77.209,
      PickupAddress: 'Connaught Place, New Delhi',
      DeliveryLat: 28.4595,
      DeliveryLng: 77.0266,
      DeliveryAddress: 'Gurgaon, Haryana',
    },
  ],
};

const DUMMY_ACTIVE_TRIPS = {
  data: [
    {
      LoadPostID: 'AT001',
      PickupLat: 19.076,
      PickupLng: 72.8777,
      PickupAddress: 'Mumbai CST',
      DeliveryLat: 18.5204,
      DeliveryLng: 73.8567,
      DeliveryAddress: 'Pune',
      DriverLat: 19.12,
      DriverLng: 72.88,
      DriverID: 'DRV123',
      VehicleNumber: 'MH12AB1234',
      Destination_Lat: 18.5204,
      Destination_Lng: 73.8567,
    },
  ],
};

const DUMMY_PROCESS_TRIPS = {
  data: [
    {
      LoadPostID: 'PT001',
      Origin_Lat: 12.9716,
      Origin_Lng: 77.5946,
      Origin: 'Bangalore',
      Destination_Lat: 13.0827,
      Destination_Lng: 80.2707,
      Destination: 'Chennai',
      DriverLat: 12.98,
      DriverLng: 77.6,
      DriverID: 'DRV999',
    },
  ],
};

// Main Floating Action Button Component
export const FloatingActionButton = () => {
  const dispatch = useDispatch();
  const modalRef = useRef<any>(null);
  const CustomerID = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID || '',
  );

  const [getActiveTrips, { data: activeTrips }] = useGetActiveTripsMutation();
  const { data: customerPosts } = useGetCustomerPostsQuery(
    { CustomerID },
    { skip: !CustomerID },
  );
  console.log('Customer Posts:', activeTrips);
  console.log({ customerPosts });
  const {
    data: processTrips,
    isFetching,
    refetch,
  } = useGetProcessTripsQuery({ CustomerID });
  console.log({ customerPosts });
  const activeTripsModalRef = useRef<ProcessTripsModalRef>(null);
  const processTripsModalRef = useRef<ProcessTripsModalRef>(null);

  const [isOpen, setIsOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;
  const loadPostData = customerPosts ?? DUMMY_LOAD_POSTS;
  const activeTripsData = activeTrips ?? DUMMY_ACTIVE_TRIPS;
  const processTripsData = processTrips ?? DUMMY_PROCESS_TRIPS;
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleButtonPress = (button: DashboardButtonProp) => {
    toggleMenu();
    dispatch(resetMap());

    console.log({ id: button?.id });
    if (button?.id === 'load-posts') {
      dispatch(setCustomerMap('Load'));

      dispatch(addOrUpdateDriver([]));
      dispatch(
        setPostId(
          customerPosts?.data?.[0]?.LoadPostID ||
            loadPostData?.data?.[0]?.LoadPostID ||
            '',
        ),
      );
      dispatch(
        setOrigin({
          latitude:
            customerPosts?.data?.[0]?.PickupLat ||
            loadPostData?.data?.[0]?.PickupLat,
          longitude:
            customerPosts?.data?.[0]?.PickupLng ||
            loadPostData?.data?.[0]?.PickupLng,
        }),
      );
      dispatch(
        setOriginAddress(
          customerPosts?.data?.[0]?.PickupAddress ||
            loadPostData?.data?.[0]?.PickupAddress ||
            '',
        ),
      );
      dispatch(
        setDestinationAddress(
          customerPosts?.data?.[0]?.DeliveryAddress ||
            loadPostData?.data?.[0]?.DeliveryAddress ||
            '',
        ),
      );
      dispatch(setDestination(null));

      modalRef.current?.open();
    } else if (button?.id === 'active-trips') {
      dispatch(addOrUpdateDriver([]));
      dispatch(setCustomerMap('Active'));
      dispatch(
        setPostId(
          activeTrips?.data?.[0]?.LoadPostID ||
            activeTripsData?.data?.[0]?.LoadPostID,
        ),
      );
      dispatch(
        setOrigin({
          latitude:
            activeTrips?.data?.[0]?.PickupLat ||
            activeTripsData?.data?.[0]?.PickupLat,
          longitude:
            activeTrips?.data?.[0]?.PickupLng ||
            activeTripsData?.data?.[0]?.PickupLng,
        }),
      );
      dispatch(
        setOriginAddress(
          activeTrips?.data?.[0]?.PickupAddress ||
            activeTripsData?.data?.[0]?.PickupAddress,
        ),
      );
      dispatch(
        setDestinationAddress(
          activeTrips?.data?.[0]?.DeliveryAddress ||
            activeTripsData?.data?.[0]?.DeliveryAddress,
        ),
      );
      dispatch(
        selectDriver({
          latitude:
            activeTrips?.data?.[0]?.DriverLat ||
            activeTripsData?.data?.[0]?.DriverLat,
          longitude:
            activeTrips?.data?.[0]?.DriverLng ||
            activeTripsData?.data?.[0]?.DriverLng,
          available: true,
          driver:
            activeTrips?.data?.[0]?.DriverID ||
            activeTripsData?.data?.[0]?.DriverID,
          id:
            activeTrips?.data?.[0]?.DriverID ||
            activeTripsData?.data?.[0]?.DriverID,
          licensePlate:
            activeTrips?.data?.[0]?.VehicleNumber ||
            activeTripsData?.data?.[0]?.VehicleNumbe,
          type: 'medium',
          rotation: 0,
        }),
      );
      dispatch(
        setDestination({
          latitude: activeTrips?.data?.[0]?.Destination_Lat || 0,
          longitude: activeTrips?.data?.[0]?.Destination_Lng || 0,
        }),
      );

      activeTripsModalRef.current?.open();
    } else if (button?.id === 'process-trips') {
      dispatch(addOrUpdateDriver([]));
      dispatch(setCustomerMap('Process'));
      dispatch(
        setPostId(
          processTrips?.data?.[0]?.LoadPostID ||
            processTripsData?.data?.[0]?.LoadPostID,
        ),
      );
      dispatch(
        setOrigin({
          latitude:
            processTrips?.data?.[0]?.Origin_Lat ||
            processTripsData?.data?.[0]?.Origin_Lat,
          longitude:
            processTrips?.data?.[0]?.Origin_Lng ||
            processTripsData?.data?.[0]?.Origin_Lng,
        }),
      );
      dispatch(
        setOriginAddress(
          processTrips?.data?.[0]?.Origin ||
            processTripsData?.data?.[0]?.Origin ||
            '',
        ),
      );
      dispatch(
        setDestinationAddress(
          processTrips?.data?.[0]?.Destination ||
            processTripsData?.data?.[0]?.Destination ||
            '',
        ),
      );
      if (
        (processTrips?.data?.[0]?.DriverLat &&
          processTrips?.data?.[0]?.DriverLng) ||
        (processTripsData?.data?.[0]?.DriverLat &&
          processTripsData?.data?.[0]?.DriverLng)
      ) {
        dispatch(
          selectDriver({
            latitude:
              processTrips?.data?.[0].DriverLat ||
              processTripsData?.data?.[0].DriverLat,
            longitude:
              processTrips?.data?.[0].DriverLng ||
              processTripsData?.data?.[0].DriverLng,
            available: true,
            driver:
              processTrips?.data?.[0].DriverID ||
              processTripsData?.data?.[0].DriverID,
            id:
              processTrips?.data?.[0].DriverID ||
              processTripsData?.data?.[0].DriverID,
            licensePlate:
              processTrips?.data?.[0].VehicleNumber ||
              processTripsData?.data?.[0].VehicleNumber,
            type: 'medium',
            rotation: 0,
          }),
        );
      }
      dispatch(
        setDestination({
          latitude:
            processTrips?.data?.[0]?.Destination_Lat ||
            processTripsData?.data?.[0]?.Destination_Lat,
          longitude:
            processTrips?.data?.[0]?.Destination_Lng ||
            processTripsData?.data?.[0]?.Destination_Lng,
        }),
      );

      processTripsModalRef.current?.open();
    }
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  useLayoutEffect(() => {
    getActiveTrips({ CustomerID });
  }, []);

  return (
    <>
      <View style={buttonStyles.container}>
        {isOpen && (
          <View style={buttonStyles.buttonsContainer}>
            <Animated.View
              style={[
                buttonStyles.titleContainer,
                {
                  opacity: animation,
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={buttonStyles.title}>Quick Actions</Text>
            </Animated.View>
            {DASHBOARD_BUTTONS.map((button, index) => (
              <DashboardButton
                key={button.id}
                icon={button.icon}
                label={button.label}
                color={button.color}
                onPress={() => handleButtonPress(button)}
                isActive={false}
                animation={animation}
                index={index}
              />
            ))}
          </View>
        )}

        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <TouchableOpacity
            style={buttonStyles.mainButton}
            onPress={toggleMenu}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Toggle action menu"
          >
            <IconButton
              icon={isOpen ? 'close' : 'plus'}
              size={24}
              iconColor={colors.surface}
              style={buttonStyles.mainIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      <LoadPostModal ref={modalRef} />
      <ProcessTripsModal ref={processTripsModalRef} />
      <ActiveTripsModal ref={activeTripsModalRef} />
    </>
  );
};

// Enhanced Styles
const buttonStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(15),
    right: wp(5),
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  buttonsContainer: {
    alignItems: 'flex-end',
    marginBottom: hp(2),
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: wp(50),
    minWidth: wp(20),
  },
  titleContainer: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: hp(1.5),
    alignSelf: 'center',
  },
  title: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: colors.backgroundDarker,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginVertical: hp(0.8),
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 12,
    width: '100%',
  },
  buttonActive: {
    backgroundColor: '#F3F4F6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    margin: 0,
  },
  label: {
    fontSize: wp(3.8),
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  labelActive: {
    color: colors.backgroundDarker,
    fontWeight: '700',
  },
  mainButton: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainIcon: {
    margin: 0,
  },
});
