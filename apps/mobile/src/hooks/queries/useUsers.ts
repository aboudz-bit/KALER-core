import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';

export function useUsers(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.users.all(filters),
    queryFn: async () => {
      const { data } = await usersApi.getAll(filters);
      return data.data!;
    },
    refetchInterval: 10000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data } = await usersApi.getById(id);
      return data.data!;
    },
    enabled: !!id,
  });
}
