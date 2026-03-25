import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { useZones } from '../../src/hooks/queries/useZones';
import {
  useRespondToAlert,
  useConfirmReceipt,
} from '../../src/hooks/mutations/useRespondToAlert';
import { useAlerts } from '../../src/hooks/queries/useAlerts';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { colors } from '../../src/utils/colors';
import { haptic } from '../../src/utils/haptics';
import { hasPermission } from '@kaler/shared';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: zones } = useZones();
  const { isActive: isEmergency } = useEmergency();
  const { data: activeAlerts } = useAlerts(true);
  const respondToAlert = useRespondToAlert();
  const confirmReceipt = useConfirmReceipt();

  const handleLogout = () => {
    haptic.warning();
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          haptic.heavy();
          logout();
        },
      },
    ]);
  };

  const handleRespond = async (
    alertId: string,
    response: 'safe' | 'need_help'
  ) => {
    try {
      await confirmReceipt.mutateAsync(alertId);
      await respondToAlert.mutateAsync({ alertId, response });
      haptic.success();
      Alert.alert(
        'Response Sent',
        `You reported: ${response === 'safe' ? 'Safe' : 'Need Help'}`
      );
    } catch {
      haptic.error();
      Alert.alert('Error', 'Failed to send response');
    }
  };

  if (!user) return null;

  const zone = zones?.find((z: any) => z.id === user.zoneId);
  const canManage = hasPermission(user.role as any, 'supervisor');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Emergency Response Section */}
      {isEmergency && activeAlerts && activeAlerts.length > 0 && (
        <Card variant="danger" style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={28} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>EMERGENCY ACTIVE</Text>
              <Text style={styles.emergencySubtitle}>
                {activeAlerts[0].title}
              </Text>
            </View>
          </View>
          <Text style={styles.emergencyMessage}>
            {activeAlerts[0].message}
          </Text>
          <View style={styles.responseButtons}>
            <Button
              title="I'm Safe"
              variant="success"
              onPress={() => handleRespond(activeAlerts[0].id, 'safe')}
              loading={respondToAlert.isPending}
              icon={
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.white}
                />
              }
              style={{ flex: 1 }}
            />
            <Button
              title="Need Help"
              variant="danger"
              onPress={() => handleRespond(activeAlerts[0].id, 'need_help')}
              loading={respondToAlert.isPending}
              icon={
                <Ionicons name="warning" size={20} color={colors.white} />
              }
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      )}

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.badgeRow}>
          <Badge text={user.role} variant="info" />
          <Badge
            text={user.affiliation}
            variant={user.affiliation === 'aramco' ? 'info' : 'default'}
          />
        </View>
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <ProfileRow
          icon="card"
          label="Badge Number"
          value={user.badgeNumber}
        />
        <ProfileRow
          icon="business"
          label="Company"
          value={(user as any).company || '-'}
        />
        <ProfileRow
          icon="location"
          label="Zone"
          value={zone?.name || 'Unassigned'}
        />
        <ProfileRow
          icon="shield"
          label="ECO Slot"
          value={(user as any).ecoSlot || '-'}
        />
        <ProfileRow
          icon="mail"
          label="Email"
          value={(user as any).email || '-'}
        />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Ionicons name="pulse" size={20} color={colors.gray[400]} />
            <Text style={styles.profileRowLabel}>Status</Text>
          </View>
          <StatusIndicator
            status={(user as any).responseStatus || 'no_reply'}
          />
        </View>
      </Card>

      {/* Management Section */}
      {canManage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>
          <MenuItem
            icon="people"
            label="Personnel Monitoring"
            onPress={() => router.push('/(tabs)/users')}
          />
          <MenuItem
            icon="notifications"
            label="Alert Management"
            onPress={() => router.push('/(tabs)/alerts')}
          />
          <MenuItem
            icon="map"
            label="Zone Management"
            onPress={() => router.push('/(tabs)/map')}
          />
        </View>
      )}

      <Button
        title="Logout"
        variant="outline"
        onPress={handleLogout}
        icon={
          <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        }
        style={{ marginTop: 32 }}
      />
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.profileRowLeft}>
        <Ionicons name={icon} size={20} color={colors.gray[400]} />
        <Text style={styles.profileRowLabel}>{label}</Text>
      </View>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconCircle}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emergencyCard: {
    marginBottom: 20,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.danger,
    letterSpacing: 1.5,
  },
  emergencySubtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: 2,
  },
  emergencyMessage: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 4,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCard: {
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  profileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileRowLabel: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },
  profileRowValue: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
    maxWidth: '50%',
    textAlign: 'right',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gray[500],
    letterSpacing: 1,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[800],
  },
});
