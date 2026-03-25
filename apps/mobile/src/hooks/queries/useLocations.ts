import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations.all,
    queryFn: async () => {
      const { data } = await locationsApi.getAll();
      return data.data!;
    },
  });
}

export function useLocationsByZone(zoneId: string) {
  return useQuery({
    queryKey: queryKeys.locations.byZone(zoneId),
    queryFn: async () => {
      const { data } = await locationsApi.getByZone(zoneId);
      return data.data!;
    },
    enabled: !!zoneId,
  });
}
