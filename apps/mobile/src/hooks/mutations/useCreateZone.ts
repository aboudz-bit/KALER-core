import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zonesApi, locationsApi } from '../../api/endpoints';
import { queryKeys } from '../../api/queryKeys';
import type { CreateZoneInput, UpdateZoneInput, CreateLocationInput, UpdateLocationInput } from '@kaler/shared';

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneInput) => zonesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneInput }) =>
      zonesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zonesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationInput) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationInput }) =>
      locationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
    },
  });
}
