interface AddressDetails {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  components: Record<string, any>;
}

interface DestinationDetails {
  ConsigneeName?: string;
  Pincode?: string;
  Taluka?: string;
  Destination_1?: string;
  Destination_2?: string;
  District?: string;
  state?: string;
}

interface OriginDetails {
  ContactPerson?: string;
  ContactNumber?: string;
  Origin_1?: string;
  Origin_2?: string;
}

interface LoadPostFormValues {
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  CustomerID: string;
  destination: AddressDetails & { details?: DestinationDetails };
  ConsigneeName?: string;
  Pincode?: string;
  Taluka?: string;
  Destination_1?: string;
  Destination_2?: string;
  District?: string;
  state?: string;
  ContactPerson?: string;
  ContactNumber?: string;
  Origin_1?: string;
  Origin_2?: string;
  DhalaLength: string;
  ExpectedAvailableTime: string;
  origin: AddressDetails & { details?: OriginDetails };
  VehicleType: string;
  Weight: string;
}

interface LoadPostFormState {
  form: LoadPostFormValues;
  step: number;
  errors: Partial<Record<keyof LoadPostFormValues | string, string>>;
}
