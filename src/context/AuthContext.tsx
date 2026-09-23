import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserRole, UserSession } from '../types/api';
import { api, ApiError } from '../lib/api';

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | 'visitor';
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  userEmail: string;
  avatar: string;
  signin: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (payload: { email: string; password: string; role: UserRole; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await api.get<UserSession>('/me');
      setUser(res.data);
    } catch {
      // 401 or no active session cookie
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signin = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await api.post('/auth/signin', { email, password });
      await fetchSession();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    full_name?: string;
  }) => {
    setIsLoading(true);
    try {
      await api.post('/auth/signup', payload);
      await fetchSession();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/signout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      setIsLoading(false);
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
        user,
        role,
        isAuthenticated,
        isLoading,
        userName,
        userEmail,
        avatar,
        signin,
        signup,
        logout,
        refetchUser: fetchSession,
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
