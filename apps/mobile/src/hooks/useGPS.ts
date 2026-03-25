import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { usersApi } from '../api/endpoints';
import { useAuth } from '../providers/AuthProvider';

interface GPSState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isTracking: boolean;
}

export function useGPS(intervalMs = 30000) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<GPSState>({
    latitude: null,
    longitude: null,
    error: null,
    isTracking: false,
  });
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (mounted) {
          setState((s) => ({ ...s, error: 'Location permission denied' }));
        }
        return;
      }

      if (mounted) {
        setState((s) => ({ ...s, isTracking: true }));
      }

      // Get initial position
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (mounted) {
          const { latitude, longitude } = location.coords;
          setState((s) => ({ ...s, latitude, longitude }));
          usersApi.updateGPS({ latitude, longitude }).catch(() => {});
        }
      } catch {
        // Will get location via watch
      }

      // Watch position
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval: 10,
        },
        (location) => {
          if (mounted) {
            const { latitude, longitude } = location.coords;
            setState((s) => ({ ...s, latitude, longitude, error: null }));
            usersApi.updateGPS({ latitude, longitude }).catch(() => {});
          }
        }
      );
    })();

    return () => {
      mounted = false;
      watchRef.current?.remove();
    };
  }, [isAuthenticated, intervalMs]);

  return state;
}
