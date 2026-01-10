import tw from '@utils/tw';
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SelectItem = {
  [key: string]: any;
  disabled?: boolean;
};

interface SelectListProps {
  setSelected: (selected: any) => void;
  value?: any;
  placeholder?: string;
  label?: string;
  iconLeft?: React.ReactNode;
  iconLeftStyle?: any;
  boxStyles?: any;
  inputStyles?: any;
  dropdownStyles?: any;
  dropdownItemStyles?: any;
  dropdownTextStyles?: any;
  maxHeight?: number;
  data: SelectItem[];
  displayKey?: string;
  matchKey?: string;
  defaultOption?: SelectItem;
  defaultValue?: any;
  defaultKey?: any;
  searchicon?: React.ReactNode;
  arrowicon?: React.ReactNode;
  closeicon?: React.ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  notFoundText?: string;
  disabledItemStyles?: any;
  disabledTextStyles?: any;
  onSelect?: (selectedItem: any) => void;
  save?: 'key' | 'value' | 'object' | string;
  dropdownShown?: boolean;
  fontFamily?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  isLoading?: boolean;
  onClear?: () => void;
  disabled?: boolean;
}

const SelectList: React.FC<SelectListProps> = ({
  setSelected,
  value,
  placeholder = 'Select an option',
  label,
  iconLeft,
  iconLeftStyle,
  boxStyles,
  inputStyles,
  dropdownStyles,
  dropdownItemStyles,
  dropdownTextStyles,
  maxHeight = 200,
  data,
  displayKey = 'value',
  matchKey,
  defaultOption,
  defaultValue,
  defaultKey,
  searchicon = false,
  arrowicon = false,
  closeicon = false,
  search = true,
  searchPlaceholder = 'Search',
  notFoundText = 'No data found',
  disabledItemStyles,
  disabledTextStyles,
  onSelect = () => {},
  onClear = () => {},
  save = 'key',
  dropdownShown = false,
  fontFamily,
  onSearchChange,
  searchValue,
  isLoading = false,
  disabled = false,
}) => {
  const [_firstRender, _setFirstRender] = React.useState<boolean>(true);
  const [dropdown, setDropdown] = React.useState<boolean>(dropdownShown);
  const [selectedItem, setSelectedItem] = React.useState<SelectItem | null>(
    null,
  );
  const [height, setHeight] = React.useState<number>(maxHeight);
  const [internalSearchValue, setInternalSearchValue] =
    React.useState<string>('');
  const animatedvalue = React.useRef(new Animated.Value(0)).current;
  const [filtereddata, setFilteredData] = React.useState<SelectItem[]>(data);
  const [isFocused, setIsFocused] = React.useState(false);

  const actualSearchValue =
    searchValue !== undefined ? searchValue : internalSearchValue;
  const setSearchValue =
    searchValue !== undefined
      ? onSearchChange || (() => {})
      : setInternalSearchValue;

  const actualMatchKey =
    matchKey ||
    (save === 'key'
      ? 'key'
      : save === 'value'
      ? 'value'
      : typeof save === 'string'
      ? save
      : 'key');

  const normalizeString = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase();
  };

  const findItem = React.useCallback(
    (val: any) => {
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
    [data, save, actualMatchKey],
  );

  React.useEffect(() => {
    if (value === undefined) return;
    const matchedItem = findItem(value);
    if (matchedItem) {
      setSelectedItem(matchedItem);
    } else {
      setSelectedItem(
        value && typeof value === 'object' ? value : { [displayKey]: value },
      );
    }
  }, [value, findItem, displayKey]);

  React.useEffect(() => {
    setHeight(maxHeight);
  }, [maxHeight]);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  React.useEffect(() => {
    if (_firstRender && data.length > 0) {
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

      _setFirstRender(false);
    }
  }, [
    _firstRender,
    data,
    defaultOption,
    defaultKey,
    defaultValue,
    save,
    findItem,
    actualMatchKey,
    value,
  ]);

  const slidedown = () => {
    if (disabled) return;
    setDropdown(true);
    setIsFocused(true);
    Animated.timing(animatedvalue, {
      toValue: height,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const slideup = () => {
    setIsFocused(false);
    Animated.timing(animatedvalue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start(() => setDropdown(false));
  };

  const getDisplayValue = (item: SelectItem | null): string => {
    if (!item) return placeholder || 'Select an option';
    if (typeof item !== 'object') return String(item);

    const displayValue = displayKey
      .split('.')
      .reduce((obj, key) => obj?.[key], item);
    return displayValue
      ? String(displayValue)
      : placeholder || 'Select an option';
  };

  const handleItemPress = (item: SelectItem) => {
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
    slideup();
    setTimeout(() => setFilteredData(data), 800);
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    const result = data.filter(item => {
      const searchStr = normalizeString(val);
      const displayValue = normalizeString(getDisplayValue(item));
      return displayValue.includes(searchStr);
    });
    setFilteredData(result);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredData(data);
    slideup();
  };

  const hasValue = selectedItem !== null && selectedItem !== undefined;

  return (
    <View>
      {dropdown && search ? (
        <View style={[styles.wrapper, boxStyles, { backgroundColor: '#fff' }]}>
          <View style={styles.searchContainer}>
            {!searchicon ? (
              <Icon
                name="search"
                size={20}
                style={styles.searchIcon}
                color="#666"
              />
            ) : (
              searchicon
            )}

            <TextInput
              placeholder={searchPlaceholder}
              placeholderTextColor="#999"
              onChangeText={handleSearchChange}
              value={actualSearchValue}
              style={[
                styles.searchInput,
                { fontFamily, color: '#000' },
                inputStyles,
              ]}
              selectionColor="#1976D2"
            />

            {isLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <TouchableOpacity onPress={handleClearSearch}>
                {!closeicon ? (
                  <Icon
                    name="close"
                    size={17}
                    style={styles.closeIcon}
                    color="#666"
                  />
                ) : (
                  closeicon
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={tw`relative`}>
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
              { backgroundColor: disabled ? '#f5f5f5' : '#fff' }, // Add background color
              label && { paddingTop: 18, paddingBottom: 8 },
              disabled && {
                backgroundColor: '#f5f5f5',
                borderColor: '#e0e0e0',
              },
            ]}
            onPress={() => {
              if (disabled) return;
              if (!dropdown) {
                Keyboard.dismiss();
                slidedown();
              } else {
                slideup();
              }
            }}
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
                { fontFamily, color: disabled ? '#c4c5c6' : '#000' }, // Set text color
                inputStyles,
                iconLeft && { marginLeft: 10, flex: 1 },
                disabled && { color: '#c4c5c6' },
              ]}
            >
              {getDisplayValue(selectedItem)}
            </Text>

            {!arrowicon && !onClear ? (
              <Icon
                name={dropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                style={[styles.arrowIcon, disabled && { color: '#c4c5c6' }]}
                color={disabled ? '#c4c5c6' : '#666'}
              />
            ) : (
              arrowicon
            )}
          </TouchableOpacity>
          {value !== '' && !disabled && (
            <IconButton
              icon="close"
              style={tw`absolute right-0 top-0`}
              onPress={onClear}
            />
          )}
        </View>
      )}

      {dropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              maxHeight: animatedvalue,
              position: 'absolute',
              bottom: '100%',
              marginBottom: 8,
              zIndex: 9999,
              backgroundColor: '#fff', // White background for dropdown
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            },
            dropdownStyles,
          ]}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { backgroundColor: '#fff' },
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            indicatorStyle="black"
          >
            {filtereddata.length >= 1 ? (
              filtereddata.map((item, index) => {
                const disabled = item.disabled ?? false;
                const displayValue = getDisplayValue(item);
                const isSelected =
                  selectedItem &&
                  findItem(
                    save === 'object'
                      ? selectedItem
                      : typeof save === 'string'
                      ? selectedItem[save]
                      : selectedItem[actualMatchKey],
                  ) === item;

                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      dropdownItemStyles,
                      { backgroundColor: '#fff' }, // White background for each option
                      isSelected && { backgroundColor: '#f0f7ff' }, // Light blue for selected
                      disabled && [
                        styles.disabledoption,
                        disabledItemStyles,
                        { backgroundColor: '#f9f9f9' },
                      ],
                    ]}
                    key={index}
                    onPress={() => !disabled && handleItemPress(item)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        { fontFamily, color: '#000' }, // Black text
                        dropdownTextStyles,
                        disabled && [
                          styles.disabledText,
                          disabledTextStyles,
                          { color: '#999' },
                        ],
                      ]}
                      numberOfLines={2}
                    >
                      {displayValue}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View>
                <TouchableOpacity
                  style={[
                    styles.option,
                    dropdownItemStyles,
                    { backgroundColor: '#fff' },
                  ]}
                  onPress={() => {
                    const newItem = { [displayKey]: actualSearchValue };
                    setSelectedItem(newItem);
                    setSelected(actualSearchValue);
                    slideup();
                  }}
                >
                  <Text
                    style={[{ fontFamily, color: '#000' }, dropdownTextStyles]}
                  >
                    {notFoundText} min 3 word - Use "{actualSearchValue}"
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd', // Lighter border color
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff', // White background
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: '#fff', // White background for dropdown
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    overflow: 'hidden',
    backgroundColor: '#fff', // White background for options
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Separator between options
  },
  disabledoption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9', // Light gray for disabled
    opacity: 0.9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff', // White background for search container
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    color: '#666',
  },
  searchInput: {
    padding: 0,
    height: 20,
    flex: 1,
    color: '#000', // Black text for search input
    fontSize: 16,
  },
  closeIcon: {
    width: 17,
    height: 17,
    color: '#666',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    color: '#666',
  },
  scrollContent: {
    paddingVertical: 0, // No vertical padding
    overflow: 'hidden',
    backgroundColor: '#fff', // White background for scroll content
  },
  disabledText: {
    color: '#999', // Gray for disabled text
  },
  label: {
    position: 'absolute',
    backgroundColor: '#fff', // White background for label
    paddingHorizontal: 4,
    zIndex: 1,
  },
  iconLeftContainer: {
    marginRight: 10,
  },
});

export default SelectList;
