import { api } from '../api-client';
import { VoucherRange, TaxReceiptType } from '@/types';

export const getVoucherRanges = async (branchId?: string): Promise<VoucherRange[]> => {
  const query = branchId ? `?branchId=${branchId}` : '';
  return api.get(`/vouchers${query}`);
};

export const saveVoucherRange = async (range: Partial<VoucherRange>): Promise<VoucherRange> => {
  if (range.id) {
    return api.patch(`/vouchers/${range.id}`, range);
  }
  return api.post('/vouchers', range);
};

export const burnNCF = async (type: TaxReceiptType, branchId: string): Promise<string> => {
  return api.post('/vouchers/burn', { type, branchId });
};