import { ShipmentData } from '@api/api.type';
import {
  useGetAproximateWeightQuery,
  useGetTruckTypemutationMutation,
} from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, {
  useCallback,
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

const FirstStep: React.FC = () => {
  const navigation = useNavigation();
  const pickupModalRef = useRef<PickupModalRef>(null);
  const dropModalRef = useRef<DropModalRef>(null);
  const vehicleModalRef = useRef<SelectionModalRef>(null);
  const weightModalRef = useRef<SelectionModalRef>(null);

  const { values, errors, setFieldValue, touched } =
    useFormikContext<ShipmentData>();

  console.log(values, errors, touched);

  const [getTruck, { data: truckTypesData }] =
    useGetTruckTypemutationMutation();
  const { data: ApproximateWeight } = useGetAproximateWeightQuery(
    { vehicleType: values?.vehicle?.vehicleType },
    { skip: !values?.vehicle?.vehicleType },
  );
  console.log({ ApproximateWeight });
  useLayoutEffect(() => {
    getTruck();
  }, [navigation]);

  // Truck type
  const truckTypes =
    truckTypesData?.data?.map((truck: any) => ({
      id: truck?.VehicleType?.toLowerCase()?.replace(' ', '-'),
      label: truck.VehicleType,
      image: { uri: truck?.img },
      description: truck.WeightRange,
      color: '#EF476F',
    })) || [];
  console.log(truckTypes, 'trucktype in first');

  const selectedTruckType = useMemo(
    () =>
      truckTypesData?.data.find(
        truck => truck.VehicleType === values.vehicle.vehicleType,
      ),
    [truckTypesData, values.vehicle.vehicleType],
  );

  // Weight type
  const weightTypes =
    ApproximateWeight?.data?.map((weight: any) => ({
      id: weight?.WeightRange?.toLowerCase()?.replace(' ', '-'),
      label: weight?.WeightRange,
      image: { uri: weight?.img },
      color: '#3B82F6',
    })) || [];

  const selectedWeightType: any = useMemo(
    () =>
      ApproximateWeight?.data.find(
        weight => weight.WeightRange === values.vehicle.weightRange,
      ),
    [ApproximateWeight, values.vehicle.weightRange],
  );
  const weightLimits = useMemo(() => {
    if (!values.vehicle.weightRange) return null;

    const match = values.vehicle.weightRange.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return null;

    return {
      min: Number(match[1]),
      max: Number(match[2]),
    };
  }, [values.vehicle.weightRange]);
  const handleOpenVehicleModal = useCallback(
    () => vehicleModalRef.current?.open(),
    [],
  );
  const handleOpenWeightModal = useCallback(
    () => weightModalRef.current?.open(),
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

  // Determine border colors based on errors + touched
  const pickupBorderColor =
    touched.pickup?.origin && errors.pickup?.origin ? '#ef4444' : '#d1d5db';
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
  const weightBorderColor =
    touched.vehicle?.weightRange && errors.vehicle?.weightRange
      ? '#ef4444'
      : values.vehicle.weightRange
      ? '#3B82F6'
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
              Pickup Location
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
                  {values.pickup.companyName && (
                    <Text
                      style={tw`text-xs text-gray-500 mt-1`}
                      numberOfLines={1}
                    >
                      Company: {values.pickup.companyName}
                    </Text>
                  )}
                  {(values.pickup.pincode ||
                    values.pickup.state ||
                    values.pickup.district ||
                    values.pickup.taluka) && (
                    <Text
                      style={tw`text-xs text-gray-500 mt-1`}
                      numberOfLines={2}
                    >
                      {[
                        values.pickup.pincode &&
                          `Pincode: ${values.pickup.pincode}`,
                        values.pickup.state,
                        values.pickup.district,
                        values.pickup.taluka,
                      ]
                        .filter(Boolean)
                        .join(', ')}
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
              Delivery Location
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
                    {values.delivery.consigneeName || 'Consignee'}{' '}
                    {values.delivery.contactNumber || 'Consignee'}
                  </Text>

                  <Text style={tw`text-sm text-gray-800 font-small`}>
                    {values.delivery.plotOrBuilding},{' '}
                    {values.delivery.streetArea}
                  </Text>
                  <Text style={tw`text-sm text-gray-600 `}>
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

        {/* Vehicle Type */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-2 bg-green-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Vehicle Requirement
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
          >
            {values.vehicle.vehicleType ? (
              <View style={tw`flex-row items-center gap-2`}>
                <Image
                  source={
                    selectedTruckType?.img
                      ? { uri: selectedTruckType?.img }
                      : undefined
                  }
                  style={tw`w-12 h-12`}
                  resizeMode="contain"
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-bold text-gray-800`}>
                    {selectedTruckType?.VehicleType}
                  </Text>
                  <Text style={tw`text-xs text-gray-600 mt-1`}>
                    {selectedTruckType?.WeightRange}
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
                  Select vehicle type
                </Text>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={tw.color('gray-500')}
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

        {/* Weight Range Selection */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-4 bg-purple-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Weight Range
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`p-3 border-2  rounded-lg`,
              {
                borderColor: weightBorderColor,
                backgroundColor: values.vehicle.weightRange
                  ? '#3B82F620'
                  : '#f9fafb',
              },
            ]}
            onPress={handleOpenWeightModal}
            disabled={!values.vehicle.vehicleType}
            activeOpacity={0.7}
          >
            {values.vehicle.weightRange ? (
              <View style={tw`flex-row items-center gap-3`}>
                <Image
                  source={
                    selectedWeightType?.img
                      ? { uri: selectedWeightType?.img }
                      : undefined
                  }
                  style={tw`w-12 h-12`}
                  resizeMode="contain"
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-bold text-gray-800`}>
                    {selectedWeightType?.WeightRange}
                  </Text>
                </View>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={tw.color('gray-500')}
                />
              </View>
            ) : (
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`bg-gray-200 p-2 rounded-full`}>
                  <Icon name="fitness-center" size={16} color="#6B7280" />
                </View>
                <Text style={tw`text-gray-500 text-sm flex-1`}>
                  {values.vehicle.vehicleType
                    ? 'Select Weight Range'
                    : 'Select vehicle type first'}
                </Text>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={
                    values.vehicle.vehicleType
                      ? tw.color('gray-500')
                      : tw.color('gray-300')
                  }
                />
              </View>
            )}
          </TouchableOpacity>

          {errors.vehicle?.weightRange && touched.vehicle?.weightRange && (
            <Text style={styles.errorText}>
              {errors.vehicle.weightRange as string}
            </Text>
          )}
        </View>

        {/* Exact Weight Input */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`w-2 h-4 bg-indigo-500 mr-2 rounded-full`} />
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
                value={values.vehicle.approximateWeightKg}
                onChangeText={text =>
                  setFieldValue('vehicle.approximateWeightKg', text)
                }
                placeholder={
                  weightLimits
                    ? `Enter weight between ${weightLimits.min}-${weightLimits.max} kg`
                    : 'Enter exact weight in kilograms'
                }
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
        </View>
      </ScrollView>

      {/* Modals */}
      <PickupModal ref={pickupModalRef} />
      <DropModal ref={dropModalRef} />
      <SelectionModal
        ref={vehicleModalRef}
        title="Select Vehicle Type"
        options={truckTypes}
        selectedValue={values.vehicle.vehicleType}
        onSelect={(vehicleType: any) => {
          setFieldValue('vehicle.vehicleType', vehicleType);
          setFieldValue('vehicle.weightRange', '');
        }}
        numColumns={2}
      />
      <SelectionModal
        key="weight"
        ref={weightModalRef}
        title="Select Weight Range"
        options={weightTypes}
        selectedValue={values.vehicle.weightRange}
        onSelect={(weight: any) => setFieldValue('vehicle.weightRange', weight)}
        numColumns={2}
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
