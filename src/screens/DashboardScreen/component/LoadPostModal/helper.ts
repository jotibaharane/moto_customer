import { Dimensions } from 'react-native';

export interface LoadPost {
  LoadPostID: string;
  CustomerID: string;
  Origin: string;
  Destination: string;
  VehicleType: string;
  Weight: string;
  verify_flag: string;
  verification_code: string;
  trip_status: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string;
  PostInsertDate: string;
  PostUpdateDate: string | null;
  Origin_Lat: number;
  Origin_Lng: number;
  Origin_City: string;
  Origin_District: string;
  Origin_Taluka: string;
  Origin_State: string;
  Origin_Pincode: string;
  Destination_Lat: number;
  Destination_Lng: number;
  Destination_City: string;
  Destination_District: string;
  Destination_Taluka: string;
  Destination_State: string;
  Destination_Pincode: string;
  AddressInsertDate: string;
  AddressUpdateDate: string | null;
}

export const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#FFA500';
    case 'confirmed':
      return '#28A745';
    case 'in progress':
      return '#007BFF';
    case 'completed':
      return '#6C757D';
    case 'cancelled':
      return '#DC3545';
    default:
      return '#6C757D';
  }
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};
