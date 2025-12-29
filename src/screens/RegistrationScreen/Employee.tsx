import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import React, { useState, memo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  TextInput,
  Card,
  Button,
  Modal,
  Portal,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { routeName } from '@utils/navigationHelpers';
import { useInsertEmployeeMutation } from '@api/hooks_api';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { SelectList } from '@components/common/Select';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const designationList = [
  { key: 'owner', value: 'Owner' },
  { key: 'manager', value: 'Manager' },
  { key: 'supervisor', value: 'Supervisor' },
  { key: 'staff', value: 'Staff' },
];
const authorityList = [
  { key: 'full', value: 'Load Post And Operation' },
  { key: 'limited', value: 'Operation' },
  { key: 'read', value: 'Data Entry' },
];
const departmentList = [
  { key: 'accounts', value: 'Accounts' },
  { key: 'operations', value: 'Operations' },
  { key: 'sales', value: 'Sales' },
  { key: 'hr', value: 'HR' },
  { key: 'support', value: 'Support' },
];

/* ---------------- TYPES ---------------- */
interface EmployeeData {
  name: string;
  number: string;
  employeeId: string;
  designation: string;
  email: string;
  authority: string;
  department: string;
  id: string;
}

interface ValidationErrors {
  [key: string]: Partial<EmployeeData>;
}

/* ---------------- EMPLOYEE FORM MODAL ---------------- */
interface EmployeeFormModalProps {
  visible: boolean;
  onClose: () => void;
  employee?: EmployeeData | null;
  onSubmit: (employee: EmployeeData) => void;
  isEditing: boolean;
  employeeIndex?: number;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = memo(
  ({ visible, onClose, employee, onSubmit, isEditing, employeeIndex }) => {
    const [formData, setFormData] = useState<EmployeeData>(
      employee || {
        name: '',
        number: '',
        employeeId: '',
        designation: '',
        email: '',
        authority: '',
        department: '',
        id: Date.now().toString(),
      },
    );
    const [errors, setErrors] = useState<Partial<EmployeeData>>({});

    useEffect(() => {
      if (employee) {
        setFormData(employee);
      } else {
        setFormData({
          name: '',
          number: '',
          employeeId: '',
          designation: '',
          email: '',
          authority: '',
          department: '',
          id: Date.now().toString(),
        });
      }
      setErrors({});
    }, [employee, visible]);

    const validateForm = () => {
      const newErrors: Partial<EmployeeData> = {};

      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name too short';
      }

      if (!/^[0-9]{10}$/.test(formData.number)) {
        newErrors.number = 'Enter valid 10 digit number';
      }

      if (!formData.designation) {
        newErrors.designation = 'Designation required';
      }

      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter valid email';
      }

      if (!formData.authority) {
        newErrors.authority = 'Authority required';
      }

      if (!formData.department) {
        newErrors.department = 'Department required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        onSubmit({ ...formData, id: employee?.id || Date.now().toString() });
        onClose();
      }
    };

    const updateField = (field: keyof EmployeeData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    return (
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={modalStyles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={modalStyles.modalTitle}>
            {isEditing
              ? employeeIndex !== undefined
                ? `Authority #${employeeIndex + 1}`
                : 'Edit Authority'
              : employeeIndex !== undefined
              ? `Authority #${employeeIndex + 1}`
              : 'Add Authority'}
          </Text>

          {/* Designation */}
          <View style={modalStyles.fieldContainer}>
            <SelectList
              label="Designation *"
              data={designationList}
              setSelected={val => updateField('designation', val)}
              value={formData.designation}
              placeholder="Select Designation"
              save="key"
              search={false}
              boxStyles={modalStyles.selectBox}
              dropdownStyles={modalStyles.dropdown}
            />
            {errors.designation && (
              <HelperText type="error" visible={!!errors.designation}>
                {errors.designation}
              </HelperText>
            )}
          </View>

          {/* Department */}
          <View style={modalStyles.fieldContainer}>
            <SelectList
              label="Department *"
              data={departmentList}
              setSelected={val => updateField('department', val)}
              value={formData.department}
              placeholder="Select Department"
              save="key"
              search={false}
              boxStyles={modalStyles.selectBox}
              dropdownStyles={modalStyles.dropdown}
            />
            {errors.department && (
              <HelperText type="error" visible={!!errors.department}>
                {errors.department}
              </HelperText>
            )}
          </View>

          {/* Full Name */}
          <View style={modalStyles.fieldContainer}>
            <TextInput
              mode="outlined"
              label="Full Name *"
              value={formData.name}
              onChangeText={v => updateField('name', v)}
              error={!!errors.name}
              style={modalStyles.textInput}
              outlineColor="#e1e5e9"
              activeOutlineColor="#3b82f6"
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
            )}
          </View>

          {/* Mobile Number */}
          <View style={modalStyles.fieldContainer}>
            <TextInput
              mode="outlined"
              label="Mobile Number *"
              keyboardType="phone-pad"
              value={formData.number}
              onChangeText={v => updateField('number', v)}
              error={!!errors.number}
              style={modalStyles.textInput}
              outlineColor="#e1e5e9"
              activeOutlineColor="#3b82f6"
              left={<TextInput.Icon icon="phone" />}
              maxLength={10}
            />
            {errors.number && (
              <HelperText type="error" visible={!!errors.number}>
                {errors.number}
              </HelperText>
            )}
          </View>

          {/* Email Address */}
          <View style={modalStyles.fieldContainer}>
            <TextInput
              mode="outlined"
              label="Email Address *"
              value={formData.email}
              onChangeText={v => updateField('email', v)}
              error={!!errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={modalStyles.textInput}
              outlineColor="#e1e5e9"
              activeOutlineColor="#3b82f6"
              left={<TextInput.Icon icon="email" />}
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            )}
          </View>

          {/* Authority Level */}
          <View style={modalStyles.fieldContainer}>
            <SelectList
              label="Authority Level *"
              data={authorityList}
              setSelected={val => updateField('authority', val)}
              value={formData.authority}
              placeholder="Select Authority Level"
              save="key"
              search={false}
              boxStyles={modalStyles.selectBox}
              dropdownStyles={modalStyles.dropdown}
            />
            {errors.authority && (
              <HelperText type="error" visible={!!errors.authority}>
                {errors.authority}
              </HelperText>
            )}
          </View>

          {/* Modal Footer */}
          <View style={modalStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={modalStyles.cancelBtn}
              contentStyle={modalStyles.buttonContent}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={modalStyles.saveBtn}
              contentStyle={modalStyles.buttonContent}
            >
              {isEditing ? 'Update' : 'Save Authority'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    );
  },
);

/* ---------------- MAIN COMPONENT ---------------- */
const Employee = () => {
  const navigate = useNavigation();
  const CustomerDetail = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID,
  );
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [employeregistration, { isLoading: isSubmitting }] =
    useInsertEmployeeMutation();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeData | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [employeeIndex, setEmployeeIndex] = useState<number | undefined>(
    undefined,
  );
  const [authorityButtons, setAuthorityButtons] = useState<
    { id: string; index: number; name: string }[]
  >([]);
  const [maxAllowed, setMaxAllowed] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);

  /* ----------- HANDLE EMPLOYEE COUNT CHANGE ----------- */
  const handleEmployeeCountChange = (text: string) => {
    const num = text.replace(/[^0-9]/g, '');
    const n = parseInt(num) || 0;

    setMaxAllowed(num);

    if (n > 0 && n <= 10) {
      // Create buttons for each authority
      const buttons = Array.from({ length: n }, (_, index) => {
        const existingButton = authorityButtons.find(
          btn => btn.index === index,
        );
        return {
          id: existingButton?.id || `authority-${index + 1}-${Date.now()}`,
          index,
          name: existingButton?.name || `Add Authority ${index + 1}`,
        };
      });

      setAuthorityButtons(buttons);
      setEmployeeCount(n);

      // Remove employees that exceed the new limit
      if (employees.length > n) {
        const buttonIds = buttons.map(btn => btn.id);
        setEmployees(prev => prev.filter(emp => buttonIds.includes(emp.id)));
      }
    } else if (n === 0) {
      setAuthorityButtons([]);
      setEmployees([]);
      setEmployeeCount(0);
    }
  };

  /* ----------- HANDLE AUTHORITY BUTTON CLICK ----------- */
  const handleAuthorityButtonClick = (index: number, buttonId: string) => {
    // Check if this authority already has data
    const existingEmployee = employees.find(emp => emp.id === buttonId);

    if (existingEmployee) {
      // Edit existing employee
      setCurrentEmployee(existingEmployee);
      setIsEditing(true);
    } else {
      // Create new employee with the button ID
      setCurrentEmployee({
        name: '',
        number: '',
        employeeId: '',
        designation: '',
        email: '',
        authority: '',
        department: '',
        id: buttonId,
      });
      setIsEditing(false);
    }

    setEmployeeIndex(index);
    setModalVisible(true);
  };

  /* ----------- HANDLE MODAL SUBMIT ----------- */
  const handleModalSubmit = (employee: EmployeeData) => {
    if (isEditing) {
      // Update existing employee
      setEmployees(prev =>
        prev.map(emp => (emp.id === employee.id ? employee : emp)),
      );

      // Update button name
      setAuthorityButtons(prev =>
        prev.map(btn =>
          btn.id === employee.id
            ? {
                ...btn,
                name: employee.name || `Add Authority ${btn.index + 1}`,
              }
            : btn,
        ),
      );
    } else {
      // Add new employee
      setEmployees(prev => [...prev, employee]);

      // Update button name with employee name
      setAuthorityButtons(prev =>
        prev.map(btn =>
          btn.id === employee.id
            ? {
                ...btn,
                name: employee.name || `Add Authority ${btn.index + 1}`,
              }
            : btn,
        ),
      );
    }

    setModalVisible(false);
    setCurrentEmployee(null);
    setEmployeeIndex(undefined);
  };

  /* ----------- HANDLE EDIT EMPLOYEE ----------- */
  const handleEditEmployee = (employee: EmployeeData) => {
    setCurrentEmployee(employee);
    setIsEditing(true);
    setEmployeeIndex(undefined);
    setModalVisible(true);
  };

  /* ----------- VALIDATION ----------- */
  const validateAll = () => {
    const errors: ValidationErrors = {};
    let valid = true;
    let firstErrorMessage: string | null = null;

    employees.forEach(emp => {
      const empErrors: Partial<EmployeeData> = {};

      if (!emp.name.trim()) {
        empErrors.name = 'Name is required';
      } else if (emp.name.length < 2) {
        empErrors.name = 'Name too short';
      }

      if (!/^[0-9]{10}$/.test(emp.number)) {
        empErrors.number = 'Enter valid 10 digit number';
      }

      if (!emp.designation) {
        empErrors.designation = 'Designation required';
      }

      if (!emp.email) {
        empErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email)) {
        empErrors.email = 'Enter valid email';
      }

      if (!emp.authority) {
        empErrors.authority = 'Authority required';
      }

      if (!emp.department) {
        empErrors.department = 'Department required';
      }

      if (Object.keys(empErrors).length) {
        errors[emp.id] = empErrors;
        valid = false;

        if (!firstErrorMessage) {
          firstErrorMessage = Object.values(empErrors)[0] as string;
        }
      }
    });

    setValidationErrors(errors);

    if (firstErrorMessage) {
      Toast.show({
        type: 'error',
        text1: firstErrorMessage,
        position: 'top',
      });
    }

    return valid;
  };

  /* ----------- REMOVE EMPLOYEE ----------- */
  const removeEmployee = (id: string) => {
    Alert.alert(
      'Remove Authority',
      'Are you sure you want to remove this authority?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
            setValidationErrors(prev => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            });

            // Reset button name
            setAuthorityButtons(prev =>
              prev.map(btn =>
                btn.id === id
                  ? { ...btn, name: `Add Authority ${btn.index + 1}` }
                  : btn,
              ),
            );
          },
        },
      ],
    );
  };

  /* ----------- HANDLE SKIP ----------- */
  const handleSkip = () => {
    Alert.alert('Skip', 'Skip adding authorities?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Skip',
        onPress: () => navigate.replace(routeName.SET_MPIN),
      },
    ]);
  };

  /* ----------- HANDLE SUBMIT ----------- */
  const handleSubmit = async () => {
    if (employees.length === 0) {
      navigate.replace(routeName.SET_MPIN);
      return;
    }

    if (!validateAll()) {
      Alert.alert('Fix Errors', 'Please fix all errors before submitting');
      return;
    }

    const formattedEmployees = employees.map(emp => ({
      full_name: emp.name,
      contact_No: emp.number,
      // employee_id: emp.employeeId,
      designation: emp.designation,
      emailid: emp.email,
      Authority_level: emp.authority,
      department: emp.department,
    }));

    const payload = {
      CustomerID: 'CM287655',
      CustomerEmployeeDetails: formattedEmployees,
    };
    console.log('Employee Registration Payload:', payload);
    try {
      const response = await employeregistration(payload);
      console.log('Employee Registration Response:', response);
      if (response?.data?.status == '00') {
        Toast.show({
          type: 'success',
          text1: response?.data?.message,
          position: 'top',
        });
        navigate.navigate(routeName.SET_MPIN);
      } else if (response?.data?.status == '01') {
        Toast.show({
          type: 'error',
          text1: response?.data?.message,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'There is error in Api',
          position: 'top',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network error occurred',
        position: 'top',
      });
    }
  };

  /* ----------- RENDER AUTHORITY BUTTON ----------- */
  const renderAuthorityButton = ({
    item,
    index,
  }: {
    item: { id: string; index: number; name: string };
    index: number;
  }) => {
    const hasEmployee = employees.some(emp => emp.id === item.id && emp.name);

    return (
      <Button
        mode="outlined"
        style={[styles.authorityBtn, hasEmployee && styles.filledAuthorityBtn]}
        onPress={() => handleAuthorityButtonClick(item.index, item.id)}
        icon={hasEmployee ? 'account-check' : 'account-plus'}
        contentStyle={styles.leftAlignedButton}
        labelStyle={[
          styles.buttonLabel,
          hasEmployee ? styles.filledButtonLabel : styles.emptyButtonLabel,
        ]}
      >
        {item.name}
      </Button>
    );
  };

  /* ----------- RENDER EMPLOYEE ITEM ----------- */
  const renderEmployeeItem = ({
    item,
    index,
  }: {
    item: EmployeeData;
    index: number;
  }) => {
    const hasErrors = validationErrors[item.id];

    return (
      <Card
        style={[styles.employeeCard, hasErrors && styles.errorCard]}
        onPress={() => handleEditEmployee(item)}
      >
        <Card.Content>
          <View style={styles.listItemContent}>
            <View style={styles.listItemLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.listItemInfo}>
                <Text style={styles.employeeName}>{item.name}</Text>
                <Text style={styles.employeeDetails}>
                  {item.designation} • {item.department}
                </Text>
                <Text style={styles.authorityBadge}>
                  {item.authority === 'full'
                    ? 'Full Access'
                    : item.authority === 'limited'
                    ? 'Limited'
                    : 'Read Only'}
                </Text>
                {hasErrors && (
                  <HelperText type="error" visible={!!hasErrors}>
                    {Object.values(hasErrors)[0]}
                  </HelperText>
                )}
              </View>
            </View>
            <Button
              mode="text"
              onPress={(e: any) => {
                e.stopPropagation();
                removeEmployee(item.id);
              }}
              icon="close"
              textColor="#ef4444"
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const currentTotalCount = employees.length;
  const isLimitReached = currentTotalCount === parseInt(maxAllowed) || 0;

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* FIXED HEADER */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Add Authorities</Text>
              <Text style={styles.headerSubtitle}>
                Set up employee accounts with specific permissions
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={handleSkip}
              style={styles.headerSkipButton}
              labelStyle={styles.headerSkipLabel}
              icon="arrow-right"
            >
              Skip
            </Button>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* MAIN CONTENT CARD */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="account-group" size={24} color="#3b82f6" />
                <Text style={styles.cardTitle}>
                  Operating Authority Other Than User
                </Text>
              </View>

              <View style={styles.countSection}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Maximum Authorities"
                    value={maxAllowed}
                    mode="outlined"
                    keyboardType="number-pad"
                    maxLength={2}
                    left={<TextInput.Icon icon="account-multiple" />}
                    onChangeText={handleEmployeeCountChange}
                    style={styles.inputField}
                    outlineColor="#e1e5e9"
                    activeOutlineColor="#3b82f6"
                  />
                </View>

                <View
                  style={[
                    styles.countBadge,
                    isLimitReached && styles.countBadgeFull,
                  ]}
                >
                  <Text style={styles.countText}>
                    {currentTotalCount}/{parseInt(maxAllowed) || 0}
                  </Text>
                  <Text style={styles.countSubtext}>Added</Text>
                </View>
              </View>

              <HelperText type="info" style={styles.helperText}>
                <Icon name="information" size={16} color="#3b82f6" /> If you
                wish to authorize/allow others to operate this app on their
                mobile with same credentials
              </HelperText>
            </Card.Content>
          </Card>

          {/* AUTHORITY BUTTONS */}
          {authorityButtons.length > 0 && (
            <Card style={styles.buttonsCard}>
              <Card.Content>
                <View style={styles.buttonsHeader}>
                  <Text style={styles.buttonsTitle}>
                    Authority Forms ({authorityButtons.length})
                  </Text>
                  <Text style={styles.buttonsSubtitle}>
                    Click on any button to fill authority details
                  </Text>
                </View>
                <FlatList
                  data={authorityButtons}
                  keyExtractor={item => item.id}
                  renderItem={renderAuthorityButton}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                />
              </Card.Content>
            </Card>
          )}

          {/* EMPLOYEES LIST */}
          {employees.length > 0 && (
            <Card style={styles.employeesCard}>
              <Card.Content>
                <View style={styles.employeesHeader}>
                  <Icon name="account-check" size={24} color="#10b981" />
                  <Text style={styles.employeesTitle}>
                    Saved Authorities ({employees.length})
                  </Text>
                </View>
                <FlatList
                  data={employees}
                  keyExtractor={item => item.id}
                  renderItem={renderEmployeeItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.employeesListContainer}
                  showsVerticalScrollIndicator={false}
                />
              </Card.Content>
            </Card>
          )}

          {/* EMPTY STATE */}
          {employees.length === 0 && authorityButtons.length === 0 && (
            <Card style={styles.emptyState}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="account-multiple-plus" size={64} color="#cbd5e1" />
                <Text style={styles.emptyStateTitle}>No Authorities Added</Text>
                <Text style={styles.emptyStateText}>
                  Enter the number of authorities above to create forms for each
                  authority
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* SUBMIT BUTTON */}
          {employees.length > 0 && (
            <Card style={styles.submitCard}>
              <Card.Content>
                <Button
                  mode="contained"
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  loading={isSubmitting}
                  icon="check-circle"
                >
                  {`Save ${employees.length} Authority${
                    employees.length > 1 ? 'ies' : ''
                  } & Continue`}
                </Button>
              </Card.Content>
            </Card>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* EMPLOYEE FORM MODAL */}
      <Portal>
        <EmployeeFormModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setCurrentEmployee(null);
            setEmployeeIndex(undefined);
          }}
          employee={currentEmployee}
          onSubmit={handleModalSubmit}
          isEditing={isEditing}
          employeeIndex={employeeIndex}
        />
      </Portal>
    </>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Fixed Header Styles
  fixedHeader: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  headerSkipButton: {
    borderColor: '#e2e8f0',
    marginLeft: 12,
  },
  headerSkipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 20, // Add padding to account for fixed header
  },
  // Summary Card Styles
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  countSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputField: {
    backgroundColor: '#fff',
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeFull: {
    backgroundColor: '#10b981',
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  countSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  // Buttons Card Styles
  buttonsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buttonsHeader: {
    marginBottom: 16,
  },
  buttonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  buttonsSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  listContainer: {
    paddingBottom: 8,
  },
  authorityBtn: {
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  filledAuthorityBtn: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  leftAlignedButton: {
    justifyContent: 'flex-start',
  },
  buttonLabel: {
    textAlign: 'left',
    fontSize: 14,
  },
  emptyButtonLabel: {
    color: '#3b82f6',
  },
  filledButtonLabel: {
    color: '#10b981',
  },
  // Employees Card Styles
  employeesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  employeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  employeesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  employeesListContainer: {
    paddingBottom: 8,
  },
  employeeCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  errorCard: {
    borderColor: '#ef4444',
    borderWidth: 1,
    backgroundColor: '#fef2f2',
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listItemInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  authorityBadge: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  // Submit Card Styles
  submitCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  submitButtonContent: {
    height: 50,
  },
  bottomPadding: {
    height: 20,
  },
  // Empty State Styles
  emptyState: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 40,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  selectBox: {
    borderColor: '#e1e5e9',
    borderRadius: 8,
  },
  dropdown: {
    position: 'absolute',
    top: -200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    zIndex: 1000,
    elevation: 10,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  cancelBtn: {
    minWidth: 100,
    borderColor: '#e2e8f0',
  },
  saveBtn: {
    minWidth: 140,
    backgroundColor: '#3b82f6',
  },
  buttonContent: {
    height: 44,
  },
});

export default Employee;
