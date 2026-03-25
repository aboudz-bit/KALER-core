import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useConfirmReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertsApi.confirmReceipt(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useRespondToAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      response,
    }: {
      alertId: string;
      response: 'safe' | 'need_help';
    }) => alertsApi.respond(alertId, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}
