import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/providers/AuthProvider';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { colors } from '../../src/utils/colors';

function EmergencyBanner() {
  const { isActive, mode } = useEmergency();
  if (!isActive) return null;

  const modeLabel = mode === 'shelter_in' ? 'SHELTER IN' : 'BLACKOUT';
  const bgColor = mode === 'blackout' ? colors.emergency.blackout : colors.emergency.shelter_in;

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
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
    <View style={{ flex: 1 }}>
      <EmergencyBanner />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[400],
          tabBarStyle: { paddingBottom: 4 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>D</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarLabel: 'Alerts',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>A</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Personnel',
            tabBarLabel: 'Users',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>U</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Zone Map',
            tabBarLabel: 'Map',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>M</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'More',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>P</Text>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    alignItems: 'center',
  },
  bannerText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
});
