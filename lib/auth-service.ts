
import { User, UserRole } from '@/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User, tokens: AuthTokens }> {
    // In production, this calls the NestJS endpoint
    // const res = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials)
    // });
    // if (!res.ok) throw new Error('Login failed');
    // return res.json();

    // Mock response for architectural demonstration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'u1',
            username: credentials.username,
            role: UserRole.ADMIN,
            branchId: 'b1',
            isActive: true
          },
          tokens: {
            accessToken: 'mock_jwt_access',
            refreshToken: 'mock_jwt_refresh'
          }
        });
      }, 1000);
    });
  }
};
