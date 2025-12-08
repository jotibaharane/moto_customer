import {
  useGetCargoContentQuery,
  useGetPackageTypeQuery,
  useGetBodyTypeQuery,
} from '@api/hooks_api';
import CustomRadioButton from '@components/common/CustomRadioButton';
import { SelectionButton } from '@screens/LoadPostScreen/components/SecondStep';
import SelectionModal, {
  SelectionModalRef,
} from '@screens/LoadPostScreen/components/SelectionModal';

import {
  Cargotypeoptions,
  DhalaLengthOptions,
} from '@screens/LoadPostScreen/constant';

import tw from '@utils/tw';
import { useFormikContext } from 'formik';
import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Divider } from 'react-native-paper';

export type CargoData = {
  cargoType?: string;
  dhalaLength?: string;
  bodyType?: string;
  cargoContent?: string;
  packagingType?: string;
  cargoNote?: string;
  packagingNote?: string;
};

/* ------------------ Dummy API Data (remove when real API works) ------------------ */
const dummyBodyTypeData = [
  { id: '1', label: 'Open Body', img: 'https://via.placeholder.com/80' },
  { id: '2', label: 'Closed Body', img: 'https://via.placeholder.com/80' },
  { id: '3', label: 'Standard Body', img: 'https://via.placeholder.com/80' },
];

const dummyCargoContentData = [
  { id: 'cement', label: 'Cement Bags', img: 'https://via.placeholder.com/80' },
  { id: 'steel', label: 'Steel Rods', img: 'https://via.placeholder.com/80' },
  {
    id: 'plastic',
    label: 'Plastic Granules',
    img: 'https://via.placeholder.com/80',
  },
];

const dummyPackageTypeData = [
  { id: 'box', label: 'Boxed', img: 'https://via.placeholder.com/80' },
  { id: 'pallet', label: 'Pallet', img: 'https://via.placeholder.com/80' },
  { id: 'loose', label: 'Loose', img: 'https://via.placeholder.com/80' },
];

/* ------------------------------------------------------------------------------- */

