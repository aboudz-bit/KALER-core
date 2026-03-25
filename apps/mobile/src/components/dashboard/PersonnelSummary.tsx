import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import type { DashboardStats } from '@kaler/shared';

interface Props {
  stats: DashboardStats;
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.statBlock, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function PersonnelSummary({ stats }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL PERSONNEL</Text>
        <Text style={styles.totalValue}>{stats.totalPersonnel}</Text>
      </View>
      <View style={styles.grid}>
        <StatBlock label="Safe" value={stats.safe} color={colors.status.safe} />
        <StatBlock
          label="Pending"
          value={stats.pending}
          color={colors.status.pending}
        />
        <StatBlock
          label="Need Help"
          value={stats.needHelp}
          color={colors.status.need_help}
        />
        <StatBlock
          label="No Reply"
          value={stats.noReply}
          color={colors.status.no_reply}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[500],
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
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
    paddingTop: 8,
    borderTopWidth: 3,
    marginHorizontal: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
    marginTop: 2,
  },
});
