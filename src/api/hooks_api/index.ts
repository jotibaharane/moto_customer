import {
  ActiveTripRequest,
  ActiveTripResponse,
  ApproximateWeightRequest,
  BodyTypeRequest,
  BodyTypeResponse,
  CargoContentTypesResponse,
  CargoPackageTypesResponse,
  CustomerPostRequest,
  CustomerPostResponse,
  CustomerProcessRequest,
  CustomerProcessResponse,
  DistrictRequest,
  DistrictResponse,
  InsertCustomerResponse,
  MpinLoginRequest,
  MpinLoginResponse,
  MpinRequest,
  MpinResponse,
  NearestDriversRequest,
  NearestDriversResponse,
  OtpResponse,
  PackageTypeRequest,
  PincodeDataRequest,
  PincodeDataResponse,
  PincodeResponse,
  RegisterRequest,
  RegisterResponse,
  SendOtpRequest,
  ShipmentData,
  StateResponse,
  TransportRequest,
  TruckResponse,
  ValidateOtpRequest,
  ValidateOtpResponse,
  WeightResponse,
} from '@api/api.type';
import { apiEndpoints } from '@api/endpoints';
import baseApi from '../index';

export const motoApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    sendOtp: builder.mutation<OtpResponse, SendOtpRequest>({
      query: queryArg => ({
        url: apiEndpoints.sendOtp,
        method: 'POST',
        body: queryArg,
      }),
    }),
    validateOtp: builder.mutation<ValidateOtpResponse, ValidateOtpRequest>({
      query: queryArg => ({
        url: apiEndpoints.validateOtp,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getDistrict: builder.mutation<DistrictResponse, DistrictRequest>({
      query: queryArg => ({
        url: apiEndpoints.stateRegionDistrict,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getPincodeData: builder.mutation<PincodeDataResponse, PincodeDataRequest>({
      query: queryArg => ({
        url: apiEndpoints.pincode,
        method: 'POST',
        body: queryArg,
      }),
    }),
    insertCustomer: builder.mutation<RegisterResponse, RegisterRequest>({
      query: queryArg => ({
        url: apiEndpoints.registerCustomer,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getState: builder.query<StateResponse, void>({
      query: () => ({
        url: apiEndpoints.stateRegionDistrict,
        method: 'POST',
      }),
    }),
    setMpin: builder.mutation<MpinResponse, MpinRequest>({
      query: queryArg => ({
        url: apiEndpoints.setMpin,
        method: 'POST',
        body: queryArg,
      }),
    }),
    mpinLogin: builder.mutation<MpinLoginResponse, MpinLoginRequest>({
      query: queryArg => ({
        url: apiEndpoints.mpinLogin,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getCustomerPosts: builder.query<CustomerPostResponse, CustomerPostRequest>({
      query: body => ({
        url: apiEndpoints.customerpost,
        method: 'POST',
        body,
      }),
    }),
    getProcessTrips: builder.query<
      CustomerProcessResponse,
      CustomerProcessRequest
    >({
      query: queryArg => ({
        url: apiEndpoints.processTrips,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getActiveTrips: builder.query<ActiveTripResponse, ActiveTripRequest>({
      query: queryArg => ({
        url: apiEndpoints.activeTrips,
        method: 'POST',
        body: queryArg,
      }),
    }),
    postCustomerRequirement: builder.mutation<
      InsertCustomerResponse,
      ShipmentData
    >({
      query: queryArg => ({
        url: `/Insert_customer_load_post`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getBodyType: builder.query<BodyTypeResponse, BodyTypeRequest>({
      query: body => ({
        url: '/get_vehicle_Details',
        method: 'POST',
        body,
      }),
    }),
    updateCustomerRequirement: builder.mutation<
      InsertCustomerResponse,
      TransportRequest
    >({
      query: queryArg => ({
        url: `/update_customer_load_post`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getCurrentAddress: builder.query<PincodeResponse, void>({
      query: query => ({
        url: '/customer_post_address',
        method: 'POST',
        body: query,
      }),
    }),
    getTruckType: builder.query<TruckResponse, void>({
      query: () => ({
        url: '/get_vehicle_Details',
        method: 'POST',
      }),
    }),
    getAproximateWeight: builder.query<
      WeightResponse,
      ApproximateWeightRequest
    >({
      query: body => ({
        url: '/get_vehicle_Details',
        method: 'POST',
        body,
      }),
    }),
    getPackageType: builder.query<
      CargoPackageTypesResponse,
      PackageTypeRequest
    >({
      query: body => ({
        url: '/get_CargoTypes',
        method: 'POST',
        body,
      }),
    }),
    getCargoContent: builder.query<CargoContentTypesResponse, void>({
      query: body => ({
        url: '/get_CargoTypes',
        method: 'POST',
      }),
    }),
    getNearbyDrivers: builder.query<
      NearestDriversResponse,
      NearestDriversRequest
    >({
      query: queryArg => ({
        url: `/get_Nearest_Drivers`,
        method: 'POST',
        body: queryArg,
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useValidateOtpMutation,
  useGetDistrictMutation,
  useGetPincodeDataMutation,
  useInsertCustomerMutation,
  useGetStateQuery,
  useSetMpinMutation,
  useMpinLoginMutation,
  useGetCustomerPostsQuery,
  useGetProcessTripsQuery,
  useGetActiveTripsQuery,
  usePostCustomerRequirementMutation,
  useGetBodyTypeQuery,
  useUpdateCustomerRequirementMutation,
  useGetCurrentAddressQuery,
  useGetTruckTypeQuery,
  useGetAproximateWeightQuery,
  useGetPackageTypeQuery,
  useGetCargoContentQuery,
  useGetNearbyDriversQuery,
} = motoApi;
