import { VoucherRange, TaxReceiptType } from '../types';
import { getVoucherRanges as apiGetVoucherRanges, saveVoucherRange as apiSaveVoucherRange, burnNCF } from '../lib/api/vouchers';

export const getVoucherRanges = async (branchId?: string): Promise<VoucherRange[]> => {
  return apiGetVoucherRanges(branchId);
};

export const saveVoucherRange = async (range: Partial<VoucherRange>): Promise<VoucherRange> => {
  return apiSaveVoucherRange(range);
};

export const getNextNCF = async (type: TaxReceiptType, branchId: string): Promise<string | null> => {
  return burnNCF(type, branchId);
};

export const generateVoucherId = (): string => {
  return `vr-${Math.random().toString(36).substr(2, 9)}`;
};