
import { AuditLog, AuditAction } from '../types';
import { api } from '../lib/api-client';

/**
 * LavanFlow OS - Persistent Audit Logging
 * Now transitions from LocalStorage to MySQL via Prisma Backend
 */

export const getAuditLogs = async (branchId?: string): Promise<AuditLog[]> => {
  const query = branchId ? `?branchId=${branchId}` : '';
  return api.get(`/audit-logs${query}`);
};

export const logAction = async (
  user: { id: string, username: string, branchId: string }, 
  action: AuditAction, 
  details: string,
  metadata?: any
) => {
  const logData = {
    userId: user.id,
    branchId: user.branchId,
    action,
    details,
    metadata,
    timestamp: Date.now()
  };
  
  // Send to backend to persist in MySQL via prisma.auditLog.create()
  const savedLog = await api.post('/audit-logs', logData);
  
  // Dispatch local event for real-time UI reactive updates
  window.dispatchEvent(new CustomEvent('audit_updated', { detail: savedLog }));
  return savedLog;
};

export const clearAuditLogs = async () => {
  await api.delete('/audit-logs');
  window.dispatchEvent(new Event('audit_updated'));
};
