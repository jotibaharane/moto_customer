import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Formik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import * as Yup from 'yup';

import {
  useGetcustomerloadpostdetailsQuery,
  useInsertVehicleloadpostdatasheetMutation,
  useUpdateloadpostMutation,
} from '@api/hooks_api';
import LoadpostDropdown from '@components/common/DropDown/LoadpostDropdown';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import Step1_VehicleCustomer from './Step1_VehicleCustomer';
import Step2_CargoInvoice from './Step2_CargoInvoice';
// import ChargesFreightInput from './ChargesFreightInput';
// Import types
import {
  DropdownItem,
  FormikValues,
  LoadPostApiPayload,
  LoadPostData,
  VdltValues,
} from '../forms/api.types';

// ========== DUMMY DATA ==========
const DUMMY_DATA = [
  {
    LoadPostID: 'LP721277',

    // Vehicle & Driver
    Vehcile_No: 'MH12DE1433',
    MobileNo: '8779239065',

    // ================= PICKUP / CONSIGNOR =================
    pickupName: 'RAIS AHMED SHAH',
    pickupPhone: '8779239065',
    pickupGst: '27AAACR5055M1ZP',
    pickupAddress1: 'Ratan Compound',
    pickupAddress2: 'Near Anjur Phata',
    pickupCity: 'Bhiwandi',
    pickupDistrict: 'Thane',
    pickupState: 'Maharashtra',
    pickupPincode: '421302',
    pickupGoogle: '825H+JJ Bhiwandi, Maharashtra, India',

    // ================= DROP / CONSIGNEE =================
    dropName: 'Amit Kumar',
    dropPhone: '9876543210',
    dropGst: '07AABCS1429M1ZQ',
    dropAddress1: 'Ratan Lal Market',
    dropAddress2: 'Ajmeri Gate',
    dropCity: 'New Delhi',
    dropDistrict: 'Central Delhi',
    dropState: 'Delhi',
    dropPincode: '110055',
    dropGoogle:
      'J6V9+2MW, Ratan Lal Market, Ajmeri Gate, New Delhi, Delhi, 110055, India',

    // ================= CARGO =================
    BodyType: 'Multiaxel Trailer',
    CargoContent: 'Agro',
    CargoPackageType: 'Corrugated Boxes',
    VehicleType: 'Multi Axle',
    Weight: '12500-18000kg',
    Approximate_weight: '200',
  },
];

// ========== HELPER FUNCTIONS ==========
const transformToDropdownItems = (data: LoadPostData[]): DropdownItem[] => {
  console.log({ data });
  return data.map(item => ({
    loadPostId: item.LoadPostID,
    Vehicleno: item?.VehicleType,
    pickupCity: item?.PickupCity,
    dropCity: item?.DeliveryCity,

    pickupName: item?.PickupContactPerson,
    full: item,
  }));
};

