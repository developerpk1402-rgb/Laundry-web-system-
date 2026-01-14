
import { AuthTokens } from './auth-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  private async fetcher(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest'); // CSRF protection hint for NestJS
    
    const token = this.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('laundry_access_token') : null);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      let response = await fetch(url, { ...options, headers });

      if (response.status === 401 && typeof window !== 'undefined') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem('laundry_access_token');
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(url, { ...options, headers });
        } else {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }

      if (!response.ok) {
        // OWASP A07:2021 - Generic Error Messages to prevent enumeration
        const error = await response.json().catch(() => ({ message: 'System unavailable. Please contact security admin.' }));
        throw new Error(error.message || 'An unexpected security event occurred.');
      }

      return response.json();
    } catch (error) {
      // Log error to internal monitoring but hide details from user
      console.error(`[Security Audit] API Failure:`, error);
      throw new Error('Communication with secure nodes failed.');
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('laundry_refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) throw new Error();
      
      const tokens: AuthTokens = await res.json();
      this.accessToken = tokens.accessToken;
      localStorage.setItem('laundry_access_token', tokens.accessToken);
      localStorage.setItem('laundry_refresh_token', tokens.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get(endpoint: string) { return this.fetcher(endpoint, { method: 'GET' }); }
  async post(endpoint: string, data: any) { return this.fetcher(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  async patch(endpoint: string, data: any) { return this.fetcher(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
  async delete(endpoint: string) { return this.fetcher(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();
