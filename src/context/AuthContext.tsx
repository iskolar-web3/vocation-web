import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole, UserSession } from '../types/api';
import { api } from '../lib/api';
import { UserSessionSchema } from '../lib/schemas';

export const meQueryOptions = () => ({
  queryKey: ['me'] as const,
  queryFn: async (): Promise<UserSession | null> => {
    try {
      const res = await api.get<UserSession>('/me', undefined, {
        schema: UserSessionSchema,
      });
      return res.data;
    } catch {
      return null;
    }
  },
  staleTime: 1000 * 60 * 5,
  retry: false,
});

export interface AuthContextType {
  user: UserSession | null;
  role: UserRole | 'visitor';
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  userEmail: string;
  avatar: string;
  signin: (credentials: { email: string; password: string }) => Promise<UserSession | null>;
  signup: (payload: { email: string; password: string; role: UserRole; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user = null, isLoading, refetch } = useQuery(meQueryOptions());

  const signin = async ({ email, password }: { email: string; password: string }): Promise<UserSession | null> => {
    const res = await api.post<UserSession>('/auth/signin', { email, password });
    const user = res.data;
    queryClient.setQueryData(['me'], user);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    return user;
  };

  const signup = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    full_name?: string;
  }) => {
    const res = await api.post<UserSession>('/auth/signup', payload);
    const user = res.data;
    queryClient.setQueryData(['me'], user);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const logout = async () => {
    try {
      await api.post('/auth/signout');
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vocation_dev_user');
      }
      queryClient.setQueryData(['me'], null);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.clear();
    }
  };

  const role: UserRole | 'visitor' = user ? user.role : 'visitor';
  const isAuthenticated = Boolean(user);
  const userName = user?.full_name || (user ? 'Authenticated User' : 'Guest Visitor');
  const userEmail = user?.email || '';
  const avatar = user?.avatar_url || '';

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        role,
        isAuthenticated,
        isLoading,
        userName,
        userEmail,
        avatar,
        signin,
        signup,
        logout,
        refetchUser: async () => {
          const fresh = await queryClient.fetchQuery({ ...meQueryOptions(), staleTime: 0 });
          queryClient.setQueryData(['me'], fresh);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
