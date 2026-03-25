import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useAlerts(activeOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.alerts.all(activeOnly),
    queryFn: async () => {
      const { data } = await alertsApi.getAll(activeOnly);
      return data.data!;
    },
    refetchInterval: 10000,
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: queryKeys.alerts.detail(id),
    queryFn: async () => {
      const { data } = await alertsApi.getById(id);
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useAlertReceipts(alertId: string) {
  return useQuery({
    queryKey: queryKeys.alerts.receipts(alertId),
    queryFn: async () => {
      const { data } = await alertsApi.getReceipts(alertId);
      return data.data!;
    },
    enabled: !!alertId,
    refetchInterval: 5000,
  });
}

export function useEmergencyState() {
  return useQuery({
    queryKey: queryKeys.alerts.emergencyState,
    queryFn: async () => {
      const { data } = await alertsApi.getEmergencyState();
      return data.data!;
    },
    refetchInterval: 10000,
  });
}