export default function Step2_CargoInvoice({ data }: { data: CargoData }) {
  const { values, setFieldValue } = useFormikContext();
  // Notes
  const [cargoNote, setCargoNote] = useState(data?.cargoNote || '');
  const [packNote, setPackNote] = useState(data?.packagingNote || '');

  // Selection States
  const [selectedBodyType, setSelectedBodyType] = useState<any>(null);
  const [selectedCargoContent, setSelectedCargoContent] = useState<any>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<any>(null);

  // Refs for Modal
  const bodyTypeRef = useRef<SelectionModalRef>(null);
  const cargoContentRef = useRef<SelectionModalRef>(null);
  const packageTypeRef = useRef<SelectionModalRef>(null);

  return (
    <View style={styles.container}>
      {/* ---------------- Cargo Type ---------------- */}
      <Section title="Select Cargo Type" color="#3366FF">
        <View
          style={tw`border-2 border-dashed border-gray-300 bg-gray-50 p-2 rounded-lg`}
        >
          <CustomRadioButton
            options={Cargotypeoptions}
            selectedOption="Normal"
            selectedColor="#3B82F6"
            containerStyle={tw`p-2`}
          />
        </View>
      </Section>

      {/* ---------------- Dhala Length ---------------- */}
      <Section title="Select Dhala Length" color="#FFAA00">
        <View
          style={tw`border-2 border-dashed border-gray-300 bg-gray-50 p-2 rounded-lg`}
        >
          <CustomRadioButton
            options={DhalaLengthOptions}
            selectedOption="5"
            selectedColor="#3B82F6"
            containerStyle={tw`p-2`}
          />
        </View>
      </Section>

      {/* ---------------- Body Type ---------------- */}
      <Section title="Body Type" color="#00AA55">
        <SelectionButton
          value={selectedBodyType?.label}
          placeholder="Choose Body Type"
          iconName="local-shipping"
          onPress={() => bodyTypeRef.current?.open()}
          renderSelected={() =>
            selectedBodyType ? (
              <SelectedItemCard item={selectedBodyType} />
            ) : null
          }
        />
      </Section>

      {/* ---------------- Cargo Content ---------------- */}
      <Section title="Cargo Content | Material" color="#00AA55">
        <SelectionButton
          value={selectedCargoContent?.label}
          placeholder="Choose Cargo Content"
          iconName="local-shipping"
          onPress={() => cargoContentRef.current?.open()}
          renderSelected={() => (
            <View style={tw`flex-row items-center gap-2`}>
              <Image
                source={
                  selectedCargoContent?.image
                    ? selectedCargoContent.image
                    : undefined
                }
                style={tw`w-10 h-10`}
                resizeMode="contain"
              />
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-bold text-gray-800`}>
                  {selectedCargoContent?.label}
                </Text>
                <Text style={tw`text-xs text-gray-600 mt-1`}>
                  Selected Cargo Content
                </Text>
              </View>
            </View>
          )}
        />

        {/* --- Small Note TextBox --- */}
        <TextInput
          value={cargoNote}
          onChangeText={setCargoNote}
          placeholder="Enter cargo content note"
          style={styles.smallInput}
          multiline
        />
      </Section>

      {/* ---------------- Package Type ---------------- */}
      <Section title="Package Type" color="#AA55FF">
        <SelectionButton
          value={selectedPackageType?.label}
          placeholder="Choose Package Type"
          iconName="category"
          onPress={() => packageTypeRef.current?.open()}
          renderSelected={() =>
            selectedPackageType ? (
              <SelectedItemCard item={selectedPackageType} />
            ) : null
          }
        />
      </Section>

      {/* ---------------- Selection Modals ---------------- */}
      <SelectionModal
        ref={bodyTypeRef}
        title="Select Body Type"
        options={dummyBodyTypeData}
        onSelect={item => setSelectedBodyType(item)}
      />

      <SelectionModal
        ref={cargoContentRef}
        title="Select Cargo Content"
        options={dummyCargoContentData}
        onSelect={item => setSelectedCargoContent(item)}
      />

      <SelectionModal
        ref={packageTypeRef}
        title="Select Packaging Type"
        options={dummyPackageTypeData}
        onSelect={item => setSelectedPackageType(item)}
      />
    </View>
  );
}

/* ------------------ Reusable UI Components ------------------ */

const SelectedItemCard = ({ item }: any) => (
  <View style={tw`flex-row items-center gap-2`}>
    <Image
      source={{ uri: item.img }}
      style={tw`w-10 h-10`}
      resizeMode="contain"
    />
    <View>
      <Text style={tw`text-sm font-bold text-gray-800`}>{item.label}</Text>
      <Text style={tw`text-xs text-gray-600`}>Selected</Text>
    </View>
  </View>
);

const Section = ({ children, title, color }) => (
  <View style={{ marginBottom: 22 }}>
    <View style={styles.titleRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const AddNoteButton = ({ onPress }) => (
  <TouchableOpacity style={styles.noteBtn} onPress={onPress}>
    <Text style={styles.noteBtnText}>+ Add Note</Text>
  </TouchableOpacity>
);

const NoteCard = ({ note }) => (
  <View style={styles.noteCard}>
    <Text style={styles.noteCardText}>{note}</Text>
  </View>
);

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 5, marginRight: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  noteBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#EAF3FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBD6FF',
  },
  noteBtnText: { color: '#3366FF', fontWeight: '600', fontSize: 13 },
  noteCard: {
    marginTop: 8,
    backgroundColor: '#FFF7E6',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  noteCardText: { color: '#A86800', fontSize: 13 },
  smallInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    backgroundColor: '#FAFAFA',
    fontSize: 13,
    textAlignVertical: 'top',
  },
});
