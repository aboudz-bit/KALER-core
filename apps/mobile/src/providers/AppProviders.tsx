import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { EmergencyProvider } from './EmergencyProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <EmergencyProvider>{children}</EmergencyProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
