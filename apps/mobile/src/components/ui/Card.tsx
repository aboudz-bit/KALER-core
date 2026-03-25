import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'default', onPress }: Props) {
  const borderColor = {
    default: colors.gray[200],
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
  }[variant];

  const content = (
    <View
      style={[
        styles.card,
        { borderLeftColor: borderColor },
        variant !== 'default' && styles.highlighted,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  highlighted: {
    borderLeftWidth: 4,
  },
});
