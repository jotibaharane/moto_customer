// ===============================================
// File: src/components/Map/types.ts
// ===============================================
export type LatLngStrict = { latitude: number; longitude: number };

export type TruckLocation = {
  id: string;
  latitude: number;
  longitude: number;
  heading?: number; // degrees, optional
};

export type LogisticsMapProps = {
  origin: LatLngStrict;
  destination?: LatLngStrict;
  nearbyTrucks?: TruckLocation[];
  showTruckRoute?: boolean;
  showOriginToDestinationRoute?: boolean;
  /** Google Maps Platform API Key (Directions API enabled) */
  apiKey: string;
  /** padding for fitToCoordinates */
  mapPadding?: { top: number; right: number; bottom: number; left: number };
  /** custom JSON map style */
  mapStyle?: any[];
  /** polyline width */
  strokeWidth?: number;
  /** callback when map & data are ready */
  onReady?: () => void;
  /** error callback */
  onError?: (err: unknown) => void;
};
