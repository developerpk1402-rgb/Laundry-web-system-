
import { Branch } from '../types';
import { BRANCHES as INITIAL_BRANCHES } from '../constants';

const STORAGE_KEY = 'lavanflow_branches_db';

export const getBranches = (): Branch[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  
  // Seed with initial branches if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BRANCHES));
  return INITIAL_BRANCHES;
};

export const saveBranch = (branch: Branch) => {
  const branches = getBranches();
  const index = branches.findIndex(b => b.id === branch.id);
  if (index >= 0) {
    branches[index] = branch;
  } else {
    branches.push(branch);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
  return branches;
};

export const deleteBranch = (id: string) => {
  const branches = getBranches().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
  return branches;
};

export const generateBranchId = (): string => {
  return `b-${Math.random().toString(36).substr(2, 9)}`;
};
