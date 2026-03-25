import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../src/providers/AppProviders';
import { useAuth } from '../src/providers/AuthProvider';
import { useSocket } from '../src/hooks/useSocket';
import { useGPS } from '../src/hooks/useGPS';
import { colors } from '../src/utils/colors';

function AppContent() {
  // Initialize socket connection and GPS tracking
  useSocket();
  useGPS();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
