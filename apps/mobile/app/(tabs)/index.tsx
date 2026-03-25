import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { haptic } from '../../src/utils/haptics';

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
        haptic.success();
      } catch {
        haptic.error();
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <EmergencyModeBar
        onDeactivate={handleDeactivate}
        canDeactivate={!!canDeactivate}
        deactivating={deactivateAlert.isPending}
      />

      {stats && <PersonnelSummary stats={stats} />}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="notifications" size={22} color={colors.warning} />
          <Text style={styles.statNum}>{stats?.activeAlerts || 0}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="location" size={22} color={colors.secondary} />
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
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    color: colors.gray[400],
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '600',
  },
});