const mapApiDataToFormik = (item: LoadPostData): Partial<FormikValues> => ({
  // Pickup Details
  pickupName: item?.PickupContactPerson || '',
  pickupPhone: item?.PickupContactNumber || '',
  pickupAddress1: item?.PickupPlotBuilding || '',
  pickupAddress2: item?.PickupStreetArea || '',
  // pickupGoogle: item.Origin || '',
  pickupCity: item?.PickupCity || '',
  pickupState: item?.PickupState || '',
  pickupPincode: item?.PickupPincode || '',
  //pickupGst: '27AAACR5055M1ZP',
  // pickupDistrict: 'Thane',
  pickupTaluka: item?.PickupTaluka || '',
  pickupLat: item?.PickupLat || 0,
  pickupLng: item?.PickupLng || 0,

  // Drop Details
  dropName: item?.DeliveryContactPerson || '',
  dropPhone: item?.DeliveryContactNumber || '',
  dropAddress1: item?.DeliveryPlotBuilding || '',
  dropAddress2: item?.DeliveryStreetArea || '',
  dropGoogle: item?.DeliveryGoogleMapLocation || '',
  dropCity: item?.DeliveryCity || '',
  dropState: item?.DeliveryState || '',
  dropPincode: item?.DeliveryPincode || '',
  dropGst: item?.DeliveryGST || '',
  dropDistrict: item?.DeliveryDistrict || '',
  dropTaluka: item?.DeliveryTaluka || '',
  dropLat: item?.DeliveryLat || 0,
  dropLng: item?.DeliveryLng || 0,

  // Documents: item.isDocumentsAvailable || [],

  // Vehicle & Cargo Details
  // bodyType: item.BodyType || '',
  // cargoContent: item.CargoContent || '',
  // packageType: item.CargoPackageType || '',
  // dhalaLength: '',
  // Approximate_weight: item.Approximate_weight || '',
  // netWeight: item.Weight || '',
  // grossWeight: item.Weight || '',
  // VehicleType: item.VehicleType || '',
  // Declaration: item.StockTransfers   || '',

  // Driver Details
  // driverName: item. || '',
  // driverNumber: item.MobileNo || '',
  // vehicleNo: item.Vehcile_No || '',
});

// ========== API PAYLOAD TRANSFORMATION ==========
// const transformToApiPayload = (
//   values: FormikValues,
//   selectedLoadPostId: string,
// ): VdltValues => {
//   // Get CustomerID from Redux store or use default

//   return {
//     LoadPostID: selectedLoadPostId || 'LP999888',
//     CustomerID: '123654',

//     consigner: {
//       consigner_name: values.pickupName || '',
//       //  consigner_gst: values.Address[0]?.ConsignerDetails?.GST || '',
//       consigner_address: `${values.pickupAddress1 || ''} ${
//         values.pickupAddress2 || ''
//       }`.trim(),
//       consigner_pincode: values.pickupPincode || '',
//       consigner_origin: values.pickupCity || '',
//       consigner_state: values.pickupState || '',
//       consigner_gst: values.dropGst || '',

//       // pickup: {
//       //   pickup_plot_unit: values.pickupAddress1 || '',
//       //   pickup_area_street: values.pickupAddress2 || '',
//       //   pickup_pincode: values.pickupPincode || '',
//       //   pickup_state: values.pickupState || '',
//       //   pickup_district: values.pickupDistrict || '',
//       //   pickup_taluka: values.pickupTaluka || '',
//       //   pickup_map_location: values.pickupGoogle || '',
//       //   pickup_Lat: values.pickupLat || 0,
//       //   pickup_Lng: values.pickupLng || 0,
//       // },
//     },

//     consignee: {
//       consignee_name: values.customerName || '',
//       // consignee_gst: values.dropGst || '',
//       consignee_address: `${values.dropAddress1 || ''} ${
//         values.dropAddress2 || ''
//       }`.trim(),
//       consignee_pincode: values.dropPincode || '',
//       consignee_destination: values.dropCity || '',
//       consignee_state: values.dropState || '',
//       consignee_gst: values.dropGst || '',

//       // drop: {
//       //   drop_plot_unit: values.dropAddress1 || '',
//       //   drop_area_street: values.dropAddress2 || '',
//       //   drop_pincode: values.dropPincode || '',
//       //   drop_state: values.dropState || '',
//       //   drop_district: values.dropDistrict || '',
//       //   drop_taluka: values.dropTaluka || '',
//       //   drop_map_location: values.dropGoogle || '',
//       //   drop_Lat: values.dropLat || 0,
//       //   drop_Lng: values.dropLng || 0,
//       // },
//     },

//     domestic_type: values?.documentype,
//     dom_declaration: values?.declaration,
//     declaration: values?.isDeclared,
//     declaration_img: values?.declarationImages,

//     // cargo: {
//     //   cargo_content: values.cargoContent || '',
//     //   package_type: values.packageType || '',
//     //   package_name: values.packageNote || '',
//     // },

