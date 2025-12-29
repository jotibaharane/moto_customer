import { ShipmentData } from '@api/api.type';
import { DhalaLengthOption, FormStep } from './type';
interface CargoTypeOptions {
  value: string;
  label: string;
}

export const emptyShipmentData: ShipmentData = {
  customerId: '',
  pickup: {
    pickupType: 'Registered',
    contactName: '',
    companyName: '',
    contactNumber: '',
    plotOrBuilding: '',
    streetArea: '',
    pincode: '',
    state: '',
    district: '',
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
    weightRange: '',
    approximateWeightKg: '',
  },
  load: {
    cargoType: 'Normal',
    bodyType: '',
    cargoContent: '',
    packageType: '',
    expectedVehicleAvailability: '',
    dhalaLength: '',
  },
  schedule: {
    date: '',
    time: '',
  },
};

export const STEPS: FormStep[] = ['Location', 'Load', 'Confirmation'];

export const DhalaLengthOptions: DhalaLengthOption[] = [
  { value: '5', label: '5 Feet' },
  { value: '10', label: '10 Feet' },
  { value: '15', label: '15 Feet' },
];

export const Cargotypeoptions: CargoTypeOptions[] = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Dense', label: 'Dense' },
  { value: 'Voluminous', label: 'Voluminous' },
];

export const BodyType: BodyType[] = [
  { value: 'Normal', label: 'Open' },
  { value: 'Dense', label: 'Closed' },
  { value: 'Voluminous', label: 'Voluminous' },
];
