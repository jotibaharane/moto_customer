import { VehicleSheetState } from './VehicSheetType';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: VehicleSheetState = {
  isDocumentsAvailable: false,
};
const vehicleSheetSlice = createSlice({
  name: 'vehicleSheet',
  initialState,
  reducers: {
    setIsDocumentsAvailable: (
      state: VehicleSheetState,
      action: PayloadAction<boolean>,
    ) => {
      state.isDocumentsAvailable = action.payload;
    },
  },
});

export const { setIsDocumentsAvailable } = vehicleSheetSlice.actions;
export default vehicleSheetSlice.reducer;
