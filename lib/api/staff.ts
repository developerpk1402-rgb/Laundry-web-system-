
import { api } from '../api-client';
import { User } from '@/types';

export const getActiveStaff = async (branchId?: string): Promise<User[]> => {
  const query = branchId ? `?branchId=${branchId}` : '';
  return api.get(`/staff/active${query}`);
};

export const updateStaffStatus = async (id: string, isActive: boolean): Promise<User> => {
  return api.patch(`/staff/${id}/status`, { isActive });
};

export const getStaffProfile = async (id: string): Promise<User> => {
  return api.get(`/staff/profile/${id}`);
};
