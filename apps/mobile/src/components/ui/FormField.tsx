import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors } from '../../utils/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          inputProps.multiline && styles.multiline,
          style,
        ]}
        placeholderTextColor={colors.gray[400]}
        returnKeyType={inputProps.multiline ? 'default' : 'done'}
        blurOnSubmit={!inputProps.multiline}
        {...inputProps}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.gray[900],
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});
