import Icon from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type SelectItem = {
  [key: string]: any;
  disabled?: boolean;
};

interface MultipleSelectListProps {
  setSelected: (selected: any[]) => void;
  value?: any[];
  placeholder?: string;
  boxStyles?: any;
  inputStyles?: any;
  dropdownStyles?: any;
  dropdownItemStyles?: any;
  dropdownTextStyles?: any;
  maxHeight?: number;
  data: SelectItem[];
  displayKey?: string;
  matchKey?: string;
  defaultOptions?: SelectItem[];
  defaultValues?: any[];
  defaultKeys?: any[];
  searchicon?: React.ReactNode;
  arrowicon?: React.ReactNode;
  closeicon?: React.ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  onSelect?: (selectedItems: any[]) => void;
  label?: string;
  notFoundText?: string;
  disabledItemStyles?: any;
  disabledTextStyles?: any;
  disabledCheckBoxStyles?: any;
  labelStyles?: any;
  badgeStyles?: any;
  badgeTextStyles?: any;
  checkBoxStyles?: any;
  save?: 'key' | 'value' | 'object' | string;
  dropdownShown?: boolean;
  fontFamily?: string;
  caseInsensitiveSearch?: boolean;
  defaultValue?: any;
  defaultKey?: any;
}

const MultipleSelectList: React.FC<MultipleSelectListProps> = ({
  fontFamily,
  setSelected,
  value,
  placeholder = 'Select options',
  boxStyles,
  inputStyles,
  dropdownStyles,
  dropdownItemStyles,
  dropdownTextStyles,
  maxHeight = 350,
  data,
  displayKey = 'value',
  matchKey,
  defaultOptions,
  defaultValue,
  defaultKey,
  searchicon = false,
  arrowicon = false,
  closeicon = false,
  search = true,
  searchPlaceholder = 'Search',
  onSelect = () => {},
  label,
  notFoundText = 'No data found',
  disabledItemStyles,
  disabledTextStyles,
  disabledCheckBoxStyles,
  labelStyles,
  badgeStyles,
  badgeTextStyles,
  checkBoxStyles,
  save = 'key',
  dropdownShown = false,
  caseInsensitiveSearch = true,
}) => {
  const [_firstRender, _setFirstRender] = React.useState<boolean>(true);
  const [dropdown, setDropdown] = React.useState<boolean>(dropdownShown);
  const [selectedItems, setSelectedItems] = React.useState<SelectItem[]>([]);
  const [height, setHeight] = React.useState<number>(maxHeight);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const animatedvalue = React.useRef(new Animated.Value(0)).current;
  const [filtereddata, setFilteredData] = React.useState(data);

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
    return String(str).trim()?.toLowerCase();
  };

  const findItems = React.useCallback(
    (values: any[]) => {
      if (!values || values.length === 0) return [];

      const matchedItems = data.filter(item => {
        if (save === 'object') {
          return values.some(val => {
            if (typeof val !== 'object') return false;
            if (caseInsensitiveSearch) {
              return Object.keys(val).every(key => {
                const itemVal = item[key];
                const valVal = val[key];
                if (typeof itemVal === 'string' && typeof valVal === 'string') {
                  return itemVal.toLowerCase() === valVal.toLowerCase();
                }
                return itemVal === valVal;
              });
            }
            return JSON.stringify(val) === JSON.stringify(item);
          });
        }

        const itemValue = actualMatchKey
          .split('.')
          .reduce((obj, key) => obj?.[key], item);
        return values.some(val => {
          if (
            caseInsensitiveSearch &&
            typeof itemValue === 'string' &&
            typeof val === 'string'
          ) {
            return (
              itemValue?.toLowerCase()?.trim() === val?.toLowerCase()?.trim()
            );
          }
          return itemValue === val;
        });
      });

      // For any values that didn't match, create temporary items
      const unmatchedValues = values.filter(val => {
        if (save === 'object') {
          if (typeof val !== 'object') return true;
          return !matchedItems.some(item => {
            if (caseInsensitiveSearch) {
              return Object.keys(val).every(key => {
                const itemVal = item[key];
                const valVal = val[key];
                if (typeof itemVal === 'string' && typeof valVal === 'string') {
                  return itemVal.toLowerCase() === valVal.toLowerCase();
                }
                return itemVal === valVal;
              });
            }
            return JSON.stringify(val) === JSON.stringify(item);
          });
        }

        return !matchedItems.some(item => {
          const itemValue = actualMatchKey
            .split('.')
            .reduce((obj, key) => obj?.[key], item);
          if (
            caseInsensitiveSearch &&
            typeof itemValue === 'string' &&
            typeof val === 'string'
          ) {
            return (
              itemValue?.toLowerCase()?.trim() === val?.toLowerCase()?.trim()
            );
          }
          return itemValue === val;
        });
      });

      const unmatchedItems = unmatchedValues.map(val => {
        if (save === 'object' && typeof val === 'object') {
          return val;
        }
        return { [displayKey]: val };
      });

      return [...matchedItems, ...unmatchedItems];
    },
    [data, save, actualMatchKey, caseInsensitiveSearch, displayKey],
  );

  React.useEffect(() => {
    if (value === undefined) return;

    const matchedItems = findItems(value);
    setSelectedItems(matchedItems);
  }, [value, findItems]);

  React.useEffect(() => {
    setHeight(maxHeight);
  }, [maxHeight]);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  React.useEffect(() => {
    if (_firstRender && data.length > 0) {
      let defaultItems: SelectItem[] = [];

      if (defaultOptions) {
        defaultItems = defaultOptions;
      } else if (defaultKey) {
        defaultItems = findItems(defaultKey);
      } else if (defaultValue) {
        defaultItems = findItems(defaultValue);
      }

      if (defaultItems.length > 0 && value === undefined) {
        setSelectedItems(defaultItems);
        if (save === 'object') {
          setSelected(defaultItems);
        } else {
          const selectedValues = defaultItems.map(item =>
            typeof save === 'string' ? item[save] : item[actualMatchKey],
          );
          setSelected(selectedValues);
        }
      }

      _setFirstRender(false);
    }
  }, [
    _firstRender,
    data,
    defaultOptions,
    defaultKey,
    defaultValue,
    save,
    findItems,
    actualMatchKey,
    value,
  ]);

  const slidedown = () => {
    setDropdown(true);
    Animated.timing(animatedvalue, {
      toValue: height,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const slideup = () => {
    Animated.timing(animatedvalue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start(() => setDropdown(false));
  };

  const isItemSelected = (item: SelectItem) => {
    return selectedItems.some(selected => {
      if (save === 'object') {
        if (caseInsensitiveSearch) {
          return Object.keys(selected).every(key => {
            const selectedVal = selected[key];
            const itemVal = item[key];
            if (
              typeof selectedVal === 'string' &&
              typeof itemVal === 'string'
            ) {
              return selectedVal.toLowerCase() === itemVal.toLowerCase();
            }
            return selectedVal === itemVal;
          });
        }
        return JSON.stringify(selected) === JSON.stringify(item);
      }

      const selectedValue =
        typeof save === 'string' ? selected[save] : selected[actualMatchKey];
      const itemValue =
        typeof save === 'string' ? item[save] : item[actualMatchKey];

      if (
        caseInsensitiveSearch &&
        typeof selectedValue === 'string' &&
        typeof itemValue === 'string'
      ) {
        return selectedValue.toLowerCase() === itemValue.toLowerCase();
      }
      return selectedValue === itemValue;
    });
  };

  const getDisplayValue = (item: SelectItem): string => {
    if (typeof item !== 'object') return String(item);
    const displayValue = displayKey
      .split('.')
      .reduce((obj, key) => obj?.[key], item);
    return displayValue ? String(displayValue) : '';
  };

  const handleItemPress = (item: SelectItem) => {
    if (item.disabled) return;

    let newSelectedItems: SelectItem[];
    const isSelected = isItemSelected(item);

    if (isSelected) {
      newSelectedItems = selectedItems.filter(selected => {
        if (save === 'object') {
          if (caseInsensitiveSearch) {
            return !Object.keys(selected).every(key => {
              const selectedVal = selected[key];
              const itemVal = item[key];
              if (
                typeof selectedVal === 'string' &&
                typeof itemVal === 'string'
              ) {
                return selectedVal.toLowerCase() === itemVal.toLowerCase();
              }
              return selectedVal === itemVal;
            });
          }
          return JSON.stringify(selected) !== JSON.stringify(item);
        }

        const selectedValue =
          typeof save === 'string' ? selected[save] : selected[actualMatchKey];
        const itemValue =
          typeof save === 'string' ? item[save] : item[actualMatchKey];

        if (
          caseInsensitiveSearch &&
          typeof selectedValue === 'string' &&
          typeof itemValue === 'string'
        ) {
          return selectedValue.toLowerCase() !== itemValue.toLowerCase();
        }
        return selectedValue !== itemValue;
      });
    } else {
      newSelectedItems = [...selectedItems, item];
    }

    setSelectedItems(newSelectedItems);

    if (save === 'object') {
      setSelected(newSelectedItems);
    } else {
      const selectedValues = newSelectedItems.map(item =>
        typeof save === 'string' ? item[save] : item[actualMatchKey],
      );
      setSelected(selectedValues);
    }

    if (onSelect) {
      onSelect(newSelectedItems);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    const result = data.filter(item => {
      const searchStr = caseInsensitiveSearch ? val.toLowerCase() : val;
      const displayValue = caseInsensitiveSearch
        ? getDisplayValue(item).toLowerCase()
        : getDisplayValue(item);
      return displayValue.includes(searchStr);
    });
    setFilteredData(result);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredData(data);
    slideup();
  };

  const renderBadges = () => {
    return selectedItems.map((item, index) => {
      const displayValue = getDisplayValue(item);
      return (
        <View key={index} style={[styles.badge, badgeStyles]}>
          <Text style={[styles.badgeText, { fontFamily }, badgeTextStyles]}>
            {displayValue}
          </Text>
          <TouchableOpacity
            onPress={() => handleItemPress(item)}
            style={styles.badgeClose}
          >
            <Icon name="close" size={12} color="white" />
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <View>
      {dropdown && search ? (
        <View style={[styles.wrapper, boxStyles]}>
          <View style={styles.searchContainer}>
            {!searchicon ? (
              <Icon name="search-web" size={24} style={styles.searchIcon} />
            ) : (
              searchicon
            )}
            <TextInput
              placeholder={searchPlaceholder}
              onChangeText={handleSearchChange}
              value={searchValue}
              style={[styles.searchInput, { fontFamily }, inputStyles]}
            />
            <TouchableOpacity onPress={handleClearSearch}>
              {!closeicon ? (
                <Icon name="close" size={17} style={styles.closeIcon} />
              ) : (
                closeicon
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : selectedItems.length > 0 ? (
        <TouchableOpacity
          style={[styles.wrapper, boxStyles]}
          onPress={() => {
            if (!dropdown) {
              Keyboard.dismiss();
              slidedown();
            } else {
              slideup();
            }
          }}
        >
          <View>
            {label && (
              <Text style={[styles.label, { fontFamily }, labelStyles]}>
                {label}
              </Text>
            )}
            <View style={styles.badgeContainer}>{renderBadges()}</View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.wrapper, boxStyles]}
          onPress={() => {
            if (!dropdown) {
              Keyboard.dismiss();
              slidedown();
            } else {
              slideup();
            }
          }}
        >
          <Text style={[styles.placeholder, { fontFamily }, inputStyles]}>
            {placeholder}
          </Text>
          {!arrowicon ? (
            <Icon name="chevron-down" size={20} style={styles.arrowIcon} />
          ) : (
            arrowicon
          )}
        </TouchableOpacity>
      )}

      {dropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            { maxHeight: animatedvalue },
            dropdownStyles,
          ]}
        >
          <View style={{ maxHeight: height }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled={true}
            >
              {filtereddata.length >= 1 ? (
                filtereddata.map((item, index) => {
                  const disabled = item.disabled ?? false;
                  const isSelected = isItemSelected(item);
                  const displayValue = getDisplayValue(item);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        dropdownItemStyles,
                        isSelected && { backgroundColor: '#f0f0f0' },
                        disabled && [styles.disabledoption, disabledItemStyles],
                      ]}
                      key={index}
                      onPress={() => !disabled && handleItemPress(item)}
                      disabled={disabled}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          checkBoxStyles,
                          isSelected && {
                            borderColor: '#007AFF',
                            backgroundColor: '#E3F2FD',
                          },
                          disabled && [
                            styles.disabledCheckBox,
                            disabledCheckBoxStyles,
                          ],
                        ]}
                      >
                        {isSelected && (
                          <Icon
                            name="check-circle"
                            size={16}
                            color={disabled ? '#c4c5c6' : '#007AFF'}
                            style={styles.checkIcon}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.text,
                          { fontFamily },
                          dropdownTextStyles,
                          disabled && [styles.disabledText, disabledTextStyles],
                        ]}
                      >
                        {displayValue}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View>
                  <TouchableOpacity
                    style={[styles.option, dropdownItemStyles]}
                    onPress={() => {
                      // When no match found, create a temporary item with the search value
                      const newItem = { [displayKey]: searchValue };
                      const newSelectedItems = [...selectedItems, newItem];
                      setSelectedItems(newSelectedItems);

                      if (save === 'object') {
                        setSelected(newSelectedItems);
                      } else {
                        const selectedValues = newSelectedItems.map(item =>
                          typeof save === 'string'
                            ? item[save]
                            : item[actualMatchKey],
                        );
                        setSelected(selectedValues);
                      }

                      if (onSelect) {
                        onSelect(newSelectedItems);
                      }

                      slideup();
                    }}
                  >
                    <Text style={[{ fontFamily }, dropdownTextStyles]}>
                      {notFoundText} - Use "{searchValue}"
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {selectedItems.length > 0 && (
              <Pressable>
                <View style={styles.selectedHeader}>
                  <Text style={[styles.selectedLabel, { fontFamily }]}>
                    Selected
                  </Text>
                  <View style={styles.separator} />
                </View>
                <View style={styles.selectedBadgesContainer}>
                  {renderBadges()}
                </View>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'gray',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'gray',
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledoption: {
    backgroundColor: 'whitesmoke',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 7,
  },
  searchInput: {
    padding: 0,
    height: 20,
    flex: 1,
  },
  closeIcon: {
    width: 17,
    height: 17,
  },
  label: {
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'gray',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 50,
    marginRight: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    marginRight: 5,
  },
  badgeClose: {
    marginLeft: 5,
  },
  placeholder: {},
  arrowIcon: {
    width: 20,
    height: 20,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  checkbox: {
    width: 20, // Increased size
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledCheckBox: {
    backgroundColor: '#c4c5c6',
  },
  checkIcon: {
    // Removed paddingLeft to center icon
  },
  text: {
    fontSize: 16,
  },
  disabledText: {
    color: '#c4c5c6',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
  },
  selectedLabel: {
    marginRight: 20,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    flex: 1,
    backgroundColor: 'gray',
  },
  selectedBadgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
});

export default MultipleSelectList;
