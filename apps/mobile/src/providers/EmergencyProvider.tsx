import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import type { Alert, EmergencyMode } from '@kaler/shared';

interface EmergencyState {
  isActive: boolean;
  mode: EmergencyMode | null;
  activeAlert: Alert | null;
  activeAlerts: Alert[];
}

interface EmergencyContextType extends EmergencyState {
  refresh: () => Promise<void>;
  activateEmergency: (mode: EmergencyMode, alert: Alert) => void;
  deactivateEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | null>(null);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<EmergencyState>({
    isActive: false,
    mode: null,
    activeAlert: null,
    activeAlerts: [],
  });

  const refresh = useCallback(async () => {
    try {
      const [emergencyRes, alertsRes] = await Promise.all([
        alertsApi.getEmergencyState(),
        alertsApi.getAll(true),
      ]);

      const emergency = emergencyRes.data.data;
      const activeAlerts = alertsRes.data.data || [];

      setState({
        isActive: emergency?.isActive || false,
        mode: emergency?.mode || null,
        activeAlert: activeAlerts.find(
          (a: any) => a.id === emergency?.activeAlertId
        ) || null,
        activeAlerts,
      });
    } catch {
      // ignore - will retry on next refresh
    }
  }, []);

  const activateEmergency = useCallback(
    (mode: EmergencyMode, alert: Alert) => {
      setState((s) => ({
        ...s,
        isActive: true,
        mode,
        activeAlert: alert,
      }));
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.emergencyState });
    },
    [queryClient]
  );

  const deactivateEmergency = useCallback(() => {
    setState((s) => ({
      ...s,
      isActive: false,
      mode: null,
      activeAlert: null,
    }));
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    queryClient.invalidateQueries({ queryKey: queryKeys.alerts.emergencyState });
  }, [queryClient]);

  return (
    <EmergencyContext.Provider
      value={{ ...state, refresh, activateEmergency, deactivateEmergency }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx)
    throw new Error('useEmergency must be used within EmergencyProvider');
  return ctx;
}
