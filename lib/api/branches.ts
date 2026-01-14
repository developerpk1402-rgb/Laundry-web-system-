import { api } from '../api-client';
import { Branch } from '@/types';

export const getBranches = async (): Promise<Branch[]> => {
  return api.get('/branches');
};

export const saveBranch = async (branch: Partial<Branch>): Promise<Branch> => {
  if (branch.id) {
    return api.patch(`/branches/${branch.id}`, branch);
  }
  return api.post('/branches', branch);
};

export const deleteBranch = async (id: string): Promise<void> => {
  return api.delete(`/branches/${id}`);
};