import { ShipmentData } from '@api/api.type';
import {
  useCargoType_BodyType_HistoryQuery,
  useGetBodyTypeQuery,
  useGetCargoContentQuery,
  useGetPackageTypeQuery,
} from '@api/hooks_api';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { RadioButton } from 'react-native-paper';
import CurrentDatePicker from '../CurrentDatePicker';
import NextDatePicker from '../NextDatePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePickerModal from '@components/custumcomponent/ImagePickerModal';
import SearchableBottomSheet from '@modal/SearchableBottomSheet';

// Add this interface for history items
interface HistoryItem {
  id: string;
  label: string;
  image?: string;
  timestamp?: string;
  count?: number;
}

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
    style={tw` bg-white p-4 rounded-xl border ${
      error && touched ? 'border-red-300' : 'border-gray-100'
    } shadow-xs`}
    testID={testID}
  >
    <View style={tw`flex-row items-center `}>
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
  showCameraIcon?: boolean;
  onCameraPress?: () => void;
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
  value,
  placeholder,
  iconName,
  onPress,
  renderSelected,
  hasError = false,
  testID,
  showCameraIcon = false,
  onCameraPress,
}) => (
  <View style={tw`flex-row items-center gap-2`}>
    <TouchableOpacity
      style={tw`flex-1 border-2  ${
        value
          ? hasError
            ? 'border-red-200 bg-red-50'
            : 'border-blue-200 bg-blue-50'
          : hasError
          ? 'border-red-200 bg-red-50'
          : 'border-gray-300 bg-gray-50'
      } p-2 rounded-lg`}
      onPress={onPress}
      testID={testID}
    >
      {value ? (
        renderSelected()
      ) : (
        <View style={tw`flex-row items-center gap-3`}>
          <View style={tw`bg-gray-200 rounded-full`}>
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
    {showCameraIcon && (
      <TouchableOpacity
        style={tw`p-3 bg-blue-100 rounded-lg`}
        onPress={onCameraPress}
        testID="camera-button"
      >
        <Icon name="camera-alt" size={20} color="#3B82F6" />
      </TouchableOpacity>
    )}
  </View>
);

const SecondStep: React.FC = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ShipmentData>();
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };

  // ===== STATE =====
  const [cargoTypeModalVisible, setCargoTypeModalVisible] = useState(false);
  const [packageTypeModalVisible, setPackageTypeModalVisible] = useState(false);
  const [showOtherCargoInput, setShowOtherCargoInput] = useState(false);
  const [showOtherPackageInput, setShowOtherPackageInput] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [expectedDay, setExpectedDay] = useState<'current' | 'next'>('current');

  // Local state for date/time pickers
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');

  // ===== DATA FETCHING =====
  const { data: cargoContentData } = useGetCargoContentQuery();
  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: values.load.cargoType },
    { skip: !values.load.cargoType },
  );

  const { data: cargoTypeBodyTypeHistoryData } =
    useCargoType_BodyType_HistoryQuery({ CustomerID: CustomerID });

  const historyList = cargoTypeBodyTypeHistoryData?.data ?? [];

  // ===== OPTIONS =====
  const cargoContentOptions =
    cargoContentData?.data?.map(item => ({
      id: item?.cargo_type,
      label: item?.cargo_type,
      image: { uri: item?.img },
    })) || [];

  // Add "Other" option to cargo content
  const cargoContentOptionsWithOther = [
    ...cargoContentOptions,
    { id: 'other', label: 'Other', image: undefined },
  ];

  const packageTypeOptions =
    packageTypeData?.data?.map(item => ({
      id: item?.packaging_type,
      label: item?.packaging_type,
      image: { uri: item?.img },
    })) || [];

  // Add "Other" option to package type
  const packageTypeOptionsWithOther = [
    ...packageTypeOptions,
    { id: 'other', label: 'Other', image: undefined },
  ];

  // ===== HELPER FUNCTIONS =====
  const isLiquidOrChemical = () => {
    const selectedCargo = values.load.cargoType;
    if (!selectedCargo) return false;

    const lowerCargo = selectedCargo.toLowerCase();
    const liquidChemicalKeywords = [
      'liquid',
      'chemical',
      'fluid',
      'liquids',
      'oil',
      'petroleum',
      'gasoline',
      'diesel',
      'solvent',
      'acid',
      'alkali',
    ];
    return liquidChemicalKeywords.some(keyword => lowerCargo.includes(keyword));
  };

  const shouldShowHazardousSection = () => {
    return values.load.cargoType && isLiquidOrChemical();
  };

  const isNextDayRadioEnabled = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= 15 * 60; // enabled only after 3:00 PM
  };

  // ===== HANDLERS =====
  const updateExpectedAvailability = (date: string, time: string) => {
    if (!date || !time) return;
    setFieldValue('load.expectedVehicleAvailability', `${date} ${time}`);
  };

  const handleCargoTypeSelect = (cargoType: string) => {
    if (cargoType === 'other') {
      setFieldValue('load.cargoType', '');
      setFieldValue('load.otherCargoType', '');
      setShowOtherCargoInput(true);
    } else {
      setFieldValue('load.cargoType', cargoType);
      setFieldValue('load.otherCargoType', '');
      setShowOtherCargoInput(false);
    }

    // Reset hazardous/flammable fields when cargo type changes
    setFieldValue('load.isHazardous', false);
    setFieldValue('load.isFlammable', false);
    setFieldValue('load.flammableDeclaration', '');
    setFieldValue('load.hazardousDeclaration', '');

    setCargoTypeModalVisible(false);
  };

  const handlePackageTypeSelect = (packageType: string) => {
    if (packageType === 'other') {
      // Clear packageType – user will type custom value in the input
      setFieldValue('load.packageType', '');
      setFieldValue('load.packageDescription', '');
      setShowOtherPackageInput(true);
    } else {
      setFieldValue('load.packageType', packageType);
      setFieldValue('load.packageDescription', '');
      setShowOtherPackageInput(false);
    }
    setPackageTypeModalVisible(false);
  };

  const handleImageSelected = (uri: string) => {
    setFieldValue('load.packageImage', uri);
    console.log('Selected image URI:', uri);
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 120 : 80}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.compactContainer} testID="address-info-step">
          {/* Cargo Information Section */}
          <SelectionCard
            title="Cargo Information"
            color="#10B981"
            error={
              (errors.load?.cargoType as string) ||
              (errors.load?.packageType as string) ||
              (errors.load?.weight as string)
            }
            touched={
              (touched.load?.cargoType as boolean) ||
              (touched.load?.packageType as boolean) ||
              (touched.load?.weight as boolean)
            }
            testID="cargo-info-card"
          >
            {/* Cargo Content Dropdown */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                Cargo / Material Type *
              </Text>
              <SelectionButton
                value={values.load.cargoType}
                placeholder="Select Cargo Type"
                iconName="inventory"
                onPress={() => setCargoTypeModalVisible(true)}
                hasError={!!errors.load?.cargoType && !!touched.load?.cargoType}
                testID="cargo-type-button"
                renderSelected={() => (
                  <View style={tw`flex-row items-center gap-3`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-bold text-gray-800`}>
                        {values.load.otherCargoType || values.load.cargoType}
                      </Text>
                      <Text style={tw`text-xs text-gray-600 mt-1`}>
                        Selected cargo content
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
            </View>

            {/* Cargo Type Inputs based on selection */}
            {(values.load.cargoType || showOtherCargoInput) && (
              <View style={tw`mb-4`}>
                {/* Show cargo type input only when "Other" is selected */}
                {showOtherCargoInput && (
                  <>
                    <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                      Cargo Type / Material Name *
                    </Text>
                    <TextInput
                      value={values.load.cargoType}
                      onChangeText={text => {
                        setFieldValue('load.cargoType', text);
                        // Auto-reset hazardous/flammable declarations when typing
                        if (text && !isLiquidOrChemical()) {
                          setFieldValue('load.isHazardous', false);
                          setFieldValue('load.isFlammable', false);
                          setFieldValue('load.flammableDeclaration', '');
                          setFieldValue('load.hazardousDeclaration', '');
                        }
                      }}
                      placeholder="Enter cargo type (e.g., Electronics, Chemicals, etc.)"
                      style={tw`border border-gray-300 rounded-lg p-3 bg-white mb-3`}
                    />
                  </>
                )}

                {/* Material Name Input - Always show when cargo type is selected */}
                <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                  Cargo Name / Material Name *
                </Text>
                <TextInput
                  value={values.load.materialName || ''}
                  onChangeText={text =>
                    setFieldValue('load.materialName', text)
                  }
                  placeholder={
                    showOtherCargoInput
                      ? 'Enter specific material name'
                      : `Enter ${values.load.cargoType} material name`
                  }
                  style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                />
              </View>
            )}

            {/* Package Type Selection - Show after cargo type is selected */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                Package Type *
              </Text>
              <SelectionButton
                value={values.load.packageType}
                placeholder="Select Package Type"
                iconName="storefront"
                onPress={() => setPackageTypeModalVisible(true)}
                hasError={
                  !!errors.load?.packageType && !!touched.load?.packageType
                }
                testID="package-type-button"
                showCameraIcon={true}
                onCameraPress={() => setImagePickerVisible(true)}
                renderSelected={() => (
                  <View style={tw`flex-row items-center gap-3`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-bold text-gray-800`}>
                        {values.load.packageType}
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

              {/* Show selected image preview if available */}
              {values.load.packageImage && (
                <View style={tw`mt-2`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Package image selected
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <Icon name="image" size={16} color="#3B82F6" />
                    <Text style={tw`text-xs text-blue-600 ml-1`}>
                      Image attached
                    </Text>
                  </View>
                </View>
              )}

              {/* Other Package Type Inputs */}
              {showOtherPackageInput && (
                <View style={tw`mt-3`}>
                  <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                    Enter Package Type Details
                  </Text>
                  <TextInput
                    value={values.load.packageType}
                    onChangeText={text =>
                      setFieldValue('load.packageType', text)
                    }
                    placeholder="Package type name"
                    style={tw`border border-gray-300 rounded-lg p-3 bg-white mb-2`}
                  />
                  <TextInput
                    value={values.load.packageDescription}
                    onChangeText={text =>
                      setFieldValue('load.packageDescription', text)
                    }
                    placeholder="Package description (optional)"
                    style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            </View>

            {/* Hazardous/Flammable Checkboxes - Show only when cargo is liquid/chemical */}
            {shouldShowHazardousSection() && (
              <View style={tw`mb-4`}>
                <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                  Hazardous/Flammable Declaration
                </Text>
                <View style={tw`flex-row gap-4`}>
                  {/* Hazardous Checkbox */}
                  <TouchableOpacity
                    style={tw`flex-row items-center flex-1`}
                    onPress={() =>
                      setFieldValue(
                        'load.isHazardous',
                        !values.load.isHazardous,
                      )
                    }
                  >
                    <View
                      style={tw`w-5 h-5 border border-gray-400 rounded mr-2 ${
                        values.load.isHazardous ? 'bg-blue-500' : 'bg-white'
                      }`}
                    >
                      {values.load.isHazardous && (
                        <Icon name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={tw`text-sm text-gray-700`}>Hazardous</Text>
                  </TouchableOpacity>

                  {/* Flammable Checkbox */}
                  <TouchableOpacity
                    style={tw`flex-row items-center flex-1`}
                    onPress={() =>
                      setFieldValue(
                        'load.isFlammable',
                        !values.load.isFlammable,
                      )
                    }
                  >
                    <View
                      style={tw`w-5 h-5 border border-gray-400 rounded mr-2 ${
                        values.load.isFlammable ? 'bg-blue-500' : 'bg-white'
                      }`}
                    >
                      {values.load.isFlammable && (
                        <Icon name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={tw`text-sm text-gray-700`}>Flammable</Text>
                  </TouchableOpacity>
                </View>

                {/* Flammable Content Input - Show when flammable is checked */}
                {values.load.isFlammable && (
                  <View style={tw`mt-3`}>
                    <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                      Flammable Content Details *
                    </Text>
                    <TextInput
                      value={values.load.flammableDeclaration}
                      onChangeText={text =>
                        setFieldValue('load.flammableDeclaration', text)
                      }
                      placeholder="Enter flammable content details"
                      style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}

                {/* Hazardous Details Input - Show when hazardous is checked */}
                {values.load.isHazardous && (
                  <View style={tw`mt-3`}>
                    <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                      Hazardous Details *
                    </Text>
                    <TextInput
                      value={values.load.hazardousDeclaration}
                      onChangeText={text =>
                        setFieldValue('load.hazardousDeclaration', text)
                      }
                      placeholder="Enter hazardous material details"
                      style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Weight Input - Only show when cargo and package are selected */}
            {values.load.cargoType && values.load.packageType && (
              <View style={tw`mb-4`}>
                <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                  Approximate Weight per Package (kg) *
                </Text>
                <TextInput
                  value={values.load.weight}
                  onChangeText={text => setFieldValue('load.weight', text)}
                  placeholder="Enter approximate weight per package in kg"
                  keyboardType="numeric"
                  style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                />
              </View>
            )}
          </SelectionCard>

          {/* Time Picker */}
          <View
            style={tw`bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
          >
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`w-2 h-4 bg-indigo-500 mr-2 rounded-full`} />
              <Text style={tw`text-base font-bold text-gray-800`}>
                Expected Vehicle Availability At Pickup Point
              </Text>
            </View>

            <RadioButton.Group
              value={expectedDay}
              onValueChange={v => {
                if (v === 'next' && !isNextDayRadioEnabled()) return;
                setExpectedDay(v);
              }}
            >
              {/* CURRENT DAY */}
              <View style={tw`flex-row items-center mb-2`}>
                <RadioButton value="current" color="#3B82F6" />
                <Text>Current Day</Text>
              </View>
              {expectedDay === 'current' && (
                <CurrentDatePicker
                  onDateChange={date => {
                    setCurrentDate(date);
                    updateExpectedAvailability(date, currentTime);
                  }}
                  onTimeChange={time => {
                    setCurrentTime(time);
                    updateExpectedAvailability(currentDate, time);
                  }}
                />
              )}
              {/* NEXT DAY */}
              <>
                <View style={tw`flex-row items-center mt-5 mb-2`}>
                  <RadioButton
                    value="next"
                    color="#3B82F6"
                    disabled={!isNextDayRadioEnabled()}
                  />
                  <View style={tw`flex-row items-center flex-wrap`}>
                    <Text
                      style={
                        !isNextDayRadioEnabled()
                          ? tw`text-gray-400`
                          : tw`text-gray-800`
                      }
                    >
                      Next Day
                    </Text>
                    <Text style={tw`text-xs text-red-500 ml-2`}>
                      (This will be active between 15:00 to 23:59)
                    </Text>
                  </View>
                </View>
                {expectedDay === 'next' && (
                  <NextDatePicker
                    onDateChange={date => {
                      setNextDate(date);
                      updateExpectedAvailability(date, nextTime);
                    }}
                    onTimeChange={time => {
                      setNextTime(time);
                      updateExpectedAvailability(nextDate, time);
                    }}
                  />
                )}
              </>
            </RadioButton.Group>
          </View>

          {/* Modals */}
          <SearchableBottomSheet
            visible={cargoTypeModalVisible}
            onClose={() => setCargoTypeModalVisible(false)}
            title="Select Cargo Content"
            data={cargoContentOptionsWithOther}
            selectedValue={values.load.cargoType}
            onSelect={handleCargoTypeSelect}
          />
          <SearchableBottomSheet
            visible={packageTypeModalVisible}
            onClose={() => setPackageTypeModalVisible(false)}
            title="Select Package Type"
            data={packageTypeOptionsWithOther}
            selectedValue={values.load.packageType}
            onSelect={handlePackageTypeSelect}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
        title="Upload Package Image"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 80,
  },
  compactContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default SecondStep;
