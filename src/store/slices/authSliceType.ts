// --- Types ---
export interface CustomerDetails {
  CustomerID: string;
  CompanyName: string;
  ContactPerson: string;
  EmailID: string;
  ContactNo: string;
  MPIN_Flag: string;
}
export interface AddressComponents {
  place: string;
  dist: string;
  tal: string;
  state: string;
  pincode: string;
}

export interface RegisteredAddress {
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
}

export interface AuthState {
  isOnboarded: boolean;
  mobileNumber: string | null;
  isAuthenticated: boolean;
  mpinSet: boolean;
  profileCompleted: boolean;
  RegisteredAddress: RegisteredAddress | null; // ← updated
  mpin: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  customerDetails: CustomerDetails | null;
  attempts: number;
}
