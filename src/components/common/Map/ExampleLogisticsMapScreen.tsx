// Example usage in a screen component
import React from 'react';
import { View } from 'react-native';
import LogisticsMap, { Truck } from './LogisticsMap';

const MapScreen: React.FC = () => {
  const origin = { latitude: 37.78825, longitude: -122.4324 };
  const destination = { latitude: 37.7749, longitude: -122.4194 };

  const nearbyTrucks: Truck[] = [
    { id: '1', latitude: 37.78225, longitude: -122.4224, heading: 45 },
    { id: '2', latitude: 37.78625, longitude: -122.4284, heading: 90 },
    { id: '3', latitude: 37.79025, longitude: -122.4304, heading: 135 },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LogisticsMap
        origin={origin}
        destination={destination}
        nearbyTrucks={nearbyTrucks}
        showTruckRoute={true}
        showOriginToDestinationRoute={true}
      />
    </View>
  );
};

export default MapScreen;
