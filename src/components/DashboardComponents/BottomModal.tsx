import Icon from '@react-native-vector-icons/material-design-icons';
import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={wp(24)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingTop: wp(80),
    // maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(24),
    marginBottom: hp(20),
  },
  title: {
    fontSize: wp(20),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: wp(8),
  },
  scrollContent: {
    paddingHorizontal: wp(10),
    paddingBottom: hp(24),
  },
});

export default BottomModal;
