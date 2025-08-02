import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, KeyboardTypeOptions, StyleSheet } from "react-native";
import { Iconify } from "react-native-iconify";
import { clsx } from "clsx";
import { useController } from "react-hook-form";
import { FormFieldProps } from "../../types";

interface CustomInputProps extends FormFieldProps {
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  handleShowPassword?: () => void;
  multiline?: boolean;
  className?: string;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  handleOnChange?: (value: string | number) => void;
  maxLength?: number;
  defaultValue?: string;
  editable?: boolean;
  placeholderTextColor?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  placeholder,
  control,
  handleOnChange,
  icon,
  secureTextEntry,
  handleShowPassword,
  multiline = false,
  className,
  numberOfLines,
  keyboardType = "default",
  maxLength,
  defaultValue,
  editable = true,
  placeholderTextColor = "#9CA3AF",
}) => {
  const [isFocused, setIsFocused] = useState("");

  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: defaultValue || "",
  });

  const handleChangeText = (text: string | number) => {
    field.onChange(text);
    if (handleOnChange) {
      handleOnChange(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            isFocused === name && styles.inputFocused,
            multiline && styles.multilineInput,
          ]}
          onFocus={() => setIsFocused(name)}
          onBlur={() => setIsFocused("")}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          placeholderTextColor={placeholderTextColor}
          maxLength={maxLength}
          onChangeText={handleChangeText}
          value={field.value}
          editable={editable}
        />

        {icon && (
          <View style={styles.iconContainer}>{icon}</View>
        )}

        {handleShowPassword && (
          <View style={styles.passwordToggle}>
            <TouchableOpacity onPress={handleShowPassword}>
              {secureTextEntry ? (
                <Iconify icon="ri:eye-off-line" size={20} color="#9CA3AF" />
              ) : (
                <Iconify icon="ri:eye-line" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {fieldState.error && (
        <View style={styles.errorContainer}>
          <Iconify icon="ri:error-warning-line" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{fieldState.error.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  multilineInput: {
    height: 'auto',
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
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
});

export default CustomInput;