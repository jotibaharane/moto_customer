import { formatDistance, getStatusStyle } from '@utils/customerPostsutils';
import tw from '@utils/tw';
import { Animated, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const PostCard = ({ item, onPress }: { item: any; onPress: any }) => {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);
  const statusStyle = getStatusStyle(item.status);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        tw`mb-4 mx-3`,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <Card
        style={tw`bg-white rounded-xl overflow-hidden border-0`}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onPress(item)}
      >
        {/* Status Ribbon */}
        <View
          style={[
            tw`absolute top-0 left-0 right-0 h-1`,
            { backgroundColor: statusStyle.color },
          ]}
        />

        {/* Card Content */}
        <View style={tw`p-4 pt-5`}>
          {/* Origin -> Destination Section */}
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs text-gray-500 font-medium mb-1`}>
                FROM
              </Text>
              <Text
                style={tw`text-lg font-bold text-gray-900`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.origin}
              </Text>
            </View>

            <View style={tw`items-center mx-2`}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color="#6b7280"
                style={tw`mr-1`}
              />
              <Text style={tw` text-gray-500 mt-1 font-medium`}>
                {formatDistance(item.distance)}
              </Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
                <View style={tw`w-16 h-0.5 bg-gray-400 mx-1`} />
                <View style={tw`w-2 h-2 bg-red-500 rounded-full`} />
              </View>
            </View>

            <View style={tw`flex-1 items-end`}>
              <Text style={tw`text-xs text-gray-500 font-medium mb-1`}>TO</Text>
              <Text
                style={tw`text-lg font-bold text-gray-900 text-right`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.destination}
              </Text>
            </View>
          </View>

          {/* Load ID and Status */}
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons
                name="truck-delivery"
                size={16}
                color="#6b7280"
                style={tw`mr-1`}
              />
              <Text style={tw`text-xs text-gray-500 font-medium`}>
                {item.postId}
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons
                name={statusStyle.icon}
                size={14}
                color={statusStyle.color}
                style={tw`mr-1`}
              />
              <Chip
                style={[
                  tw`px-2 py-0.5`,
                  { backgroundColor: statusStyle.backgroundColor },
                ]}
                textStyle={{
                  ...tw`text-xs font-medium capitalize`,
                  color: statusStyle.color,
                }}
              >
                {item.status}
              </Chip>
            </View>
          </View>

          {/* Divider */}
          <View style={tw`h-0.5 bg-gray-300 my-2`} />

          {/* Load Details */}
          <View style={tw`flex-row justify-between `}>
            {/* Left Column */}
            <View style={tw`gap-y-3`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-blue-50 p-1.5 rounded-full mr-2`}>
                  <MaterialCommunityIcons
                    name="truck"
                    size={14}
                    color="#3b82f6"
                  />
                </View>
                <View>
                  <Text style={tw`text-[11px] text-gray-500 font-medium`}>
                    TRUCK TYPE
                  </Text>
                  <Text style={tw`text-sm font-medium text-gray-800`}>
                    {item.truckType}
                  </Text>
                </View>
              </View>

              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-purple-50 p-1.5 rounded-full mr-2`}>
                  <MaterialCommunityIcons
                    name="scale"
                    size={14}
                    color="#8b5cf6"
                  />
                </View>
                <View>
                  <Text style={tw`text-[11px] text-gray-500 font-medium`}>
                    WEIGHT
                  </Text>
                  <Text style={tw`text-sm font-medium text-gray-800`}>
                    {item.weight}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column */}
            <View style={tw`gap-y-3`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-green-50 p-1.5 rounded-full mr-2`}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={14}
                    color="#10b981"
                  />
                </View>
                <View>
                  <Text style={tw`text-[11px] text-gray-500 font-medium`}>
                    CONTAINTS
                  </Text>
                  <Text style={tw`text-sm font-medium text-gray-800`}>
                    {item.commodity}
                  </Text>
                </View>
              </View>

              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-amber-50 p-1.5 rounded-full mr-2`}>
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={14}
                    color="#f59e0b"
                  />
                </View>
                <View>
                  <Text style={tw`text-[11px] text-gray-500 font-medium`}>
                    VIEWS
                  </Text>
                  <Text style={tw`text-sm font-medium text-gray-800`}>
                    {item.views}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

export default PostCard;
