import { ShipmentData } from '@api/api.type';
import {
  useGetAproximateWeightQuery,
  useGetTruckTypeMutation,
} from '@api/hooks_api';
import { useNavigation } from '@react-navigation/native';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const [getTruck, { data: truckTypesData }] = useGetTruckTypeMutation();
  const { data: ApproximateWeight, refetch } = useGetAproximateWeightQuery(
    { vehicleType: values?.VehicleType },
    { skip: !values?.VehicleType },
  );

  useLayoutEffect(() => {
    getTruck();
  }, [navigation]);

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

  // Weight type
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

  // Compact address display component
  const CompactAddressDisplay = ({
    type,
    address,
    line1,
    line2,
    contactPerson,
    contactNumber,
    consigneeName,
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
          <Text style={tw`text-sm text-gray-800 font-medium`} numberOfLines={1}>
            {address}
          </Text>

          {/* Compact address lines */}
          {(line1 || line2) && (
            <Text style={tw`text-xs text-gray-600 mt-1`} numberOfLines={2}>
              {[line1, line2].filter(Boolean).join(', ')}
            </Text>
          )}

          {/* Contact info - show only if exists */}
          {(contactPerson || contactNumber) && (
            <Text style={tw`text-xs text-gray-500 mt-1`} numberOfLines={1}>
              {contactPerson && `Contact: ${contactPerson}`}
              {contactPerson && contactNumber && ' • '}
              {contactNumber}
            </Text>
          )}

          {/* Delivery specific fields */}
          {consigneeName && (
            <Text style={tw`text-xs text-gray-500 mt-1`} numberOfLines={1}>
              Consignee: {consigneeName}
            </Text>
          )}

          {/* Location details - compact format */}
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

  return (
    <View style={styles.compactContainer}>
      {/* Pickup Location Card - Compact */}
      <View
        style={tw`mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={tw`w-2 h-4 bg-blue-500 mr-2 rounded-full`} />
          <Text style={tw`text-base font-bold text-gray-800`}>
            Pickup Location
          </Text>
        </View>

        <TouchableOpacity
          style={tw`p-3 border border-dashed border-gray-300 rounded-lg`}
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

      {/* Delivery Location Card - Compact */}
      <View
        style={tw`mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={tw`w-2 h-4 bg-red-500 mr-2 rounded-full`} />
          <Text style={tw`text-base font-bold text-gray-800`}>
            Delivery Location
          </Text>
        </View>

        <TouchableOpacity
          style={tw`p-3 border border-dashed border-gray-300 rounded-lg`}
          onPress={handleOpenDropModal}
          activeOpacity={0.7}
        >
          <CompactAddressDisplay
            type="delivery"
            address={values.destination?.address}
            line1={values.Destination_1}
            line2={values.Destination_2}
            consigneeName={values.ConsigneeName}
            pincode={values.Pincode}
            state={values.state}
            district={values.District}
            taluka={values.Taluka}
          />
        </TouchableOpacity>

        {errors.destination && touched.destination && (
          <Text style={styles.errorText}>{errors.destination as string}</Text>
        )}
      </View>

      {/* Vehicle Type - Compact */}
      <View
        style={tw`mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={tw`w-2 h-4 bg-green-500 mr-2 rounded-full`} />
          <Text style={tw`text-base font-bold text-gray-800`}>
            Vehicle Type
          </Text>
        </View>

        <TouchableOpacity
          style={tw`border-2 border-dashed ${
            values?.VehicleType
              ? `border-[#EF476F] bg-[#EF476F20]`
              : 'border-gray-300 bg-gray-50'
          } p-3 rounded-lg`}
          onPress={handleOpenVehicleModal}
          activeOpacity={0.7}
        >
          {values?.VehicleType ? (
            <View style={tw`flex-row items-center gap-3`}>
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
            <View style={tw`flex-row items-center gap-3`}>
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
          <Text style={styles.errorText}>
            {(errors?.VehicleType as string) || ''}
          </Text>
        )}
      </View>

      {/* Weight Range - Compact */}
      <View
        style={tw`mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={tw`w-2 h-4 bg-purple-500 mr-2 rounded-full`} />
          <Text style={tw`text-base font-bold text-gray-800`}>
            Weight Range
          </Text>
        </View>

        <TouchableOpacity
          style={tw`border-2 border-dashed ${
            values.Weight
              ? `border-[#3B82F6] bg-[#3B82F620]`
              : 'border-gray-300 bg-gray-50'
          } p-3 rounded-lg`}
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
          <Text style={styles.errorText}>
            {(errors?.Weight as string) || ''}
          </Text>
        )}
      </View>

      {/* Render modals */}
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
        onSelect={(weight: any) => {
          setFieldValue('Weight', weight);
        }}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc', // light gray background
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FirstStep;
