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
  image: any;
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
          styles.optionItem,
          selectedValue === item.label && styles.selectedOptionItem,
        ]}
        onPress={() => handleSelect(item)}
      >
        <Image
          source={item.image}
          style={styles.optionImage}
          resizeMode="contain"
        />

        <Text style={styles.optionLabel}>{item.label}</Text>

        {item?.description && (
          <Text style={styles.optionDescription}>{item.description}</Text>
        )}

        {selectedValue === item.id && (
          <View style={styles.selectedBadge}>
            <Icon source="check" size={16} color="#FFFFFF" />
          </View>
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
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={
              numColumns > 1 ? styles.columnWrapper : undefined
            }
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon source="image-off" size={48} color="#E0E0E0" />
                <Text style={styles.emptyText}>No options available</Text>
              </View>
            }
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
});

export default SelectionModal;
