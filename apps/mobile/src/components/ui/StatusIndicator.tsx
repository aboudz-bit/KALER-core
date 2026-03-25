import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

const STATUS_CONFIG: Record<
  string,
  { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  safe: { color: colors.status.safe, label: 'Safe', icon: 'checkmark-circle' },
  pending: {
    color: colors.status.pending,
    label: 'Pending',
    icon: 'time-outline',
  },
  need_help: {
    color: colors.status.need_help,
    label: 'Need Help',
    icon: 'warning',
  },
  no_reply: {
    color: colors.status.no_reply,
    label: 'No Reply',
    icon: 'ellipsis-horizontal-circle-outline',
  },
};

interface Props {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showIcon?: boolean;
}

export function StatusIndicator({
  status,
  size = 'medium',
  showLabel = true,
  showIcon = true,
}: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.no_reply;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 22 : 18;

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons name={config.icon} size={iconSize} color={config.color} />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: config.color, fontSize: size === 'small' ? 12 : 14 },
          ]}
        >
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
    gap: 5,
  },
  label: {
    fontWeight: '600',
  },
});
