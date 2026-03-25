import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const bgColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : variant === 'outline'
          ? 'transparent'
          : 'transparent';

  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : colors.white;

  const paddingVertical = size === 'small' ? 8 : size === 'large' ? 16 : 12;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          paddingVertical,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontWeight: '700',
  },
});
