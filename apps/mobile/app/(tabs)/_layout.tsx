import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { colors } from '../../src/utils/colors';

function EmergencyBanner() {
  const { isActive, mode } = useEmergency();
  const insets = useSafeAreaInsets();

  if (!isActive) return null;

  const modeLabel = mode === 'shelter_in' ? 'SHELTER IN PLACE' : 'BLACKOUT';
  const bgColor =
    mode === 'blackout' ? colors.emergency.blackout : colors.emergency.shelter_in;
  const icon: keyof typeof Ionicons.glyphMap =
    mode === 'blackout' ? 'moon' : 'shield';

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={18} color={colors.white} />
      <Text style={styles.bannerText}>EMERGENCY: {modeLabel}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <EmergencyBanner />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[400],
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.gray[100],
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarLabel: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Personnel',
            tabBarLabel: 'Personnel',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Zone Map',
            tabBarLabel: 'Map',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'More',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 2,
  },
});
