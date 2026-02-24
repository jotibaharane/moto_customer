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
// export interface FormikValues {
//   // Step 1 - Vehicle & Customer
//   vehicleNo: string;
//   driverName: string;
//   driverNumber: string;
//   loadPosDate: string;
//   customerName: string;

//   // Pickup Details
//   pickupName: string;
//   pickupPhone: string;
//   // pickupGst: string;
//   pickupAddress1: string;
//   pickupAddress2: string;
//   pickupPincode: string;
//   pickupCity: string;
//   pickupState: string;
//   pickupDistrict: string;
//   pickupTaluka: string;
//   pickupGoogle: string;
//   pickupLat: number;
//   pickupLng: number;

//   // Drop Details
//   dropName: string;
//   dropPhone: string;
//   dropGst: string;
//   dropAddress1: string;
//   dropAddress2: string;
//   dropPincode: string;
//   dropCity: string;
//   dropState: string;
//   dropDistrict: string;
//   dropTaluka: string;
//   dropGoogle: string;
//   dropLat: number;
//   dropLng: number;
//   isDeclared: boolean;

//   documentype: string;

//   invoiceDetails: Array<{
//     id: string;
//     InvoiceNo: string;
//     InvoiceDate: string;
//     Unit: string;
//     GrossQuantity: string;
//     NetQuantity: string;
//     ValueAmount: string;
//     PachageType: string;
//     MaterialName: string;
//     PoNo?: string;
//     Podate?: string;
//     ImageUpload: string;
//   }>;

//   // Challans
//   challans: Array<{
//     id: string;
//     ChallanNo: string;
//     ChallanDate: string;
//     Unit: string;
//     GrossWeight: string;
//     NetWeight: string;
//     MaterialName: string;
//     DocumentNo: string;
//     Quantity: string;
//     ValueAmount: string;
//     PoNo?: string;
//     Podate?: string;
//     ImageUpload: string;
//   }>;
//   // Bill of Entries
//   billOfEntries: Array<{
//     BillOfEntryNo: string;
//     BillOfEntryDate: string;
//     ShipperName: string;
//     Country: string;
//     BuyerName: string;
//     Destination: string;
//     Currency: string;
//     PackageType: string;
//     MaterialName: string;
//     ValueAmount: string;
//     ImageUpload: string;
//   }>;
//   // Stock Transfers
//   StockTransfers: Array<{
//     id: string;
//     StockTransferNo: string;
//     StockTransferDate: string;
//     Unit: string;
//     GrossQuantity: string;
//     NetQuantity: string;
//     TranferValue: string;
//     ImageUpload: string;
//     FromLocation: string;
//     ToLocation: string;
//     MaterialName: string;
//     PoNo?: string;
//     Podate?: string;
//   }>;
//   declaration: {
//     checkbox1: false;
//     checkbox2: false;
//     checkbox3: false;
//     checkbox4: false;
//     checkbox5: false;
//   };
//   declarationImages: [];
// }

export interface FormikValues {
  // Step 1 – Vehicle & Customer
  vehicleNo: string;
  driverName: string;
  driverNumber: string;
  loadPosDate: string;
  customerName: string;

  // Pickup Details
  pickupName: string;
  pickupPhone: string;
  pickupGst?: string;
  pickupAddress1: string;
  pickupAddress2: string;
  pickupPincode: string;
  pickupCity: string;
  pickupState: string;
  pickupDistrict?: string;
  pickupTaluka?: string;
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
  dropDistrict?: string;
  dropTaluka?: string;
  dropGoogle: string;
  dropLat: number;
  dropLng: number;
  // Declaration
  isDeclared: boolean;
  // Shipment Type
  documentype: string;
  // STEP 2 – Invoices
  invoices: Array<{
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    unit: string;
    quantity: string;
    netWeight?: string;
    grossWeight?: string;
    value: string;
    packageType: string;
    materialType: string;
    poNo?: string;
    poDate?: string;
    image: string;
    remarks?: string;
  }>;

  // Challans
  challans: Array<{
    id: string;
    challanNo: string;
    challanDate: string;
    unit: string;
    quantity: string;
    netWeight: string;
    materialType: string;
    documentno: string;
    value: string;
    poNo?: string;
    poDate?: string;
    image: string;
    packageType?: string;
    remarks?: string;
  }>;

  // Bill of Entries
  billOfEntries: Array<{
    billOfEntryNo: string;
    billOfEntryDate: string;
    shipperName: string;
    country: string;
    buyerName: string;
    destination: string;
    currency: string;
    packageType: string;
    materialType: string;
    value: string;
    image: string;
    remarks?: string;
  }>;

  // Stock Transfers
  StockTransfers: Array<{
    id: string;
    StockTransferNo: string;
    StockTransferDate: string;
    unit: string;
    quantity: string;
    netWeight: string;
    grossWeight?: string;
    value: string;
    image: string;
    fromLocation: string;
    toLocation: string;
    materialType: string;
    poNo?: string;
    poDate?: string;
    remarks?: string;
  }>;

  // Payload-2 Declaration Texts
  declarationTextList: string[];

  // Images
  declarationImages: string[];
}

