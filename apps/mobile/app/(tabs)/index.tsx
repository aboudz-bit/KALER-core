import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDashboardStats } from '../../src/hooks/queries/useDashboard';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { EmergencyModeBar } from '../../src/components/dashboard/EmergencyModeBar';
import { PersonnelSummary } from '../../src/components/dashboard/PersonnelSummary';
import { QuickActions } from '../../src/components/dashboard/QuickActions';
import { ActiveAlertsList } from '../../src/components/dashboard/ActiveAlertsList';
import { useAuth } from '../../src/providers/AuthProvider';
import { useDeactivateAlert } from '../../src/hooks/mutations/useCreateAlert';
import { hasPermission } from '@kaler/shared';
import { colors } from '../../src/utils/colors';

export default function DashboardScreen() {
  const { data: stats, isLoading, refetch, isRefetching } = useDashboardStats();
  const { user } = useAuth();
  const emergency = useEmergency();
  const deactivateAlert = useDeactivateAlert();

  const canDeactivate = user && hasPermission(user.role as any, 'eco');

  const handleDeactivate = async () => {
    if (emergency.activeAlert) {
      try {
        await deactivateAlert.mutateAsync(emergency.activeAlert.id);
        emergency.deactivateEmergency();
      } catch {
        // handled by mutation
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <EmergencyModeBar
        onDeactivate={handleDeactivate}
        canDeactivate={!!canDeactivate}
      />

      {stats && <PersonnelSummary stats={stats} />}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{stats?.activeAlerts || 0}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{stats?.activeZones || 0}</Text>
          <Text style={styles.statLabel}>Active Zones</Text>
        </View>
      </View>

      <QuickActions />
      <ActiveAlertsList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '600',
    marginTop: 4,
  },
});
