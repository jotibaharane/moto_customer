// components/BottomModal.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  backdropOpacity?: number;
  animationDuration?: number;
  swipeThreshold?: number;
  disableSwipe?: boolean;
  preventSwipeClose?: boolean; // 👈 NEW
  customHeight?: number | string;
}

export interface BottomModalRef {
  open: () => void;
  close: () => void;
}

const BottomModal = forwardRef<BottomModalRef, BottomModalProps>(
  (
    {
      children,
      onClose,
      backdropOpacity = 0.5,
      animationDuration = 300,
      swipeThreshold = 100,
      disableSwipe = false,
      preventSwipeClose = false, // 👈 NEW
      customHeight,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disableSwipe,
        onMoveShouldSetPanResponder: () => !disableSwipe,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0 && !disableSwipe) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!preventSwipeClose && gestureState.dy > swipeThreshold) {
            closeModal();
          } else {
            resetPosition();
          }
        },
      }),
    ).current;

    const openModal = () => {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const closeModal = () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        onClose?.();
      });
    };

    const resetPosition = () => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    };

    useImperativeHandle(ref, () => ({
      open: openModal,
      close: closeModal,
    }));

    // Only allow number, "auto", or percentage string for height
    let modalHeight: number | 'auto' | `${number}%` | undefined;
    if (typeof customHeight === 'number') {
      modalHeight = customHeight;
    } else if (
      customHeight === undefined ||
      customHeight === 'auto' ||
      (typeof customHeight === 'string' && /^\d+%$/.test(customHeight))
    ) {
      modalHeight = customHeight as 'auto' | `${number}%` | undefined;
    } else {
      modalHeight = undefined;
    }

    return (
      <Modal
        transparent
        visible={isVisible}
        onRequestClose={closeModal}
        animationType="none"
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacityAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            modalHeight !== undefined ? { height: modalHeight } : {},
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleBar} />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
});

export default BottomModal;
