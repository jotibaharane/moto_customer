import { ShipmentData } from '@api/api.type';
import {
  useGetAproximateWeightQuery,
  useGetTruckTypeMutation,
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

  const [getTruck, { data: truckTypesData }] = useGetTruckTypeMutation();
  const { data: ApproximateWeight } = useGetAproximateWeightQuery(
    { vehicleType: values?.VehicleType },
    { skip: !values?.VehicleType },
  );

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

  const selectedTruckType = useMemo(
    () =>
      truckTypesData?.data.find(
        truck => truck.VehicleType === values.VehicleType,
      ),
    [truckTypesData, values.VehicleType],
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
        weight => weight.WeightRange === values.Weight,
      ),
    [ApproximateWeight, values.Weight],
  );

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

  const CompactAddressDisplay = ({
    type,
    address,
    line1,
    line2,
    contactPerson,
    contactNumber,
    consigneeName,
    registeredAddress,
    pincode,
    state,
    district,
    taluka,
  }: {
    type: 'pickup' | 'delivery';
    address?: string;
    line1?: string;
    line2?: string;
    contactPerson?: string;
    contactNumber?: string;
    consigneeName?: string;
    registeredAddress?: string;
    pincode?: string;
    state?: string;
    district?: string;
    taluka?: string;
  }) => {
    const primaryColor = type === 'pickup' ? 'blue-500' : 'red-500';
    const iconName = type === 'pickup' ? 'add-location' : 'location-on';

    if (!address) {
      return (
        <View style={tw`flex-row items-center`}>
          <Icon name={iconName} size={16} color={tw.color(primaryColor)} />
          <Text style={tw`ml-2 text-${primaryColor} text-sm`}>
            {type === 'pickup'
              ? 'Add Pickup Location'
              : 'Add Delivery Location'}
          </Text>
        </View>
      );
    }

    return (
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1 mr-2`}>
          {(contactPerson || contactNumber) && (
            <Text
              style={tw`text-sm text-gray-800 font-medium`}
              numberOfLines={1}
            >
              {contactPerson && ` ${contactPerson}`}
              {contactPerson && contactNumber && ' • '}
              {contactNumber}
            </Text>
          )}
          {(line1 || line2) && (
            <Text
              style={tw`text-sm text-gray-800 font-medium`}
              numberOfLines={2}
            >
              {[line1, line2].filter(Boolean).join(', ')}
            </Text>
          )}

          <Text style={tw`text-sm text-gray-800 font-medium`} numberOfLines={3}>
            {registeredAddress} {address}
          </Text>
          {consigneeName && (
            <Text style={tw`text-xs text-gray-500 mt-1`} numberOfLines={1}>
              Consignee: {consigneeName}
            </Text>
          )}
          {(pincode || state || district || taluka) && (
            <Text style={tw`text-xs text-gray-500 mt-1`} numberOfLines={2}>
              {[pincode && `Pincode: ${pincode}`, state, district, taluka]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
        </View>
        <Icon name="edit" size={16} color={tw.color('gray-500')} />
      </View>
    );
  };

  // Determine border colors based on errors + touched
  const pickupBorderColor =
    touched.origin && errors.origin ? '#ef4444' : '#d1d5db';
  const deliveryBorderColor =
    touched.destination && errors.destination ? '#ef4444' : '#d1d5db';
  const vehicleBorderColor =
    touched.VehicleType && errors.VehicleType
      ? '#ef4444'
      : values.VehicleType
      ? '#EF476F'
      : '#d1d5db';
  const weightBorderColor =
    touched.Weight && errors.Weight
      ? '#ef4444'
      : values.Weight
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
              tw`p-3 border-2 border-dashed rounded-lg`,
              { borderColor: pickupBorderColor },
            ]}
            onPress={handleOpenPickupModal}
            activeOpacity={0.7}
          >
            <CompactAddressDisplay
              type="pickup"
              address={values.origin?.address}
              line1={values.Origin_1}
              line2={values.Origin_2}
              contactPerson={values.ContactPerson}
              contactNumber={values.ContactNumber}
            />
          </TouchableOpacity>

          {errors.origin && touched.origin && (
            <Text style={styles.errorText}>{errors.origin as string}</Text>
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
              tw`p-3 border-2 border-dashed rounded-lg`,
              { borderColor: deliveryBorderColor },
            ]}
            onPress={handleOpenDropModal}
            activeOpacity={0.7}
          >
            {values.destination?.address ? (
              <View style={tw`flex-row rounded-lg`}>
                <View style={tw` flex-1`}>
                  <Text style={tw`text-sm text-gray-800 font-medium`}>
                    {values.ConsigneeName || 'Consignee'}{' '}
                    {values.ConsigneeContactNumber || 'Consignee'}
                  </Text>

                  <Text style={tw`text-sm text-gray-800 font-small`}>
                    {values.Destination_1}, {values.Destination_2}
                  </Text>
                  <Text style={tw`text-sm text-gray-600 `}>
                    {values.destination.address}
                  </Text>

                  <Text style={tw`text-sm text-gray-800 font-medium`}>
                    {values.District}, {values.state} - {values.Pincode}
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

            {/* <CompactAddressDisplay
              type="delivery"
              consigneeName={values.ConsigneeName}
              address={values.destination?.address}
              line1={values.Destination_1}
              line2={values.Destination_2}
              pincode={values.Pincode}
              state={values.state}
              district={values.District}
              taluka={values.Taluka}
            /> */}
          </TouchableOpacity>

          {errors.destination && touched.destination && (
            <Text style={styles.errorText}>{errors.destination as string}</Text>
          )}
        </View>

        {/* Vehicle Type */}
        <View
          style={tw`bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-3`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-2 h-2 bg-green-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Vehicle Type
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`p-3 border-2 border-dashed rounded-lg`,
              {
                borderColor: vehicleBorderColor,
                backgroundColor: values.VehicleType ? '#EF476F20' : '#f9fafb',
              },
            ]}
            onPress={handleOpenVehicleModal}
            activeOpacity={0.7}
          >
            {values?.VehicleType ? (
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

          {errors.VehicleType && touched.VehicleType && (
            <Text style={styles.errorText}>{errors.VehicleType as string}</Text>
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
              tw`p-3 border-2 border-dashed rounded-lg`,
              {
                borderColor: weightBorderColor,
                backgroundColor: values.Weight ? '#3B82F620' : '#f9fafb',
              },
            ]}
            onPress={handleOpenWeightModal}
            disabled={!values?.VehicleType}
            activeOpacity={0.7}
          >
            {values?.Weight ? (
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
                  {values?.VehicleType
                    ? 'Select Weight Range'
                    : 'Select vehicle type first'}
                </Text>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={
                    values?.VehicleType
                      ? tw.color('gray-500')
                      : tw.color('gray-300')
                  }
                />
              </View>
            )}
          </TouchableOpacity>

          {errors.Weight && touched.Weight && (
            <Text style={styles.errorText}>{errors.Weight as string}</Text>
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
                  touched.Approximate_weight &&
                    errors.Approximate_weight &&
                    tw`border-red-500`,
                ]}
                value={values.Approximate_weight}
                onChangeText={text => setFieldValue('Approximate_weight', text)}
                placeholder="Enter exact weight in kilograms"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              {errors.Approximate_weight && touched.Approximate_weight && (
                <Text style={styles.errorText}>
                  {errors.Approximate_weight}
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
        selectedValue={values.VehicleType}
        onSelect={(vehicleType: any) => {
          setFieldValue('VehicleType', vehicleType);
          setFieldValue('Weight', '');
        }}
        numColumns={2}
      />
      <SelectionModal
        key="weight"
        ref={weightModalRef}
        title="Select Weight Range"
        options={weightTypes}
        selectedValue={values.Weight}
        onSelect={(weight: any) => setFieldValue('Weight', weight)}
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 80, // ensures last input isn’t hidden
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FirstStep;
