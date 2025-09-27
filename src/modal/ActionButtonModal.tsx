import QuickActionsGrid from '@components/DashboardComponents/QuickActionsGrid';
import colors from '@utils/colors';
import { hp, wp } from '@utils/responsive';
import { useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

const ActionButtonModal = ({
  visible,
  onClose,
  actions,
  onActionPress,
}: any) => {
  const [pan] = useState(new Animated.ValueXY());
  const [modalHeight] = useState(hp(320));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) {
        pan.setValue({ x: 0, y: gestureState.dy });
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        Animated.timing(pan, {
          toValue: { x: 0, y: modalHeight },
          duration: 200,
          useNativeDriver: true,
        }).start(onClose);
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: pan.getTranslateTransform(),
            height: modalHeight,
          },
        ]}
      >
        <View style={styles.modalHeader} {...panResponder.panHandlers}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}></Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon source="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <QuickActionsGrid
          actions={actions}
          onActionPress={onActionPress}
          columns={4}
        />
      </Animated.View>
    </Modal>
  );
};

export default ActionButtonModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? hp(40) : hp(30),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHandle: {
    width: wp(40),
    height: hp(5),
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginLeft: 24, // Offset for close button
  },
  closeButton: {
    padding: 5,
  },
});
