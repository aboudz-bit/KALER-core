import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../utils/colors';
import { haptic } from '../../utils/haptics';
import { useAuth } from '../../providers/AuthProvider';
import { hasPermission } from '@kaler/shared';

interface ActionItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  minRole?: string;
}

const ACTIONS: ActionItem[] = [
  {
    label: 'Send Alert',
    icon: 'megaphone',
    color: colors.danger,
    route: '/(tabs)/alerts',
    minRole: 'eco',
  },
  {
    label: 'Personnel',
    icon: 'people',
    color: colors.secondary,
    route: '/(tabs)/users',
  },
  {
    label: 'Zone Map',
    icon: 'map',
    color: colors.primaryLight,
    route: '/(tabs)/map',
  },
];

export function QuickActions() {
  const { user } = useAuth();

  const visibleActions = ACTIONS.filter((a) => {
    if (!a.minRole) return true;
    return user && hasPermission(user.role as any, a.minRole as any);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.grid}>
        {visibleActions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: action.color },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => {
              haptic.light();
              router.push(action.route as any);
            }}
          >
            <Ionicons name={action.icon} size={24} color={colors.white} />
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
