import { apiClient } from './client';
import type {
  ApiResponse,
  DashboardStats,
  LoginInput,
  CreateUserInput,
  CreateZoneInput,
  UpdateZoneInput,
  CreateLocationInput,
  UpdateLocationInput,
  UpdateGPSInput,
  CreateAlertInput,
  RespondToAlertInput,
} from '@kaler/shared';

// Auth
export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/login', data),
  register: (data: CreateUserInput) =>
    apiClient.post<ApiResponse<any>>('/auth/register', data),
  getProfile: () =>
    apiClient.get<ApiResponse<any>>('/auth/profile'),
};

// Dashboard
export const dashboardApi = {
  getStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};

// Zones
export const zonesApi = {
  getAll: () => apiClient.get<ApiResponse<any[]>>('/zones'),
  getById: (id: string) => apiClient.get<ApiResponse<any>>(`/zones/${id}`),
  create: (data: CreateZoneInput) =>
    apiClient.post<ApiResponse<any>>('/zones', data),
  update: (id: string, data: UpdateZoneInput) =>
    apiClient.patch<ApiResponse<any>>(`/zones/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/zones/${id}`),
};

// Locations
export const locationsApi = {
  getAll: () => apiClient.get<ApiResponse<any[]>>('/locations'),
  getByZone: (zoneId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/locations/zone/${zoneId}`),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/locations/${id}`),
  create: (data: CreateLocationInput) =>
    apiClient.post<ApiResponse<any>>('/locations', data),
  update: (id: string, data: UpdateLocationInput) =>
    apiClient.patch<ApiResponse<any>>(`/locations/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/locations/${id}`),
};

// Users
export const usersApi = {
  getAll: (filters?: Record<string, string>) =>
    apiClient.get<ApiResponse<any[]>>('/users', { params: filters }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/users/${id}`),
  updateGPS: (data: UpdateGPSInput) =>
    apiClient.post<ApiResponse<any>>('/users/gps', data),
  getUsersInZone: (zoneId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/users/zone/${zoneId}/gps`),
  resetStatuses: () =>
    apiClient.post<ApiResponse<void>>('/users/reset-statuses'),
};

// Alerts
export const alertsApi = {
  getAll: (activeOnly?: boolean) =>
    apiClient.get<ApiResponse<any[]>>('/alerts', {
      params: activeOnly ? { active: 'true' } : undefined,
    }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/alerts/${id}`),
  getReceipts: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/alerts/${id}/receipts`),
  getEmergencyState: () =>
    apiClient.get<ApiResponse<any>>('/alerts/emergency-state'),
  create: (data: CreateAlertInput) =>
    apiClient.post<ApiResponse<any>>('/alerts', data),
  deactivate: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/alerts/${id}/deactivate`),
  confirmReceipt: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/alerts/${id}/confirm`),
  respond: (id: string, data: RespondToAlertInput) =>
    apiClient.post<ApiResponse<any>>(`/alerts/${id}/respond`, data),
};
