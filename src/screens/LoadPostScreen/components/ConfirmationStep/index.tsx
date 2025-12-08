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

  console.log('values', values, distanceInfo);

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
      if (values?.origin && values?.destination) {
        const result = await calculateDistance(
          {
            lat: values?.origin?.coordinates?.lat,
            lng: values?.origin?.coordinates?.lng,
          },
          {
            lat: values?.destination?.coordinates?.lat,
            lng: values?.destination?.coordinates?.lng,
          },
        );
        console.log(
          result,
          values.origin?.coordinates?.lat,
          values.origin?.coordinates?.lng,
          values.destination?.coordinates?.lat,
          values?.destination?.coordinates?.lng,
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
  }, [values?.origin, values?.destination]);

  const selectedBodyType = values.BodyType
    ? BodyTypeData?.data?.find(b => b.BodyType === values.BodyType)
    : null;
  const selectedCargoContent = values.CargoContent
    ? cargoContentData?.data.find(c => c.cargo_type === values.CargoContent)
    : null;
  const selectedPackageType = values.CargoPackageType
    ? packageTypeData?.data?.find(
        p => p.packaging_type === values.CargoPackageType,
      )
    : null;

  const Pickupname =
    values.PickupType == 'self' || 'Registered' ? 'abhishek' : null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Animated.ScrollView style={[tw`flex-1 bg-gray-50 p-1`]}>
      {/* Main Shipment Card */}
      <View style={[tw`bg-white mb-4  `, styles.card]}>
        {/* Card Header - ID, Date, Status */}
        {/* <View style={tw`bg-blue-50 px-6 py-4 border-b border-gray-200`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-gray-500 text-xs font-medium`}>
                SHIPMENT ID
              </Text>
              <Text style={tw`text-gray-900 text-lg font-bold`}>
                #SH{Date.now().toString().slice(-6)}
              </Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-gray-500 text-xs font-medium`}>
                {currentDate}
              </Text>
              <View style={tw`bg-green-100 px-2 py-1 rounded-full mt-1`}>
                <Text style={tw`text-green-700 text-xs font-semibold`}>
                  CONFIRMED
                </Text>
              </View>
            </View>
          </View>
        </View> */}

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
                {values.ContactPerson}
                {values.ContactNumber && (
                  <Text style={tw`text-gray-600 text-base`}>
                    {' '}
                    • {values.ContactNumber}
                  </Text>
                )}
              </Text>

              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-700 text-sm mb-1`}>
                  {values.Origin_1}
                  {values.Origin_2 && `, ${values.Origin_2}`}
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {values.origin?.address}
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
                {values.ConsigneeName}
                {values.ConsigneeContactNumber && (
                  <Text style={tw`text-gray-600 text-base`}>
                    {' '}
                    • {values.ConsigneeContactNumber}
                  </Text>
                )}
              </Text>

              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-700 text-sm mb-1`}>
                  {values.Destination_1}
                  {values.Destination_2 && `, ${values.Destination_2}`}
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {values.destination?.address}
                  {(values.District ||
                    values.Taluka ||
                    values.state ||
                    values.Pincode) && (
                    <Text>
                      {', '}
                      {[values.District, values.Taluka, values.state]
                        .filter(Boolean)
                        .join(', ')}
                      {values.Pincode && ` - ${values.Pincode}`}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle & Cargo Details with Images */}
        <View style={tw`bg-gray-50 px-6 py-4 border-t border-gray-200`}>
          {/* Vehicle Section with Image */}
          <View style={tw`flex-row items-start mb-4`}>
            <View style={tw`mr-4`}>
              <View
                style={tw`bg-white p-3 rounded-lg shadow-sm border border-gray-200`}
              >
                <Image
                  source={
                    selectedBodyType?.img ? { uri: selectedBodyType.img } : {}
                  }
                  style={tw`w-16 h-16`}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-800 font-bold text-base mb-3`}>
                Vehicle Details
              </Text>

              <View style={tw`flex-row justify-between mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    VEHICLE TYPE
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <FontAwesome5
                      name="truck"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values.VehicleType}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    WEIGHT RANGE
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <FontAwesome5
                      name="weight-hanging"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values.Weight}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={tw`flex-row justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    BODY TYPE
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <MaterialIcons
                      name="local-shipping"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values.BodyType}
                    </Text>
                  </View>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    WEIGHT RANGE
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <MaterialIcons
                      name="local-shipping"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values?.Approximate_weight}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Cargo Section with Images */}
          <View style={tw`flex-row items-start`}>
            <View style={tw`mr-4`}>
              <View
                style={tw`bg-white p-3 rounded-lg shadow-sm border border-gray-200`}
              >
                <Image
                  source={
                    selectedCargoContent?.img
                      ? { uri: selectedCargoContent.img }
                      : {}
                  }
                  style={tw`w-16 h-16`}
                  resizeMode="contain"
                />
              </View>
              {selectedPackageType?.img && (
                <View
                  style={tw`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mt-2`}
                >
                  <Image
                    source={{ uri: selectedPackageType.img }}
                    style={tw`w-16 h-16`}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-800 font-bold text-base mb-3`}>
                Cargo Details
              </Text>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                  CARGO CONTENT
                </Text>
                <View style={tw`flex-row items-center`}>
                  <MaterialIcons
                    name="inventory"
                    size={14}
                    color="#6b7280"
                    style={tw`mr-2`}
                  />
                  <Text style={tw`text-gray-800 font-semibold`}>
                    {values.CargoContent}
                  </Text>
                </View>
              </View>

              {values.CargoPackageType && (
                <View style={tw`mb-3`}>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    PACKAGING TYPE
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <MaterialIcons
                      name="package"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values.CargoPackageType}
                    </Text>
                  </View>
                </View>
              )}

              {values.DhalaLength && (
                <View>
                  <Text style={tw`text-gray-500 text-xs font-medium mb-1`}>
                    DHALA LENGTH
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <MaterialIcons
                      name="straighten"
                      size={14}
                      color="#6b7280"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-800 font-semibold`}>
                      {values.DhalaLength} meters
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Additional Info Footer */}
        <View style={tw`bg-white px-6 py-4 border-t border-gray-200`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-gray-500 text-xs font-medium`}>
                AVAILABLE TIME
              </Text>
              <Text style={tw`text-gray-800 font-semibold text-sm`}>
                {values.ExpectedAvailableTime || 'Flexible'}
              </Text>
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

      {/* Additional Notes Card */}
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
    // elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});

export default ConfirmationStep;
