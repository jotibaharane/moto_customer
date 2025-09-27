// --- Types ---
export interface CustomerDetails {
  CustomerID: string;
  CompanyName: string;
  ContactPerson: string;
  EmailID: string;
  ContactNo: string;
  MPIN_Flag: string;
}

export interface AuthState {
  isOnboarded: boolean;
  mobileNumber: string | null;
  isAuthenticated: boolean;
  mpinSet: boolean;
  profileCompleted: boolean;
  mpin: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  customerDetails: CustomerDetails | null;
  attempts: number;
}
