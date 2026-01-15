
import { BRANCHES, GARMENTS, MOCK_CUSTOMERS } from '../constants';
import { TaxReceiptType, PrinterType } from '../types';

/**
 * LavanFlow OS - Local-First API Client (Vercel Optimized)
 * This client simulates a NestJS + Prisma backend using localStorage.
 * It is designed to be SSR-safe for Next.js deployments.
 */

const STORAGE_KEY = 'lavanflow_db';

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    this.initDatabase();
  }

  setToken(token: string | null) {
    this.accessToken = token;
  }

  private initDatabase() {
    if (typeof window === 'undefined') return;
    
    const db = localStorage.getItem(STORAGE_KEY);
    if (!db || db === 'null') {
      const initialDb = {
        branches: BRANCHES,
        inventory: GARMENTS,
        customers: MOCK_CUSTOMERS,
        orders: [],
        staff: [
          {
            id: 'u-admin-1',
            username: 'Admin',
            role: 'Admin',
            branchId: BRANCHES[0].id,
            isActive: true,
            schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], startTime: '08:00', endTime: '20:00' }
          }
        ],
        auditLogs: [],
        vouchers: BRANCHES.flatMap(b => [
          { id: `v-${b.id}-1`, type: TaxReceiptType.TAX_CREDIT, prefix: 'B01', start: 1, end: 100, current: 1, branchId: b.id, status: 'Active', createdAt: new Date().toISOString() },
          { id: `v-${b.id}-2`, type: TaxReceiptType.FINAL_CONSUMER, prefix: 'B02', start: 1, end: 500, current: 1, branchId: b.id, status: 'Active', createdAt: new Date().toISOString() },
          { id: `v-${b.id}-3`, type: TaxReceiptType.GOVERNMENT, prefix: 'B15', start: 1, end: 50, current: 1, branchId: b.id, status: 'Active', createdAt: new Date().toISOString() }
        ]),
        company: {
          name: 'LavanFlow Enterprise',
          slogan: 'Excellence in Care',
          rnc: '101002003',
          address: 'Av. Winston Churchill 12, DN',
          phone: '809-555-0000',
          email: 'contact@lavanflow.com',
          itbisRate: 0.18
        },
        branchSettings: BRANCHES.reduce((acc, b) => ({
          ...acc,
          [b.id]: {
            printerType: PrinterType.THERMAL_80MM,
            autoPrintReceipt: true,
            defaultTaxReceipt: TaxReceiptType.FINAL_CONSUMER
          }
        }), {}),
        backups: []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
    }
  }

  private getDb() {
    if (typeof window === 'undefined') {
      return this.getFallbackDb();
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data || data === 'null') return this.getFallbackDb();
      return JSON.parse(data);
    } catch (e) {
      return this.getFallbackDb();
    }
  }

  private getFallbackDb() {
    return { 
      orders: [], staff: [], customers: [], branches: BRANCHES, 
      auditLogs: [], vouchers: [], backups: [], company: {}, inventory: GARMENTS,
      branchSettings: {}
    };
  }

  private saveDb(db: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  private async simulateLatency(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetcher(endpoint: string, options: RequestInit = {}) {
    await this.simulateLatency();

    const db = this.getDb() || this.getFallbackDb();
    const path = endpoint.split('?')[0];
    const params = new URLSearchParams(endpoint.split('?')[1] || '');

    try {
      // --- ORDERS ---
      if (path === '/orders') {
        if (options.method === 'GET') {
          let results = db.orders || [];
          if (params.get('status')) results = results.filter((o: any) => o.status === params.get('status'));
          return results;
        }
        if (options.method === 'POST') {
          const newOrder = JSON.parse(options.body as string);
          newOrder.id = Math.random().toString(36).substr(2, 9);
          db.orders = db.orders || [];
          db.orders.unshift(newOrder);
          this.saveDb(db);
          return newOrder;
        }
      }

      if (path.startsWith('/orders/') && path.endsWith('/status')) {
        const id = path.split('/')[2];
        const { status } = JSON.parse(options.body as string);
        const orderIndex = (db.orders || []).findIndex((o: any) => o.id === id);
        if (orderIndex > -1) {
          db.orders[orderIndex].status = status;
          if (status === 'Completed' && !db.orders[orderIndex].location) {
            db.orders[orderIndex].location = 'Shelf ' + String.fromCharCode(65 + Math.floor(Math.random() * 4)) + '-' + Math.floor(Math.random() * 50 + 1);
          }
          this.saveDb(db);
          return db.orders[orderIndex];
        }
      }

      if (path === '/orders/analytics/summary') {
        const orders = db.orders || [];
        return {
          received: orders.filter((o: any) => o.status === 'Received').length,
          processing: orders.filter((o: any) => o.status === 'In Process').length,
          completed: orders.filter((o: any) => o.status === 'Completed').length,
          delivered: orders.filter((o: any) => o.status === 'Delivered').length,
          revenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        };
      }

      // --- INVENTORY ---
      if (path === '/inventory') {
        if (options.method === 'GET') return db.inventory || GARMENTS;
      }
      if (path.startsWith('/inventory/') && path.endsWith('/price')) {
        const id = path.split('/')[2];
        const { basePrice } = JSON.parse(options.body as string);
        const inventory = db.inventory || GARMENTS;
        const idx = inventory.findIndex((g: any) => g.id === id);
        if (idx > -1) {
          inventory[idx].basePrice = basePrice;
          db.inventory = inventory;
          this.saveDb(db);
          return db.inventory[idx];
        }
      }

      // --- SETTINGS / COMPANY ---
      if (path === '/settings/company') {
        if (options.method === 'GET') return db.company || {};
        if (options.method === 'POST') {
          db.company = JSON.parse(options.body as string);
          this.saveDb(db);
          return db.company;
        }
      }

      if (path.startsWith('/settings/branch/')) {
        const branchId = path.split('/')[3];
        db.branchSettings = db.branchSettings || {};
        if (options.method === 'GET') return db.branchSettings[branchId] || {};
        if (options.method === 'POST') {
          db.branchSettings[branchId] = JSON.parse(options.body as string);
          this.saveDb(db);
          return db.branchSettings[branchId];
        }
      }

      // --- STAFF ---
      if (path === '/staff/active') {
        const branchId = params.get('branchId');
        let results = db.staff || [];
        if (branchId) results = results.filter((s: any) => s.branchId === branchId);
        return results;
      }

      if (path === '/staff') {
        if (options.method === 'GET') return db.staff || [];
        if (options.method === 'POST') {
          const newUser = JSON.parse(options.body as string);
          db.staff = db.staff || [];
          db.staff.push(newUser);
          this.saveDb(db);
          return newUser;
        }
      }
      if (path.startsWith('/staff/')) {
        const id = path.split('/')[2];
        const staff = db.staff || [];
        if (options.method === 'PATCH') {
          const updates = JSON.parse(options.body as string);
          const idx = staff.findIndex((s: any) => s.id === id);
          if (idx > -1) {
            staff[idx] = { ...staff[idx], ...updates };
            db.staff = staff;
            this.saveDb(db);
            return db.staff[idx];
          }
        }
        if (options.method === 'DELETE') {
           db.staff = staff.filter((s: any) => s.id !== id);
           this.saveDb(db);
           return { success: true };
        }
      }

      // --- VOUCHERS ---
      if (path === '/vouchers') {
        if (options.method === 'GET') return db.vouchers || [];
        if (options.method === 'POST') {
          const newRange = JSON.parse(options.body as string);
          newRange.id = Math.random().toString(36).substr(2, 9);
          newRange.createdAt = new Date().toISOString();
          newRange.status = 'Active';
          db.vouchers = db.vouchers || [];
          db.vouchers.push(newRange);
          this.saveDb(db);
          return newRange;
        }
      }
      if (path.startsWith('/vouchers/')) {
        const id = path.split('/')[2];
        if (options.method === 'DELETE') {
          db.vouchers = (db.vouchers || []).filter((v: any) => v.id !== id);
          this.saveDb(db);
          return { success: true };
        }
      }
      if (path === '/vouchers/burn') {
        const { type, branchId } = JSON.parse(options.body as string);
        const vouchers = db.vouchers || [];
        const rangeIdx = vouchers.findIndex((v: any) => v.type === type && v.branchId === branchId && v.current <= v.end);
        if (rangeIdx > -1) {
          const range = vouchers[rangeIdx];
          const ncf = range.prefix + range.current.toString().padStart(8, '0');
          vouchers[rangeIdx].current += 1;
          db.vouchers = vouchers;
          this.saveDb(db);
          return ncf;
        }
        return '';
      }

      // --- CUSTOMERS ---
      if (path === '/customers') {
        if (options.method === 'GET') {
          const search = params.get('search')?.toLowerCase();
          const customers = db.customers || MOCK_CUSTOMERS;
          if (!search) return customers;
          return customers.filter((c: any) => 
            c.name.toLowerCase().includes(search) || 
            c.phone.includes(search) || 
            (c.code && c.code.toLowerCase().includes(search))
          );
        }
        if (options.method === 'POST') {
          const newCustomer = JSON.parse(options.body as string);
          newCustomer.id = Math.random().toString(36).substr(2, 9);
          newCustomer.code = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
          db.customers = db.customers || [];
          db.customers.push(newCustomer);
          this.saveDb(db);
          return newCustomer;
        }
      }

      // --- BRANCHES ---
      if (path === '/branches') {
        return db.branches || BRANCHES;
      }

      // --- AUDIT LOGS ---
      if (path === '/audit-logs') {
        if (options.method === 'GET') return db.auditLogs || [];
        if (options.method === 'POST') {
          const log = JSON.parse(options.body as string);
          log.id = Math.random().toString(36).substr(2, 9);
          db.auditLogs = db.auditLogs || [];
          db.auditLogs.unshift(log);
          this.saveDb(db);
          return log;
        }
        if (options.method === 'DELETE') {
          db.auditLogs = [];
          this.saveDb(db);
          return { success: true };
        }
      }

      // --- SYSTEM ---
      if (path === '/system/health') {
        return {
          database: 'ONLINE',
          latency: Math.floor(Math.random() * 30) + 5,
          lastBackup: new Date().toISOString(),
          syncQueue: 0
        };
      }
      if (path === '/system/backup/history') return db.backups || [];
      if (path === '/system/backup/trigger') {
        const newBackup = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: 'MANUAL',
          status: 'SUCCESS',
          fileSize: Math.floor(Math.random() * 5000) + 1000,
          details: 'Secure state snapshot generated locally.'
        };
        db.backups = db.backups || [];
        db.backups.unshift(newBackup);
        this.saveDb(db);
        return newBackup;
      }

      // --- AUTH ---
      if (path === '/auth/login') {
        const creds = JSON.parse(options.body as string);
        const staff = db.staff || [];
        const admin = staff.find((s: any) => s.username.toLowerCase() === (creds.username || '').toLowerCase()) || staff[0];
        return {
          user: admin,
          tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' }
        };
      }

      console.warn(`[Mock API] 404: ${endpoint}`);
      return this.getDefaultResponseForPath(path);

    } catch (error) {
      console.error(`[Mock Kernel] Execution Error:`, error);
      return this.getDefaultResponseForPath(path);
    }
  }

  private getDefaultResponseForPath(path: string) {
    const listEndpoints = ['/orders', '/customers', '/staff', '/staff/active', '/audit-logs', '/vouchers', '/inventory', '/system/backup/history', '/chat/conversations'];
    if (listEndpoints.some(ep => path.includes(ep))) {
      return [];
    }
    return null;
  }

  async get(endpoint: string) { return this.fetcher(endpoint, { method: 'GET' }); }
  async post(endpoint: string, data: any) { return this.fetcher(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  async patch(endpoint: string, data: any) { return this.fetcher(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
  async delete(endpoint: string) { return this.fetcher(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();