//     // PO: {
//     //   po_number: values.poNo || '',
//     //   po_date: values.poDate || '',
//     // },

//     // weight: {
//     //   No_of_package: values.freightDetails?.noOfPackages || '0',
//     //   net_weight: values.freightDetails?.netQuantity || values.netWeight || '0',
//     //   approx_weight: values.Approximate_weight || '0',
//     //   gross_weight:
//     //     values.freightDetails?.grossWeight || values.grossWeight || '0',
//     // },

//     // charges: {
//     //   freightAmount: values.freightDetails?.freightAmount || '0',
//     //   loadingcharge: values.freightDetails?.loading || '0',
//     //   unloadingcharge: values.freightDetails?.unloading || '0',
//     //   LRcharge: values.freightDetails?.lrCharges || '0',
//     //   othercharge: values.freightDetails?.otherCharges || '0',
//     //   otherchargelabel: values.freightDetails?.otherChargesLabel || '',
//     //   Advance: values.freightDetails?.advance || '0',
//     //   // },

//     invoiceDetails: (values.invoices && values.invoices[0]?.InvoiceNo
//       ? [values.invoices[0]]
//       : []
//     ).map(inv => ({
//       invoice_number: inv.InvoiceNo || '',
//       invoice_date: inv.InvoiceDate || '',
//       Unit: inv.Unit || '',
//       quantity: inv.GrossQuantity || '',
//       value_amount: inv.ValueAmount || '',
//       invoice_img: inv.ImageUpload || '',
//       Materialtype: inv.MaterialName || '',
//       PackageType: inv.PachageType || '',
//     })),

//     challanDetails: (values.challans && values.challans[0]?.ChallanNo
//       ? [values.challans[0]]
//       : []
//     ).map(ch => ({
//       challan_number: ch.ChallanNo || '',
//       challan_date: ch.ChallanDate || '',
//       Unit: ch.Unit || '',
//       quantity: ch.GrossWeight || '',
//       net_weight: ch.NetWeight || '',
//       value_amount: ch.ValueAmount || '',
//       challan_img: ch.ImageUpload || '',
//       doc_no: ch.DocumentNo || '',
//       po_number: ch.PoNo || '',
//       po_date: ch.Podate || '',
//       material_Type: ch.MaterialName || '',
//       package_type: ch.PackageType || '',
//       remarks: ch.MaterialName || '',
//     })),
//     BillDetails: (values.billOfEntries && values.billOfEntries[0]?.BillOfEntryNo
//       ? [values.billOfEntries[0]]
//       : []
//     ).map(be => ({
//       Bill_Entry_number: be.BillOfEntryNo || '',
//       Bill_Entry_date: be.BillOfEntryDate || '',
//       Shipper_name: be.ShipperName || '',
//       Country: be.Country || '',
//       buyer_name: be.BuyerName || '',
//       destination: be.Destination || '',
//       Currency: be.Currency || '',
//       Package_type: be.PackageType || '',
//       material_name: be.MaterialName || '',
//       Value: be.ValueAmount || '',
//       image_upload: be.ImageUpload || '',
//       Material_type: be.MaterialName || '',
//     })),
//     stockDetails: (values.StockTransfers &&
//     values.StockTransfers[0]?.StockTransferNo
//       ? [values.StockTransfers[0]]
//       : []
//     ).map(st => ({
//       stock_number: st.StockTransferNo || '',
//       stock_date: st.StockTransferDate || '',
//       Unit: st.Unit || '',
//       net_weight: st.NetQuantity || '',
//       gross_weight: st.GrossQuantity || '',
//       value_amount: st.TranferValue || '',

