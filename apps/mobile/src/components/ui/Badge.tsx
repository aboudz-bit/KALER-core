import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  text: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  size?: 'small' | 'medium';
}

const VARIANT_COLORS = {
  default: { bg: colors.gray[100], text: colors.gray[700] },
  danger: { bg: colors.dangerLight, text: colors.danger },
  warning: { bg: colors.warningLight, text: '#92400E' },
  success: { bg: colors.successLight, text: '#065F46' },
  info: { bg: colors.infoLight, text: '#1E40AF' },
};

export function Badge({ text, variant = 'default', size = 'medium' }: Props) {
  const color = VARIANT_COLORS[variant];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }, isSmall && styles.small]}>
      <Text style={[styles.text, { color: color.text }, isSmall && styles.smallText]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  smallText: {
    fontSize: 10,
  },
});
