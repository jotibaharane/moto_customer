import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useState, memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import { routeName } from '@utils/navigationHelpers';
import { useInsertEmployeeMutation } from '@api/hooks_api';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { SelectList } from '@components/common/Select';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useGooglePlacesSelect } from '@hooks/useGooglePlaces';

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

/* ---------------- TYPES ---------------- */
interface EmployeeData {
  name: string;
  number: string;
  employeeId: string;
  designation: string;
  email: string;
  authority: string;
}

interface ValidationErrors {
  [key: number]: Partial<EmployeeData>;
}

/* ---------------- INPUT COMPONENT ---------------- */
const EmployeeInput = memo(
  ({ label, value, error, onChange, onBlur, keyboardType }: any) => (
    <View style={styles.inputContainer}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        error={!!error}
        placeholder=" "
        style={styles.paperInput}
        outlineColor="#e1e5e9"
        activeOutlineColor="#3b82f6"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  ),
);

/* ---------------- MAIN ---------------- */
const Employee = () => {
  const navigate = useNavigation();
  const CustomerDetail = useSelector(
    (state: RootState) => state?.auth?.customerDetails?.CustomerID,
  );
  const originPlaces = useGooglePlacesSelect();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [employeregistration] = useInsertEmployeeMutation();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [countInput, setCountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ----------- VALIDATION ----------- */
  const validateField = (field: keyof EmployeeData, value: string) => {
    const rules: any = {
      name: (v: string) =>
        !v ? 'Name is required' : v.length < 2 ? 'Name too short' : '',
      number: (v: string) =>
        /^[0-9]{10}$/.test(v) ? '' : 'Enter valid 10 digit number',
      employeeId: (v: string) => (!v ? 'Employee ID required' : ''),
      designation: (v: string) => (!v ? 'Designation required' : ''),
      email: (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter valid email',
      authority: (v: string) => (!v ? 'Authority required' : ''),
    };

    return rules[field](value.trim());
  };

  const validateAll = () => {
    const errors: ValidationErrors = {};
    let valid = true;
    let firstErrorMessage: string | null = null;

    employees.forEach((emp, idx) => {
      const empErrors: Partial<EmployeeData> = {};

      (Object.keys(emp) as Array<keyof EmployeeData>).forEach(field => {
        const err = validateField(field, emp[field]);
        if (err) {
          empErrors[field] = err;
          valid = false;

          if (!firstErrorMessage) {
            firstErrorMessage = err;
          }
        }
      });

      if (Object.keys(empErrors).length) errors[idx] = empErrors;
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

  /* ----------- EVENTS ----------- */
  const updateField = (
    idx: number,
    field: keyof EmployeeData,
    value: string,
  ) => {
    setEmployees(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });

    if (validationErrors[idx]?.[field]) {
      setValidationErrors(prev => {
        const clone = { ...prev };
        delete clone[idx][field];
        if (!Object.keys(clone[idx]).length) delete clone[idx];
        return clone;
      });
    }
  };

  /* ----------- ADD/REMOVE ----------- */
  const addMultiple = () => {
    const n = Number(countInput);
    if (!n || n <= 0 || n > 10)
      return Alert.alert('Invalid', 'Enter up to 10 employees');

    const newForms = Array(n).fill({
      name: '',
      number: '',
      employeeId: '',
      designation: '',
      email: '',
      authority: '',
    });

    setEmployees(prev => [...prev, ...newForms]);
    setCountInput('');
  };

  const addSingle = () => {
    if (employees.length >= 20)
      return Alert.alert('Limit', 'Max 20 employees allowed');

    setEmployees(prev => [
      ...prev,
      {
        name: '',
        number: '',
        employeeId: '',
        designation: '',
        email: '',
        authority: '',
      },
    ]);
  };

  const removeEmployee = (idx: number) => {
    if (employees.length === 1) {
      setEmployees([]);
      return;
    }

    setEmployees(prev => prev.filter((_, i) => i !== idx));
  };

  /* ----------- SUBMIT ----------- */
  const handleSubmit = async () => {
    if (employees.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please add at least one employee',
        position: 'top',
      });
      return;
    }

    if (!validateAll()) {
      Alert.alert('Fix Errors', 'Please fix all errors');
      return;
    }

    const formattedEmployees = employees.map(emp => ({
      full_name: emp.name,
      contact_no: emp.number,
      employee_id: emp.employeeId,
      designation: emp.designation,
      email_id: emp.email,
      authority: emp.authority,
    }));

    const payload = {
      CustomerID: CustomerDetail,
      CustomerEmployeeDetails: formattedEmployees,
    };

    const response = await employeregistration(payload);
    console.log(response, 'this is response');
    if (response?.data?.status == '00') {
      setIsSubmitting(true);
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
  };

  /* ----------- SKIP ----------- */
  const handleSkip = () => {
    Alert.alert('Skip', 'Skip adding employees?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Skip',
        onPress: () => navigate.replace(routeName.SET_MPIN),
      },
    ]);
  };

  /* ----------- UI ----------- */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}

        {/* QUICK ADD SECTION */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add Employees</Text>

          <View style={styles.quickAddRow}>
            {/* LEFT: Input */}
            <TextInput
              mode="outlined"
              label="Number of employees"
              value={countInput}
              keyboardType="numeric"
              onChangeText={setCountInput}
              style={styles.bulkInput}
              outlineColor="#e1e5e9"
              activeOutlineColor="#3b82f6"
            />

            {/* RIGHT: Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.bulkAddButton,
                  !countInput && styles.disabledButton,
                ]}
                disabled={!countInput}
                onPress={addMultiple}
              >
                <Text style={styles.bulkAddButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EMPLOYEES LIST - Only show when there are employees */}
        {employees.length > 0 && (
          <View style={styles.employeesContainer}>
            <View style={styles.employeesHeader}>
              <Text style={styles.employeesTitle}>
                Authorities ({employees.length})
              </Text>
            </View>

            {employees.map((emp, idx) => (
              <View key={idx} style={styles.authorityBox}>
                {/* TITLE */}
                <Text style={styles.authTitle}>Authority #{idx + 1}</Text>

                {/* DESIGNATION DROPDOWN */}
                <View style={styles.fieldBox}>
                  <SelectList
                    label="Designation *"
                    data={designationList}
                    setSelected={val => updateField(idx, 'designation', val)}
                    value={emp.designation}
                    placeholder="Choose an option"
                    save="key"
                  />
                </View>

                {/* EMPLOYEE ID */}
                <View style={styles.iconInput}>
                  <TextInput
                    mode="flat"
                    label="Employee ID *"
                    value={emp.employeeId}
                    onChangeText={v => updateField(idx, 'employeeId', v)}
                    error={validationErrors[idx]?.employeeId}
                    underlineColor="transparent"
                    style={styles.flatInput}
                    left={<TextInput.Icon icon="identifier" />} // or "card-account-details"
                  />
                </View>

                {/* FULL NAME */}
                <View style={styles.iconInput}>
                  <TextInput
                    mode="flat"
                    label="Full Name *"
                    value={emp.name}
                    onChangeText={v => updateField(idx, 'name', v)}
                    error={validationErrors[idx]?.name}
                    underlineColor="transparent"
                    style={styles.flatInput}
                    left={<TextInput.Icon icon="account" />}
                  />
                </View>

                {/* MOBILE NUMBER */}
                <View style={styles.iconInput}>
                  <TextInput
                    mode="flat"
                    label="Mobile Number *"
                    keyboardType="phone-pad"
                    value={emp.number}
                    onChangeText={v => updateField(idx, 'number', v)}
                    error={validationErrors[idx]?.number}
                    underlineColor="transparent"
                    style={styles.flatInput}
                    left={<TextInput.Icon icon="phone" />}
                  />
                </View>

                {/* EMAIL */}
                <View style={styles.iconInput}>
                  <TextInput
                    mode="flat"
                    label="Email Address"
                    value={emp.email}
                    onChangeText={v => updateField(idx, 'email', v)}
                    error={validationErrors[idx]?.email}
                    underlineColor="transparent"
                    keyboardType="email-address"
                    style={styles.flatInput}
                    left={<TextInput.Icon icon="email" />}
                  />
                </View>

                {/* AUTHORITY LEVEL */}
                <View style={styles.fieldBox}>
                  <SelectList
                    label="Authority Level *"
                    data={authorityList}
                    setSelected={val => updateField(idx, 'authority', val)}
                    value={emp.authority}
                    placeholder="Choose an option"
                    save="key"
                  />
                </View>

                {/* REMOVE BUTTON */}
                <TouchableOpacity
                  style={styles.removeAuthority}
                  onPress={() => removeEmployee(idx)}
                >
                  <Text style={styles.removeAuthorityText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* SUBMIT BUTTON - Only show when there are employees */}
        {employees.length > 0 && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledSubmitButton,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Save Employees ({employees.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* EMPTY STATE */}
        {employees.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Employees Added</Text>
            <Text style={styles.emptyStateText}>
              Use the quick add section above to add employees to your account
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },

  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },

  quickAddSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e293b',
  },
  quickAddRow: {
    flexDirection: 'row', // FIXED: ensures single row
    alignItems: 'center',
    gap: 12,
  },
  bulkInputContainer: {
    flex: 1,
  },
  bulkInput: {
    flex: 1, // input takes flexible width
  },
  buttonGroup: {
    alignItems: 'center',
  },
  bulkAddButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
  },
  bulkAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  singleAddButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  singleAddButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },

  employeesContainer: {
    padding: 16,
  },
  employeesHeader: {
    marginBottom: 16,
  },
  employeesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },

  employeeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },

  removeButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeButtonText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 12,
  },

  paperInput: {
    backgroundColor: '#fff',
  },

  inputContainer: {
    marginBottom: 16,
  },
  selectContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },

  submitContainer: {
    padding: 16,
    paddingTop: 8,
  },
  submitButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledSubmitButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  skipButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  authorityBox: {
    backgroundColor: '#fff7ff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#f0d8ff',
  },

  authTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1e1e1e',
  },

  fieldBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1.3,
    borderColor: '#e0e0e0',
  },

  iconInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },

  flatInput: {
    backgroundColor: 'transparent',
    height: 50,
  },

  removeAuthority: {
    backgroundColor: '#ffe5e5',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffb3b3',
    alignItems: 'center',
  },

  removeAuthorityText: {
    color: '#d10000',
    fontWeight: '600',
    fontSize: 14,
  },
  Addbutton: {
    flexDirection: 'row',
  },
});

export default Employee;
