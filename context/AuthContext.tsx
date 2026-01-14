
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authService, LoginCredentials } from '@/lib/auth-service';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('laundry_user');
      const token = localStorage.getItem('laundry_access_token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        api.setToken(token);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (creds: LoginCredentials) => {
    const { user, tokens } = await authService.login(creds);
    setUser(user);
    api.setToken(tokens.accessToken);
    localStorage.setItem('laundry_user', JSON.stringify(user));
    localStorage.setItem('laundry_access_token', tokens.accessToken);
    localStorage.setItem('laundry_refresh_token', tokens.refreshToken);
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('laundry_user');
    localStorage.removeItem('laundry_access_token');
    localStorage.removeItem('laundry_refresh_token');
    router.push('/login');
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
