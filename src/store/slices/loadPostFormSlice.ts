import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialFormState: LoadPostFormValues = {
  BodyType: '',
  CargoContent: '',
  CargoPackageType: '',
  CustomerID: '',
  destination: {
    address: '',
    coordinates: { latitude: 0, longitude: 0 },
    components: {},
  },
  ConsigneeName: '',
  Pincode: '',
  Taluka: '',
  Destination_1: '',
  Destination_2: '',
  District: '',
  state: '',
  ContactPerson: '',
  ContactNumber: '',
  Origin_1: '',
  Origin_2: '',
  DhalaLength: '',
  ExpectedAvailableTime: '',
  origin: {
    address: '',
    coordinates: { latitude: 0, longitude: 0 },
    components: {},
  },
  VehicleType: '',
  Weight: '',
};

const initialState: LoadPostFormState = {
  form: initialFormState,
  step: 1,
  errors: {},
};

const loadPostFormSlice = createSlice({
  name: 'loadPostForm',
  initialState,
  reducers: {
    // Update a top-level form field
    updateFormField: (
      state,
      action: PayloadAction<Partial<LoadPostFormValues>>,
    ) => {
      state.form = { ...state.form, ...action.payload };
    },
    // Update nested destination fields
    updateDestination: (
      state,
      action: PayloadAction<
        Partial<AddressDetails & { details?: Partial<DestinationDetails> }>
      >,
    ) => {
      state.form.destination = { ...state.form.destination, ...action.payload };
    },
    // Update nested origin fields
    updateOrigin: (
      state,
      action: PayloadAction<
        Partial<AddressDetails & { details?: Partial<OriginDetails> }>
      >,
    ) => {
      state.form.origin = { ...state.form.origin, ...action.payload };
    },
    // Validate fields for the current step
    validateStep: state => {
      const errors: Partial<Record<keyof LoadPostFormValues | string, string>> =
        {};
      if (state.step === 1) {
        if (!state.form.origin.address)
          errors['origin.address'] = 'Origin address is required';
        if (!state.form.origin.coordinates.latitude)
          errors['origin.coordinates.latitude'] = 'Latitude is required';
        if (!state.form.origin.coordinates.longitude)
          errors['origin.coordinates.longitude'] = 'Longitude is required';
        if (!state.form.destination.address)
          errors['destination.address'] = 'Destination address is required';
        if (!state.form.destination.coordinates.latitude)
          errors['destination.coordinates.latitude'] = 'Latitude is required';
        if (!state.form.destination.coordinates.longitude)
          errors['destination.coordinates.longitude'] = 'Longitude is required';
        if (state.form.Pincode && !/^\d{6}$/.test(state.form.Pincode))
          errors.Pincode = 'Pincode must be 6 digits';
        if (
          state.form.ContactNumber &&
          !/^\d{10}$/.test(state.form.ContactNumber)
        )
          errors.ContactNumber = 'Contact number must be 10 digits';
      } else if (state.step === 2) {
        if (!state.form.BodyType) errors.BodyType = 'Body Type is required';
        if (!state.form.CargoContent)
          errors.CargoContent = 'Cargo Content is required';
        if (!state.form.CargoPackageType)
          errors.CargoPackageType = 'Cargo Package Type is required';
        if (!state.form.CustomerID)
          errors.CustomerID = 'Customer ID is required';
        if (!state.form.VehicleType)
          errors.VehicleType = 'Vehicle Type is required';
        if (!state.form.Weight) errors.Weight = 'Weight is required';
      }
      state.errors = errors;
    },
    // Move to the next step if valid
    nextStep: state => {
      state.errors = {};
      const errors: Partial<Record<keyof LoadPostFormValues | string, string>> =
        {};
      if (state.step === 1) {
        if (!state.form.origin.address)
          errors['origin.address'] = 'Origin address is required';
        if (!state.form.origin.coordinates.latitude)
          errors['origin.coordinates.latitude'] = 'Latitude is required';
        if (!state.form.origin.coordinates.longitude)
          errors['origin.coordinates.longitude'] = 'Longitude is required';
        if (!state.form.destination.address)
          errors['destination.address'] = 'Destination address is required';
        if (!state.form.destination.coordinates.latitude)
          errors['destination.coordinates.latitude'] = 'Latitude is required';
        if (!state.form.destination.coordinates.longitude)
          errors['destination.coordinates.longitude'] = 'Longitude is required';
        if (state.form.Pincode && !/^\d{6}$/.test(state.form.Pincode))
          errors.Pincode = 'Pincode must be 6 digits';
        if (
          state.form.ContactNumber &&
          !/^\d{10}$/.test(state.form.ContactNumber)
        )
          errors.ContactNumber = 'Contact number must be 10 digits';
      } else if (state.step === 2) {
        if (!state.form.BodyType) errors.BodyType = 'Body Type is required';
        if (!state.form.CargoContent)
          errors.CargoContent = 'Cargo Content is required';
        if (!state.form.CargoPackageType)
          errors.CargoPackageType = 'Cargo Package Type is required';
        if (!state.form.CustomerID)
          errors.CustomerID = 'Customer ID is required';
        if (!state.form.VehicleType)
          errors.VehicleType = 'Vehicle Type is required';
        if (!state.form.Weight) errors.Weight = 'Weight is required';
      }
      state.errors = errors;
      if (Object.keys(errors).length === 0 && state.step < 3) {
        state.step += 1;
      }
    },
    // Move to the previous step
    prevStep: state => {
      if (state.step > 1) {
        state.step -= 1;
        state.errors = {};
      }
    },
    // Submit the form
    submitForm: state => {
      // Simulate submission (replace with API call)
      console.log('Form submitted:', state.form);
      // Reset form and step
      state.form = initialFormState;
      state.step = 1;
      state.errors = {};
    },
    // Reset the form
    resetForm: state => {
      state.form = initialFormState;
      state.step = 1;
      state.errors = {};
    },
  },
});

export const {
  updateFormField,
  updateDestination,
  updateOrigin,
  validateStep,
  nextStep,
  prevStep,
  submitForm,
  resetForm,
} = loadPostFormSlice.actions;
export default loadPostFormSlice.reducer;