//       from_location: st.FromLocation || '',
//       to_location: st.ToLocation || '',
//       material: st.MaterialName || '',
//       quantity: st.NetQuantity || '',
//       remarks: st.MaterialName,
//     })),
//   };
// };
// ========== API PAYLOAD TRANSFORMATION ==========
// const transformToApiPayload = (
//   values: FormikValues,
//   selectedLoadPostId: string,
// ): VdltValues => {
//   // Helper function to extract items from groups
//   const extractItemsFromGroups = (groups: any[] | undefined) => {
//     if (!groups || groups.length === 0) return [];

//     // Flatten all items from all groups
//     const allItems = groups.flatMap(group => group.items || []);
//     return allItems;
//   };

//   // Get CustomerID from Redux store or use default
//   return {
//     LoadPostID: selectedLoadPostId || 'LP999888',
//     CustomerID: '123654',

//     consigner: {
//       consigner_name: values.pickupName || '',
//       consigner_address: `${values.pickupAddress1 || ''} ${
//         values.pickupAddress2 || ''
//       }`.trim(),
//       consigner_pincode: values.pickupPincode || '',
//       consigner_origin: values.pickupCity || '',
//       consigner_state: values.pickupState || '',
//       consigner_gst: values.pickupGst || '',
//     },

//     consignee: {
//       consignee_name: values.dropName || '',
//       consignee_address: `${values.dropAddress1 || ''} ${
//         values.dropAddress2 || ''
//       }`.trim(),
//       consignee_pincode: values.dropPincode || '',
//       consignee_destination: values.dropCity || '',
//       consignee_state: values.dropState || '',
//       consignee_gst: values.dropGst || '',
//     },

//     domestic_type: values?.shipmentDocumentType,
//     dom_declaration: values?.declaration,
//     declaration: values?.isDeclared,
//     declaration_img: values?.declarationImages || [],

//     // Transform invoice items
//     invoiceDetails: extractItemsFromGroups(values.invoices).map(item => ({
//       invoice_number: item.invoiceNo || '',
//       invoice_date: item.invoiceDate || '',
//       Unit: item.unit || '',
//       quantity: item.quantity || item.netWeight || '',
//       value_amount: item.value || '',
//       invoice_img: item.image || '',
//       Materialtype: item.materialType || '',
//       PackageType: item.packageType || '',
//     })),

//     // Transform challan items
//     challanDetails: extractItemsFromGroups(values.challans).map(item => ({
//       challan_number: item.challanNo || '',
//       challan_date: item.challanDate || '',
//       Unit: item.unit || '',
//       quantity: item.quantity || item.netWeight || '',
//       net_weight: item.netWeight || '',
//       value_amount: item.value || '',
//       challan_img: item.image || '',
//       doc_no: item.documentno || '',
//       po_number: item.poNo || '',
//       po_date: item.poDate || '',
//       material_Type: item.materialType || '',
//       package_type: item.packageType || '',
//       remarks: item.materialType || '',
//     })),

//     // Transform bill of entry items
//     BillDetails: extractItemsFromGroups(values.billOfEntries).map(item => ({
//       Bill_Entry_number: item.billOfEntryNo || '',
//       Bill_Entry_date: item.billOfEntryDate || '',
//       Shipper_name: item.shipperName || '',
//       Country: item.country || '',
//       buyer_name: item.buyerName || '',
//       destination: item.destination || '',
//       Currency: item.currency || '',
//       Package_type: item.packageType || '',
//       material_name: item.materialType || '',
//       Value: item.value || '',
//       image_upload: item.image || '',
//       Material_type: item.materialType || '',
//     })),

//     // Transform stock transfer items
//     stockDetails: extractItemsFromGroups(values.StockTransfers).map(item => ({
//       stock_number: item.StockTransferNo || '',
//       stock_date: item.StockTransferDate || '',
//       Unit: item.unit || '',
//       net_weight: item.netWeight || '',
//       gross_weight: item.grossWeight || '',
//       value_amount: item.value || '',
//       from_location: item.fromLocation || '',
//       to_location: item.toLocation || '',
//       material: item.materialType || '',
//       quantity: item.quantity || item.netWeight || '',
//       remarks: item.materialType || '',
//     })),
//   };
// };

