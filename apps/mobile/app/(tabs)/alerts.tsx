import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAlerts } from '../../src/hooks/queries/useAlerts';
import { useZones } from '../../src/hooks/queries/useZones';
import { useCreateAlert, useDeactivateAlert } from '../../src/hooks/mutations/useCreateAlert';
import { useAuth } from '../../src/providers/AuthProvider';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { colors } from '../../src/utils/colors';
import { hasPermission } from '@kaler/shared';
import type { AlertType, AlertSeverity, EmergencyMode } from '@kaler/shared';

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string }[] = [
  { value: 'security', label: 'Security Alert' },
  { value: 'drill', label: 'Drill' },
  { value: 'restricted_movement', label: 'Restricted Movement' },
  { value: 'custom', label: 'Custom' },
];

const SEVERITY_OPTIONS: { value: AlertSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

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
  const [emergencyMode, setEmergencyMode] = useState<EmergencyMode | null>(null);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setType('security');
    setSeverity('medium');
    setIsGlobal(true);
    setSelectedZones([]);
    setEmergencyMode(null);
  };

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    try {
      await createAlert.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        severity,
        priority: severity === 'critical' ? 'emergency' : severity === 'high' ? 'urgent' : 'normal',
        isGlobal,
        zoneIds: isGlobal ? [] : selectedZones,
        emergencyMode,
      });
      setShowCreate(false);
      resetForm();
      Alert.alert('Success', 'Alert sent successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create alert');
    }
  };

  const handleDeactivate = (id: string) => {
    Alert.alert('Deactivate Alert', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivateAlert.mutateAsync(id);
          } catch {
            Alert.alert('Error', 'Failed to deactivate alert');
          }
        },
      },
    ]);
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones((prev) =>
      prev.includes(zoneId) ? prev.filter((z) => z !== zoneId) : [...prev, zoneId]
    );
  };

  return (
    <View style={styles.container}>
      {canCreate && (
        <View style={styles.header}>
          <Button title="Create Alert" onPress={() => setShowCreate(true)} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {(!alerts || alerts.length === 0) && (
          <Text style={styles.emptyText}>No alerts</Text>
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
            <Card key={alert.id} variant={variant} style={{ marginBottom: 8 }}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <View style={styles.badges}>
                  <Badge text={alert.type} variant="info" />
                  <Badge
                    text={alert.severity}
                    variant={
                      alert.severity === 'critical'
                        ? 'danger'
                        : alert.severity === 'high'
                          ? 'warning'
                          : 'default'
                    }
                  />
                  {alert.isActive ? (
                    <Badge text="Active" variant="success" />
                  ) : (
                    <Badge text="Inactive" variant="default" />
                  )}
                </View>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              {alert.emergencyMode && (
                <Badge
                  text={alert.emergencyMode === 'shelter_in' ? 'Shelter In' : 'Blackout'}
                  variant="danger"
                />
              )}
              <Text style={styles.alertDate}>
                {new Date(alert.createdAt).toLocaleString()}
              </Text>
              {alert.isActive && canCreate && (
                <Button
                  title="Deactivate"
                  variant="danger"
                  size="small"
                  onPress={() => handleDeactivate(alert.id)}
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          );
        })}
      </ScrollView>

      <Modal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Alert"
      >
        <Text style={styles.formLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Alert title"
        />

        <Text style={styles.formLabel}>Message</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Alert message"
          multiline
        />

        <Text style={styles.formLabel}>Type</Text>
        <View style={styles.optionRow}>
          {ALERT_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionBtn,
                type === opt.value && styles.optionBtnActive,
              ]}
              onPress={() => setType(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  type === opt.value && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.formLabel}>Severity</Text>
        <View style={styles.optionRow}>
          {SEVERITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionBtn,
                severity === opt.value && styles.optionBtnActive,
              ]}
              onPress={() => setSeverity(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  severity === opt.value && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.formLabel}>Emergency Mode (optional)</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              emergencyMode === null && styles.optionBtnActive,
            ]}
            onPress={() => setEmergencyMode(null)}
          >
            <Text
              style={[
                styles.optionText,
                emergencyMode === null && styles.optionTextActive,
              ]}
            >
              None
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              emergencyMode === 'shelter_in' && {
                backgroundColor: colors.danger,
              },
            ]}
            onPress={() => setEmergencyMode('shelter_in')}
          >
            <Text
              style={[
                styles.optionText,
                emergencyMode === 'shelter_in' && { color: colors.white },
              ]}
            >
              Shelter In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              emergencyMode === 'blackout' && {
                backgroundColor: colors.emergency.blackout,
              },
            ]}
            onPress={() => setEmergencyMode('blackout')}
          >
            <Text
              style={[
                styles.optionText,
                emergencyMode === 'blackout' && { color: colors.white },
              ]}
            >
              Blackout
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.formLabel}>Target</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              isGlobal && styles.optionBtnActive,
            ]}
            onPress={() => setIsGlobal(true)}
          >
            <Text
              style={[
                styles.optionText,
                isGlobal && styles.optionTextActive,
              ]}
            >
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              !isGlobal && styles.optionBtnActive,
            ]}
            onPress={() => setIsGlobal(false)}
          >
            <Text
              style={[
                styles.optionText,
                !isGlobal && styles.optionTextActive,
              ]}
            >
              Zone Target
            </Text>
          </TouchableOpacity>
        </View>

        {!isGlobal && zones && (
          <>
            <Text style={styles.formLabel}>Select Zones</Text>
            <View style={styles.optionRow}>
              {zones.map((zone: any) => (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.optionBtn,
                    selectedZones.includes(zone.id) && {
                      backgroundColor: zone.color || colors.secondary,
                    },
                  ]}
                  onPress={() => toggleZone(zone.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedZones.includes(zone.id) && {
                        color: colors.white,
                      },
                    ]}
                  >
                    {zone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Button
          title="Send Alert"
          onPress={handleCreate}
          loading={createAlert.isPending}
          variant="danger"
          size="large"
          style={{ marginTop: 24 }}
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
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray[400],
    fontSize: 16,
    paddingTop: 40,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: 180,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.gray[600],
    marginVertical: 6,
  },
  alertDate: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 4,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.white,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  optionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  optionTextActive: {
    color: colors.white,
  },
});
