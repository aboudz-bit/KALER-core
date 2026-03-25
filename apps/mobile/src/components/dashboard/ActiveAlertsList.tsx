import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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
          <Text style={styles.emptyText}>No active alerts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ACTIVE ALERTS ({alerts.length})</Text>
      {alerts.slice(0, 5).map((alert: any) => {
        const variant =
          alert.severity === 'critical'
            ? 'danger'
            : alert.severity === 'high'
              ? 'warning'
              : 'default';
        return (
          <Card key={alert.id} variant={variant} style={{ marginBottom: 8 }}>
            <View style={styles.alertRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage} numberOfLines={1}>
                  {alert.message}
                </Text>
              </View>
              <View style={styles.alertBadges}>
                <Badge
                  text={alert.type}
                  variant={alert.severity === 'critical' ? 'danger' : 'info'}
                />
                {alert.isGlobal && <Badge text="Global" variant="warning" />}
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[500],
    letterSpacing: 1,
    marginBottom: 8,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: 14,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
  },
  alertMessage: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  alertBadges: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
});