export interface Address {
  ConsignerDetails: {
    Name: string;
    Gst: string;
    Address1: string;
    Address2: string;
    MobileNo: string;
    AlternateMobileNo: string;
    Pincode: string;
    Destination: string;
    City: string;
    State: string;
    Pick_lat: string;
    Pick_lng: string;
    GoogleLocation: string;
  };
  ConsigneeDetails: {
    Name: string;
    Gst: string;
    MobileNo: string;
    Address1: string;
    Address2: string;
    Pincode: string;
    Destination: string;
    Drop_lat: string;
    Drop_lng: string;
    GoogleLocation: string;
    City: string;
    State: string;
  };
}

export interface Document {
  DocumentType: string;
  InvoiceNo?: {
    InvoiceNo: string;
    InvoiceDate: string;
    Unit: string;
    GrossQuantity: string;
    NetQuantity: string;
    ValueAmount: string;
    PachageType: string;
    MaterialName: string;
    PoNo?: string;
    Podate?: string;
    ImageUpload: string;
  };
  ChallanNo?: {
    ChallanNo: string;
    ChallanDate: string;
    Unit: string;
    GrossWeight: string;
    NetWeight: string;
    MaterialName: string;
    DocumentNo: string;
    Quantity: string;
    ValueAmount: string;
    PoNo?: string;
    Podate?: string;
    ImageUpload: string;
  };
  StockTransferNo?: {
    StockTransferNo: string;
    StockTransferDate: string;
    Unit: string;
    GrossQuantity: string;
    NetQuantity: string;
    TranferValue: string;
    ImageUpload: string;
    FromLocation: string;
    ToLocation: string;
    MaterialName: string;
    PoNo?: string;
    Podate?: string;
  };
  BillOfEntryNo?: {
    BillOfEntryNo: string;
    BillOfEntryDate: string;
    ShipperName: string;
    Country: string;
    BuyerName: string;
    Destination: string;
    Currency: string;
    PackageType: string;
    MaterialName: string;
    ValueAmount: string;
    ImageUpload: string;
  };
}
export interface Declaration {
  IsDeclared: boolean;
  ImageUpload: string;
}
export interface VdltValues {
  LoadposytID: string;
  VehicleNo: string;
  DriverName: string;
  Address: Address[];
  Documents: Document[];
  isDeclared: boolean;
  Declaration: Declaration;
}
// Dropdown Types
export interface LoadPostData {
  LoadPostID: string;
  CustomerID: string;

  driver_id: string;
  DriverID: string;
  dllDriverID: string;

  full_name: string;
  MobileNo: string;

  VehicleType: string;
  Weight: string;
  Approximate_weight: number;

  verify_flag: 'Y' | 'N';
  master_status: 'Y' | 'N';

  BodyType: string[]; // array in API
  CargoContent: string;
  CargoPackageType: string;
  ExpectedAvailableTime: string;

  // ================= PICKUP =================
  PickupContactPerson: string;
  PickupContactNumber: string;
  PickupAddress: string;
  PickupPlotBuilding: string;
  PickupStreetArea: string;
  PickupCity: string;
  PickupDistrict: string;
  PickupTaluka: string;
  PickupState: string;
  PickupPincode: string;
  PickupLat: number;
  PickupLng: number;

  // ================= DELIVERY =================
  DeliveryCompanyName: string;
  DeliveryContactPerson: string;
  DeliveryContactNumber: string;
  DeliveryAddress: string;
  DeliveryPlotBuilding: string;
  DeliveryStreetArea: string;
  DeliveryCity: string;
  DeliveryDistrict: string;
  DeliveryPincode: string;
  DeliveryLat: number;
  DeliveryLng: number;

  // ================= STATUS =================
  CustomerStatus: string;
  VendorStatus: string | null;
  DriverStatus: string;
  LPStatus: string;
  LP_status: string;

  // ================= LOCATION =================
  DriverLat: number;
  DriverLng: number;

  VendorID: string | null;
}

// export interface LoadPostData {
//   LoadPostID: string;

//   // Vehicle & Driver
//   Vehcile_No?: string;
//   MobileNo: string;

//   // ================= PICKUP / CONSIGNOR =================
//   pickupName: string;
//   pickupPhone?: string;
//   pickupGst?: string;
//   pickupAddress1: string;
//   pickupAddress2?: string;
//   pickupCity: string;
//   pickupDistrict?: string;
//   pickupState: string;
//   pickupPincode: string;
//   pickupGoogle?: string;
//   pickupLat?: number;
//   pickupLng?: number;

//   // ================= DROP / CONSIGNEE =================
//   dropName: string;
//   dropPhone?: string;
//   dropGst?: string;
//   dropAddress1: string;
//   dropAddress2?: string;
//   dropCity: string;
//   dropDistrict?: string;
//   dropState: string;
//   dropPincode: string;
//   dropGoogle?: string;
//   dropLat?: number;
//   dropLng?: number;

//   // ================= CARGO =================
//   BodyType: string;
//   CargoContent: string;
//   CargoPackageType: string;
//   VehicleType: string;
//   Weight: string;
//   Approximate_weight: string;
// }

export interface DropdownItem {
  loadPostId: string;
  pickupCity: string;
  dropCity: string;
  pickupName: string;
  full: LoadPostData;
}
