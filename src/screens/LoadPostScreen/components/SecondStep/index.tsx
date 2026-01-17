import { ShipmentData } from '@api/api.type';
import {
  useCargoType_BodyType_HistoryQuery,
  useGetBodyTypeQuery,
  useGetCargoContentQuery,
  useGetPackageTypeQuery,
} from '@api/hooks_api';
import CustomRadioButton from '@components/common/CustomRadioButton';
import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Cargotypeoptions, DhalaLengthOptions } from '../../constant';
import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { RadioButton, Checkbox } from 'react-native-paper';
import CurrentDatePicker from '../CurrentDatePicker';
import NextDatePicker from '../NextDatePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
  value,
  placeholder,
  iconName,
  onPress,
  renderSelected,
  hasError = false,
  testID,
}) => (
  <TouchableOpacity
    style={tw`border-2  ${
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
);

// Add History Modal Component
interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  historyData: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  onClose,
  title,
  historyData,
  onSelect,
}) => {
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={tw`flex-row items-center p-4 border-b border-gray-100 bg-white`}
      onPress={() => onSelect(item)}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={tw`w-12 h-12 rounded-lg mr-3`}
          resizeMode="contain"
        />
      ) : (
        <View
          style={tw`w-12 h-12 bg-gray-100 rounded-lg mr-3 items-center justify-center`}
        >
          <Icon name="history" size={20} color="#6B7280" />
        </View>
      )}
      <View style={tw`flex-1`}>
        <Text style={tw`text-sm font-semibold text-gray-800`}>
          {item.label}
        </Text>
        {item.timestamp && (
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            Last used: {item.timestamp}
          </Text>
        )}
        {item.count && (
          <Text style={tw`text-xs text-blue-600 mt-1`}>
            Used {item.count} times
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-gray-50`}>
        {/* Header */}
        <View style={tw`bg-white px-4 py-4 border-b border-gray-200`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-lg font-bold text-gray-900`}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={tw`w-8 h-8 items-center justify-center rounded-full bg-gray-100`}
            >
              <Icon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={tw`text-sm text-gray-600 mt-1`}>
            Select from your recent choices
          </Text>
        </View>

        {/* History List */}
        {historyData.length > 0 ? (
          <FlatList
            data={historyData}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            style={tw`flex-1`}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={tw`flex-1 items-center justify-center p-8`}>
            <Icon name="history-toggle-off" size={48} color="#D1D5DB" />
            <Text
              style={tw`text-lg font-medium text-gray-500 mt-4 text-center`}
            >
              No history yet
            </Text>
            <Text style={tw`text-sm text-gray-400 mt-2 text-center`}>
              Your recent selections will appear here
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

// Add Cargo Content Modal Component
interface CargoContentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    cargoType: string;
    packageType: string;
    weight: string;
    isFlammable?: boolean;
  }) => void;
  isLiquid?: boolean;
  initialData?: {
    cargoType: string;
    packageType: string;
    weight: string;
    isFlammable?: boolean;
  };
}

const CargoContentModal: React.FC<CargoContentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLiquid = false,
  initialData,
}) => {
  const [selectedCargoType, setSelectedCargoType] = useState<string>(
    initialData?.cargoType || '',
  );
  const [selectedPackageType, setSelectedPackageType] = useState<string>(
    initialData?.packageType || '',
  );
  const [weight, setWeight] = useState<string>(initialData?.weight || '');
  const [isFlammable, setIsFlammable] = useState<boolean>(
    initialData?.isFlammable || false,
  );

  const { data: cargoContentData } = useGetCargoContentQuery();
  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: selectedCargoType },
    { skip: !selectedCargoType },
  );

  const cargoContentOptions =
    cargoContentData?.data?.map(item => ({
      id: item?.cargo_type,
      label: item?.cargo_type,
      image: { uri: item?.img },
    })) || [];

  const packageTypeOptions =
    packageTypeData?.data?.map(item => ({
      id: item?.packaging_type,
      label: item?.packaging_type,
      image: { uri: item?.img },
    })) || [];

  const handleSubmit = () => {
    onSubmit({
      cargoType: selectedCargoType,
      packageType: selectedPackageType,
      weight,
      isFlammable: isLiquid ? isFlammable : undefined,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black/50`}>
        <View style={tw`bg-white w-11/12 max-w-md rounded-xl`}>
          {/* Header */}
          <View style={tw`p-4 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-lg font-bold text-gray-900`}>
                {isLiquid ? 'Liquid Cargo Details' : 'Cargo Content Details'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={tw`w-8 h-8 items-center justify-center rounded-full bg-gray-100`}
              >
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={tw`text-sm text-gray-600 mt-1`}>
              {isLiquid
                ? 'Fill in your liquid cargo information'
                : 'Fill in your cargo information'}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={tw`max-h-96 p-4`}>
            {/* Cargo Type Selection */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                Select Cargo Type *
              </Text>
              <SelectionButton
                value={selectedCargoType}
                placeholder="Choose Cargo Type"
                iconName="inventory"
                onPress={() => {}}
                renderSelected={() => (
                  <View style={tw`flex-row items-center gap-3`}>
                    <Image
                      source={{
                        uri:
                          cargoContentData?.data?.find(
                            c => c.cargo_type === selectedCargoType,
                          )?.img || '',
                      }}
                      style={tw`w-10 h-10`}
                      resizeMode="contain"
                    />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-bold text-gray-800`}>
                        {selectedCargoType}
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
              {cargoContentOptions.length > 0 && (
                <View style={tw`mt-2 border border-gray-200 rounded-lg p-2`}>
                  <FlatList
                    data={cargoContentOptions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={tw`flex-row items-center p-3 border-b border-gray-100`}
                        onPress={() => setSelectedCargoType(item.id)}
                      >
                        <View
                          style={tw`w-6 h-6 rounded-full border-2 ${
                            selectedCargoType === item.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          } items-center justify-center`}
                        >
                          {selectedCargoType === item.id && (
                            <View
                              style={tw`w-3 h-3 rounded-full bg-blue-500`}
                            />
                          )}
                        </View>
                        {item.image?.uri && (
                          <Image
                            source={{ uri: item.image.uri }}
                            style={tw`w-8 h-8 ml-3`}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={tw`ml-3 text-gray-700`}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* Package Type Selection */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                Select Package Type *
              </Text>
              <SelectionButton
                value={selectedPackageType}
                placeholder="Choose Package Type"
                iconName="storefront"
                onPress={() => {}}
                renderSelected={() => (
                  <View style={tw`flex-row items-center gap-3`}>
                    <Image
                      source={{
                        uri:
                          packageTypeData?.data?.find(
                            p => p.packaging_type === selectedPackageType,
                          )?.img || '',
                      }}
                      style={tw`w-10 h-10`}
                      resizeMode="contain"
                    />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-bold text-gray-800`}>
                        {selectedPackageType}
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
              {packageTypeOptions.length > 0 && (
                <View style={tw`mt-2 border border-gray-200 rounded-lg p-2`}>
                  <FlatList
                    data={packageTypeOptions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={tw`flex-row items-center p-3 border-b border-gray-100`}
                        onPress={() => setSelectedPackageType(item.id)}
                      >
                        <View
                          style={tw`w-6 h-6 rounded-full border-2 ${
                            selectedPackageType === item.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          } items-center justify-center`}
                        >
                          {selectedPackageType === item.id && (
                            <View
                              style={tw`w-3 h-3 rounded-full bg-blue-500`}
                            />
                          )}
                        </View>
                        {item.image?.uri && (
                          <Image
                            source={{ uri: item.image.uri }}
                            style={tw`w-8 h-8 ml-3`}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={tw`ml-3 text-gray-700`}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* Weight Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                Approximate Weight per kg *
              </Text>
              <View style={tw`border border-gray-300 rounded-lg bg-gray-50`}>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter weight in kg"
                  keyboardType="numeric"
                  style={tw`p-3 text-gray-800`}
                />
              </View>
            </View>

            {/* Flammable Checkbox (only for liquid) */}
            {isLiquid && (
              <View style={tw`mb-4`}>
                <TouchableOpacity
                  style={tw`flex-row items-center`}
                  onPress={() => setIsFlammable(!isFlammable)}
                >
                  <View
                    style={tw`w-6 h-6 rounded border-2 ${
                      isFlammable
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    } items-center justify-center`}
                  >
                    {isFlammable && (
                      <Icon name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text style={tw`ml-3 text-gray-700 font-medium`}>
                    Is flammable
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={tw`p-4 border-t border-gray-200`}>
            <TouchableOpacity
              onPress={handleSubmit}
              // disabled={!selectedCargoType || !selectedPackageType || !weight}
              style={tw`bg-blue-500 rounded-lg p-3 items-center ${
                !selectedCargoType || !selectedPackageType || !weight
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <Text style={tw`text-white font-semibold`}>Save Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SecondStep: React.FC = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ShipmentData>();
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };

  const [bodyTypeHistoryVisible, setBodyTypeHistoryVisible] = useState(false);
  const [cargoContentModalVisible, setCargoContentModalVisible] =
    useState(false);
  const [liquidCargoModalVisible, setLiquidCargoModalVisible] = useState(false);
  const [selectedCargoOption, setSelectedCargoOption] = useState<
    'cargoContent' | 'liquid' | ''
  >('');
  const [expectedDay, setExpectedDay] = useState('current');

  const { data: BodyTypeData } = useGetBodyTypeQuery(
    {
      vehicleType: values.vehicle.vehicleType,
      weightRange: values.vehicle.weightRange,
    },
    { skip: !values.vehicle.vehicleType || !values.vehicle.weightRange },
  );

  const { data: cargoTypeBodyTypeHistoryData } =
    useCargoType_BodyType_HistoryQuery({ CustomerID: CustomerID });

  const historyList = cargoTypeBodyTypeHistoryData?.data ?? [];

  const bodyTypeHistoryData = Array.from(
    new Map(historyList.map(item => [item.BodyType, item])).values(),
  ).map((item, index) => ({
    id: String(index + 1),
    label: item.BodyType,
    timestamp: new Date(item.LastUsedDate).toLocaleString(),
    count: historyList.filter(x => x.BodyType === item.BodyType).length,
  }));

  const bodyTypeRef = useRef<SelectionModalRef>(null);

  const updateSchedule = (dayType: string, date: string, time: string) => {
    if (!date || !time) return;

    const dateTime = `${date} ${time}`;
    setFieldValue(
      'load.expectedVehicleAvailability',
      dayType === 'current' ? 'Current Day' : 'Next Day',
    );
    setFieldValue('schedule.date', date);
    setFieldValue('schedule.time', time);
  };

  const isNextDayRadioEnabled = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    return minutes >= 15 * 60; // enabled only after 3:00 PM
  };

  const bodyTypeOptions =
    BodyTypeData?.data?.map(item => ({
      id: item?.BodyType,
      label: item?.BodyType,
      image: { uri: item?.img },
    })) || [];

  const selectedBodyType = useMemo(
    () =>
      BodyTypeData?.data.find(body => body.BodyType === values.load.bodyType),
    [BodyTypeData, values.load.bodyType],
  );

  const handleHistorySelect = (item: HistoryItem) => {
    setFieldValue('load.bodyType', item.label);
    setBodyTypeHistoryVisible(false);
  };

  const handleCargoContentSubmit = (data: {
    cargoType: string;
    packageType: string;
    weight: string;
    isFlammable?: boolean;
  }) => {
    setFieldValue('load.cargoType', data.cargoType);
    setFieldValue('load.packageType', data.packageType);
    setFieldValue('load.weight', data.weight);
    setFieldValue('load.isLiquid', selectedCargoOption === 'liquid');
    if (selectedCargoOption === 'liquid') {
      setFieldValue('load.isFlammable', data.isFlammable || false);
    }
  };

  const handleCargoOptionSelect = (option: 'cargoContent' | 'liquid') => {
    setSelectedCargoOption(option);
    if (option === 'cargoContent') {
      setCargoContentModalVisible(true);
    } else {
      setLiquidCargoModalVisible(true);
    }
  };

  const getSelectedCargoDisplay = () => {
    if (!values.load.cargoType) return null;

    const isLiquid = values.load.isLiquid;
    return `${isLiquid ? 'Liquid Cargo' : 'Cargo Content'}: ${
      values.load.cargoType
    }${values.load.packageType ? `, ${values.load.packageType}` : ''}${
      values.load.weight ? `, ${values.load.weight}kg` : ''
    }${isLiquid && values.load.isFlammable ? ', Flammable' : ''}`;
  };

  return (
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
        {/* Dhala Length Selection */}
        <SelectionCard
          title="Select Dhala Length"
          color="#F59E0B"
          error={errors.load?.dhalaLength as string}
          touched={touched.load?.dhalaLength as boolean}
          testID="dhala-length-card"
        >
          <View style={tw`border-2 border-gray-300 bg-gray-50 p-3 rounded-lg`}>
            <CustomRadioButton
              options={DhalaLengthOptions}
              selectedOption={values.load.dhalaLength}
              onSelect={(value: string) => {
                setFieldValue('load.dhalaLength', value);
              }}
              selectedColor="#3B82F6"
              containerStyle={tw`p-2`}
            />
          </View>
        </SelectionCard>

        {/* Body Type Selection */}
        <SelectionCard
          title="Body Type"
          color="#3B82F6"
          error={errors.load?.bodyType as string}
          touched={touched.load?.bodyType as boolean}
          testID="body-type-card"
        >
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`flex-1`}>
              <SelectionButton
                value={values.load.bodyType}
                placeholder="Choose Body Type"
                iconName="local-shipping"
                onPress={() => bodyTypeRef.current?.open()}
                hasError={!!errors.load?.bodyType && !!touched.load?.bodyType}
                testID="body-type-button"
                renderSelected={() => (
                  <View style={tw`flex-row items-center gap-2`}>
                    <Image
                      source={
                        selectedBodyType?.img
                          ? { uri: selectedBodyType?.img }
                          : undefined
                      }
                      style={tw`w-10 h-10`}
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
            </View>
            <TouchableOpacity
              onPress={() => setBodyTypeHistoryVisible(true)}
              style={tw`h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 shadow-xs`}
            >
              <Icon name="history" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <SelectionModal
            ref={bodyTypeRef}
            title="Select Body Type"
            options={bodyTypeOptions}
            selectedValue={values.load.bodyType}
            onSelect={(bodyType: any) => {
              setFieldValue('load.bodyType', bodyType);
            }}
            numColumns={2}
          />
        </SelectionCard>

        {/* Cargo Content Radio Buttons */}
        <SelectionCard
          title="Cargo Information"
          color="#10B981"
          error={errors.load?.cargoType as string}
          touched={touched.load?.cargoType as boolean}
          testID="cargo-info-card"
        >
          {/* Display selected cargo if exists */}
          {getSelectedCargoDisplay() && (
            <View
              style={tw`mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg`}
            >
              <Text style={tw`text-sm font-semibold text-blue-800`}>
                Selected:
              </Text>
              <Text style={tw`text-sm text-blue-700 mt-1`}>
                {getSelectedCargoDisplay()}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (values.load.isLiquid) {
                    setSelectedCargoOption('liquid');
                    setLiquidCargoModalVisible(true);
                  } else {
                    setSelectedCargoOption('cargoContent');
                    setCargoContentModalVisible(true);
                  }
                }}
                style={tw`mt-2`}
              >
                <Text style={tw`text-xs text-blue-500 underline`}>
                  Edit selection
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Radio Buttons */}
          <View style={tw`border-2 border-gray-300 bg-gray-50 p-3 rounded-lg`}>
            <CustomRadioButton
              options={[
                { label: 'Select Cargo Content', value: 'cargoContent' },
              ]}
              selectedOption={selectedCargoOption}
              onSelect={(value: string) => {
                handleCargoOptionSelect(value as 'cargoContent' | 'liquid');
              }}
              selectedColor="#10B981"
              containerStyle={tw`p-2`}
            />
            <CustomRadioButton
              options={[
                {
                  label: 'Select if your cargo is in liquid form',
                  value: 'liquid',
                },
              ]}
              selectedOption={selectedCargoOption}
              onSelect={(value: string) => {
                handleCargoOptionSelect(value as 'cargoContent' | 'liquid');
              }}
              selectedColor="#10B981"
              containerStyle={tw`p-2`}
            />
          </View>
        </SelectionCard>

        {/* Time Picker */}
        <View
          style={tw`bg-white p-4 rounded-xl border border-gray-100 shadow-xs`}
        >
          {/* Header */}
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`w-2 h-4 bg-indigo-500 mr-2 rounded-full`} />
            <Text style={tw`text-base font-bold text-gray-800`}>
              Expected Vehicle Availability At Pickup Point
            </Text>
          </View>

          <RadioButton.Group
            value={expectedDay}
            onValueChange={v => {
              if (v === 'next' && !isNextDayRadioEnabled()) {
                return; // block selection before 3 PM
              }

              setExpectedDay(v);

              if (v === 'current') {
                updateSchedule(
                  'current',
                  values.CurrentDate,
                  values.CurrentTime,
                );
              } else {
                updateSchedule('next', values.NextDate, values.NextTime);
              }
            }}
          >
            {/* CURRENT DAY */}
            <View style={tw`flex-row items-center mb-2`}>
              <RadioButton value="current" color="#3B82F6" />
              <Text>Current Day</Text>
            </View>
            <CurrentDatePicker
              dateValue={values.CurrentDate}
              timeValue={values.CurrentTime}
              onDateChange={d => {
                setFieldValue('CurrentDate', d);
                updateSchedule('current', d, values.CurrentTime);
              }}
              onTimeChange={t => {
                setFieldValue('CurrentTime', t);
                updateSchedule('current', values.CurrentDate, t);
              }}
              disabled={expectedDay !== 'current'}
            />
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

              <NextDatePicker
                dateValue={values.NextDate}
                timeValue={values.NextTime}
                onDateChange={d => {
                  setFieldValue('NextDate', d);
                  updateSchedule('next', d, values.NextTime);
                }}
                onTimeChange={t => {
                  setFieldValue('NextTime', t);
                  updateSchedule('next', values.NextDate, t);
                }}
                disabled={expectedDay !== 'next'}
              />
            </>
          </RadioButton.Group>
        </View>

        {/* History Modal */}
        <HistoryModal
          visible={bodyTypeHistoryVisible}
          onClose={() => setBodyTypeHistoryVisible(false)}
          title="Body Type History"
          historyData={bodyTypeHistoryData}
          onSelect={handleHistorySelect}
        />

        {/* Cargo Content Modal */}
        <CargoContentModal
          visible={cargoContentModalVisible}
          onClose={() => setCargoContentModalVisible(false)}
          onSubmit={handleCargoContentSubmit}
          isLiquid={false}
          initialData={{
            cargoType: values.load.cargoType,
            packageType: values.load.packageType,
            weight: values.load.weight,
          }}
        />

        {/* Liquid Cargo Modal */}
        <CargoContentModal
          visible={liquidCargoModalVisible}
          onClose={() => setLiquidCargoModalVisible(false)}
          onSubmit={handleCargoContentSubmit}
          isLiquid={true}
          initialData={{
            cargoType: values.load.cargoType,
            packageType: values.load.packageType,
            weight: values.load.weight,
            isFlammable: values.load.isFlammable,
          }}
        />
      </View>
    </KeyboardAwareScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default SecondStep;
