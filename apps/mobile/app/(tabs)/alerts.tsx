import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../src/hooks/queries/useAlerts';
import { useZones } from '../../src/hooks/queries/useZones';
import {
  useCreateAlert,
  useDeactivateAlert,
} from '../../src/hooks/mutations/useCreateAlert';
import { useAuth } from '../../src/providers/AuthProvider';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { FormField } from '../../src/components/ui/FormField';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { ChipSelect } from '../../src/components/ui/ChipSelect';
import { colors } from '../../src/utils/colors';
import { haptic } from '../../src/utils/haptics';
import { hasPermission } from '@kaler/shared';
import type { AlertType, AlertSeverity, EmergencyMode } from '@kaler/shared';

export default function AlertsScreen() {
  const { user } = useAuth();
  const { data: alerts, refetch, isRefetching } = useAlerts();
  const { data: zones } = useZones();
  const createAlert = useCreateAlert();
  const deactivateAlert = useDeactivateAlert();

  const canCreate = user && hasPermission(user.role as any, 'eco');

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('security');
  const [severity, setSeverity] = useState<AlertSeverity>('medium');
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState<EmergencyMode | null>(
    null
  );

  const resetForm = useCallback(() => {
    setTitle('');
    setMessage('');
    setType('security');
    setSeverity('medium');
    setIsGlobal(true);
    setSelectedZones([]);
    setEmergencyMode(null);
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      haptic.error();
      Alert.alert('Missing Fields', 'Title and message are required');
      return;
    }

    try {
      await createAlert.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        severity,
        priority:
          severity === 'critical'
            ? 'emergency'
            : severity === 'high'
              ? 'urgent'
              : 'normal',
        isGlobal,
        zoneIds: isGlobal ? [] : selectedZones,
        emergencyMode,
      });
      haptic.success();
      setShowCreate(false);
      resetForm();
      Alert.alert('Alert Sent', 'Alert has been sent to targeted personnel');
    } catch (err: any) {
      haptic.error();
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to create alert'
      );
    }
  };

  const handleDeactivate = (id: string, alertTitle: string) => {
    haptic.warning();
    Alert.alert('Deactivate Alert', `Deactivate "${alertTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivateAlert.mutateAsync(id);
            haptic.success();
          } catch {
            haptic.error();
            Alert.alert('Error', 'Failed to deactivate alert');
          }
        },
      },
    ]);
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones((prev) =>
      prev.includes(zoneId)
        ? prev.filter((z) => z !== zoneId)
        : [...prev, zoneId]
    );
  };

  return (
    <View style={styles.container}>
      {canCreate && (
        <View style={styles.header}>
          <Button
            title="Create Alert"
            onPress={() => setShowCreate(true)}
            icon={<Ionicons name="add-circle" size={20} color={colors.white} />}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {(!alerts || alerts.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={colors.gray[300]}
            />
            <Text style={styles.emptyText}>No alerts</Text>
          </View>
        )}
        {alerts?.map((alert: any) => {
          const variant =
            alert.severity === 'critical'
              ? 'danger'
              : alert.severity === 'high'
                ? 'warning'
                : alert.isActive
                  ? 'success'
                  : 'default';
          return (
            <Card key={alert.id} variant={variant} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {alert.message}
                  </Text>
                </View>
                {alert.isActive && (
                  <View style={styles.activeDot} />
                )}
              </View>

              <View style={styles.alertMeta}>
                <Badge text={alert.type.replace('_', ' ')} variant="info" size="small" />
                <Badge
                  text={alert.severity}
                  variant={
                    alert.severity === 'critical'
                      ? 'danger'
                      : alert.severity === 'high'
                        ? 'warning'
                        : 'default'
                  }
                  size="small"
                />
                {alert.isGlobal && (
                  <Badge text="Global" variant="warning" size="small" />
                )}
                {alert.emergencyMode && (
                  <Badge
                    text={alert.emergencyMode.replace('_', ' ')}
                    variant="danger"
                    size="small"
                  />
                )}
              </View>

              <View style={styles.alertFooter}>
                <Text style={styles.alertDate}>
                  {new Date(alert.createdAt).toLocaleString()}
                </Text>
                {alert.isActive && canCreate && (
                  <Pressable
                    onPress={() => handleDeactivate(alert.id, alert.title)}
                    style={({ pressed }) => [
                      styles.deactivateChip,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    hitSlop={8}
                  >
                    <Ionicons name="power" size={14} color={colors.danger} />
                    <Text style={styles.deactivateText}>Deactivate</Text>
                  </Pressable>
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Alert"
      >
        <FormField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Alert title"
          maxLength={200}
        />

        <FormField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Describe the emergency or situation..."
          multiline
          maxLength={2000}
        />

        <Text style={styles.formLabel}>Type</Text>
        <ChipSelect
          chips={[
            { value: 'security', label: 'Security' },
            { value: 'drill', label: 'Drill' },
            { value: 'restricted_movement', label: 'Restricted' },
            { value: 'custom', label: 'Custom' },
          ]}
          selected={type}
          onChange={(v) => setType(v as AlertType)}
        />

        <Text style={[styles.formLabel, { marginTop: 20 }]}>Severity</Text>
        <SegmentedControl
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
          value={severity}
          onChange={(v) => setSeverity(v as AlertSeverity)}
        />

        <Text style={[styles.formLabel, { marginTop: 20 }]}>
          Emergency Mode
        </Text>
        <ChipSelect
          chips={[
            { value: 'none', label: 'None' },
            { value: 'shelter_in', label: 'Shelter In', color: colors.danger },
            {
              value: 'blackout',
              label: 'Blackout',
              color: colors.emergency.blackout,
            },
          ]}
          selected={emergencyMode || 'none'}
          onChange={(v) =>
            setEmergencyMode(v === 'none' ? null : (v as EmergencyMode))
          }
        />

        <Text style={[styles.formLabel, { marginTop: 20 }]}>Target</Text>
        <SegmentedControl
          options={[
            { value: 'global', label: 'Global (All)' },
            { value: 'zone', label: 'Zone Target' },
          ]}
          value={isGlobal ? 'global' : 'zone'}
          onChange={(v) => setIsGlobal(v === 'global')}
        />

        {!isGlobal && zones && zones.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.formSubLabel}>Select target zones</Text>
            <ChipSelect
              chips={zones.map((z: any) => ({
                value: z.id,
                label: z.name,
                color: z.color,
              }))}
              selected={selectedZones}
              onChange={toggleZone}
              multiSelect
            />
          </View>
        )}

        <Button
          title="Send Alert"
          onPress={handleCreate}
          loading={createAlert.isPending}
          variant="danger"
          size="large"
          icon={
            <Ionicons name="megaphone" size={20} color={colors.white} />
          }
          style={{ marginTop: 32 }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: 16,
    fontWeight: '500',
  },
  alertCard: {
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  alertMessage: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
    lineHeight: 20,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginTop: 5,
  },
  alertMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  alertDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  deactivateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerLight,
  },
  deactivateText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[700],
    marginBottom: 8,
  },
  formSubLabel: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 8,
  },
});
