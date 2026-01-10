// @types/apiTypes.ts

// Main API Request Types
export interface Consigner {
  consigner_name: string;
  consigner_gst: string;
  consigner_address: string;
  consigner_pincode: string;
  consigner_origin: string;
  consigner_state: string;
  pickup: {
    pickup_plot_unit: string;
    pickup_area_street: string;
    pickup_pincode: string;
    pickup_state: string;
    pickup_district: string;
    pickup_taluka: string;
    pickup_map_location: string;
    pickup_Lat: number;
    pickup_Lng: number;
  };
}

export interface Consignee {
  consignee_name: string;
  consignee_gst: string;
  consignee_address: string;
  consignee_pincode: string;
  consignee_destination: string;
  consignee_state: string;
  drop: {
    drop_plot_unit: string;
    drop_area_street: string;
    drop_pincode: string;
    drop_state: string;
    drop_district: string;
    drop_taluka: string;
    drop_map_location: string;
    drop_Lat: number;
    drop_Lng: number;
  };
}

export interface Cargo {
  cargo_content: string;
  package_type: string;
  package_name: string;
}

export interface PO {
  po_number: string;
  po_date: string;
}

export interface Weight {
  No_of_package: string;
  net_weight: string;
  approx_weight: string;
  gross_weight: string;
}

export interface Chargers {
  freightAmount: string;
  loadingcharge: string;
  unloadingcharge: string;
  LRcharge: string;
  othercharge: string;
  otherchargelabel: string;
  Advance: string;
}

export interface InvoiceDetail {
  invoice_number: string;
  invoice_date: string;
  Unit: string;
  quantity: string;
  value_amount: string;
  invoice_img: string;
  remarks: string;
}

export interface ChallanDetail {
  challan_number: string;
  challan_date: string;
  Unit: string;
  quantity: string;
  value_amount: string;
  challan_img: string;
  remarks: string;
}

export interface LoadPostApiPayload {
  LoadPostID: string;
  CustomerID: string;
  consigner: Consigner;
  consignee: Consignee;
  cargo: Cargo;
  PO: PO;
  weight: Weight;
  chargers: Chargers;
  lr_no: string;
  lr_date: string;
  invoiceDetails: InvoiceDetail[];
  challanDetails: ChallanDetail[];
}

// Formik Types
export interface FormikValues {
  // Step 1 - Vehicle & Customer
  vehicleNo: string;
  driverName: string;
  driverNumber: string;
  loadPosDate: string;
  customerName: string;

  // Pickup Details
  pickupName: string;
  pickupPhone: string;
  pickupGst: string;
  pickupAddress1: string;
  pickupAddress2: string;
  pickupPincode: string;
  pickupCity: string;
  pickupState: string;
  pickupDistrict: string;
  pickupTaluka: string;
  pickupGoogle: string;
  pickupLat: number;
  pickupLng: number;

  // Drop Details
  dropName: string;
  dropPhone: string;
  dropGst: string;
  dropAddress1: string;
  dropAddress2: string;
  dropPincode: string;
  dropCity: string;
  dropState: string;
  dropDistrict: string;
  dropTaluka: string;
  dropGoogle: string;
  dropLat: number;
  dropLng: number;

  // Vehicle & Cargo Details
  VehicleType: string;
  bodyType: string;
  cargoContent: string;
  packageType: string;
  packageNote: string;
  dhalaLength: string;
  Approximate_weight: string;

  // PO Details
  poNo: string;
  poDate: string;

  // Invoices
  invoices: Array<{
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    unit: string;
    quantity: string;
    value: string;
    image: string | null;
  }>;

  // Challans
  challans: Array<{
    id: string;
    challanNo: string;
    challanDate: string;
    unit: string;
    quantity: string;
    value: string;
    image: string | null;
  }>;

  // Weight Details
  netWeight: string;
  grossWeight: string;

  // Freight Details
  freightDetails: {
    noOfPackages: string;
    netQuantity: string;
    grossWeight: string;
    freightAmount: string;
    loading: string;
    unloading: string;
    lrCharges: string;
    otherCharges: string;
    otherChargesLabel: string;
    advance: string;
    balance: string;
  };

  // Additional Fields
  labReportApplied: boolean;
  labReportAvailable: boolean;
  insurance: boolean;
  transitRisk: string;
  lr_no: string;
  lr_date: string;

  // Arrays for UI
  cargo: any[];
  packaging: any[];
  // freightDetailsArray: any[];
}

// Dropdown Types
export interface LoadPostData {
  LoadPostID: string;
  full_name: string;
  MobileNo: string;
  Vehcile_No?: string;
  Origin: string;
  Origin_City: string;
  Origin_State: string;
  Origin_Pincode: string;
  Destination: string;
  Destination_City: string;
  Destination_State: string;
  Destination_Pincode: string;
  BodyType: string;
  CargoContent: string;
  CargoPackageType: string;
  VehicleType: string;
  Weight: string;
  Approximate_weight: string;
}

export interface DropdownItem {
  loadPostId: string;
  pickupCity: string;
  dropCity: string;
  pickupName: string;
  full: LoadPostData;
}
