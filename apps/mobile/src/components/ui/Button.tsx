import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../../utils/colors';
import { haptic } from '../../utils/haptics';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  hapticFeedback?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  icon,
  hapticFeedback = true,
}: Props) {
  const bgColor = {
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : colors.white;

  const height = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const fontSize = size === 'small' ? 14 : size === 'large' ? 17 : 15;

  const handlePress = () => {
    if (hapticFeedback) {
      if (variant === 'danger') haptic.warning();
      else haptic.light();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          height,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: colors.primary,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
      android_ripple={{
        color: 'rgba(255,255,255,0.2)',
        borderless: false,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize, marginLeft: icon ? 8 : 0 },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
