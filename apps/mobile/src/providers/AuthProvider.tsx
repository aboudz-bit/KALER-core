import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import { setAuthToken, clearAuthToken, getStoredToken } from '../api/client';
import type { LoginInput, User } from '@kaler/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for stored token on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          const { data } = await authApi.getProfile();
          setState({
            user: data.data,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        await clearAuthToken();
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await authApi.login(input);
    const { token, user } = data.data!;
    await setAuthToken(token);
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    await clearAuthToken();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await authApi.getProfile();
      setState((s) => ({ ...s, user: data.data }));
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
