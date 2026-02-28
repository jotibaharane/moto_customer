import { ShipmentData } from '@api/api.type';
import {
  useGetAproximateWeightQuery,
  useGetTruckTypemutationMutation,
  useGetVehicleTypesQuery,
  // useGetBodyTypeQuery,
  useGetBodytypesQuery,
  useGetdhalalengthQuery,
} from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropModal, { DropModalRef } from '../DropModal';
import PickupModal, { PickupModalRef } from '../PickupModal';
import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import { useDebounce } from '@utils/debounce';
import { useSnackbar } from '../../../../errorhandler/snackbar/SnackbarProvider';
// Dhala Length options
const DHALA_LENGTHS = [
  { label: '18 ft', value: '18' },
  { label: '20 ft', value: '20' },
  { label: '22 ft', value: '22' },
  { label: '24 ft', value: '24' },
  { label: '28 ft', value: '28' },
  { label: '32 ft', value: '32' },
];

const DHALA_LENGTH_OPTIONS = DHALA_LENGTHS.map(item => ({
  id: item.value,
  label: item.label,
}));
// Body Type options with images
const BODY_TYPES = [
  {
    label: 'Close with Tarpaulin',
    value: 'close_tarpaulin',
    // image: require('@assets/images/close_tarpaulin.png'), // Add your image paths
    description: 'Closed body with tarpaulin cover',
  },
  {
    label: 'Close Body Container',
    value: 'close_body_container',
    // image: require('@assets/images/close_body_container.png'),
    description: 'Fully enclosed container',
  },
  {
    label: 'Open Body',
    value: 'open_body',
    // image: require('@assets/images/open_body.png'),
    description: 'Open body truck',
  },
  {
    label: 'Open Platform',
    value: 'open_platform',
    // image: require('@assets/images/open_platform.png'),
    description: 'Flat platform without sides',
  },
];

