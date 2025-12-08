import * as Yup from 'yup';
import { FormStep } from './type';

export const getStepSchema = (currentStep: FormStep) => {
  switch (currentStep) {
    case 'Location':
      return Yup.object().shape({
        PickupType: Yup.string().required(),

        // 👉 Dynamic origin address validation
        origin: Yup.object().shape({
          address: Yup.string().when('PickupType', {
            is: val =>
              val === 'Registered' || val === 'self' || val === 'other',
            then: schema => schema.required('Pickup location is required'),
            otherwise: schema => schema.notRequired(),
          }),
        }),

        // 👉 Only required for self + other
        Origin_1: Yup.string().when('PickupType', {
          is: val => val === 'self' || val === 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        Origin_2: Yup.string().when('PickupType', {
          is: val => val === 'self' || val === 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        // 👉 Destination always required
        destination: Yup.object().shape({
          address: Yup.string().required('Delivery location is required'),
        }),

        Destination_1: Yup.string().required('Required'),
        Destination_2: Yup.string().required('Required'),

        // 👉 Only required when PickupType = other
        Pincode: Yup.string().when('PickupType', {
          is: 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        Taluka: Yup.string().when('PickupType', {
          is: 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        District: Yup.string().when('PickupType', {
          is: 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        state: Yup.string().when('PickupType', {
          is: 'other',
          then: schema => schema.required('Required'),
          otherwise: schema => schema.notRequired(),
        }),

        // 👉 Consignee name always needed
        ConsigneeName: Yup.string().required('Consignee name is required'),

        // 👉 Only required for other
        ContactPerson: Yup.string().when('PickupType', {
          is: 'other',
          then: schema => schema.required('Contact person is required'),
          otherwise: schema => schema.notRequired(),
        }),

        ContactNumber: Yup.string().when('PickupType', {
          is: 'other',
          then: schema =>
            schema
              .required('Contact number is required')
              .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
          otherwise: schema => schema.notRequired(),
        }),

        VehicleType: Yup.string().required('Vehicle type is required'),
        Weight: Yup.string().required('Weight is required'),
      });

    case 'Load':
      return Yup.object().shape({
        BodyType: Yup.string().required('Body type is required'),
        CargoContent: Yup.string().required('Cargo content is required'),
        CargoPackageType: Yup.string().required('Package type is required'),
        // ExpectedAvailableTime: Yup.string().required(
        //   'Available time is required',
        // ),
        DhalaLength: Yup.string()
          .required('Dhala length is required')
          .matches(/^\d+(\.\d+)?$/, 'Dhala length must be a valid number'),
      });

    case 'Confirmation':
      return Yup.object().shape({}); // no validation

    default:
      return Yup.object().shape({});
  }
};
