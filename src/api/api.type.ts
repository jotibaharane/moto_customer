// otp send
export type SendOtpRequest = {
  mobile_number: string;
};

export interface OtpResponse {
  status: string;
  message: string;
}

// validate otp
export type ValidateOtpRequest = {
  mobile_number: string;
  otp: string;
};
export interface ValidateOtpResponse {
  status: string;
  message: string;
  Customer_Details?: {
    CustomerID: string;
    CompanyName: string;
    ContactPerson: string;
    EmailID: string;
    ContactNo: string;
    MPIN_Flag: string;
  };
}

// state
export interface State {
  state: string;
}

export interface StateResponse {
  status: string;
  message: string;
  data: State[];
}

// pincode
export interface PincodeData {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

export interface PincodeDataResponse {
  status: string;
  message: string;
  data: PincodeData;
}

export interface PincodeDataRequest {
  pincode: string;
}

// district
export interface DistrictData {
  region: string;
}

export interface DistrictResponse {
  status: string;
  message: string;
  data: DistrictData[];
}

export interface DistrictRequest {
  state: string;
}

// customer register
export type RegisterRequest = {
  CompanyType: string;
  CompanyName: string;
  ContactPerson: string;
  ContactNo: string;
  EmailID: string;
  Address1: string;
  Address2: string;
  Pincode: string;
  State: string;
  Destination: string;
  City: string;
  RegisteredAddress?: {
    id: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
    addressComponents: {
      place: string;
      dist: string;
      tal: string;
      state: string;
      pincode: string;
    };
  };
};

export interface CustomerDetails {
  CustomerID: string;
  CompanyName: string;
  Address: string;
  ContactPerson: string;
  EmailID: string;
  ContactNo: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  Customer_Details: CustomerDetails;
}
// mpin
export interface MpinRequest {
  CustomerID: string;
  ContactNo: string;
  Customer_MPIN: string;
}
export interface MpinResponse {
  status_code: string;
  status_desc: string;
}

// mpin login
export interface MpinLoginRequest {
  CustomerID: string;
  ContactNo: string;
  Customer_MPIN: string;
}
export interface MpinLoginResponse {
  status_code: string;
  status_desc: string;
}

// customer post

export interface CustomerPostRequest {
  CustomerID: string;
}
export interface CustomerLoadPost {
  LoadPostID: string;
  CustomerID: string;
  Origin: string;
  Destination: string;
  VehicleType: string;
  Weight: string;
  verify_flag: string;
  verification_code: string;
  trip_status: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string;
  PostInsertDate: string | null;
  PostUpdateDate: string | null;
  Origin_Lat: number;
  Origin_Lng: number;
  Origin_City: string;
  Origin_District: string;
  Origin_Taluka: string;
  Origin_State: string;
  Origin_Pincode: string;
  Destination_Lat: number;
  Destination_Lng: number;
  Destination_City: string;
  Destination_District: string;
  Destination_Taluka: string;
  Destination_State: string;
  Destination_Pincode: string;
  AddressInsertDate: string | null;
  AddressUpdateDate: string | null;
}

export interface CustomerPostResponse {
  status: string;
  message: string;
  data: CustomerLoadPost[];
}

// process trips
export interface CustomerProcessRequest {
  LoadPostID?: string;
  CustomerID: string;
}
export interface CustomerProcessResponse {
  status: string;
  message: string;
  data: CustomerProcess[];
}

export interface CustomerProcess {
  LoadPostID: string;
  CustomerID: string;
  Origin: string;
  Destination: string;
  VehicleType: string;
  Weight: string;
  DhalaLength: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string; // ISO Date string
  PostInsertDate: string; // ISO Date string
  PostUpdateDate: string | null; // Nullable
  Origin_Lat: number;
  Origin_Lng: number;
  Origin_City: string;
  Origin_District: string;
  Origin_Taluka: string;
  Origin_State: string;
  Origin_Pincode: string;
  Destination_Lat: number;
  Destination_Lng: number;
  Destination_City: string;
  Destination_District: string;
  Destination_Taluka: string;
  Destination_State: string;
  Destination_Pincode: string;
  AddressInsertDate: string; // ISO Date string
  AddressUpdateDate: string | null; // Nullable
  CustomerPostID: string;
  cpsCustomerID: string;
  VendorID: string | null;
  DriverID: string | null;
  CustomerStatus: string;
  VendorStatus: string | null;
  DriverStatus: string | null;
  tripStatus: string;
  DriverLat: number | null;
  DriverLng: number | null;
  dllDriverID: string | null;
  MobileNo: string;
}

// active trips
export interface ActiveTrip {
  ActiveTripID: string;
  Customer_LoadPostID: string;
  Driver_LoadPostID: string;
  CustomerID: string;
  DriverID: string;
  VendorID: string;
  DriverMobile: string;
  VehicleNumber: string;
  VehicleType: string;
  Customer_Origin: string;
  Customer_Origin_Lat: number;
  Customer_Origin_Lng: number;
  Customer_Destination: string;
  Customer_Destination_Lat: number;
  Customer_Destination_Lng: number;
  Driver_Lat: number;
  Driver_Lng: number;
  Driver_Status: string;
  Vendor_Status: string;
  Customer_Status: string;
  Trip_Status: string;
  AcceptDate: string;
  CloseDate: string | null;
}

export interface ActiveTripResponse {
  status: string;
  message: string;
  data: ActiveTrip[];
}

export interface ActiveTripRequest {
  LoadPostID?: string;
  CustomerID: string;
}

// customer load post
export interface CustomerDetails {
  CustomerID: string;
  CompanyName: string;
  Address: string;
  ContactPerson: string;
  EmailID: string;
  ContactNo: string;
}

export interface InsertCustomerResponse {
  status: string;
  message: string;
  Customer_Details?: CustomerDetails;
}

export interface TransportRequest {
  CustomerID: string;
  origin: Location;
  destination: Location;
  VehicleType: string;
  Weight: string;
  DhalaLength: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string;
  LoadPostID?: String;
  // Optional fields
  customCargoType?: string;
  Over_Dimensional_Cargo?: string;
}
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressComponents {
  dist: string;
  pincode: string;
  state: string;
  place: string;
  tal: string;
}

export interface Location {
  address: string;
  coordinates: Coordinates;
  components: AddressComponents;
}

export interface ShipmentData {
  BodyType: string;
  PickupType: string;
  CargoContent: string;
  CargoPackageType: string;
  registeredAddress?: string;
  cargo_type: string;
  CustomerID: string;
  destination: Location;
  ConsigneeName: string;
  ContactNumber: string;
  ExpectedAvailableDate?: string;
  Pincode: string;
  Taluka: string;
  Destination_1: string;
  Destination_2: string;
  District: string;
  state: string;
  ContactPerson: string;
  ConsigneeContactNumber: string;
  Origin_1: string;
  Origin_2: string;
  DhalaLength: string;
  Approximate_weight: string;
  ExpectedAvailableTime: string;
  origin: Location;
  VehicleType: string;
  Weight: string;
  // pickupType: string;
}

// body type
export interface BodyTypeRequest {
  vehicleType: string;
  weightRange: string;
}
export interface BodyTypeData {
  VehicleName: string;
  VehicleType: string;
  BodyType: string;
  WeightRange: string;
  img: string | null;
}

export interface BodyTypeResponse {
  status: string;
  message: string;
  data: BodyTypeData[];
}

// pincode
export interface PincodeResponse {
  status: string;
  message: string;
  data: PincodeData[];
}

// truck type
export interface TruckType {
  VehicleType: string;
  img: string | null;
  WeightRange: string;
}

export interface TruckResponse {
  status: string;
  message: string;
  data: TruckType[];
}

// weight
export interface WeightRange {
  WeightRange: string;
}

export interface WeightResponse {
  status: string;
  message: string;
  data: WeightRange[];
}
export type ApproximateWeightRequest = {
  vehicleType: string;
};

// package type
export interface CargoPackageType {
  cargo_type: string;
  packaging_type: string;
  img: string | null;
}

export interface CargoPackageTypesResponse {
  status: string;
  message: string;
  data: CargoPackageType[];
}
export interface PackageTypeRequest {
  cargotype: string;
}

// cargo content
export interface CargoContentType {
  cargo_type: string;
  packaging_type: string;
  img: string | null;
}

export interface CargoContentTypesResponse {
  status: string;
  message: string;
  data: CargoContentType[];
}

// driver
export interface NearestDriversResponse {
  status: string;
  message: string;
  data: DriverData[];
}

export interface DriverData {
  LoadPostID: string;
  DriverID: string;
  VehicleType: string;
  Driver_Origin_Lat: number;
  Driver_Origin_Lng: number;
  DistanceInKm: number;
  Customer_LoadPostID: string;
  Customer_Origin_Lat: number;
  Customer_Origin_Lng: number;
  Customer_Destination_Lat: number;
  Customer_Destination_Lng: number;
  VehicleNumber: string;
}

export interface NearestDriversRequest {
  LoadPostID: string;
  CustomerID: string;
}
