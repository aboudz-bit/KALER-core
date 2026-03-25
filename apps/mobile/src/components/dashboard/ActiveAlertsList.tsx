import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../hooks/queries/useAlerts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors } from '../../utils/colors';

export function ActiveAlertsList() {
  const { data: alerts } = useAlerts(true);

  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>ACTIVE ALERTS</Text>
        <View style={styles.empty}>
          <Ionicons
            name="checkmark-circle-outline"
            size={40}
            color={colors.gray[300]}
          />
          <Text style={styles.emptyText}>No active alerts</Text>
          <Text style={styles.emptySubtext}>All clear</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        ACTIVE ALERTS ({alerts.length})
      </Text>
      {alerts.slice(0, 5).map((alert: any) => {
        const variant =
          alert.severity === 'critical'
            ? 'danger'
            : alert.severity === 'high'
              ? 'warning'
              : 'default';
        return (
          <Card key={alert.id} variant={variant} style={styles.alertCard}>
            <View style={styles.alertRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage} numberOfLines={2}>
                  {alert.message}
                </Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.activatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.alertBadges}>
                <Badge
                  text={alert.type.replace('_', ' ')}
                  variant={alert.severity === 'critical' ? 'danger' : 'info'}
                  size="small"
                />
                {alert.emergencyMode && (
                  <Badge text={alert.emergencyMode.replace('_', ' ')} variant="danger" size="small" />
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gray[500],
    letterSpacing: 1,
    marginBottom: 10,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 6,
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.gray[300],
    fontSize: 13,
  },
  alertCard: {
    marginBottom: 10,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
  },
  alertMessage: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 3,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 4,
  },
  alertBadges: {
    gap: 4,
    alignItems: 'flex-end',
  },
});
