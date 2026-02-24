import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePickerModal from '@components/custumcomponent/ImagePickerModal';
import { useFormikContext } from 'formik';

export default function Step3_Declaration() {
  const { values, setFieldValue } = useFormikContext<any>();

  const [showCameraModal, setShowCameraModal] = useState(false);

  // Initialize checkboxes in Formik if not present
  if (!values.declaration) {
    setFieldValue('declaration', {
      checkbox1: false,
      checkbox2: false,
      checkbox3: false,
      checkbox4: false,
      checkbox5: false,
    });
  }

  if (!values.declarationImages) {
    setFieldValue('declarationImages', []);
  }

  const handleCheckboxPress = (checkbox: string) => {
    setFieldValue('declaration', {
      ...values.declaration,
      [checkbox]: !values.declaration[checkbox],
    });
  };

  const anyChecked = Object.values(values.declaration || {}).some(
    value => value === true,
  );

  const handleImageSelected = (imageUri: string) => {
    const updatedImages = [...(values.declarationImages || []), imageUri];
    setFieldValue('declarationImages', updatedImages);
    Alert.alert('Success', 'Image captured successfully!', [{ text: 'OK' }]);
  };

  const removeImage = (index: number) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updatedImages = (values.declarationImages || []).filter(
            (_, i) => i !== index,
          );
          setFieldValue('declarationImages', updatedImages);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>
            Declaration in case documents are not available
          </Text>
        </View>

        <View style={styles.checkboxesContainer}>
          {[
            {
              id: 'checkbox1',
              text: 'Commercial Invoice/Challan GST documents not available',
            },
            {
              id: 'checkbox2',
              text: 'Declaration available with Material along with Shipper as well as Receiver Address',
            },
            {
              id: 'checkbox3',
              text: 'I/we declare that the contents / Goods Transporting is Household Material or used Goods so it has no Commercial Value',
            },
            {
              id: 'checkbox4',
              text: 'I / we are giving declarations that transit challan along with shipment as this goods has no commercial value',
            },
            {
              id: 'checkbox5',
              text: 'No commercial document Available for domestic goods',
            },
          ].map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkboxRow}
              onPress={() => handleCheckboxPress(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  values.declaration?.[item.id] && styles.checkboxChecked,
                ]}
              >
                {values.declaration?.[item.id] && (
                  <Icon name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {anyChecked && (
          <View style={styles.cameraSection}>
            <Text style={styles.sectionTitle}>Capture Document</Text>

            {(values.declarationImages || []).length === 0 ? (
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCameraModal(true)}
                activeOpacity={0.7}
              >
                <Icon name="camera" size={24} color="#007AFF" />
                <Text style={styles.cameraText}>Tap to capture</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagesSection}>
                <View style={styles.imagesHeader}>
                  <Text style={styles.imagesTitle}>
                    Images ({values.declarationImages.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCameraModal(true)}
                    style={styles.addButton}
                  >
                    <Icon name="plus" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {values.declarationImages.map((uri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Icon name="image" size={24} color="#007AFF" />
                      <Text style={styles.imageLabel}>Doc {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Icon name="close" size={14} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {anyChecked && (values.declarationImages || []).length > 0 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              // Formik values are already updated, just submit parent form
              Alert.alert(
                'Success',
                `Declaration ready with ${values.declarationImages.length} image(s)`,
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}

        {!anyChecked && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Select at least one declaration
            </Text>
          </View>
        )}

        <ImagePickerModal
          visible={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onImageSelected={handleImageSelected}
          title="Capture Document"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 12 },
  noteContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  checkboxesContainer: { marginBottom: 20 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#007AFF' },
  checkboxText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 18 },
  cameraSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  cameraText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagesSection: { marginTop: 4 },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagesTitle: { fontSize: 13, fontWeight: '500', color: '#495057' },
  addButton: { padding: 4 },
  imageItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  imageLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  warningContainer: {
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    alignItems: 'center',
  },
  warningText: { color: '#856404', fontSize: 13 },
});
