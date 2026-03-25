import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';
import type { CreateAlertInput } from '@kaler/shared';

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlertInput) => alertsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.emergencyState });
    },
  });
}

export function useDeactivateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.emergencyState });
    },
  });
}
