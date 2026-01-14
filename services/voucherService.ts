
import { VoucherRange, TaxReceiptType, VoucherStatus } from '../types';

const STORAGE_KEY = 'lavanflow_vouchers_db';

const INITIAL_RANGES: VoucherRange[] = [
  {
    id: 'vr1',
    type: TaxReceiptType.TAX_CREDIT,
    prefix: 'B01',
    start: 1,
    end: 100,
    current: 0,
    branchId: 'b1',
    status: VoucherStatus.ACTIVE,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vr2',
    type: TaxReceiptType.FINAL_CONSUMER,
    prefix: 'B02',
    start: 1,
    end: 500,
    current: 0,
    branchId: 'b1',
    status: VoucherStatus.ACTIVE,
    createdAt: new Date().toISOString()
  }
];

export const getVoucherRanges = (): VoucherRange[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RANGES));
  return INITIAL_RANGES;
};

export const saveVoucherRange = (range: VoucherRange) => {
  const ranges = getVoucherRanges();
  const index = ranges.findIndex(r => r.id === range.id);
  if (index >= 0) {
    ranges[index] = range;
  } else {
    ranges.push(range);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  return ranges;
};

export const deleteVoucherRange = (id: string) => {
  const ranges = getVoucherRanges().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  return ranges;
};

export const getNextNCF = (type: TaxReceiptType, branchId: string): string | null => {
  if (type === TaxReceiptType.NONE) return null;

  const ranges = getVoucherRanges();
  const range = ranges.find(r => 
    r.type === type && 
    r.branchId === branchId && 
    r.status !== VoucherStatus.EXHAUSTED &&
    r.status !== VoucherStatus.INACTIVE
  );

  if (!range) return null;

  const nextValue = range.start + range.current;
  if (nextValue > range.end) {
    range.status = VoucherStatus.EXHAUSTED;
    saveVoucherRange(range);
    return null;
  }

  // Generate the padded string
  const ncf = `${range.prefix}${nextValue.toString().padStart(8, '0')}`;

  // Update current consumption
  range.current += 1;
  
  // Calculate status
  const remaining = range.end - (range.start + range.current - 1);
  const total = range.end - range.start + 1;
  
  if (remaining === 0) {
    range.status = VoucherStatus.EXHAUSTED;
  } else if (remaining / total < 0.1) {
    range.status = VoucherStatus.LOW;
  }

  saveVoucherRange(range);
  return ncf;
};

export const generateVoucherId = (): string => {
  return `vr-${Math.random().toString(36).substr(2, 9)}`;
};
