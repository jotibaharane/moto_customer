import * as Yup from 'yup';
import { FormStep } from './type';

// Step 1 Schema - Basic Information
export const stepOneSchema = Yup.object().shape({
  origin: Yup.object().shape({
    address: Yup.string().required('Origin address is required'),
  }),
  destination: Yup.object().shape({
    address: Yup.string().required('Destination address is required'),
  }),
  VehicleType: Yup.string().required('Vehicle type is required'),
  Weight: Yup.string()
    .required('Weight is required')
    .matches(/^\d+(\.\d+)?$/, 'Weight must be a valid number'),
  Origin_1: Yup.string().required('Required'),
  Origin_2: Yup.string().required('Required'),
  Pincode: Yup.string().required('Required'),
  Taluka: Yup.string().required('Required'),
  Destination_1: Yup.string().required('Required'),
  Destination_2: Yup.string().required('Required'),
  District: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  ConsigneeName: Yup.string().required('Consignee name is required'),
  ContactPerson: Yup.string().required('Contact person is required'),
  ContactNumber: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
});

// Step 2 Schema - Additional Details
export const stepTwoSchema = Yup.object().shape({
  BodyType: Yup.string().required('Body type is required'),
  CargoContent: Yup.string().required('Cargo content is required'),
  CargoPackageType: Yup.string().required('Package type is required'),
  ExpectedAvailableTime: Yup.string().required('Available time is required'),
  DhalaLength: Yup.string()
    .required('Dhala length is required')
    .matches(/^\d+(\.\d+)?$/, 'Dhala length must be a valid number'),

  // Optional fields or fields that might be derived
});

// Complete Schema for final validation
export const completeSchema = Yup.object().shape({
  Location: stepOneSchema,
  Load: stepTwoSchema,
});

export const getStepSchema = (step: FormStep) => {
  switch (step) {
    case 'Location':
      return completeSchema.pick(['Location']);
    case 'Load':
      return completeSchema.pick(['Load']);
    default:
      return completeSchema;
  }
};
