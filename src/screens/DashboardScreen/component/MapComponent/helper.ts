import polyline from '@mapbox/polyline';
import { Location } from '@store/slices/mapSliceType';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
export const DROP_MARKER_IMG = require('@assets/icons/drop_marker.png');
export const ORIGIN_MARKER_IMG = require('@assets/icons/origin-marker.png');
export const HEAVY_TRUCK_IMG = require('@assets/icons/heavy.png');
export const MEDIUM_TRUCK_IMG = require('@assets/icons/medium.png');
export const SMALL_TRUCK_IMG = require('@assets/icons/small.png');
export const FALLBACK_IMAGE = require('@assets/icons/map_pin.png');

export const getTruckImage = (type: string) => {
  switch (type) {
    case 'small':
      return SMALL_TRUCK_IMG || FALLBACK_IMAGE;
    case 'medium':
      return MEDIUM_TRUCK_IMG || FALLBACK_IMAGE;
    case 'heavy':
      return HEAVY_TRUCK_IMG || FALLBACK_IMAGE;
    default:
      return FALLBACK_IMAGE;
  }
};

// Uber/Ola grayscale map style
export const MAP_STYLE = [
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

interface Coordinate {
  latitude: number;
  longitude: number;
}
// fetch route
export const fetchRoute = async (
  start: Location,
  end: Location,
): Promise<Coordinate[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=driving&avoid=ferries|tolls&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      let detailedCoords: Coordinate[] = [];

      route.legs.forEach((leg: any) => {
        leg.steps.forEach((step: any) => {
          const stepPoints = polyline.decode(step.polyline.points);
          const stepCoords = stepPoints.map((point: [number, number]) => ({
            latitude: point[0],
            longitude: point[1],
          }));
          detailedCoords = [...detailedCoords, ...stepCoords];
        });
      });

      return detailedCoords;
    } else {
      console.error('Directions API error:', data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    return [];
  }
};
