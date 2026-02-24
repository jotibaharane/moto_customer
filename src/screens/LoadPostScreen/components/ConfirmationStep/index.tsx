import { ShipmentData } from '@api/api.type';
import {
  useGetBodyTypeQuery,
  useGetCargoContentQuery,
  useGetPackageTypeQuery,
} from '@api/hooks_api';
import { calculateDistance } from '@utils/distanceUtils';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';

const ConfirmationStep: React.FC = () => {
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const { values } = useFormikContext<ShipmentData>();

  console.log('values', values, distanceInfo);

  const { data: BodyTypeData } = useGetBodyTypeQuery(
    {
      vehicleType: values.vehicle.vehicleType,
      weightRange: values.vehicle.weightRange,
    },
    { skip: !values.vehicle.vehicleType || !values.vehicle.weightRange },
  );
  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: values.load.cargoContent },
    { skip: !values.load.cargoContent },
  );
  const { data: cargoContentData } = useGetCargoContentQuery();

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const getDistance = async () => {
      if (values.pickup.origin && values.delivery.destination) {
        const result = await calculateDistance(
          {
            lat: values.pickup.origin.coordinates.lat,
            lng: values.pickup.origin.coordinates.lng,
          },
          {
            lat: values.delivery.destination.coordinates.lat,
            lng: values.delivery.destination.coordinates.lng,
          },
        );
        console.log(
          result,
          values.pickup.origin.coordinates.lat,
          values.pickup.origin.coordinates.lng,
          values.delivery.destination.coordinates.lat,
          values.delivery.destination.coordinates.lng,
        );
        setDistanceInfo(result);
      } else {
        setDistanceInfo(null);
      }
    };

    getDistance();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [values.pickup.origin, values.delivery.destination]);

  const selectedBodyType = values.load.bodyType
    ? BodyTypeData?.data?.find(b => b.BodyType === values.load.bodyType)
    : null;
  const selectedCargoContent = values.load.cargoContent
    ? cargoContentData?.data.find(
        c => c.cargo_type === values.load.cargoContent,
      )
    : null;
  const selectedPackageType = values.load.packageType
    ? packageTypeData?.data?.find(
        p => p.packaging_type === values.load.packageType,
      )
    : null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Animated.ScrollView style={[tw`flex-1 bg-gray-50 p-4`]}>
      {/* Main Shipment Card */}
      <View style={[tw`bg-white mb-4`, styles.card]}>
        {/* Location Section */}
        <View style={tw`p-6`}>
          {/* From Section */}
          <View style={tw`mb-6`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`w-3 h-3 bg-green-500 rounded-full mr-3`} />
              <Text style={tw`text-gray-800 font-bold text-base`}>From</Text>
            </View>

            <View style={tw`ml-6`}>
              <Text style={tw`text-gray-900 font-semibold text-lg mb-1`}>
                {values.pickup.contactName}
                {values.pickup.contactNumber && (
                  <Text style={tw`text-gray-600 text-base`}>
                    {' '}
                    • {values.pickup.contactNumber}
                  </Text>
                )}
              </Text>

              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-700 text-sm mb-1`}>
                  {values.pickup.plotOrBuilding}
                  {values.pickup.streetArea && `, ${values.pickup.streetArea}`}
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {values.pickup.origin?.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider with distance */}
          <View style={tw`flex-row items-center justify-center mb-6`}>
            <View style={tw`flex-1 h-px bg-gray-300`} />
            <View style={tw`px-3`}>
              <View style={tw`bg-blue-500 px-3 py-1 rounded-full`}>
                <Text style={tw`text-white text-xl font-semibold`}>
                  {distanceInfo?.distance || '3,500'}
                </Text>
              </View>
              <Text style={tw`text-gray-500 text-xs text-center mt-1`}>
                {distanceInfo?.duration || ''}
              </Text>
            </View>
            <View style={tw`flex-1 h-px bg-gray-300`} />
          </View>

          {/* To Section */}
          <View>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`w-3 h-3 bg-red-500 rounded-full mr-3`} />
              <Text style={tw`text-gray-800 font-bold text-base`}>To</Text>
            </View>

            <View style={tw`ml-6`}>
              <Text style={tw`text-gray-900 font-semibold text-lg mb-1`}>
                {values.delivery.consigneeName}
                {values.delivery.contactNumber && (
                  <Text style={tw`text-gray-600 text-base`}>
                    {' '}
                    • {values.delivery.contactNumber}
                  </Text>
                )}
              </Text>

              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-700 text-sm mb-1`}>
                  {values.delivery.plotOrBuilding}
                  {values.delivery.streetArea &&
                    `, ${values.delivery.streetArea}`}
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {values.delivery.destination?.address}
                  {(values.delivery.district ||
                    values.delivery.taluka ||
                    values.delivery.state ||
                    values.delivery.pincode) && (
                    <Text>
                      {', '}
                      {[
                        values.delivery.district,
                        values.delivery.taluka,
                        values.delivery.state,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      {values.delivery.pincode &&
                        ` - ${values.delivery.pincode}`}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Vehicle Details Card */}
      <View style={[tw`bg-white mb-4`, styles.card]}>
        <View style={tw`p-6`}>
          <Text style={tw`text-gray-800 font-bold text-lg mb-4`}>
            Vehicle Details
          </Text>

          <View style={tw`space-y-4`}>
            {/* Approximate Weight */}
            <View
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-100`}
            >
              <Text style={tw`text-gray-600 font-medium`}>
                Approximate Weight
              </Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="scale"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.vehicle.approximateWeightKg} kg
                </Text>
              </View>
            </View>

            {/* Dhala Length */}

            <View
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-100`}
            >
              <Text style={tw`text-gray-600 font-medium`}>Dhala Length</Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="straighten"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.dhalaLength} meters
                </Text>
              </View>
            </View>

            {/* Body Type */}
            <View style={tw`flex-row justify-between items-center py-2`}>
              <Text style={tw`text-gray-600 font-medium`}>Body Type</Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="local-shipping"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.bodyType}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Load Details Card */}
      <View style={[tw`bg-white mb-4`, styles.card]}>
        <View style={tw`p-6`}>
          <Text style={tw`text-gray-800 font-bold text-lg mb-4`}>
            Load Details
          </Text>

          <View style={tw`space-y-4`}>
            {/* Material Cargo Type */}
            <View
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-100`}
            >
              <Text style={tw`text-gray-600 font-medium`}>
                Material Cargo Type
              </Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="category"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.cargoType}
                </Text>
              </View>
            </View>

            {/* Material Name */}
            <View
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-100`}
            >
              <Text style={tw`text-gray-600 font-medium`}>Material Name</Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="inventory"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.materialName}
                </Text>
              </View>
            </View>

            {/* Package Type */}

            <View
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-100`}
            >
              <Text style={tw`text-gray-600 font-medium`}>Package Type</Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="package"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.packageType}
                </Text>
              </View>
            </View>

            {/* Approximate Weight per kg */}

            <View style={tw`flex-row justify-between items-center py-2`}>
              <Text style={tw`text-gray-600 font-medium`}>
                Approximate Weight per kg
              </Text>
              <View style={tw`flex-row items-center`}>
                <MaterialIcons
                  name="scale"
                  size={16}
                  color="#4b5563"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-800 font-semibold`}>
                  {values.load.weight} kg
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Additional Info Card */}
      <View style={[tw`bg-white mb-4`, styles.card]}>
        <View style={tw`p-6`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-gray-500 text-xs font-medium`}>
                AVAILABLE TIME
              </Text>
              <Text style={tw`text-gray-800 font-semibold text-sm`}>
                {values.load.expectedVehicleAvailability || 'Flexible'}
              </Text>
              {/* <Text style={tw`text-gray-600 text-xs`}>
                {values.schedule.date} at {values.schedule.time}
              </Text> */}
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-gray-500 text-xs font-medium`}>
                TOTAL ESTIMATE
              </Text>
              <Text style={tw`text-blue-600 font-bold text-lg`}>
                {distanceInfo ? '₹2,500' : '3,500'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
});

export default ConfirmationStep;
