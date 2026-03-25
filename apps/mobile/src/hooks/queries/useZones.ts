import { useQuery } from '@tanstack/react-query';
import { zonesApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useZones() {
  return useQuery({
    queryKey: queryKeys.zones.all,
    queryFn: async () => {
      const { data } = await zonesApi.getAll();
      return data.data!;
    },
  });
}

export function useZone(id: string) {
  return useQuery({
    queryKey: queryKeys.zones.detail(id),
    queryFn: async () => {
      const { data } = await zonesApi.getById(id);
      return data.data!;
    },
    enabled: !!id,
  });
}
