import { ShipmentData } from '@api/api.type';
import { DhalaLengthOption, FormStep } from './type';
// interface CargoTypeOptions {
//   value: string;
//   label: string;
// }

export const emptyShipmentData: ShipmentData = {
  customerId: '',
  pickup: {
    pickupType: 'Registered',
    contactName: '',
    companyName: '',
    contactNumber: '',
    shipperName: '',
    plotOrBuilding: '',
    streetArea: '',
    pincode: '',
    state: '',
    district: '',
    alternateNo: '',
    taluka: '',
    origin: {
      address: '',
      coordinates: { lat: 0, lng: 0 },
      components: { dist: '', pincode: '', state: '', place: '', tal: '' },
    },
  },
  delivery: {
    consigneeName: '',
    companyName: '',
    contactPerson: '',
    contactNumber: '',
    plotOrBuilding: '',
    streetArea: '',
    pincode: '',
    state: '',
    district: '',
    taluka: '',
    destination: {
      address: '',
      coordinates: { lat: 0, lng: 0 },
      components: { dist: '', pincode: '', state: '', place: '', tal: '' },
    },
  },
  vehicle: {
    vehicleType: '',
    weightRange: '', // This will be auto-filled from truck data
    approximateWeightKg: '', // User inputs this first
  },
  load: {
    cargoType: 'normal',
    materialName: '',
    bodyType: '',
    //  cargoContent: '',
    packageType: '',
    packageDescription: '',
    expectedVehicleAvailability: '',
    flammableDeclaration: '',
    hazardousDeclaration: '',
    weight: '',
    isHazardous: false,
    isFlammable: false,
    hdescription: '',
    packageImage: '',
    dhalaLength: '', // Will store comma-separated dhala lengths
  },
};

export const STEPS: FormStep[] = ['Location', 'Load', 'Confirmation'];

// Remove old DhalaLengthOptions and Cargotypeoptions as they're now dynamic based on goods type

export const GOODS_TYPES = [
  { label: 'Normal Goods', value: 'normal' },
  { label: 'Voluminous Goods', value: 'voluminous' },
];

export const NORMAL_GOODS_DHALA_LENGTHS = [
  { label: '18 ft', value: '18' },
  { label: '20 ft', value: '20' },
  { label: '22 ft', value: '22' },
];

export const VOLUMINOUS_GOODS_DHALA_LENGTHS = [
  { label: '22 ft', value: '22' },
  { label: '24 ft', value: '24' },
  { label: '32 ft', value: '32' },
];

export const STANDARD_BODY_TYPES = [
  { label: 'Close with Tarpaulin', value: 'close_tarpaulin' },
  { label: 'Close Body', value: 'close_body' },
];

export const SPECIAL_BODY_TYPES = [
  { label: 'Open Body', value: 'open_body' },
  { label: 'Platform', value: 'platform' },
];
