import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Region } from 'react-native-maps';
import { Driver, Location, MapCurrentState, MapState } from './mapSliceType';

const initialState: MapState = {
  currentMap: 'Load',
  originAddress: '',
  destinationAddress: '',
  postId: '',

  region: {
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  // Selected locations
  origin: null,
  destination: null,

  // ✅ Live GPS location
  currentlocation: null,

  drivers: [],
  selectedDriver: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCustomerMap: (state, action: PayloadAction<MapCurrentState>) => {
      state.currentMap = action.payload;
    },

    setPostId: (state, action: PayloadAction<string>) => {
      state.postId = action.payload;
    },

    setOriginAddress: (state, action: PayloadAction<string>) => {
      state.originAddress = action.payload;
    },

    setDestinationAddress: (state, action: PayloadAction<string>) => {
      state.destinationAddress = action.payload;
    },

    setRegion: (state, action: PayloadAction<Region>) => {
      state.region = action.payload;
    },

    // Pickup location
    setOrigin: (state, action: PayloadAction<Location | null>) => {
      state.origin = action.payload;
    },

    // Drop location
    setDestination: (state, action: PayloadAction<Location | null>) => {
      state.destination = action.payload;
    },

    // ✅ Set live current GPS location
    setCurrentLocation: (
      state,
      action: PayloadAction<{
        latitude: number;
        longitude: number;
        address?: string;
      }>,
    ) => {
      state.currentlocation = action.payload;
    },

    addOrUpdateDriver: (state, action: PayloadAction<Driver[]>) => {
      state.drivers = action.payload;
    },

    removeDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(d => d.id !== action.payload);
      if (state.selectedDriver?.id === action.payload) {
        state.selectedDriver = null;
      }
    },

    selectDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },

    clearSelectedDriver: state => {
      state.selectedDriver = null;
    },

    resetMap: () => initialState,
  },
});

export const {
  setRegion,
  setOrigin,
  setDestination,
  setCurrentLocation, // ✅ EXPORT
  addOrUpdateDriver,
  removeDriver,
  selectDriver,
  clearSelectedDriver,
  resetMap,
  setDestinationAddress,
  setOriginAddress,
  setPostId,
  setCustomerMap,
} = mapSlice.actions;

export default mapSlice.reducer;
