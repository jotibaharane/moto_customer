import BottomModal, { BottomModalRef } from '@components/BottomModal';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

export interface Option {
  id: string;
  label: string;
  image?: any;
  description?: string;
  hasTextInput?: boolean;
}

export interface SelectionModalRef {
  open: () => void;
  close: () => void;
}

interface SelectionModalProps {
  title: string;
  options: Option[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  numColumns?: number;
}

const SelectionModal = forwardRef<SelectionModalRef, SelectionModalProps>(
  ({ title, options, selectedValue, onSelect, numColumns = 2 }, ref) => {
    const bottomModalRef = useRef<BottomModalRef>(null);
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        bottomModalRef.current?.open();
      },
      close: () => {
        bottomModalRef.current?.close();
      },
    }));

    // Handle option selection
    const handleSelect = (option: Option) => {
      onSelect(option?.label);
      bottomModalRef.current?.close();
    };

    // Render option item
    const renderOptionItem = ({ item }: { item: Option }) => (
      <TouchableOpacity
        style={[
          styles.optionRow,
          selectedValue === item.label && styles.selectedOptionRow,
        ]}
        onPress={() => handleSelect(item)}
      >
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.optionRowImage}
            resizeMode="contain"
          />
        )}

        <Text style={styles.optionRowLabel}>{item.label}</Text>

        {selectedValue === item.label && (
          <Icon source="check" size={18} color="#4CAF50" />
        )}
      </TouchableOpacity>
    );

    return (
      <BottomModal
        ref={bottomModalRef}
        customHeight="80%"
        backdropOpacity={0.8}
        animationDuration={400}
        swipeThreshold={50}
        scrollEnabled={false}
        disableSwipe
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity
              onPress={() => bottomModalRef.current?.close()}
              style={styles.closeButton}
            >
              <Icon source="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <FlatList
            data={options}
            renderItem={renderOptionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
          />
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
    width: '48%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOptionItem: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  optionImage: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },

  selectedOptionRow: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },

  optionRowImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },

  optionRowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default SelectionModal;
