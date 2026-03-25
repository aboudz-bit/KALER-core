import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export function Card({ children, style, variant = 'default' }: Props) {
  const borderColor =
    variant === 'danger'
      ? colors.danger
      : variant === 'warning'
        ? colors.warning
        : variant === 'success'
          ? colors.success
          : colors.gray[200];

  return (
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
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  highlighted: {
    borderLeftWidth: 4,
  },
});
