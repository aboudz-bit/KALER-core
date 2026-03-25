import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  web: 'http://localhost:3000/api',
  default: 'http://localhost:3000/api',
});

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore not available (e.g., web fallback)
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - will be handled by auth provider
    }
    return Promise.reject(error);
  }
);

export async function setAuthToken(token: string) {
  try {
    await SecureStore.setItemAsync('auth_token', token);
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }
}

export async function clearAuthToken() {
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
}
