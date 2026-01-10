import React, { FC } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

/* ---------------- CONFIG ---------------- */

const PHOTO_GROUPS = [
  { key: 'truckFrontView', title: 'Truck Front View Photo' },
  { key: 'emptyDhala', title: 'Empty Dhala Photo' },
  { key: 'goodsLoadingStart', title: 'Goods Loading (Start)' },
  { key: 'goodsLoadingHalf', title: 'Goods Loading (Half)' },
  { key: 'goodsLoadingComplete', title: 'Goods Loading (Complete)' },
  { key: 'loadedCovered', title: 'Loaded & Covered Vehicle' },
];

interface Props {
  visible: boolean;
  setVisible: (v: boolean) => void;
}

/* ---------------- COMPONENT ---------------- */

const LoadingStatusModalUI: FC<Props> = ({ visible, setVisible }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Loading Status Photos</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Icon source="close" size={24} />
            </TouchableOpacity>
          </View>

          {/* PROGRESS */}
          <Text style={styles.progress}>
            0 / {PHOTO_GROUPS.length} Photos Captured
          </Text>

          {/* LIST */}
          <ScrollView>
            {PHOTO_GROUPS.map(item => (
              <TouchableOpacity key={item.key} style={styles.card}>
                <View style={styles.placeholder}>
                  <Icon source="camera" size={26} />
                </View>

                <Text style={styles.cardText}>{item.title}</Text>

                <View style={[styles.saveBtn, styles.saveBtnActive]}>
                  <Icon source="content-save" size={22} color="#FFF" />
                  <Text style={styles.saveText}>SAVE</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* SUBMIT */}
          <TouchableOpacity style={styles.submitBtn}>
            <Icon source="check-circle" size={22} color="#FFF" />
            <Text style={styles.submitText}>Confirm & Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingStatusModalUI;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progress: {
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  /* SAVE BUTTON */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  saveBtnActive: {
    backgroundColor: '#2563EB',
  },
  saveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  submitText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