const transformToApiPayload = (
  values: FormikValues,
  selectedLoadPostId: string,
) => {
  const extractItemsFromGroups = (groups: any[] | undefined) => {
    if (!groups || groups.length === 0) return [];
    return groups.flatMap(group => group.items || []);
  };

  return {
    LoadPostID: selectedLoadPostId || 'LP002',
    CustomerID: 'CUST001',

    consigner: {
      consigner_name: values.pickupName || '',
      consigner_gst: values.pickupGst || '',
      consigner_address: `${values.pickupAddress1 || ''} ${
        values.pickupAddress2 || ''
      }`.trim(),
      consigner_pincode: values.pickupPincode || '',
      consigner_origin: values.pickupCity || '',
      consigner_state: values.pickupState || '',
    },

    consignee: {
      consignee_name: values.dropName || '',
      consignee_gst: values.dropGst || '',
      consignee_address: `${values.dropAddress1 || ''} ${
        values.dropAddress2 || ''
      }`.trim(),
      consignee_pincode: values.dropPincode || '',
      consignee_destination: values.dropCity || '',
      consignee_state: values.dropState || '',
    },

    domestic_type: 'Domestic',

    // Payload-2 declaration format
    dom_declaration: (values.declarationTextList || []).map(
      (text: string, index: number) => ({
        [`declaration${index + 1}`]: text,
      }),
    ),

    isdeclaration: values.isDeclared ? 'Y' : 'N',
    declaration_img: values.declarationImages?.[0] || '',

    invoiceDetails: extractItemsFromGroups(values.invoices).map(item => ({
      invoice_number: item.invoiceNo || '',
      invoice_date: item.invoiceDate || '',
      Unit: item.unit || '',
      quantity: item.quantity || '',
      net_weight: item.netWeight || '',
      gross_weight: item.grossWeight || '',
      package_type: item.packageType || '',
      material_Type: item.materialType || '',
      po_number: item.poNo || '',
      po_date: item.poDate || '',
      value_amount: item.value || '',
      invoice_img: item.image || '',
      remarks: item.remarks || '',
    })),

    challanDetails: extractItemsFromGroups(values.challans).map(item => ({
      challan_number: item.challanNo || '',
      challan_date: item.challanDate || '',
      Unit: item.unit || '',
      quantity: item.quantity || '',
      net_weight: item.netWeight || '',
      package_type: item.packageType || '',
      material_Type: item.materialType || '',
      doc_no: item.documentno || '',
      po_number: item.poNo || '',
      po_date: item.poDate || '',
      value_amount: item.value || '',
      challan_img: item.image || '',
      remarks: item.remarks || '',
    })),

    stockDetails: extractItemsFromGroups(values.StockTransfers).map(item => ({
      stock_number: item.StockTransferNo || '',
      stock_date: item.StockTransferDate || '',
      Unit: item.unit || '',
      net_weight: item.netWeight || '',
      gross_weight: item.grossWeight || '',
      quantity: item.quantity || '',
      value_amount: item.value || '',
      from_location: item.fromLocation || '',
      to_location: item.toLocation || '',
      material: item.materialType || '',
      stock_img: item.image || '',
      remarks: item.remarks || '',
    })),

    BillDetails: extractItemsFromGroups(values.billOfEntries).map(item => ({
      Bill_Entry_number: item.billOfEntryNo || '',
      Bill_Entry_date: item.billOfEntryDate || '',
      Shipper_name: item.shipperName || '',
      Country: item.country || '',
      buyer_name: item.buyerName || '',
      destination: item.destination || '',
      Currency: item.currency || '',
      Value: item.value || '',
      Material_type: item.materialType || '',
      Package_type: item.packageType || '',
      Bill_img: item.image || '',
      remarks: item.remarks || '',
    })),
  };
};

