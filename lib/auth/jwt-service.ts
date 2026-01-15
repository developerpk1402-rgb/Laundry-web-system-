
import { User, UserRole } from '@/types';
import { api } from '../api-client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Handles communication with the LavanFlow Kernel (Mock or Real)
 */
export const jwtService = {
  async login(credentials: any): Promise<{ user: User, tokens: AuthTokens }> {
    const data = await api.post('/auth/login', credentials);
    if (!data) throw new Error('Authentication failed');
    return data;
  },

  async refresh(token: string): Promise<AuthTokens> {
    // Return mock refresh tokens
    return {
      accessToken: 'mock-access-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now()
    };
  },

  hasPermission(user: User, requiredRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.ADMIN]: 100,
      [UserRole.SPECIAL]: 80,
      [UserRole.CASHIER]: 50,
      [UserRole.SALESPERSON]: 30,
      [UserRole.OPERATOR]: 10
    };
    return hierarchy[user.role] >= hierarchy[requiredRole];
  }
};
