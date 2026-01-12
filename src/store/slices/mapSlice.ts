import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Region } from 'react-native-maps';
import { Driver, Location, MapCurrentState, MapState } from './mapSliceType';

// Initial state
const initialState: MapState = {
  currentMap: 'Load',
  originAddress: '',
  postId: '',
  destinationAddress: '',
  region: {
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  origin: null,
  destination: null,
  drivers: [],
  selectedDriver: null,
};

// Create the slice
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Update the map region (e.g., when user pans/zooms)
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
    // Set origin location
    setOrigin: (state, action: PayloadAction<Location>) => {
      state.origin = action.payload;
    },
    // Set destination location
    setDestination: (state, action: PayloadAction<Location | null>) => {
      state.destination = action.payload;
    },
    // Add or update a driver
    addOrUpdateDriver: (state, action: PayloadAction<Driver[]>) => {
      state.drivers = action.payload;
    },
    addDriversFromSocket: (state, action: PayloadAction<any[]>) => {
      state.drivers =
        action?.payload?.drivers?.map((state: any) => {
          return {
            available: '',
            driver: state?.DriverID,
            id: state?.DriverID,
            latitude: Number(state?.lat) || 0,
            licensePlate: state?.DriverID,
            longitude: Number(state?.lng) || 0,
            rotation: 0,
            type: '',
          };
        }) || [];
    },
    // Remove a driver
    removeDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(d => d.id !== action.payload);
      if (state.selectedDriver?.id === action.payload) {
        state.selectedDriver = null;
      }
    },
    // Select a driver and update region to focus on their location
    selectDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },
    // Clear selected driver
    clearSelectedDriver: state => {
      state.selectedDriver = null;
    },
    // Reset map to initial state
    resetMap: () => initialState,
  },
});

// Export actions
export const {
  setRegion,
  setOrigin,
  setDestination,
  addOrUpdateDriver,
  removeDriver,
  selectDriver,
  clearSelectedDriver,
  resetMap,
  setDestinationAddress,
  setOriginAddress,
  setPostId,
  setCustomerMap,
  addDriversFromSocket,
} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;
