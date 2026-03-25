import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { useAuth } from './AuthProvider';
import type { Alert, EmergencyMode } from '@kaler/shared';

interface EmergencyState {
  isActive: boolean;
  mode: EmergencyMode | null;
  activeAlert: Alert | null;
  activeAlerts: Alert[];
  isLoading: boolean;
}

interface EmergencyContextType extends EmergencyState {
  refresh: () => Promise<void>;
  activateEmergency: (mode: EmergencyMode, alert: Alert) => void;
  deactivateEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | null>(null);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<EmergencyState>({
    isActive: false,
    mode: null,
    activeAlert: null,
    activeAlerts: [],
    isLoading: true,
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
        activeAlert:
          activeAlerts.find(
            (a: any) => a.id === emergency?.activeAlertId
          ) || null,
        activeAlerts,
        isLoading: false,
      });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // Fetch emergency state on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setState({
        isActive: false,
        mode: null,
        activeAlert: null,
        activeAlerts: [],
        isLoading: false,
      });
    }
  }, [isAuthenticated, refresh]);

  const activateEmergency = useCallback(
    (mode: EmergencyMode, alert: Alert) => {
      setState((s) => ({
        ...s,
        isActive: true,
        mode,
        activeAlert: alert,
        activeAlerts: s.activeAlerts.some((a) => a.id === alert.id)
          ? s.activeAlerts
          : [...s.activeAlerts, alert],
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({
        queryKey: queryKeys.alerts.emergencyState,
      });
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
    queryClient.invalidateQueries({
      queryKey: queryKeys.alerts.emergencyState,
    });
    // Also refetch active alerts list
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
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
