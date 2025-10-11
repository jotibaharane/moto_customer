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
import baseApi from '../index';

export const motoApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    sendOtp: builder.mutation<OtpResponse, SendOtpRequest>({
      query: queryArg => ({
        url: '/Customer_SendOtp',
        method: 'POST',
        body: queryArg,
      }),
    }),
    validateOtp: builder.mutation<ValidateOtpResponse, ValidateOtpRequest>({
      query: queryArg => ({
        url: `/Customer_ValidateOtp`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getDistrict: builder.mutation<DistrictResponse, DistrictRequest>({
      query: queryArg => ({
        url: '/get_state_region_district',
        method: 'POST',
        body: queryArg,
      }),
    }),
    getPincodeData: builder.mutation<PincodeDataResponse, PincodeDataRequest>({
      query: queryArg => ({
        url: `/pincode`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    insertCustomer: builder.mutation<RegisterResponse, RegisterRequest>({
      query: queryArg => ({
        url: `/Insert_Customer`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getState: builder.query<StateResponse, void>({
      query: () => ({
        url: '/get_state_region_district',
        method: 'POST',
      }),
    }),
    setMpin: builder.mutation<MpinResponse, MpinRequest>({
      query: queryArg => ({
        url: '/Customer_Set_Mpin',
        method: 'POST',
        body: queryArg,
      }),
    }),
    mpinLogin: builder.mutation<MpinLoginResponse, MpinLoginRequest>({
      query: queryArg => ({
        url: '/Customer_Login_Mpin',
        method: 'POST',
        body: queryArg,
      }),
    }),
    getCustomerPosts: builder.mutation<
      CustomerPostResponse,
      CustomerPostRequest
    >({
      query: body => ({
        url: '/get_customer_load_post',
        method: 'POST',
        body,
      }),
    }),
    getProcessTrips: builder.mutation<
      CustomerProcessResponse,
      CustomerProcessRequest
    >({
      query: queryArg => ({
        url: `/customer_process_Trip`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    getActiveTrips: builder.mutation<ActiveTripResponse, ActiveTripRequest>({
      query: queryArg => ({
        url: `/customer_active_Trip`,
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
    getTruckType: builder.mutation<TruckResponse, void>({
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
  useGetActiveTripsMutation,
  useGetCustomerPostsMutation,
  useGetProcessTripsMutation,
  usePostCustomerRequirementMutation,
  useGetBodyTypeQuery,
  useUpdateCustomerRequirementMutation,
  useGetCurrentAddressQuery,
  useGetTruckTypeMutation,
  useGetAproximateWeightQuery,
  useGetPackageTypeQuery,
  useGetCargoContentQuery,
  useGetNearbyDriversQuery,
} = motoApi;
