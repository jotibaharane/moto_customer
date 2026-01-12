import { Region } from 'react-native-maps';

// Types
export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Marker {
  id: string;
  coordinate: Location;
  title: string;
  description: string;
  type: 'origin' | 'drop';
}

export interface Driver {
  id: string;
  latitude: number;
  longitude: number;
  type: 'small' | 'medium' | 'heavy';
  available: boolean;
  rotation: number;
  driver: string;
  licensePlate: string;
}

export type MapCurrentState = 'Load' | 'Process' | 'Active';
export interface MapState {
  region: Region;
  origin: Location | null;
  destination: Location | null;
  drivers: Driver[];
  selectedDriver: Driver | null;
  currentlocation: string;
  currentMap: MapCurrentState;
  originAddress: string;
  destinationAddress: string;
  postId: string;
}
