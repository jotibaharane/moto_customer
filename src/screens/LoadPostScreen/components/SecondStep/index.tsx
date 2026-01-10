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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Cargotypeoptions, DhalaLengthOptions } from '../../constant';
import SelectionModal, { SelectionModalRef } from '../SelectionModal';
import TimePicker from '../TimePicker24Hr';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { RadioButton } from 'react-native-paper';
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

const SecondStep: React.FC = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ShipmentData>();
  const { CustomerID } = useSelector(
    (state: RootState) => state.auth.customerDetails,
  ) || { CustomerID: '' };

  const [cargoContentHistoryVisible, setCargoContentHistoryVisible] =
    useState(false);
  const [bodyTypeHistoryVisible, setBodyTypeHistoryVisible] = useState(false);

  const { data: BodyTypeData } = useGetBodyTypeQuery(
    {
      vehicleType: values.vehicle.vehicleType,
      weightRange: values.vehicle.weightRange,
    },
    { skip: !values.vehicle.vehicleType || !values.vehicle.weightRange },
  );
  const [expectedDay, setExpectedDay] = useState('current');
  console.log('BodyTypeData', BodyTypeData);
  const {
    data: cargoTypeBodyTypeHistoryData,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useCargoType_BodyType_HistoryQuery({ CustomerID: CustomerID });

  const { data: packageTypeData } = useGetPackageTypeQuery(
    { cargotype: values.load.cargoContent },
    { skip: !values.load.cargoContent },
  );

  const { data: cargoContentData } = useGetCargoContentQuery();

  const bodyTypeRef = useRef<SelectionModalRef>(null);
  const cargoContentRef = useRef<SelectionModalRef>(null);
  const packageTypeRef = useRef<SelectionModalRef>(null);

  const historyList = cargoTypeBodyTypeHistoryData?.data ?? [];

  const bodyTypeHistoryData = Array.from(
    new Map(historyList.map(item => [item.BodyType, item])).values(),
  ).map((item, index) => ({
    id: String(index + 1),
    label: item.BodyType,
    timestamp: new Date(item.LastUsedDate).toLocaleString(),
    count: historyList.filter(x => x.BodyType === item.BodyType).length,
  }));

  const cargoContentHistoryData = Array.from(
    new Map(historyList.map(item => [item.CargoContent, item])).values(),
  ).map((item, index) => ({
    id: String(index + 1),
    label: item.CargoContent,
    image:
      'https://via.placeholder.com/100x100.png?text=' +
      encodeURIComponent(item.CargoContent),
    timestamp: new Date(item.LastUsedDate).toLocaleString(),
    count: historyList.filter(x => x.CargoContent === item.CargoContent).length,
  }));

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
  console.log({ BodyTypeData });
  // Format options for modals
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

  const cargoContentOptions =
    cargoContentData?.data?.map(item => ({
      id: item?.cargo_type,
      label: item?.cargo_type,
      image: { uri: item?.img },
    })) || [];

  const selectedCargoContentType = useMemo(
    () =>
      cargoContentData?.data.find(
        content => content.cargo_type === values.load.cargoContent,
      ),
    [cargoContentData, values.load.cargoContent],
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
        pkg => pkg.packaging_type === values.load.packageType,
      ),
    [packageTypeData, values.load.packageType],
  );

  const handleHistorySelect = (
    item: HistoryItem,
    type: 'bodyType' | 'cargoContent',
  ) => {
    if (type === 'cargoContent') {
      setFieldValue('load.cargoContent', item.label);
      setCargoContentHistoryVisible(false);
      setFieldValue('load.packageType', '');
    } else if (type === 'bodyType') {
      setFieldValue('load.bodyType', item.label);
      setBodyTypeHistoryVisible(false);
    }
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
        {/* Cargo Type Selection with History */}
        <View>
          <SelectionCard
            title="Select Cargo Type"
            color="#F59E0B"
            error={errors.load?.dhalaLength as string}
            touched={touched.load?.dhalaLength as boolean}
            testID="dhala-length-card"
          >
            <View
              style={tw`border-2 border-gray-300 bg-gray-50 p-2 rounded-lg`}
            >
              <CustomRadioButton
                options={Cargotypeoptions}
                selectedOption={values.load.cargoType}
                onSelect={(value: string) => {
                  setFieldValue('load.cargoType', value);
                }}
                selectedColor="#3B82F6"
                containerStyle={tw`p-2`}
              />
            </View>
          </SelectionCard>
        </View>

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

        {/* Cargo Content Selection with History */}
        <View>
          <SelectionCard
            title="Cargo Content | Material"
            color="#10B981"
            error={errors.load?.cargoContent as string}
            touched={touched.load?.cargoContent as boolean}
            testID="cargo-content-card"
          >
            <View style={tw`flex-row items-center gap-2`}>
              <View style={tw`flex-1`}>
                <SelectionButton
                  value={values.load.cargoContent}
                  placeholder="Choose Cargo Content"
                  iconName="inventory"
                  onPress={() => cargoContentRef.current?.open()}
                  hasError={
                    !!errors.load?.cargoContent && !!touched.load?.cargoContent
                  }
                  testID="cargo-content-button"
                  renderSelected={() => (
                    <View style={tw`flex-row items-center gap-3`}>
                      <Image
                        source={
                          selectedCargoContentType?.img
                            ? { uri: selectedCargoContentType?.img }
                            : undefined
                        }
                        style={tw`w-10 h-10`}
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
              </View>
              <TouchableOpacity
                onPress={() => setCargoContentHistoryVisible(true)}
                style={tw`h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 shadow-xs`}
              >
                <Icon name="history" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <SelectionModal
              ref={cargoContentRef}
              title="Select Cargo Content"
              options={cargoContentOptions}
              selectedValue={values.load.cargoContent}
              onSelect={(cargoContent: any) => {
                setFieldValue('load.cargoContent', cargoContent);
                setFieldValue('load.packageType', '');
              }}
              numColumns={2}
            />
          </SelectionCard>
        </View>

        {/* Package Type Selection */}
        <SelectionCard
          title="Package Type"
          color="#8B5CF6"
          error={errors.load?.packageType as string}
          touched={touched.load?.packageType as boolean}
          testID="package-type-card"
        >
          <SelectionButton
            value={values.load.packageType}
            placeholder="Choose Package Type"
            iconName="storefront"
            onPress={() => packageTypeRef.current?.open()}
            hasError={!!errors.load?.packageType && !!touched.load?.packageType}
            testID="package-type-button"
            renderSelected={() => (
              <View style={tw`flex-row items-center gap-3`}>
                <Image
                  source={
                    selectedPackageType?.img
                      ? { uri: selectedPackageType?.img }
                      : undefined
                  }
                  style={tw`w-10 h-10`}
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
            selectedValue={values.load.packageType}
            onSelect={(packageType: any) => {
              setFieldValue('load.packageType', packageType);
            }}
            numColumns={2}
          />
        </SelectionCard>

        {/* Time Picker */}
        {/* Expected Availability Section */}

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

        {/* History Modals */}
        <HistoryModal
          visible={bodyTypeHistoryVisible}
          onClose={() => setBodyTypeHistoryVisible(false)}
          title="Body Type History"
          historyData={bodyTypeHistoryData}
          onSelect={item => handleHistorySelect(item, 'bodyType')}
        />
        <HistoryModal
          visible={cargoContentHistoryVisible}
          onClose={() => setCargoContentHistoryVisible(false)}
          title="Cargo Content History"
          historyData={cargoContentHistoryData}
          onSelect={item => handleHistorySelect(item, 'cargoContent')}
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
