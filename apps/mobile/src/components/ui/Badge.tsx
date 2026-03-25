import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  text: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

const VARIANT_COLORS = {
  default: { bg: colors.gray[100], text: colors.gray[700] },
  danger: { bg: colors.dangerLight, text: colors.danger },
  warning: { bg: colors.warningLight, text: '#92400E' },
  success: { bg: colors.successLight, text: '#065F46' },
  info: { bg: colors.infoLight, text: '#1E40AF' },
};

export function Badge({ text, variant = 'default' }: Props) {
  const color = VARIANT_COLORS[variant];

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