// ========== INITIAL VALUES ==========
// const initialValues = {
//   // Step 1
//   pickupName: '',
//   pickupGst: '',
//   pickupAddress1: '',
//   pickupAddress2: '',
//   pickupPhone: '',
//   pickupAltPhone: '',
//   pickupPincode: '',
//   pickupCity: '',
//   pickupState: '',
//   pickupLat: '',
//   pickupLng: '',
//   pickupGoogle: '',

//   dropName: '',
//   dropGst: '',
//   dropPhone: '',
//   dropAddress1: '',
//   dropAddress2: '',
//   dropPincode: '',
//   dropCity: '',
//   dropState: '',
//   dropLat: '',
//   dropLng: '',
//   dropGoogle: '',

//   // Step 2
//   invoices: [],
//   challans: [],
//   billOfEntries: [],
//   StockTransfers: [],
//   isDeclared: false,

//   // Step 3
//   declaration: {
//     checkbox1: '',
//     checkbox2: '',
//     checkbox3: '',
//     checkbox4: '',
//     checkbox5: '',
//   },
//   declarationImages: [],
// };
const initialValues = {
  // STEP 1 – Pickup
  pickupName: '',
  pickupGst: '',
  pickupAddress1: '',
  pickupAddress2: '',
  pickupPhone: '',
  pickupAltPhone: '',
  pickupPincode: '',
  pickupCity: '',
  pickupState: '',
  pickupLat: '',
  pickupLng: '',
  pickupGoogle: '',

  // STEP 1 – Drop
  dropName: '',
  dropGst: '',
  dropPhone: '',
  dropAddress1: '',
  dropAddress2: '',
  dropPincode: '',
  dropCity: '',
  dropState: '',
  dropLat: '',
  dropLng: '',
  dropGoogle: '',

  // STEP 2 – Documents
  invoices: [],
  challans: [],
  billOfEntries: [],
  StockTransfers: [],

  // STEP 3 – Declaration (Payload-2 style)
  isDeclared: false, // will convert to "Y" / "N"

  // Array of declaration texts
  declarationTextList: [
    '', // declaration1
    '', // declaration2
    '', // declaration3
    '', // declaration4
  ],

  // Single or multiple images (first one will be used)
  declarationImages: [],
};

// ========== VALIDATION SCHEMA ==========
const validationSchema = Yup.object().shape({
  pickupName: Yup.string().required('Consigner name is required'),
  pickupGst: Yup.string().required('GST number is required'),
  pickupAddress1: Yup.string().required('Address is required'),
  pickupPincode: Yup.string()
    .matches(/^\d{6}$/, 'Invalid pincode')
    .required('Pincode is required'),
  dropName: Yup.string().required('Consignee name is required'),
  dropGst: Yup.string().required('GST number is required'),
  dropAddress1: Yup.string().required('Address is required'),
  dropPincode: Yup.string()
    .matches(/^\d{6}$/, 'Invalid pincode')
    .required('Pincode is required'),
});

const Tab = createMaterialTopTabNavigator();

