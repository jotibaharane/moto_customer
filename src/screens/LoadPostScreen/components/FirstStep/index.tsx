import { ShipmentData } from '@api/api.type';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useCallback, useMemo, useRef } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import DropModal, { DropModalRef } from '../DropModal';
import PickupModal, { PickupModalRef } from '../PickupModal';
// import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import {
  useGetAproximateWeightQuery,
  useGetTruckTypeQuery,
} from '@api/hooks_api';
import DropModal, { DropModalRef } from '../DropModal';
import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import { styles } from './style';

const FirstStep: React.FC = () => {
  const pickupModalRef = useRef<PickupModalRef>(null);
  const dropModalRef = useRef<DropModalRef>(null);
  const vehicleModalRef = useRef<SelectionModalRef>(null);
  const weightModalRef = useRef<SelectionModalRef>(null);

  const { values, errors, setFieldValue, touched } =
    useFormikContext<ShipmentData>();

  const { data: truckTypesData } = useGetTruckTypeQuery();
  const { data: ApproximateWeight } = useGetAproximateWeightQuery(
    { vehicleType: values?.VehicleType },
    { skip: !values?.VehicleType },
  );

  // truck type
  const truckTypes =
    truckTypesData?.data?.map((truck: any) => ({
      id: truck.VehicleType.toLowerCase().replace(' ', '-'),
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

  const handleOpenVehicleModal = useCallback(() => {
    vehicleModalRef.current?.open();
  }, []);

  //  Weight type
  const weightTypes =
    ApproximateWeight?.data?.map((weight: any) => ({
      id: weight?.WeightRange?.toLowerCase().replace(' ', '-'),
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

  const handleOpenWeightModal = useCallback(() => {
    weightModalRef.current?.open();
  }, []);

  // Handle pickup modal open
  const handleOpenPickupModal = useCallback(() => {
    pickupModalRef.current?.open();
  }, []);

  // Handle drop modal open
  const handleOpenDropModal = useCallback(() => {
    dropModalRef.current?.open();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Information</Text>
      <Text style={styles.subtitle}>Please provide your Location details</Text>

      <View style={styles.inputGroup}>
        {/* Pickup Location Card */}
        <View
          style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
        >
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-6 bg-blue-500 mr-3 rounded-full`} />
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Pickup Location
            </Text>
          </View>

          <TouchableOpacity
            style={tw`p-4 border border-dashed border-gray-300 rounded-lg mb-4`}
            onPress={handleOpenPickupModal}
            activeOpacity={0.7}
          >
            {values.origin?.address ? (
              <View>
                <Text style={tw`text-gray-800 font-medium`}>
                  {values.origin.address}
                </Text>
                {values.Origin_1 && (
                  <Text style={tw`text-gray-600 mt-1`}>
                    {values.Origin_1}, {/* {values.building} */}
                  </Text>
                )}
                {values?.Origin_2 && (
                  <Text style={tw`text-gray-600`}>{values?.Origin_2}</Text>
                )}
                {values?.ContactPerson && (
                  <Text style={tw`text-gray-600`}>{values?.ContactPerson}</Text>
                )}
                {values?.ContactNumber && (
                  <Text style={tw`text-gray-600`}>{values?.ContactNumber}</Text>
                )}
              </View>
            ) : (
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="add-location"
                  size={20}
                  color={tw.color('blue-500')}
                />
                <Text style={tw`ml-2 text-blue-500`}>Add Pickup Location</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {errors.origin && touched.origin && (
          <Text style={styles.errorText}>{errors.origin as string}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        {/* Delivery Location Card */}
        <View
          style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
        >
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-6 bg-red-500 mr-3 rounded-full`} />
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Delivery Location
            </Text>
          </View>

          <TouchableOpacity
            style={tw`p-4 border border-dashed border-gray-300 rounded-lg mb-4`}
            onPress={handleOpenDropModal}
            activeOpacity={0.7}
          >
            {values.destination?.address ? (
              <View>
                <Text style={tw`text-gray-800 font-medium`}>
                  {values.destination.address}
                </Text>
                {values?.ConsigneeName && (
                  <Text style={tw`text-gray-600 mt-1`}>
                    Consignee: {values.ConsigneeName}
                  </Text>
                )}
                {values?.state && (
                  <Text style={tw`text-gray-600`}>{values?.Destination_1}</Text>
                )}
                {values?.state && (
                  <Text style={tw`text-gray-600`}>{values?.Destination_2}</Text>
                )}

                {values?.Pincode && (
                  <Text style={tw`text-gray-600`}>
                    Pincode: {values?.Pincode}
                  </Text>
                )}
                {values?.state && (
                  <Text style={tw`text-gray-600`}>State: {values?.state}</Text>
                )}
                {values?.District && (
                  <Text style={tw`text-gray-600`}>
                    District: {values?.District}
                  </Text>
                )}
                {values?.Taluka && (
                  <Text style={tw`text-gray-600`}>
                    Taluka: {values?.Taluka}
                  </Text>
                )}
              </View>
            ) : (
              <View style={tw`flex-row items-center`}>
                <Icon
                  name="location-on"
                  size={20}
                  color={tw.color('red-500')}
                />
                <Text style={tw`ml-2 text-red-500`}>Add Delivery Location</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {errors.destination && touched.destination && (
          <Text style={styles.errorText}>{errors.destination as string}</Text>
        )}
      </View>

      {/* vehicle type */}
      <View style={styles.inputGroup}>
        <View
          style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
        >
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-6 bg-green-500 mr-3 rounded-full`} />
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Vehicle Type
            </Text>
          </View>

          <TouchableOpacity
            style={tw`border-2 border-dashed ${
              values?.VehicleType
                ? `border-[${'#EF476F'}] bg-[${'#EF476F'}20]`
                : 'border-gray-300 bg-gray-50'
            } p-2 rounded-xl`}
            onPress={handleOpenVehicleModal}
            activeOpacity={0.7}
          >
            {values?.VehicleType ? (
              <View style={tw`items-center justify-center flex-row gap-5`}>
                <Image
                  source={
                    selectedTruckType?.img
                      ? { uri: selectedTruckType?.img }
                      : undefined
                  }
                  style={tw`w-20 h-20 mb-3`}
                  resizeMode="contain"
                />
                <View style={tw`items-center`}>
                  <Text style={tw`text-lg font-bold text-gray-800`}>
                    {selectedTruckType?.VehicleType}
                  </Text>
                  <Text style={tw`text-gray-600 mt-1`}>
                    {selectedTruckType?.WeightRange}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={tw`items-center justify-center flex-row gap-5 py-4`}>
                <View style={tw`bg-gray-200 p-4 rounded-full `}>
                  <Icon name="directions-car" size={24} color="#6B7280" />
                </View>
                <Text style={tw`text-gray-500 font-medium`}>
                  Select vehicle type
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {errors.VehicleType && touched.VehicleType && (
          <Text style={styles.errorText}>
            {(errors?.VehicleType as string) || ''}
          </Text>
        )}
      </View>

      {/* weight range */}
      <View style={styles.inputGroup}>
        <View
          style={tw`mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}
        >
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-6 bg-green-500 mr-3 rounded-full`} />
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Weight Range
            </Text>
          </View>

          <TouchableOpacity
            style={tw`border-2 border-dashed ${
              values.Weight
                ? `border-[#3B82F6] bg-[#3B82F620]`
                : 'border-gray-300 bg-gray-50'
            } p-2 rounded-xl`}
            onPress={handleOpenWeightModal}
            disabled={!values?.VehicleType}
            activeOpacity={0.7}
          >
            {values?.Weight ? (
              <View style={tw`items-center justify-center flex-row gap-5`}>
                <Image
                  source={
                    selectedWeightType?.img
                      ? { uri: selectedWeightType?.img }
                      : undefined
                  }
                  style={tw`w-20 h-20 mb-3`}
                  resizeMode="contain"
                />
                <View style={tw`items-center`}>
                  <Text style={tw`text-lg font-bold text-gray-800`}>
                    {selectedWeightType?.WeightRange}
                  </Text>
                  {/* <Text style={tw`text-gray-600 mt-1`}>{values?.Weight}</Text> */}
                </View>
              </View>
            ) : (
              <View style={tw`items-center justify-center flex-row gap-5 py-4`}>
                <View style={tw`bg-gray-200 p-4 rounded-full `}>
                  <Icon name="fitness-center" size={24} color="#6B7280" />
                </View>
                <Text style={tw`text-gray-500 font-medium`}>
                  {values?.VehicleType
                    ? 'Select Weight Range'
                    : 'Select vehicle type first'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {errors.Weight && touched.Weight && (
          <Text style={styles.errorText}>
            {(errors?.Weight as string) || ''}
          </Text>
        )}
      </View>

      {/* Render modals at root level */}
      <PickupModal ref={pickupModalRef} />
      <DropModal ref={dropModalRef} />

      {/* Selection modals - moved to root level to prevent remounting */}
      <SelectionModal
        ref={vehicleModalRef}
        title="Select Vehicle Type"
        options={truckTypes}
        selectedValue={values.VehicleType}
        onSelect={(vehicleType: any) => {
          console.log({ vehicleType });
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
        onSelect={(weight: any) => {
          setFieldValue('Weight', weight);
        }}
        numColumns={2}
      />
    </View>
  );
};

export default FirstStep;
