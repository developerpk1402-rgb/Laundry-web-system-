import { User, UserRole, Permission } from '../types';
import { getActiveStaff, updateStaffStatus, getStaffProfile } from '../lib/api/staff';
import { api } from '../lib/api-client';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.SPECIAL]: [Permission.VIEW_REPORTS, Permission.SYSTEM_LOGS],
  [UserRole.CASHIER]: [Permission.CREATE_ORDERS, Permission.EDIT_ORDERS, Permission.PROCESS_INVOICE, Permission.GENERATE_NCF],
  [UserRole.SALESPERSON]: [Permission.CREATE_ORDERS, Permission.EDIT_ORDERS],
  [UserRole.OPERATOR]: [Permission.EDIT_ORDERS]
};

export const getUsers = async (): Promise<User[]> => {
  return api.get('/staff');
};

export const getEmployeesByBranch = async (branchId: string): Promise<User[]> => {
  return getActiveStaff(branchId);
};

export const saveUser = async (user: Partial<User>): Promise<User> => {
  if (user.id) {
    return api.patch(`/staff/${user.id}`, user);
  }
  return api.post('/staff', user);
};

export const deleteUser = async (id: string): Promise<void> => {
  return api.delete(`/staff/${id}`);
};

export const generateUserId = (): string => {
  return `u-${Math.random().toString(36).substr(2, 9)}`;
};

export const hasPermission = (user: User, permission: Permission): boolean => {
  if (user.role === UserRole.ADMIN) return true;
  return user.permissions?.includes(permission) || false;
};

export const isEmployeeOnDuty = (user: User): boolean => {
  if (!user.schedule || !user.isActive) return false;
  
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = days[now.getDay()];
  
  if (!user.schedule.days.includes(currentDay)) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = user.schedule.startTime.split(':').map(Number);
  const [endH, endM] = user.schedule.endTime.split(':').map(Number);
  
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  return currentTime >= startTime && currentTime <= endTime;
};