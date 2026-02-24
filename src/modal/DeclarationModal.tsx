import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFormikContext } from 'formik';
import ImagePickerModal from '@components/custumcomponent/ImagePickerModal';

const { height } = Dimensions.get('window');

/** ✅ SINGLE SOURCE OF TRUTH */
const DECLARATIONS = [
  'Commercial Invoice not available',
  'Declaration with shipper & receiver address',
  'Household / Used goods – no commercial value',
  'Transit challan provided',
  'No commercial document for domestic goods',
];

export default function DeclarationModal({ visible, onClose, onSave }) {
  const { values, setFieldValue } = useFormikContext<any>();
  const [pickerVisible, setPickerVisible] = useState(false);

  /** ✅ SAFE FALLBACKS */
  const declarationTexts: string[] = values.declarationTextList ?? [];
  const declarationImages: string[] = values.declarationImages ?? [];

  /** ✅ CHECK IF CHECKED (derived state) */
  const isChecked = (index: number) => Boolean(declarationTexts[index]?.trim());

  /** ✅ CHECKBOX CLICK → AUTO FILL / CLEAR TEXT */
  const handleCheckboxPress = (index: number) => {
    const updated = [...declarationTexts];

    if (updated[index]?.trim()) {
      updated[index] = ''; // uncheck
    } else {
      updated[index] = DECLARATIONS[index]; // auto-fill
    }

    setFieldValue('declarationTextList', updated);
  };

  /** ✅ IMAGE ADD */
  const handleImageSelected = (uri: string) => {
    setFieldValue('declarationImages', [...declarationImages, uri]);
    setPickerVisible(false);
  };

  /** ✅ IMAGE REMOVE */
  const removeImage = (index: number) => {
    Alert.alert('Remove Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          setFieldValue(
            'declarationImages',
            declarationImages.filter((_, i) => i !== index),
          ),
      },
    ]);
  };

  /** ✅ SAVE */
  const handleSubmit = () => {
    onSave?.();
    onClose?.();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Declaration</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.container}>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    Declaration in case documents are not available
                  </Text>
                </View>

                {/* ✅ CHECKBOXES */}
                {DECLARATIONS.map((text, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.checkboxRow}
                    onPress={() => handleCheckboxPress(index)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isChecked(index) && styles.checkboxChecked,
                      ]}
                    >
                      {isChecked(index) && (
                        <Icon name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>{text}</Text>
                  </TouchableOpacity>
                ))}

                {/* ✅ OPTIONAL EDITABLE TEXT */}
                {declarationTexts.map(
                  (text, index) =>
                    text?.trim() && (
                      <TextInput
                        key={index}
                        value={text}
                        onChangeText={t => {
                          const updated = [...declarationTexts];
                          updated[index] = t;
                          setFieldValue('declarationTextList', updated);
                        }}
                        multiline
                        style={styles.textInput}
                      />
                    ),
                )}

                {/* ✅ IMAGE SECTION */}
                <View style={styles.cameraSection}>
                  <Text style={styles.sectionTitle}>Capture Document</Text>

                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setPickerVisible(true)}
                  >
                    <Icon name="camera" size={24} color="#007AFF" />
                    <Text style={styles.cameraText}>Tap to capture</Text>
                  </TouchableOpacity>

                  {declarationImages.length > 0 && (
                    <>
                      <View style={styles.imagesHeader}>
                        <Text style={styles.imagesTitle}>
                          Images ({declarationImages.length})
                        </Text>
                        <TouchableOpacity
                          onPress={() => setPickerVisible(true)}
                        >
                          <Icon name="plus" size={18} color="#007AFF" />
                        </TouchableOpacity>
                      </View>

                      <ScrollView horizontal>
                        {declarationImages.map((_, index) => (
                          <View key={index} style={styles.imageItem}>
                            <Icon name="image" size={24} color="#007AFF" />
                            <Text style={styles.imageLabel}>
                              Doc {index + 1}
                            </Text>
                            <TouchableOpacity
                              style={styles.removeBtn}
                              onPress={() => removeImage(index)}
                            >
                              <Icon name="close" size={14} color="#ff3b30" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </View>

                {/* ✅ SAVE BUTTON */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Save Declaration</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* IMAGE PICKER */}
      <ImagePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    maxHeight: height * 0.5,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  container: { padding: 16 },
  noteContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  noteTitle: { fontSize: 14, fontWeight: '600' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#007AFF' },
  checkboxText: { flex: 1, fontSize: 13 },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    fontSize: 13,
  },
  cameraSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: '600', marginBottom: 10 },
  cameraButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
  },
  cameraText: { marginLeft: 8, color: '#007AFF' },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  imagesTitle: { fontWeight: '500' },
  imageItem: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
    position: 'relative',
  },
  imageLabel: { fontSize: 11 },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
