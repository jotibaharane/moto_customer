import { Location } from '@store/slices/mapSliceType';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import { useCallback, useState } from 'react';

interface Suggestion {
  key: string;
  value: string;
  data: any;
}

interface GooglePlace {
  place_id: string;
  description: string;
}

export const useGooglePlacesSelect = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input,
        )}&key=${GOOGLE_MAPS_API_KEY}&components=country:IN`,
      );
      const data = await response.json();
      console.log({ data });
      setSuggestions(
        (data.predictions || []).map((item: GooglePlace) => ({
          key: item.place_id,
          value: item.description,
          data: item,
        })),
      );
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<Location | null> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address,address_components`,
        );
        const data = await response.json();

        if (data?.result) {
          const location = formatLocationResult(data?.result);
          console.log({ location });
          setSelectedLocation(location);
          return location;
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [],
  );

  const formatLocationResult = (result: any): Location => {
    const addressComponents = extractAddressComponents(
      result.address_components,
    );
    return {
      address: result.formatted_address || '',
      components: addressComponents,
      coordinates: {
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0,
      },
    };
  };

  const extractAddressComponents = (addressComponents: any[]): any => {
    const components: any = {
      dist: '',
      pincode: '',
      state: '',
      place: '',
      tal: '',
    };

    if (!addressComponents) return components;

    addressComponents.forEach(component => {
      if (component.types.includes('postal_code')) {
        components.pincode = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        components.state = component.long_name;
      } else if (
        component.types.includes('locality') ||
        component.types.includes('sublocality_level_1')
      ) {
        components.place = component.long_name;
      } else if (component.types.includes('administrative_area_level_2')) {
        components.dist = component.long_name;
      } else if (
        component.types.includes('sublocality_level_2') ||
        component.types.includes('sublocality_level_3')
      ) {
        // Try to get taluka/tahsil from sublocality if available
        components.tal = component.long_name;
      }
    });

    return components;
  };
  const handleInputChange = (value: string) => {
    setInputValue(value);
    fetchSuggestions(value);
  };

  return {
    inputValue,
    suggestions,
    isLoading,
    selectedLocation,
    handleInputChange,
    getPlaceDetails,
    setSelectedLocation,
  };
};
