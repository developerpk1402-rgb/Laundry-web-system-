import { Branch } from '../types';
import { getBranches as apiGetBranches, saveBranch as apiSaveBranch, deleteBranch as apiDeleteBranch } from '../lib/api/branches';

export const getBranches = async (): Promise<Branch[]> => {
  return apiGetBranches();
};

export const saveBranch = async (branch: Partial<Branch>): Promise<Branch> => {
  return apiSaveBranch(branch);
};

export const deleteBranch = async (id: string): Promise<void> => {
  return apiDeleteBranch(id);
};

export const generateBranchId = (): string => {
  return `b-${Math.random().toString(36).substr(2, 9)}`;
};