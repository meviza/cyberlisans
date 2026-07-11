'use client';

import * as React from 'react';
import { apiFetch, setTokens, getAccessToken } from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'DEALER' | 'ADMIN' | 'SUPER_ADMIN';
  twoFactorEnabled: boolean;
  wallet: { balanceTry: number; balanceUsd: number; balanceEur: number; balanceUsdt: number };
  locale: string;
  currency: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    twoFactorToken?: string,
  ) => Promise<{ requires2FA?: boolean }>;
  register: (input: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  locale?: string;
  currency?: string;
  referralCode?: string;
  isAdult: boolean;
  consentKvkk: boolean;
  consentTerms: boolean;
  marketingOptIn?: boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await apiFetch<AuthUser>('/profile/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const login = React.useCallback(
    async (email: string, password: string, twoFactorToken?: string) => {
      const res = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        requires2FA?: boolean;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, twoFactorToken }),
      });
      if (res.requires2FA) return { requires2FA: true };
      setTokens(res.accessToken, res.refreshToken);
      await refresh();
      return {};
    },
    [refresh],
  );

  const register = React.useCallback(
    async (input: RegisterPayload) => {
      const res = await apiFetch<{ message?: string; emailVerified?: boolean; userId?: string }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(input) },
      );
      // Auto-verified accounts: log in immediately for smoother UX
      if (res.emailVerified) {
        try {
          const loginRes = await apiFetch<{
            accessToken: string;
            refreshToken: string;
          }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: input.email, password: input.password }),
          });
          setTokens(loginRes.accessToken, loginRes.refreshToken);
          await refresh();
        } catch {
          // Register ok; login can be done manually
        }
      }
    },
    [refresh],
  );

  const logout = React.useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {}
    setTokens(null, null);
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
