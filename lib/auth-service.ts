
import { User } from '@/types';
import { api } from './api-client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User, tokens: AuthTokens }> {
    const result = await api.post('/auth/login', credentials);
    if (!result) throw new Error('Login failed');
    return result;
  }
};