// ========== MAIN COMPONENT ==========
export default function MultiStepFormTabs() {
  const [selectedLoadPost, setSelectedLoadPost] = useState<string>('');
  const [stepCompletion, setStepCompletion] = useState({
    step1: false,
    step2: false,
  });
  const customerID =
    useSelector((state: RootState) => state.auth.customerDetails?.CustomerID) ||
    'CM123456';
  // API Integration
  const { data: loadPostData, isLoading } = useGetcustomerloadpostdetailsQuery({
    CustomerID: 'CM548612',
  });

  console.log({ loadPostData });
  const [insertVehicleloadpostdatasheet, { isLoading: isInserting }] =
    useInsertVehicleloadpostdatasheetMutation();

  const [updateLoadPost, { isLoading: isSubmitting }] =
    useUpdateloadpostMutation();

  // Transform data for dropdown
  const dropdownItems = useMemo(() => {
    const dataSource =
      loadPostData?.data?.length > 0 ? loadPostData.data : DUMMY_DATA;

    return transformToDropdownItems(dataSource);
  }, [loadPostData]);

  const handleSelectLoadpost = (loadPostId: string) => {
    setSelectedLoadPost(loadPostId);
  };

  // const hasAnyDocument = useSelector(
  //   (state: RootState) => state.vehicleSheet.isDocumentsAvailable,
  // );

  const checkStep1Completion = (values: FormikValues) => {
    return (
      values.pickupName?.trim() !== '' &&
      // values.pickupGst?.trim() !== '' &&
      values.pickupAddress1?.trim() !== '' &&
      values.pickupPincode?.trim() !== '' &&
      values.dropName?.trim() !== '' &&
      values.dropGst?.trim() !== '' &&
      values.dropAddress1?.trim() !== '' &&
      values.dropPincode?.trim() !== ''
    );
  };

  const checkStep2Completion = (values: FormikValues) => {
    return (
      (values.invoices && values.invoices.length > 0) ||
      (values.challans && values.challans.length > 0) ||
      (values.billOfEntries && values.billOfEntries.length > 0) ||
      (values.StockTransfers && values.StockTransfers.length > 0)
    );
  };

  // const checkStep3Completion = (values: FormikValues) => {
  //   return values.freightDetails && values.freightDetails.freightAmount !== '';
  // };

  const checkStepCompletion = (values: FormikValues) => {
    setStepCompletion({
      step1: checkStep1Completion(values),
      step2: checkStep2Completion(values),
    });
  };

  // Submit Handler
  const handleSubmit = async (values: FormikValues) => {
    try {
      // Validate required fields
      // if (!selectedLoadPost) {
      //   Alert.alert('Error', 'Please select a load post from dropdown');
      //   return;
      // }

      // if (!checkStep1Completion(values)) {
      //   Alert.alert('Error', 'Please complete Step 1: Name & Address Details');
      //   return;
      // }

      // Transform to API payload
      const payload = transformToApiPayload(values, selectedLoadPost);
      //  const payload = values;
      console.log({ payload });
      // Call API
      const response = await insertVehicleloadpostdatasheet(payload).unwrap();
      console.log({ response });

      Alert.alert('Success', 'Load data updated successfully!');
    } catch (error: any) {
      console.error('API Error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to update load data. Please try again.',
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#3366FF" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicle loading data sheet</Text>
      </View>

      {/* Dropdown Section */}
      <View style={styles.dropdownSection}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Select Load Post</Text>
          <LoadpostDropdown
            allData={dropdownItems}
            selected={selectedLoadPost}
            onSelect={handleSelectLoadpost}
            isLoading={isLoading}
            placeholder="Select a load post"
          />
        </View>
      </View>

      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        // validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {formik => {
          // Update formik values when load post is selected
          useEffect(() => {
            if (!selectedLoadPost || dropdownItems.length === 0) return;

            const selectedItem = dropdownItems.find(
              item => item.loadPostId === selectedLoadPost,
            )?.full;

            if (!selectedItem) return;

            const mappedData = mapApiDataToFormik(selectedItem);
            console.log({ mappedData });

            if (Object.keys(mappedData).length > 0) {
              formik.setValues(prev => ({ ...prev, ...mappedData }));
            }
          }, [selectedLoadPost, dropdownItems]);

          // Check step completion on values change
          useEffect(() => {
            checkStepCompletion(formik.values);
          }, [formik.values]);

          return (
            <View style={styles.tabContainer}>
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: '#3366FF',
                  tabBarInactiveTintColor: '#6B7280',

                  tabBarIndicatorStyle: {
                    backgroundColor: '#3366FF',
                    height: 3,
                  },

                  tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '600',
                    textTransform: 'none',
                  },

                  tabBarItemStyle: {
                    paddingVertical: 8,
                  },

                  tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 1,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                  },

                  swipeEnabled: false,
                }}
              >
                {/* STEP 1 */}
                <Tab.Screen
                  name="Name & Address Details"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text
                          style={[
                            styles.tabLabelText,
                            {
                              color: stepCompletion.step1
                                ? focused
                                  ? '#3366FF'
                                  : '#10B981'
                                : color,
                              fontWeight: stepCompletion.step1 ? '700' : '600',
                            },
                          ]}
                        >
                          <Text>Name & Address</Text>
                        </Text>
                        {stepCompletion.step1 && !focused && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step1_VehicleCustomer
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                        selectedLoadPost={selectedLoadPost}
                        dropdownItems={dropdownItems}
                      />

                      <Button
                        mode="contained"
                        onPress={() =>
                          navigation.navigate('Invoice/Documents Details')
                        }
                        style={styles.nextButton}
                        labelStyle={styles.buttonLabel}
                        disabled={!stepCompletion.step1}
                      >
                        <Text> Next: Invoice/Documents Detail</Text>
                      </Button>
                    </ScrollView>
                  )}
                </Tab.Screen>

                {/* STEP 2 */}
                <Tab.Screen
                  name="Invoice/Documents Details"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text style={[styles.tabLabelText, { color }]}>
                          Documents
                        </Text>
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step2_CargoInvoice
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                      />

                      {/* 🔽 FOOTER BUTTONS */}
                      <View style={styles.navButtons}>
                        <Button
                          mode="outlined"
                          onPress={() =>
                            navigation.navigate('Name & Address Details')
                          }
                          style={styles.backButton}
                        >
                          Back
                        </Button>

                        <Button
                          mode="contained"
                          onPress={formik.handleSubmit}
                          style={styles.submitButton}
                          loading={isSubmitting}
                          disabled={isSubmitting}
                        >
                          Submit Load
                        </Button>
                      </View>
                    </ScrollView>
                  )}
                </Tab.Screen>

                {/* STEP 3 */}
                {/* <Tab.Screen
                  name="Freight Summary"
                  options={{
                    tabBarLabel: ({ focused, color }) => (
                      <View style={styles.tabLabelContainer}>
                        <Text
                          style={[
                            styles.tabLabelText,
                            {
                              color: stepCompletion.step3
                                ? focused
                                  ? '#3366FF'
                                  : '#10B981'
                                : color,
                              fontWeight: stepCompletion.step3 ? '700' : '600',
                            },
                          ]}
                        >
                          Freight Summary
                        </Text>
                        {stepCompletion.step3 && !focused && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <ScrollView
                      style={styles.screenContainer}
                      contentContainerStyle={styles.contentContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Step3_FreightDetails
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                      />

                      <View style={styles.navButtons}>
                        <Button
                          mode="outlined"
                          onPress={() =>
                            navigation.navigate('Invoice/Documents Details')
                          }
                          style={styles.backButton}
                          labelStyle={styles.buttonLabel}
                        >
                          <Text>Back</Text>
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => formik.handleSubmit()}
                          style={styles.submitButton}
                          labelStyle={styles.buttonLabel}
                          loading={isSubmitting}
                          disabled={isSubmitting || !stepCompletion.step3}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Load'}
                        </Button>
                      </View>
                    </ScrollView>
                  )}
                </Tab.Screen> */}
              </Tab.Navigator>
            </View>
          );
        }}
      </Formik>
    </View>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#3366FF',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 5 : 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  dropdownSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tabContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 4,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#3366FF',
    borderWidth: 1,
    borderRadius: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#3366FF',
    borderRadius: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelText: {
    fontSize: 14,
    textTransform: 'none',
  },
  completedIndicator: {
    marginLeft: 4,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
