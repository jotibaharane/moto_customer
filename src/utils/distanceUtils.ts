// utils/distanceUtils.ts

import { GOOGLE_MAPS_API_KEY } from './env';

interface DistanceResult {
  distance: string;
  duration: string;
}

export const calculateDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<DistanceResult | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      return {
        distance: data.rows[0].elements[0].distance.text,
        duration: data.rows[0].elements[0].duration.text,
      };
    }
    return null;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
};
