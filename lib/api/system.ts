
import { api } from '../api-client';
import { BackupLog } from '@/types';

/**
 * LavanFlow OS - System Operations Node
 * Handles database snapshots, cloud sync, and kernel integrity
 */

export const triggerManualBackup = async (): Promise<BackupLog> => {
  return api.post('/system/backup/trigger', {});
};

export const getBackupHistory = async (): Promise<BackupLog[]> => {
  return api.get('/system/backup/history');
};

export const getSystemHealth = async (): Promise<{
  database: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  latency: number;
  lastBackup: string;
  syncQueue: number;
}> => {
  return api.get('/system/health');
};

export const forceSync = async () => {
  return api.post('/system/sync/force', {});
};
