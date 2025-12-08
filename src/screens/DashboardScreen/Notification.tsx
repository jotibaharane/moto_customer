import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function Notification() {
  const navigation = useNavigation<any>();

  // Example mock data — replace with API data if available
  const notifications = [
    {
      id: '1',
      driverName: 'John Doe',
      driverImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      vehicleType: 'Truck',
      vehicleNumber: 'AB-1234',
      message: 'Driver assigned for your delivery',
      time: '5 mins ago',
    },
    {
      id: '2',
      driverName: 'Sarah Lee',
      driverImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      vehicleType: 'Van',
      vehicleNumber: 'XY-9876',
      message: 'Vehicle has reached the pickup point',
      time: '30 mins ago',
    },
    {
      id: '3',
      driverName: 'Robert King',
      driverImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      vehicleType: 'Mini Truck',
      vehicleNumber: 'KA-4523',
      message: 'Delivery completed successfully',
      time: '1 hr ago',
    },
  ];

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.driverRow}>
        <Image source={{ uri: item.driverImage }} style={styles.driverImage} />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.driverName}</Text>
          <Text style={styles.vehicleInfo}>
            {item.vehicleType} • {item.vehicleNumber}
          </Text>
        </View>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🔙 Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* 📋 Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButton: {
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  message: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
});