const FirstStep: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation();
  const pickupModalRef = useRef<PickupModalRef>(null);
  const dropModalRef = useRef<DropModalRef>(null);
  const vehicleModalRef = useRef<SelectionModalRef>(null);
  const dhalaLengthModalRef = useRef<SelectionModalRef>(null);
  const bodyTypeModalRef = useRef<SelectionModalRef>(null);

  const { values, errors, setFieldValue, touched } =
    useFormikContext<ShipmentData>();

  console.log(values, errors, touched);

  // const [getTruck, { data: truckTypesData }] =
  //   useGetTruckTypemutationMutation();

  useLayoutEffect(() => {
    // getTruck();
  }, [navigation]);

  const BODY_TYPE_OPTIONS = BODY_TYPES.map(type => ({
    id: type.value, // "open_body"
    label: type.label, // "Open Body"
    image: type.image,
    description: type.description,
  }));

  const rawWeightRange = values.vehicle.approximateWeightKg;
  const debouncedWeightRange = useDebounce(rawWeightRange, 600);
  const vehicleType = values.vehicle.vehicleType;
  const BodyType = values.load?.bodyType;

  const vehicleQueryParams = useMemo(() => {
    if (!debouncedWeightRange) return null;

    return {
      weightRange: debouncedWeightRange,
      // ...(values.vehicle.vehicleType && {
      //   vehicleType: values.vehicle.vehicleType,
      // }),
      // ...(values.load?.bodyType && {
      //   bodyType: values.load.bodyType,
      // }),
    };
  }, [debouncedWeightRange]);

  const { data, currentData, isError } = useGetVehicleTypesQuery(
    vehicleQueryParams,
    {
      skip: !vehicleQueryParams,
    },
  );
  const vehicleTypesData = currentData ?? data;

  const { data: bodytypedata } = useGetBodytypesQuery({
    weightRange: rawWeightRange,
    vehicleType,
  });

  const { data: dhalalength, originalArgs } = useGetdhalalengthQuery({
    weightRange: rawWeightRange,
    vehicleType,
    BodyType,
  });
  console.log(
    '____',
    // bodytypedata,
    // vehicleTypesData,
    // originalArgs,
    dhalalength,
    originalArgs,
  );
  useEffect(() => {
    if (isError) {
      showSnackbar(
        `Something went wrong (${error?.originalStatus ?? 'Unknown'})`,
        { variant: 'error' },
      );
    }
  }, [isError]);

  // if (error)
  //   return (
  //     <>s
  //       {' '}
  //       <Snackbar
  //         visible={visible}
  //         onDismiss={onDismissSnackBar}
  //         action={{
  //           label: 'Undo',
  //           onPress: () => {
  //             onToggleSnackBar();
  //             // Do something
  //           },
  //         }}
  //       >
  //         {error?.originalStatus}
  //       </Snackbar>
  //     </>
  //   );

  const vehicleOptions = useMemo(() => {
    const options =
      vehicleTypesData?.data
        ?.filter(item => item.VehicleType)
        .map(item => ({
          id: item.VehicleType,
          label: item.VehicleType,
          image: item.img,
        })) ?? [];

    // 🔐 keep selected vehicle
    if (
      values.vehicle.vehicleType &&
      !options.some(o => o.id === values.vehicle.vehicleType)
    ) {
      options.unshift({
        id: values.vehicle.vehicleType,
        label: values.vehicle.vehicleType,
      });
    }

    return options;
  }, [vehicleTypesData, values.vehicle.vehicleType]);

  console.log({ vehicleOptions });
  // const bodyTypeOptions = useMemo(() => {
  //   if (!vehicleTypesData?.data || !values.vehicle.vehicleType) return [];

  //   return vehicleTypesData.data
  //     .filter(v => v.VehicleType === values.vehicle.vehicleType)
  //     .map(v => ({
  //       id: v.BodyType,
  //       label: v.BodyType,
  //       image: v.img,
  //     }));
  // }, [vehicleTypesData, values.vehicle.vehicleType]);

  // Truck type - filtered by approximate weight
  // const truckTypes = useMemo(() => {
  //   const weight = parseInt(values.vehicle.approximateWeightKg) || 0;

  //   if (!truckTypesData?.data) return [];

  //   // Filter truck types based on weight capacity
  //   return truckTypesData.data
  //     .filter((truck: any) => {
  //       // Parse weight range from truck.WeightRange (e.g., "1-5 tons" or "1000-5000 kg")
  //       const weightRange = truck.WeightRange?.toLowerCase();
  //       if (!weightRange) return true;

  //       // Extract min and max weight
  //       const match = weightRange.match(/(\d+)\s*[-–]\s*(\d+)/);
  //       if (!match) return true;

  //       const minWeight = parseInt(match[1]);
  //       const maxWeight = parseInt(match[2]);

  //       // Check if weight is in range (convert tons to kg if needed)
  //       const isTons = weightRange.includes('ton');
  //       if (isTons) {
  //         const weightInTons = weight / 1000;
  //         return weightInTons >= minWeight && weightInTons <= maxWeight;
  //       }

  //       return weight >= minWeight && weight <= maxWeight;
  //     })
  //     .map((truck: any) => ({
  //       id: truck?.VehicleType?.toLowerCase()?.replace(' ', '-'),
  //       label: truck.VehicleType,
  //       image: { uri: truck?.img },
  //       description: truck.WeightRange,
  //       color: '#EF476F',
  //     }));
  // }, [truckTypesData, values.vehicle.approximateWeightKg]);

  // console.log(truckTypes, 'filtered trucktype');
  const selectedVehicle = useMemo(
    () =>
      vehicleTypesData?.data.find(
        v => v.VehicleType === values.vehicle.vehicleType,
      ),
    [vehicleTypesData, values.vehicle.vehicleType],
  );

  // console.log(
  //   '____',

  //   selectedVehicle,
  //   values.vehicle.vehicleType,
  //   vehicleTypesData,
  // );
  // Get selected dhala length label

  // Get selected body type label

  console.log({ selectedBodyType }, values.load.bodyType);

  const handleOpenVehicleModal = useCallback(
    () => vehicleModalRef.current?.open(),
    [],
  );

  const handleOpenPickupModal = useCallback(
    () => pickupModalRef.current?.open(),
    [],
  );

  const handleOpenDropModal = useCallback(
    () => dropModalRef.current?.open(),
    [],
  );

  const handleOpenDhalaLengthModal = useCallback(
    () => dhalaLengthModalRef.current?.open(),
    [],
  );

  const handleOpenBodyTypeModal = useCallback(
    () => bodyTypeModalRef.current?.open(),
    [],
  );

  const bodyTypeOptions = useMemo(() => {
    const options =
      bodytypedata?.data
        ?.filter(item => item.BodyType)
        .map(item => ({
          id: item.BodyType,
          label: item.BodyType,
          image: item.img, // 🔥 FIXED
        })) ?? [];

    if (
      values.load?.bodyType &&
      !options.some(o => o.id === values.load.bodyType)
    ) {
      options.unshift({
        id: values.load.bodyType,
        label: values.load.bodyType,
      });
    }

    return options;
  }, [bodytypedata, values.load?.bodyType]);

  const selectedBodyType = useMemo(() => {
    if (!values.load?.bodyType) return null;
    return bodyTypeOptions.find(item => item.id === values.load.bodyType);
  }, [bodyTypeOptions, values.load?.bodyType]);

  const dhalaLengthOptions = useMemo(() => {
    const options =
      dhalalength?.data
        ?.filter(item => item.DhalaLength)
        .map(item => ({
          id: item.DhalaLength,
          label: item.DhalaLength,
        })) ?? [];

    // keep selected value if already chosen
    if (
      values.load?.dhalaLength &&
      !options.some(o => o.id === values.load.dhalaLength)
    ) {
      options.unshift({
        id: values.load.dhalaLength,
        label: values.load.dhalaLength,
      });
    }

    return options;
  }, [dhalalength, values.load?.dhalaLength]);

  const selectedDhalaLength = useMemo(() => {
    if (!values.load?.dhalaLength) return null;
    return dhalaLengthOptions.find(item => item.id === values.load.dhalaLength);
  }, [dhalaLengthOptions, values.load?.dhalaLength]);

  console.log(
    '-------',
    { bodyTypeOptions },
    { vehicleOptions },
    { dhalaLengthOptions },
  );
  // Determine border colors based on errors + touched
  const pickupBorderColor =
    touched.pickup?.origin?.address && errors.pickup?.origin?.address
      ? '#ef4444'
      : '#d1d5db';
  const deliveryBorderColor =
    touched.delivery?.destination && errors.delivery?.destination
      ? '#ef4444'
      : '#d1d5db';
  const vehicleBorderColor =
    touched.vehicle?.vehicleType && errors.vehicle?.vehicleType
      ? '#ef4444'
      : values.vehicle.vehicleType
      ? '#EF476F'
      : '#d1d5db';
  const dhalaLengthBorderColor =
    touched.load?.dhalaLength && errors.load?.dhalaLength
      ? '#ef4444'
      : values.load?.dhalaLength
      ? '#4F46E5'
      : '#d1d5db';
  const bodyTypeBorderColor =
    touched.load?.bodyType && errors.load?.bodyType
      ? '#ef4444'
      : values.load?.bodyType
      ? '#10B981'
      : '#d1d5db';

  return (
    <KeyboardAvoidingView
      style={styles.compactContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        nestedScrollEnabled={true}
      >
        {/* Pickup */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-4 bg-blue-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Pickup Address
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`p-3 border-2  rounded-lg`,
              { borderColor: pickupBorderColor },
            ]}
            onPress={handleOpenPickupModal}
            activeOpacity={0.7}
          >
            {values.pickup.origin?.address ? (
              <View style={tw`flex-row justify-between items-start`}>
                <View style={tw`flex-1 mr-2`}>
                  {(values.pickup.contactName ||
                    values.pickup.contactNumber) && (
                    <Text
                      style={tw`text-sm text-gray-800 font-medium`}
                      numberOfLines={1}
                    >
                      {values.pickup.contactName &&
                        `${values.pickup.contactName}`}
                      {values.pickup.contactName &&
                        values.pickup.contactNumber &&
                        ' • '}
                      {values.pickup.contactNumber}
                    </Text>
                  )}
                  {values.pickup.companyName && (
                    <Text
                      style={tw`text-sm text-gray-800 font-medium`}
                      numberOfLines={1}
                    >
                      Company: {values.pickup.companyName}
                    </Text>
                  )}
                  {(values.pickup.plotOrBuilding ||
                    values.pickup.streetArea) && (
                    <Text
                      style={tw`text-sm text-gray-800 font-medium`}
                      numberOfLines={2}
                    >
                      {[values.pickup.plotOrBuilding, values.pickup.streetArea]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  )}
                  <Text
                    style={tw`text-sm text-gray-800 font-medium`}
                    numberOfLines={3}
                  >
                    {values.pickup.origin.address}
                  </Text>

                  {(values.pickup.pincode ||
                    values.pickup.state ||
                    values.pickup.district ||
                    values.pickup.taluka) && (
                    <Text
                      style={tw`text-sm text-gray-800 mt-1 font-medium`}
                      numberOfLines={3}
                    >
                      {[
                        values.pickup.pincode &&
                          `Pincode: ${values.pickup.pincode}`,
                        values.pickup.state,
                        values.pickup.district,
                        values.pickup.taluka,
                        //s `Alternate Contact: 7506122183`,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  )}
                  {values.pickup?.alternateNo && (
                    <Text style={tw`text-sm text-gray-800 mt-1 font-medium`}>
                      Alternate Contact: {values.pickup.alternateNo}
                    </Text>
                  )}
                </View>
                <Icon name="edit" size={16} color={tw.color('gray-500')} />
              </View>
            ) : (
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="add-location"
                  size={16}
                  color={tw.color('blue-500')}
                />
                <Text style={tw`ml-2 text-blue-500 text-sm`}>
                  Add Pickup Location
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.pickup?.origin && touched.pickup?.origin && (
            <Text style={styles.errorText}>
              {errors.pickup.origin as string}
            </Text>
          )}
        </View>

        {/* Delivery */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-4 bg-red-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Delivery Address
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`p-3 border-2  rounded-lg`,
              { borderColor: deliveryBorderColor },
            ]}
            onPress={handleOpenDropModal}
            activeOpacity={0.7}
          >
            {values.delivery.destination?.address ? (
              <View style={tw`flex-row rounded-lg`}>
                <View style={tw` flex-1`}>
                  <Text style={tw`text-sm text-gray-800 font-medium`}>
                    {values.delivery.consigneeName || 'Consignee'} {'*'}
                    {values.delivery.contactNumber || 'Consignee'}
                  </Text>

                  <Text style={tw`text-sm text-gray-800 font-medium`}>
                    {values.delivery.plotOrBuilding},{' '}
                    {values.delivery.streetArea}
                  </Text>
                  <Text style={tw`text-sm text-gray-800 font-medium `}>
                    {values.delivery.destination.address}
                  </Text>

                  <Text style={tw`text-sm text-gray-800 font-medium`}>
                    {values.delivery.district}, {values.delivery.state} -{' '}
                    {values.delivery.pincode}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleOpenDropModal}>
                  <Icon name="edit" size={20} color={tw.color('gray-500')} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="add-location-alt"
                  size={18}
                  color={tw.color('red-500')}
                />
                <Text style={tw`ml-2 text-red-500 text-sm`}>
                  Add Delivery Address
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.delivery?.destination && touched.delivery?.destination && (
            <Text style={styles.errorText}>
              {errors.delivery.destination as string}
            </Text>
          )}
        </View>

        {/* Approximate Weight Input */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`w-2 h-4 bg-purple-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Approximate Weight (kg)
            </Text>
          </View>

          <View style={tw`flex-row items-center`}>
            <View style={tw`flex-1`}>
              <TextInput
                style={[
                  tw`border border-gray-300 rounded-lg p-3 text-gray-800 text-base`,
                  touched.vehicle?.approximateWeightKg &&
                    errors.vehicle?.approximateWeightKg &&
                    tw`border-red-500`,
                ]}
                value={values.vehicle.approximateWeightKg ?? ''}
                onChangeText={text => {
                  setFieldValue('vehicle.approximateWeightKg', text);
                  // Clear vehicle type when weight changes
                  setFieldValue('vehicle.vehicleType', '');
                  setFieldValue('load.bodyType', '');
                  setFieldValue('load.dhalaLength', '');
                }}
                placeholder="Enter approximate weight in kilograms"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              {errors.vehicle?.approximateWeightKg &&
                touched.vehicle?.approximateWeightKg && (
                  <Text style={styles.errorText}>
                    {errors.vehicle.approximateWeightKg}
                  </Text>
                )}
            </View>
            <View style={tw`ml-3 bg-gray-100 px-3 py-3 rounded-lg`}>
              <Text style={tw`text-gray-600 font-medium`}>kg</Text>
            </View>
          </View>
          {/* <Text style={tw`text-sm text-gray-500 mt-2`}>
            Enter the approximate weight to see available vehicle segments
          </Text> */}
        </View>

        {/* Vehicle Segment */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-2 bg-green-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Vehicle Segment
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`p-3 border-2  rounded-lg`,
              {
                borderColor: vehicleBorderColor,
                backgroundColor: values.vehicle.vehicleType
                  ? '#EF476F20'
                  : '#f9fafb',
              },
            ]}
            onPress={handleOpenVehicleModal}
            activeOpacity={0.7}
            disabled={!values.vehicle.approximateWeightKg}
          >
            {values.vehicle.vehicleType ? (
              <View style={tw`flex-row items-center gap-2`}>
                <Image
                  source={
                    selectedVehicle?.img
                      ? { uri: selectedVehicle?.img }
                      : undefined
                  }
                  style={tw`w-12 h-12`}
                  resizeMode="contain"
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-bold text-gray-800`}>
                    {selectedVehicle?.VehicleType}
                  </Text>
                  <Text style={tw`text-xs text-gray-600 mt-1`}>
                    {selectedVehicle?.WeightRange}
                  </Text>
                </View>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={tw.color('gray-500')}
                />
              </View>
            ) : (
              <View style={tw`flex-row items-center gap-2`}>
                <View style={tw`bg-gray-200 p-2 rounded-full`}>
                  <Icon name="directions-car" size={16} color="#6B7280" />
                </View>
                <Text style={tw`text-gray-500 text-sm flex-1`}>
                  {values.vehicle.approximateWeightKg
                    ? 'Select vehicle type'
                    : 'Enter weight first'}
                </Text>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={
                    values.vehicle.approximateWeightKg
                      ? tw.color('gray-500')
                      : tw.color('gray-300')
                  }
                />
              </View>
            )}
          </TouchableOpacity>

          {errors.vehicle?.vehicleType && touched.vehicle?.vehicleType && (
            <Text style={styles.errorText}>
              {errors.vehicle.vehicleType as string}
            </Text>
          )}
        </View>
        {/* Body Type Selection (Dropdown with Images) */}
        {values.vehicle.vehicleType && (
          <View
            style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
          >
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`w-2 h-4 bg-teal-500 mr-2 rounded-full`} />
              <Text style={tw`text-base font-bold text-gray-800`}>
                Body Type
              </Text>
            </View>

            <TouchableOpacity
              style={[
                tw`p-3 border-2 rounded-lg`,
                {
                  borderColor: bodyTypeBorderColor,
                  backgroundColor: values.load?.bodyType
                    ? '#10B98110'
                    : '#f9fafb',
                },
              ]}
              onPress={handleOpenBodyTypeModal}
              activeOpacity={0.7}
            >
              {values.load?.bodyType ? (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    {selectedBodyType?.image && (
                      <Image
                        source={{ uri: selectedBodyType.image }}
                        style={tw`w-10 h-10`}
                        resizeMode="contain"
                      />
                    )}
                    <View>
                      <Text style={tw`text-sm font-medium text-gray-800`}>
                        {selectedBodyType?.label}
                      </Text>
                      {selectedBodyType?.description && (
                        <Text style={tw`text-xs text-gray-600`}>
                          {selectedBodyType.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={tw.color('gray-500')}
                  />
                </View>
              ) : (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <View style={tw`bg-gray-200 p-2 rounded-full`}>
                      <Icon name="local-shipping" size={16} color="#6B7280" />
                    </View>
                    <Text style={tw`text-gray-500 text-sm`}>
                      Select body type
                    </Text>
                  </View>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={tw.color('gray-500')}
                  />
                </View>
              )}
            </TouchableOpacity>

            {errors.load?.bodyType && touched.load?.bodyType && (
              <Text style={styles.errorText}>
                {errors.load.bodyType as string}
              </Text>
            )}
          </View>
        )}
        {/* Dhala Length Selection (Dropdown) */}
        {values.vehicle.vehicleType && (
          <View
            style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
          >
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`w-2 h-4 bg-indigo-500 mr-2 rounded-full`} />
              <Text style={tw`text-base font-bold text-gray-800`}>
                Dhala Length
              </Text>
            </View>

            <TouchableOpacity
              style={[
                tw`p-3 border-2 rounded-lg`,
                {
                  borderColor: dhalaLengthBorderColor,
                  backgroundColor: values.load?.dhalaLength
                    ? '#4F46E510'
                    : '#f9fafb',
                },
              ]}
              onPress={handleOpenDhalaLengthModal}
              activeOpacity={0.7}
            >
              {values.load?.dhalaLength ? (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <View style={tw`bg-indigo-100 p-2 rounded-full`}>
                      <Icon name="straighten" size={16} color="#4F46E5" />
                    </View>
                    <Text style={tw`text-sm font-medium text-gray-800`}>
                      {selectedDhalaLength?.label}
                    </Text>
                  </View>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={tw.color('gray-500')}
                  />
                </View>
              ) : (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <View style={tw`bg-gray-200 p-2 rounded-full`}>
                      <Icon name="straighten" size={16} color="#6B7280" />
                    </View>
                    <Text style={tw`text-gray-500 text-sm`}>
                      Select dhala length
                    </Text>
                  </View>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={tw.color('gray-500')}
                  />
                </View>
              )}
            </TouchableOpacity>

            {errors.load?.dhalaLength && touched.load?.dhalaLength && (
              <Text style={styles.errorText}>
                {errors.load.dhalaLength as string}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <PickupModal ref={pickupModalRef} />
      <DropModal ref={dropModalRef} />
      <SelectionModal
        ref={vehicleModalRef}
        title="Select Vehicle Type"
        options={vehicleOptions}
        selectedValue={values.vehicle.vehicleType}
        onSelect={(id: any) => {
          setFieldValue('vehicle.vehicleType', id);

          // ✅ clear only what depends on vehicleType
          setFieldValue('load.bodyType', '');
          setFieldValue('load.dhalaLength', '');
        }}
        numColumns={2}
      />
      <SelectionModal
        ref={dhalaLengthModalRef}
        title="Select Dhala Length"
        options={dhalaLengthOptions}
        selectedValue={values.load?.dhalaLength}
        onSelect={value => setFieldValue('load.dhalaLength', value)}
      />
      <SelectionModal
        ref={bodyTypeModalRef}
        title="Select Body Type"
        options={bodyTypeOptions}
        selectedValue={values.load?.bodyType}
        onSelect={value => {
          setFieldValue('load.bodyType', value);
          setFieldValue('load.dhalaLength', ''); // clear only child
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 80,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FirstStep;
