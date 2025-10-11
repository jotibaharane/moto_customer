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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';

const ConfirmationStep: React.FC = () => {
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const { values } = useFormikContext<ShipmentData>();
  const { data: BodyTypeData } = useGetBodyTypeQuery(
    {
      vehicleType: values.VehicleType,
      weightRange: values.Weight,
    },
    { skip: !values.VehicleType || !values.Weight },
  );
  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: values?.CargoContent },
    { skip: !values?.CargoContent },
  );

  const { data: cargoContentData } = useGetCargoContentQuery();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const getDistance = async () => {
      if (values.origin && values.destination) {
        const result = await calculateDistance(
          {
            lat: values.origin?.coordinates?.lat,
            lng: values.origin.coordinates?.lng,
          },
          {
            lat: values.destination?.coordinates?.lat,
            lng: values?.destination?.coordinates?.lng,
          },
        );
        setDistanceInfo(result);
      } else {
        setDistanceInfo(null);
      }
    };

    getDistance();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [values.origin, values.destination]);

  const selectedBodyType = values.BodyType
    ? BodyTypeData?.data?.find(b => b.BodyType === values.BodyType)
    : null;
  const selectedCargoContent = values.CargoContent
    ? cargoContentData?.data.find(c => c.cargo_type === values.CargoContent)
    : null;
  const selectedPackageType = values.CargoContent
    ? packageTypeData?.data?.find(
        p => p.packaging_type === values.CargoPackageType,
      )
    : null;

  return (
    <Animated.ScrollView style={[tw`flex-1 bg-gray-50 p-4`]}>
      {/* Header */}

      {/* Route Information Card */}
      <View style={[tw`bg-white rounded-2xl p-6 mb-5`, styles.card]}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`bg-blue-100 p-2 rounded-full mr-3`}>
            <MaterialIcons name="route" size={20} color="#3b82f6" />
          </View>
          <Text style={tw`text-xl font-bold text-gray-800`}>Route Details</Text>
        </View>

        {/* Route Visualization */}
        <View style={tw`flex-row items-start mb-5`}>
          {/* Vertical Line with Markers */}
          <View style={tw`items-center mr-4`}>
            <View
              style={tw`w-6 h-6 bg-blue-500 rounded-full items-center justify-center mb-1`}
            >
              <Ionicons name="location" size={12} color="white" />
            </View>
            <View style={tw`w-1 bg-blue-200 h-32 my-1`} />
            <View
              style={tw`w-6 h-6 bg-red-500 rounded-full items-center justify-center`}
            >
              <Ionicons name="flag" size={12} color="white" />
            </View>
          </View>

          {/* Addresses with Full Details */}
          <View style={tw`flex-1`}>
            {/* Pickup Location */}
            <View style={tw`mb-8`}>
              <Text style={tw`text-blue-700 font-semibold text-sm mb-2`}>
                Pickup Location
              </Text>
              <Text style={tw`text-gray-800 font-medium text-base mb-1`}>
                {values.origin.address}
              </Text>

              {/* Pickup Address Details */}
              {(values.Origin_1 || values.Origin_2) && (
                <View style={tw`bg-blue-50 p-3 rounded-lg mt-2`}>
                  <Text style={tw`text-blue-700 text-sm`}>
                    {values.Origin_1}
                    {values.Origin_2 && `, ${values.Origin_2}`}
                  </Text>
                </View>
              )}

              {/* Contact Info for Pickup */}
            </View>

            {/* Delivery Location */}
            <View>
              <Text style={tw`text-red-600 font-semibold text-sm mb-2`}>
                Delivery Location
              </Text>
              <Text style={tw`text-gray-800 font-medium text-base mb-1`}>
                {values.destination.address}
              </Text>

              {/* Delivery Address Details */}
              {(values.Destination_1 ||
                values.Destination_2 ||
                values.District ||
                values.Taluka ||
                values.state ||
                values.Pincode) && (
                <View style={tw`bg-red-50 p-3 rounded-lg mt-2`}>
                  {(values.Destination_1 || values.Destination_2) && (
                    <Text style={tw`text-red-700 text-sm mb-1`}>
                      {values.Destination_1}
                      {values.Destination_2 && `, ${values.Destination_2}`}
                    </Text>
                  )}
                  {(values.District ||
                    values.Taluka ||
                    values.state ||
                    values.Pincode) && (
                    <Text style={tw`text-red-700 text-sm`}>
                      {[values.District, values.Taluka, values.state]
                        .filter(Boolean)
                        .join(', ')}
                      {values.Pincode && ` - ${values.Pincode}`}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Distance and Duration */}
        <View style={tw`flex-row justify-between bg-gray-50 p-3 rounded-lg`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#6b7280"
              style={tw`mr-2`}
            />
            <View>
              <Text style={tw`text-gray-500 text-xs`}>Duration</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {distanceInfo?.duration || 'Calculating...'}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center`}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color="#6b7280"
              style={tw`mr-2`}
            />
            <View>
              <Text style={tw`text-gray-500 text-xs`}>Distance</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {distanceInfo?.distance || 'Calculating...'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information Card */}
      {values?.ContactPerson && values.ContactNumber && (
        <View style={[tw`bg-white rounded-2xl p-6 mb-5`, styles.card]}>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`bg-purple-100 p-2 rounded-full mr-3`}>
              <Ionicons name="person" size={20} color="#8b5cf6" />
            </View>
            <Text style={tw`text-xl font-bold text-gray-800`}>
              Contact Details
            </Text>
          </View>

          <View style={tw`flex-row justify-between`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-500 text-sm mb-1`}>Contact Person</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {values.ContactPerson}
              </Text>
            </View>

            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-500 text-sm mb-1`}>Contact Number</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {values.ContactNumber}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Vehicle Information Card */}
      <View style={[tw`bg-white rounded-2xl p-6 mb-5`, styles.card]}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`bg-amber-100 p-2 rounded-full mr-3`}>
            <FontAwesome5 name="truck" size={18} color="#f59e0b" />
          </View>
          <Text style={tw`text-xl font-bold text-gray-800`}>
            Vehicle Details
          </Text>
        </View>

        <View style={tw`flex-row items-center`}>
          <View style={tw`bg-gray-100 p-3 rounded-lg mr-4`}>
            <Image
              source={
                selectedBodyType?.img
                  ? { uri: selectedBodyType?.img }
                  : undefined
              }
              style={tw`w-16 h-16`}
              resizeMode="contain"
            />
          </View>

          <View style={tw`flex-1`}>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-500`}>Vehicle Type</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {values?.VehicleType}
              </Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-500`}>Weight</Text>
              <Text style={tw`text-gray-800 font-medium`}>{values.Weight}</Text>
            </View>

            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>Body Type</Text>
              <Text style={tw`text-gray-800 font-medium`}>
                {values?.BodyType}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cargo Information Card */}
      <View style={[tw`bg-white rounded-2xl p-6 mb-5`, styles.card]}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`bg-indigo-100 p-2 rounded-full mr-3`}>
            <MaterialIcons name="inventory" size={20} color="#6366f1" />
          </View>
          <Text style={tw`text-xl font-bold text-gray-800`}>Cargo Details</Text>
        </View>

        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`bg-gray-100 p-3 rounded-lg mr-4`}>
            <Image
              source={
                selectedCargoContent?.img
                  ? { uri: selectedCargoContent?.img }
                  : undefined
              }
              style={tw`w-16 h-16`}
              resizeMode="contain"
            />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-500 text-sm`}>Cargo Type</Text>
            <Text style={tw`text-gray-800 font-medium`}>
              {values.CargoContent}
            </Text>
          </View>
        </View>

        <View style={tw`flex-row items-center`}>
          <View style={tw`bg-gray-100 p-3 rounded-lg mr-4`}>
            <Image
              source={
                selectedPackageType?.img
                  ? { uri: selectedPackageType?.img }
                  : undefined
              }
              style={tw`w-16 h-16`}
              resizeMode="contain"
            />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-500 text-sm`}>Packaging</Text>
            <Text style={tw`text-gray-800 font-medium`}>
              {values?.CargoPackageType}
            </Text>
          </View>
        </View>
      </View>

      {/* Additional Information Card */}
      <View style={[tw`bg-white rounded-2xl p-6 mb-5`, styles.card]}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`bg-pink-100 p-2 rounded-full mr-3`}>
            <Ionicons name="information-circle" size={20} color="#ec4899" />
          </View>
          <Text style={tw`text-xl font-bold text-gray-800`}>
            Additional Information
          </Text>
        </View>

        <View style={tw`flex-row justify-between mb-3`}>
          <Text style={tw`text-gray-500`}>Consignee Name</Text>
          <Text style={tw`text-gray-800 font-medium`}>
            {values.ConsigneeName}
          </Text>
        </View>

        <View style={tw`flex-row justify-between mb-3`}>
          <Text style={tw`text-gray-500`}>Dhala Length</Text>
          <Text style={tw`text-gray-800 font-medium`}>
            {values.DhalaLength} meters
          </Text>
        </View>

        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-500`}>Available Time</Text>
          <Text style={tw`text-gray-800 font-medium`}>
            {values.ExpectedAvailableTime}
          </Text>
        </View>
      </View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
});

export default ConfirmationStep;
