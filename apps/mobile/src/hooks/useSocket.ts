import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { useEmergency } from '../providers/EmergencyProvider';
import { queryKeys } from '../api/queryKeys';

const SOCKET_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  web: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuth();
  const { activateEmergency, deactivateEmergency } = useEmergency();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(SOCKET_URL!, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('alert_created', (alert) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      if (alert.emergencyMode) {
        activateEmergency(alert.emergencyMode, alert);
      }
    });

    socket.on('alert_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    });

    socket.on('emergency_mode_changed', (data) => {
      if (data.mode) {
        activateEmergency(data.mode, data.alert);
      } else {
        deactivateEmergency();
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    });

    socket.on('receipt_confirmed', () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });

    socket.on('user_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    });

    socket.on('zone_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    });

    socket.on('gps_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, queryClient, activateEmergency, deactivateEmergency]);

  return socketRef.current;
}
