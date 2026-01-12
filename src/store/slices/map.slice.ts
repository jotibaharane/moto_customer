// src/store/slices/newMapSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Coordinate {
  latitude: number;
  longitude: number;
  rotation: number;
}
export interface CustomerLocation {
  customerId: string;
  lat: number;
  lng: number;
  distance: number;
}

interface MapState {
  selectedDriver: Coordinate | null;
  pickupLocation: Coordinate | null;
  destinationLocation: Coordinate | null;
  driverLocations?: Coordinate[];
  map_state: 'pending' | 'active' | 'process';
}

const initialState: MapState = {
  selectedDriver: null,
  pickupLocation: null,
  destinationLocation: null,
  driverLocations: [],
  map_state: 'pending',
};

const newMapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setdriverLocation(state, action: PayloadAction<Coordinate>) {
      state.selectedDriver = action.payload;
    },
    setDriverLocations(state, action: PayloadAction<any>) {
      state.driverLocations =
        action?.payload?.drivers?.map((state: any) => {
          return {
            latitude: Number(state?.lat) || 0,
            longitude: Number(state?.lng) || 0,
            rotation: 0,
          };
        }) || [];
    },
    setPickupLocation(state, action: PayloadAction<Coordinate>) {
      state.pickupLocation = action.payload;
    },
    setDestinationLocation(state, action: PayloadAction<Coordinate>) {
      state.destinationLocation = action.payload;
    },
    setLocatation(state, action: PayloadAction<MapState>) {
      state.map_state = action?.payload?.map_state;
      state.destinationLocation = action?.payload?.destinationLocation;
      state.pickupLocation = action?.payload?.pickupLocation;
      state.selectedDriver = action?.payload?.selectedDriver;
    },

    clearMapData(state) {
      state = initialState;
    },
  },
});

export const {
  setdriverLocation,
  setPickupLocation,
  setDestinationLocation,
  clearMapData,
  setDriverLocations,
  setLocatation,
} = newMapSlice.actions;

export default newMapSlice.reducer;
