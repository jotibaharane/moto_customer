import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Image Source Options
const IMAGE_SOURCE_OPTIONS = [
  { id: 'camera', label: 'Take Photo', icon: 'camera', value: 'camera' },
  {
    id: 'gallery',
    label: 'Choose from Gallery',
    icon: 'image',
    value: 'gallery',
  },
];

// ---------------------------------------------
// INTERFACES
// ---------------------------------------------
export interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
  title?: string;
}

// ---------------------------------------------
// IMAGE PICKER COMPONENT
// ---------------------------------------------
const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Select Image Source',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePermission = async (permissionType: 'camera' | 'photo') => {
    let permission;

    if (Platform.OS === 'android') {
      permission =
        permissionType === 'camera'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    } else {
      permission =
        permissionType === 'camera'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.IOS.PHOTO_LIBRARY;
    }

    try {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const handleImageSource = async (source: 'camera' | 'gallery') => {
    setLoading(true);

    try {
      if (source === 'camera') {
        const hasPermission = await handlePermission('camera');
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to take photos',
          );
          setLoading(false);
          return;
        }

        launchCamera(
          {
            mediaType: 'photo',
            quality: 0.7,
            maxWidth: 1024,
            maxHeight: 1024,
            saveToPhotos: true,
          },
          response => {
            setLoading(false);
            if (response.didCancel) {
            } else if (response.errorCode) {
              Alert.alert('Error', `Camera Error: ${response.errorMessage}`);
            } else if (response.assets?.[0]?.uri) {
              onImageSelected(response.assets[0].uri);
              onClose();
            }
          },
        );
      } else {
        const hasPermission = await handlePermission('photo');
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to select photos',
          );
          setLoading(false);
          return;
        }

        launchImageLibrary(
          {
            mediaType: 'photo',
            quality: 0.7,
            maxWidth: 1024,
            maxHeight: 1024,
          },
          response => {
            setLoading(false);
            if (response.didCancel) {
            } else if (response.errorCode) {
              Alert.alert('Error', `Gallery Error: ${response.errorMessage}`);
            } else if (response.assets?.[0]?.uri) {
              onImageSelected(response.assets[0].uri);
              onClose();
            }
          },
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to access image source');
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {IMAGE_SOURCE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() =>
                  handleImageSource(option.value as 'camera' | 'gallery')
                }
                disabled={loading}
              >
                <View style={styles.optionIconContainer}>
                  <Icon name={option.icon} size={24} color="#3B82F6" />
                </View>
                <Text style={styles.optionText}>{option.label}</Text>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Icon name="camera-timer" size={24} color="#3B82F6" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelButton: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default ImagePickerModal;
