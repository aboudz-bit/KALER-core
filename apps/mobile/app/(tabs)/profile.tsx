import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { useZones } from '../../src/hooks/queries/useZones';
import { useRespondToAlert, useConfirmReceipt } from '../../src/hooks/mutations/useRespondToAlert';
import { useAlerts } from '../../src/hooks/queries/useAlerts';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { colors } from '../../src/utils/colors';
import { hasPermission } from '@kaler/shared';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: zones } = useZones();
  const { isActive: isEmergency } = useEmergency();
  const { data: activeAlerts } = useAlerts(true);
  const respondToAlert = useRespondToAlert();
  const confirmReceipt = useConfirmReceipt();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleRespond = async (alertId: string, response: 'safe' | 'need_help') => {
    try {
      await confirmReceipt.mutateAsync(alertId);
      await respondToAlert.mutateAsync({ alertId, response });
      Alert.alert('Response Sent', `You reported: ${response === 'safe' ? 'Safe' : 'Need Help'}`);
    } catch {
      Alert.alert('Error', 'Failed to send response');
    }
  };

  if (!user) return null;

  const zone = zones?.find((z: any) => z.id === user.zoneId);
  const canManage = hasPermission(user.role as any, 'supervisor');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Emergency Response Section */}
      {isEmergency && activeAlerts && activeAlerts.length > 0 && (
        <Card variant="danger" style={{ marginBottom: 16 }}>
          <Text style={styles.emergencyTitle}>EMERGENCY ACTIVE</Text>
          <Text style={styles.emergencySubtitle}>
            {activeAlerts[0].title}
          </Text>
          <Text style={styles.emergencyMessage}>
            {activeAlerts[0].message}
          </Text>
          <View style={styles.responseButtons}>
            <Button
              title="I'm Safe"
              variant="primary"
              onPress={() => handleRespond(activeAlerts[0].id, 'safe')}
              loading={respondToAlert.isPending}
              style={{ flex: 1, backgroundColor: colors.success }}
            />
            <Button
              title="Need Help"
              variant="danger"
              onPress={() => handleRespond(activeAlerts[0].id, 'need_help')}
              loading={respondToAlert.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      )}

      {/* Profile Card */}
      <Card>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.badgeRow}>
          <Badge text={user.role} variant="info" />
          <Badge
            text={user.affiliation}
            variant={user.affiliation === 'aramco' ? 'info' : 'default'}
          />
        </View>

        <View style={styles.infoGrid}>
          <InfoRow label="Badge Number" value={user.badgeNumber} />
          <InfoRow label="Company" value={(user as any).company || '-'} />
          <InfoRow label="Zone" value={zone?.name || 'Unassigned'} />
          <InfoRow label="ECO Slot" value={(user as any).ecoSlot || '-'} />
          <InfoRow label="Email" value={(user as any).email || '-'} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <StatusIndicator
              status={(user as any).responseStatus || 'no_reply'}
            />
          </View>
        </View>
      </Card>

      {/* Management Section */}
      {canManage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/users')}
          >
            <Text style={styles.menuItemText}>Personnel Monitoring</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Text style={styles.menuItemText}>Alert Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/map')}
          >
            <Text style={styles.menuItemText}>Zone Management</Text>
          </TouchableOpacity>
        </View>
      )}

      <Button
        title="Logout"
        variant="outline"
        onPress={handleLogout}
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.danger,
    letterSpacing: 1,
  },
  emergencySubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: 4,
  },
  emergencyMessage: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.gray[900],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[500],
    letterSpacing: 1,
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
