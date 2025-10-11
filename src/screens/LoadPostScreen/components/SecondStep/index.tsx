import { ShipmentData } from '@api/api.type';
import {
  useGetBodyTypeQuery,
  useGetCargoContentQuery,
  useGetPackageTypeQuery,
} from '@api/hooks_api';
import CustomRadioButton from '@components/common/CustomRadioButton';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DhalaLengthOptions } from '../../constant';
import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import TimePicker from '../TimePicker24Hr';

interface SelectionCardProps {
  title: string;
  children: React.ReactNode;
  color?: string;
  error?: string;
  touched?: boolean;
  testID?: string;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  children,
  color = '#3B82F6',
  error,
  touched,
  testID,
}) => (
  <View
    style={tw`mb-4 bg-white p-4 rounded-xl border ${
      error && touched ? 'border-red-300' : 'border-gray-100'
    } shadow-xs`}
    testID={testID}
  >
    <View style={tw`flex-row items-center mb-3`}>
      <View
        style={[tw`w-2 h-4 mr-2 rounded-full`, { backgroundColor: color }]}
      />
      <Text style={tw`text-base font-bold text-gray-800`}>{title}</Text>
    </View>
    {children}
    {error && touched && (
      <Text style={[styles.errorText, tw`mt-2`]}>{error}</Text>
    )}
  </View>
);

interface SelectionButtonProps {
  value: any;
  placeholder: string;
  iconName: string;
  onPress: () => void;
  renderSelected: () => React.ReactNode;
  hasError?: boolean;
  testID?: string;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  value,
  placeholder,
  iconName,
  onPress,
  renderSelected,
  hasError = false,
  testID,
}) => (
  <TouchableOpacity
    style={tw`border-2 border-dashed ${
      value
        ? hasError
          ? 'border-red-200 bg-red-50'
          : 'border-blue-200 bg-blue-50'
        : hasError
        ? 'border-red-200 bg-red-50'
        : 'border-gray-300 bg-gray-50'
    } p-3 rounded-lg`}
    onPress={onPress}
    testID={testID}
  >
    {value ? (
      renderSelected()
    ) : (
      <View style={tw`flex-row items-center gap-3`}>
        <View style={tw`bg-gray-200 p-2 rounded-full`}>
          <Icon name={iconName} size={16} color="#6B7280" />
        </View>
        <Text style={tw`text-gray-500 text-sm flex-1`}>{placeholder}</Text>
        <Icon
          name="keyboard-arrow-down"
          size={20}
          color={tw.color('gray-500')}
        />
      </View>
    )}
  </TouchableOpacity>
);

