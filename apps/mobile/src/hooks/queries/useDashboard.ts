import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } = await dashboardApi.getStats();
      return data.data!;
    },
    refetchInterval: 10000,
  });
}
