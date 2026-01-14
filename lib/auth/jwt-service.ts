
import { User, UserRole } from '@/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Handles communication with the NestJS Auth Controller
 */
export const jwtService = {
  async login(credentials: any): Promise<{ user: User, tokens: AuthTokens }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async refresh(token: string): Promise<AuthTokens> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  hasPermission(user: User, requiredRole: UserRole): boolean {
    const hierarchy = {
      [UserRole.ADMIN]: 100,
      [UserRole.SPECIAL]: 80,
      [UserRole.CASHIER]: 50,
      [UserRole.SALESPERSON]: 30,
      [UserRole.OPERATOR]: 10
    };
    return hierarchy[user.role] >= hierarchy[requiredRole];
  }
};