const SecondStep: React.FC = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ShipmentData>();

  console.log({ values });

  const { data: BodyTypeData } = useGetBodyTypeQuery(
    {
      vehicleType: values.VehicleType,
      weightRange: values.Weight,
    },
    { skip: !values.VehicleType || !values.Weight },
  );

  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: values?.CargoContent },
    { skip: !values?.CargoContent },
  );

  const { data: cargoContentData } = useGetCargoContentQuery();

  const bodyTypeRef = useRef<SelectionModalRef>(null);
  const cargoContentRef = useRef<SelectionModalRef>(null);
  const packageTypeRef = useRef<SelectionModalRef>(null);

  // Format options for modals
  const bodyTypeOptions =
    BodyTypeData?.data?.map(item => ({
      id: item?.BodyType,
      label: item?.BodyType,
      image: { uri: item?.img },
    })) || [];

  const selectedBodyType = useMemo(
    () => BodyTypeData?.data.find(body => body.BodyType === values.BodyType),
    [BodyTypeData, values.BodyType],
  );

  const cargoContentOptions =
    cargoContentData?.data?.map(item => ({
      id: item?.cargo_type,
      label: item?.cargo_type,
      image: { uri: item?.img },
    })) || [];

  const selectedCargoContentType = useMemo(
    () =>
      cargoContentData?.data.find(
        content => content.cargo_type === values.CargoContent,
      ),
    [cargoContentData, values.CargoContent],
  );

  const packageTypeOptions =
    packageTypeData?.data?.map(item => ({
      id: item?.packaging_type,
      label: item?.packaging_type,
      image: { uri: item?.img },
    })) || [];

  const selectedPackageType = useMemo(
    () =>
      packageTypeData?.data.find(
        pkg => pkg.packaging_type === values.CargoPackageType,
      ),
    [packageTypeData, values.CargoPackageType],
  );

  return (
    <View style={styles.compactContainer} testID="address-info-step">
      {/* Dhala Length Selection */}
      {(values?.VehicleType === 'Medium' ||
        values?.VehicleType === 'Multi Axle') && (
        <SelectionCard
          title="Select Dhala Length"
          color="#F59E0B"
          error={errors.DhalaLength as string}
          touched={touched.DhalaLength as boolean}
          testID="dhala-length-card"
        >
          <View
            style={tw`border-2 border-dashed border-gray-300 bg-gray-50 p-3 rounded-lg`}
          >
            <CustomRadioButton
              options={DhalaLengthOptions}
              selectedOption={values?.DhalaLength}
              onSelect={(value: string) => {
                setFieldValue('DhalaLength', value);
                setFieldValue('isVolumetric', true);
              }}
              selectedColor="#3B82F6"
              containerStyle={tw`p-2`}
            />
          </View>
        </SelectionCard>
      )}

      {/* Body Type Selection */}
      {values.VehicleType && (
        <SelectionCard
          title="Body Type"
          color="#3B82F6"
          error={errors.BodyType as string}
          touched={touched.BodyType as boolean}
          testID="body-type-card"
        >
          <SelectionButton
            value={values?.BodyType}
            placeholder="Choose Body Type"
            iconName="local-shipping"
            onPress={() => bodyTypeRef.current?.open()}
            hasError={!!errors.BodyType && !!touched.BodyType}
            testID="body-type-button"
            renderSelected={() => (
              <View style={tw`flex-row items-center gap-3`}>
                <Image
                  source={
                    selectedBodyType?.img
                      ? { uri: selectedBodyType?.img }
                      : undefined
                  }
                  style={tw`w-12 h-12`}
                  resizeMode="contain"
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-bold text-gray-800`}>
                    {selectedBodyType?.BodyType}
                  </Text>
                  <Text style={tw`text-xs text-gray-600 mt-1`}>
                    Selected body type
                  </Text>
                </View>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={tw.color('gray-500')}
                />
              </View>
            )}
          />
          <SelectionModal
            ref={bodyTypeRef}
            title="Select Body Type"
            options={bodyTypeOptions}
            selectedValue={values.BodyType}
            onSelect={(bodyType: any) => {
              setFieldValue('BodyType', bodyType);
            }}
            numColumns={2}
          />
        </SelectionCard>
      )}

      {/* Cargo Content Selection */}
      <SelectionCard
        title="Cargo Content"
        color="#10B981"
        error={errors.CargoContent as string}
        touched={touched.CargoContent as boolean}
        testID="cargo-content-card"
      >
        <SelectionButton
          value={values?.CargoContent}
          placeholder="Choose Cargo Content"
          iconName="inventory"
          onPress={() => cargoContentRef.current?.open()}
          hasError={!!errors.CargoContent && !!touched.CargoContent}
          testID="cargo-content-button"
          renderSelected={() => (
            <View style={tw`flex-row items-center gap-3`}>
              <Image
                source={
                  selectedCargoContentType?.img
                    ? { uri: selectedCargoContentType?.img }
                    : undefined
                }
                style={tw`w-12 h-12`}
                resizeMode="contain"
              />
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-bold text-gray-800`}>
                  {selectedCargoContentType?.cargo_type}
                </Text>
                <Text style={tw`text-xs text-gray-600 mt-1`}>
                  Selected cargo type
                </Text>
              </View>
              <Icon
                name="keyboard-arrow-down"
                size={20}
                color={tw.color('gray-500')}
              />
            </View>
          )}
        />
        <SelectionModal
          ref={cargoContentRef}
          title="Select Cargo Content"
          options={cargoContentOptions}
          selectedValue={values.CargoContent}
          onSelect={(cargoContent: any) => {
            setFieldValue('CargoContent', cargoContent);
            setFieldValue('CargoPackageType', '');
          }}
          numColumns={2}
        />
      </SelectionCard>

      {/* Package Type Selection */}
      {values.CargoContent && values.CargoContent !== 'other' && (
        <SelectionCard
          title="Package Type"
          color="#8B5CF6"
          error={errors.CargoPackageType as string}
          touched={touched.CargoPackageType as boolean}
          testID="package-type-card"
        >
          <SelectionButton
            value={values?.CargoPackageType}
            placeholder="Choose Package Type"
            iconName="storefront"
            onPress={() => packageTypeRef.current?.open()}
            hasError={!!errors.CargoPackageType && !!touched.CargoPackageType}
            testID="package-type-button"
            renderSelected={() => (
              <View style={tw`flex-row items-center gap-3`}>
                <Image
                  source={
                    selectedPackageType?.img
                      ? { uri: selectedPackageType?.img }
                      : undefined
                  }
                  style={tw`w-12 h-12`}
                  resizeMode="contain"
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-bold text-gray-800`}>
                    {selectedPackageType?.packaging_type}
                  </Text>
                  <Text style={tw`text-xs text-gray-600 mt-1`}>
                    Selected package type
                  </Text>
                </View>
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={tw.color('gray-500')}
                />
              </View>
            )}
          />
          <SelectionModal
            ref={packageTypeRef}
            title="Select Package Type"
            options={packageTypeOptions}
            selectedValue={values.CargoPackageType}
            onSelect={(packageType: any) => {
              setFieldValue('CargoPackageType', packageType);
            }}
            numColumns={2}
          />
        </SelectionCard>
      )}

      {/* Time Picker */}
      <View
        style={tw`mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={tw`w-2 h-4 bg-indigo-500 mr-2 rounded-full`} />
          <Text style={tw`text-base font-bold text-gray-800`}>
            Expected Available Time
          </Text>
        </View>
        <TimePicker
          value={values?.ExpectedAvailableTime}
          onChange={time => setFieldValue('ExpectedAvailableTime', time)}
          label="Expected Available Time"
          placeholder="Select expected time"
          error={errors.ExpectedAvailableTime as string}
          required
          testID="expected-time-picker"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default SecondStep;
