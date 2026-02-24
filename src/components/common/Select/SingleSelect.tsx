import tw from '@utils/tw';
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type SelectItem = {
  [key: string]: any;
  disabled?: boolean;
  type?: 'location' | 'default'; // Add type for location items
  isCurrentLocation?: boolean;
};

type DropdownType = 'modal' | 'bottom-sheet' | 'dropdown';

interface SelectListProps {
  setSelected: (selected: any) => void;
  value?: any;
  placeholder?: string;
  label?: string;
  iconLeft?: React.ReactNode;
  iconLeftStyle?: any;
  boxStyles?: any;
  inputStyles?: any;
  dropdownItemStyles?: any;
  dropdownTextStyles?: any;
  maxHeight?: number;
  data: SelectItem[];
  displayKey?: string;
  matchKey?: string;
  defaultOption?: SelectItem;
  defaultValue?: any;
  defaultKey?: any;
  searchPlaceholder?: string;
  notFoundText?: string;
  disabledItemStyles?: any;
  disabledTextStyles?: any;
  onSelect?: (selectedItem: any) => void;
  save?: 'key' | 'value' | 'object' | string;
  fontFamily?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  isLoading?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  showSearchInModal?: boolean;
  dropdownType?: DropdownType;
  onCurrentLocationPress?: () => void;
  showCurrentLocationOption?: boolean;
  currentLocationText?: string;
  currentLocationIcon?: React.ReactNode;
  registeredLocationText?: string;
  registeredLocationIcon?: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.6;

const SelectList: React.FC<SelectListProps> = ({
  setSelected,
  value,
  placeholder = 'Select an option',
  label,
  iconLeft,
  iconLeftStyle,
  boxStyles,
  inputStyles,
  dropdownItemStyles,
  dropdownTextStyles,
  data,
  displayKey = 'value',
  matchKey,
  defaultOption,
  defaultValue,
  defaultKey,
  searchPlaceholder = 'Search',
  notFoundText = 'No data found',
  disabledItemStyles,
  disabledTextStyles,
  onSelect = () => {},
  onClear = () => {},
  save = 'key',
  fontFamily,
  onSearchChange,
  searchValue,
  isLoading = false,
  disabled = false,
  showSearchInModal = true,
  dropdownType = 'modal',
  onCurrentLocationPress,
  showCurrentLocationOption = false,
  currentLocationText = 'Use Current Location',
  currentLocationIcon = (
    <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#1976D2" />
  ),
  registeredLocationText = 'Registered Location',
  registeredLocationIcon = (
    <Icon name="location-on" size={20} color="#4CAF50" />
  ),
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectItem | null>(null);
  const [internalSearchValue, setInternalSearchValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const actualSearchValue = useMemo(
    () => (searchValue !== undefined ? searchValue : internalSearchValue),
    [searchValue, internalSearchValue],
  );

  const setSearchValue = useMemo(
    () =>
      searchValue !== undefined
        ? onSearchChange || (() => {})
        : setInternalSearchValue,
    [searchValue, onSearchChange],
  );

  const actualMatchKey = useMemo(() => {
    if (matchKey) return matchKey;
    if (save === 'key') return 'key';
    if (save === 'value') return 'value';
    return typeof save === 'string' ? save : 'key';
  }, [matchKey, save]);

  const normalizeString = useCallback((str: any): string => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  }, []);

  const findItem = useCallback(
    (val: any): SelectItem | undefined => {
      if (val === undefined || val === null) return undefined;

      if (save === 'object' && typeof val === 'object') {
        return data.find(item => JSON.stringify(item) === JSON.stringify(val));
      }

      return data.find(item => {
        const itemValue = actualMatchKey
          .split('.')
          .reduce((obj, key) => obj?.[key], item);
        return normalizeString(itemValue) === normalizeString(val);
      });
    },
    [data, save, actualMatchKey, normalizeString],
  );

  useEffect(() => {
    if (value === undefined) return;
    const matchedItem = findItem(value);
    if (matchedItem) {
      setSelectedItem(matchedItem);
    } else if (value && typeof value === 'object') {
      setSelectedItem(value);
    }
  }, [value, findItem]);

  useEffect(() => {
    if (!data.length) return;

    let defaultItem: SelectItem | undefined;

    if (defaultOption) {
      defaultItem = defaultOption;
    } else if (defaultKey !== undefined) {
      defaultItem = findItem(defaultKey);
    } else if (defaultValue !== undefined) {
      defaultItem = findItem(defaultValue);
    }

    if (defaultItem && value === undefined) {
      setSelectedItem(defaultItem);
      if (save === 'object') {
        setSelected(defaultItem);
      } else {
        const selectedValue =
          typeof save === 'string'
            ? defaultItem[save]
            : defaultItem[actualMatchKey];
        setSelected(selectedValue);
      }
    }
  }, [
    data,
    defaultOption,
    defaultKey,
    defaultValue,
    save,
    actualMatchKey,
    value,
    findItem,
  ]);

  const getDisplayValue = useCallback(
    (item: SelectItem | null): string => {
      if (!item) return placeholder;
      if (typeof item !== 'object') return String(item);

      const displayValue = displayKey
        .split('.')
        .reduce((obj, key) => obj?.[key], item);
      return displayValue ? String(displayValue) : placeholder;
    },
    [displayKey, placeholder],
  );

  const handleItemPress = useCallback(
    (item: SelectItem) => {
      if (item.disabled) return;

      setSelectedItem(item);

      if (save === 'object') {
        setSelected(item);
      } else {
        const selectedValue =
          typeof save === 'string' ? item[save] : item[actualMatchKey];
        setSelected(selectedValue);
      }

      onSelect(item);

      if (dropdownType === 'modal') {
        setModalVisible(false);
      } else {
        setDropdownVisible(false);
      }
      setSearchValue('');
    },
    [save, actualMatchKey, onSelect, setSelected, setSearchValue, dropdownType],
  );

  const handleCurrentLocationPress = useCallback(() => {
    if (onCurrentLocationPress) {
      onCurrentLocationPress();
      if (dropdownType === 'modal') {
        setModalVisible(false);
      } else {
        setDropdownVisible(false);
      }
    }
  }, [onCurrentLocationPress, dropdownType]);

  const filteredData = useMemo(() => {
    if (!actualSearchValue.trim()) return data;

    return data.filter(item => {
      const searchStr = normalizeString(actualSearchValue);
      const displayValue = normalizeString(getDisplayValue(item));
      return displayValue.includes(searchStr);
    });
  }, [data, actualSearchValue, normalizeString, getDisplayValue]);

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearchValue(val);
    },
    [setSearchValue],
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
  }, [setSearchValue]);

  const handleOpenDropdown = useCallback(() => {
    if (disabled) return;
    setIsFocused(true);

    if (dropdownType === 'modal') {
      setModalVisible(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Measure position for dropdown
      dropdownRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height,
          left: x,
          width,
        });
        setDropdownVisible(true);
      });
    }
  }, [disabled, dropdownType]);

  const handleCloseDropdown = useCallback(() => {
    if (dropdownType === 'modal') {
      setModalVisible(false);
    } else {
      setDropdownVisible(false);
    }
    setIsFocused(false);
    setSearchValue('');
  }, [dropdownType, setSearchValue]);

  const handleContainerPress = useCallback(() => {
    setDropdownVisible(false);
  }, []);

  const hasValue = selectedItem !== null && selectedItem !== undefined;

  const renderDropdownContent = () => (
    <>
      {/* Search Input */}
      {showSearchInModal && dropdownType !== 'dropdown' && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={actualSearchValue}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />
          {actualSearchValue.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Current Location Option */}
      {showCurrentLocationOption && onCurrentLocationPress && (
        <TouchableOpacity
          style={[styles.currentLocationOption, dropdownItemStyles]}
          onPress={handleCurrentLocationPress}
        >
          {currentLocationIcon}
          <Text style={[styles.currentLocationText, dropdownTextStyles]}>
            {currentLocationText}
          </Text>
        </TouchableOpacity>
      )}

      {/* Options List */}
      <ScrollView
        style={[
          styles.optionsContainer,
          dropdownType === 'dropdown' && styles.dropdownOptionsContainer,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => {
            const isDisabled = item.disabled ?? false;
            const isSelected = selectedItem === item;
            const isLocationItem = item.type === 'location';

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  dropdownItemStyles,
                  isSelected && styles.selectedOption,
                  isDisabled && [styles.disabledOption, disabledItemStyles],
                  isLocationItem && styles.locationOption,
                ]}
                onPress={() => !isDisabled && handleItemPress(item)}
                disabled={isDisabled}
              >
                {isLocationItem && item.isCurrentLocation && (
                  <View style={styles.locationIconContainer}>
                    {currentLocationIcon}
                  </View>
                )}
                {isLocationItem && !item.isCurrentLocation && (
                  <View style={styles.locationIconContainer}>
                    {registeredLocationIcon}
                  </View>
                )}
                <Text
                  style={[
                    styles.optionText,
                    dropdownTextStyles,
                    isDisabled && [styles.disabledText, disabledTextStyles],
                    isLocationItem && styles.locationText,
                  ]}
                  numberOfLines={2}
                >
                  {getDisplayValue(item)}
                  {isLocationItem && item.isCurrentLocation && ' (Current)'}
                  {isLocationItem && !item.isCurrentLocation && ' (Registered)'}
                </Text>
                {isSelected && <Icon name="check" size={20} color="#1976D2" />}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>{notFoundText}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={handleCloseDropdown}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleCloseDropdown}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Option</Text>
            <IconButton icon="close" size={24} onPress={handleCloseDropdown} />
          </View>
          {renderDropdownContent()}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDropdown = () => (
    <>
      {dropdownVisible && (
        <>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={handleCloseDropdown}
          />
          <View
            style={[
              styles.dropdownContainer,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: MODAL_HEIGHT * 0.8,
              },
            ]}
          >
            {renderDropdownContent()}
          </View>
        </>
      )}
    </>
  );

  return (
    <>
      <View style={tw`relative`} ref={dropdownRef}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                top: isFocused || hasValue ? -8 : 18,
                fontSize: isFocused || hasValue ? 12 : 16,
                color: isFocused ? '#1976D2' : '#666',
                left: iconLeft ? 10 : 20,
              },
              inputStyles,
              tw`text-primary font-semibold`,
              disabled && { color: '#c4c5c6' },
            ]}
          >
            {label}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.wrapper,
            boxStyles,
            { backgroundColor: disabled ? '#f5f5f5' : '#fff' },
            label && { paddingTop: 18, paddingBottom: 8 },
            disabled && {
              backgroundColor: '#f5f5f5',
              borderColor: '#e0e0e0',
            },
          ]}
          onPress={handleOpenDropdown}
          activeOpacity={disabled ? 1 : 0.7}
          disabled={disabled}
        >
          {iconLeft && (
            <View style={[styles.iconLeftContainer, iconLeftStyle]}>
              {iconLeft}
            </View>
          )}
          <Text
            numberOfLines={2}
            style={[
              styles.inputText,
              { fontFamily, color: disabled ? '#c4c5c6' : '#000' },
              inputStyles,
              iconLeft && { marginLeft: 10, flex: 1 },
            ]}
          >
            {getDisplayValue(selectedItem)}
          </Text>
          <Icon
            name={dropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            style={[styles.arrowIcon, disabled && { color: '#c4c5c6' }]}
            color={disabled ? '#c4c5c6' : '#666'}
          />
        </TouchableOpacity>
        {hasValue && !disabled && (
          <IconButton
            icon="close"
            style={tw`absolute right-0 top-0`}
            onPress={onClear}
          />
        )}
      </View>

      {dropdownType === 'modal' ? renderModal() : renderDropdown()}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  label: {
    position: 'absolute',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  iconLeftContainer: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },
  optionsContainer: {
    flex: 1,
  },
  dropdownOptionsContainer: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
  },
  disabledOption: {
    backgroundColor: '#f9f9f9',
    opacity: 0.6,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  disabledText: {
    color: '#999',
  },
  notFoundContainer: {
    padding: 40,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  currentLocationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#f8f9fa',
  },
  currentLocationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    marginRight: 12,
  },
  locationText: {
    color: '#333',
    fontWeight: '500',
  },
});

export default SelectList;
