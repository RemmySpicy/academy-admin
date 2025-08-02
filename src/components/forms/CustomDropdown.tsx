import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useController } from 'react-hook-form';
import { FormFieldProps } from '../../types';

interface DropdownOption {
  label: string;
  value: string | number;
}

interface CustomDropdownProps extends FormFieldProps {
  options: DropdownOption[];
  onSelectionChange?: (value: string | number) => void;
  searchable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  name,
  control,
  placeholder = "Select an option",
  options,
  onSelectionChange,
  searchable = false,
  multiple = false,
  maxHeight = 300,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: multiple ? [] : '',
  });

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  const handleSelection = (selectedValue: string | number) => {
    if (multiple) {
      const currentValues = field.value || [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v: any) => v !== selectedValue)
        : [...currentValues, selectedValue];
      
      field.onChange(newValues);
      if (onSelectionChange) {
        onSelectionChange(newValues);
      }
    } else {
      field.onChange(selectedValue);
      setIsOpen(false);
      if (onSelectionChange) {
        onSelectionChange(selectedValue);
      }
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      const selectedOptions = options.filter(option =>
        field.value?.includes(option.value)
      );
      return selectedOptions.length > 0
        ? selectedOptions.map(opt => opt.label).join(', ')
        : placeholder;
    } else {
      const selectedOption = options.find(option => option.value === field.value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const renderOption = ({ item }: { item: DropdownOption }) => {
    const isSelected = multiple
      ? field.value?.includes(item.value)
      : field.value === item.value;

    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => handleSelection(item.value)}
      >
        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
          {item.label}
        </Text>
        {isSelected && (
          <Iconify icon="ri:check-line" size={20} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dropdown,
          isOpen && styles.dropdownOpen,
          fieldState.error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            !field.value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        <Iconify
          icon={isOpen ? "ri:arrow-up-s-line" : "ri:arrow-down-s-line"}
          size={20}
          color={disabled ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>

      {fieldState.error && (
        <View style={styles.errorContainer}>
          <Iconify icon="ri:error-warning-line" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{fieldState.error.message}</Text>
        </View>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Iconify icon="ri:close-line" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value.toString()}
              style={[styles.optionsList, { maxHeight }]}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdownOpen: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  dropdownError: {
    borderColor: '#EF4444',
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  optionsList: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  selectedOptionText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default CustomDropdown;