import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import type { DashboardStats } from '@kaler/shared';

interface Props {
  stats: DashboardStats;
}

function StatBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.statBlock, { borderTopColor: color }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function PersonnelSummary({ stats }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>TOTAL PERSONNEL</Text>
          <Text style={styles.totalDesc}>All tracked employees</Text>
        </View>
        <Text style={styles.totalValue}>{stats.totalPersonnel}</Text>
      </View>
      <View style={styles.grid}>
        <StatBlock
          label="Safe"
          value={stats.safe}
          color={colors.status.safe}
          icon="checkmark-circle"
        />
        <StatBlock
          label="Pending"
          value={stats.pending}
          color={colors.status.pending}
          icon="time"
        />
        <StatBlock
          label="Help"
          value={stats.needHelp}
          color={colors.status.need_help}
          icon="warning"
        />
        <StatBlock
          label="No Reply"
          value={stats.noReply}
          color={colors.status.no_reply}
          icon="ellipsis-horizontal-circle"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gray[500],
    letterSpacing: 1,
  },
  totalDesc: {
    fontSize: 13,
    color: colors.gray[400],
    marginTop: 2,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 3,
    marginHorizontal: 3,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
  },
});
