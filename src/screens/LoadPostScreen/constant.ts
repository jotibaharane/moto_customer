import { ShipmentData } from '@api/api.type';
import { DhalaLengthOption, FormStep } from './type';

export const emptyShipmentData: ShipmentData = {
  BodyType: '',
  CargoContent: '',
  CargoPackageType: '',
  CustomerID: '',
  destination: {
    address: '',
    coordinates: {
      lat: 0,
      lng: 0,
    },
    components: {
      dist: '',
      pincode: '',
      state: '',
      place: '',
      tal: '',
    },
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
    coordinates: {
      lat: 0,
      lng: 0,
    },
    components: {
      dist: '',
      pincode: '',
      state: '',
      place: '',
      tal: '',
    },
  },
  VehicleType: '',
  Weight: '',
};

export const STEPS: FormStep[] = ['Location', 'Load', 'Confirmation'];
export const DhalaLengthOptions: DhalaLengthOption[] = [
  { value: '5', label: '5 Feet' },
  { value: '10', label: '10 Feet' },
  { value: '15', label: '15 Feet' },
];
