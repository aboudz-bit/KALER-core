import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  safe: { color: colors.status.safe, label: 'Safe' },
  pending: { color: colors.status.pending, label: 'Pending' },
  need_help: { color: colors.status.need_help, label: 'Need Help' },
  no_reply: { color: colors.status.no_reply, label: 'No Reply' },
};

interface Props {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function StatusIndicator({ status, size = 'medium', showLabel = true }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.no_reply;
  const dotSize = size === 'small' ? 8 : size === 'large' ? 16 : 12;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: config.color,
          },
        ]}
      />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {},
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
