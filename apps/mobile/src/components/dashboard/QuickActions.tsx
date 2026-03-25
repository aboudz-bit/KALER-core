import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../utils/colors';
import { useAuth } from '../../providers/AuthProvider';
import { hasPermission } from '@kaler/shared';

export function QuickActions() {
  const { user } = useAuth();
  const canCreateAlert = user && hasPermission(user.role as any, 'eco');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.grid}>
        {canCreateAlert && (
          <TouchableOpacity
            style={[styles.action, { backgroundColor: colors.danger }]}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Text style={styles.actionText}>Send Alert</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/(tabs)/users')}
        >
          <Text style={styles.actionText}>View Personnel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.primaryLight }]}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Text style={styles.actionText}>Zone Map</Text>
        </TouchableOpacity>
      </View>
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
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
