
import { api } from '../api-client';
import { Garment } from '@/types';

export const getInventoryItems = async (category?: string): Promise<Garment[]> => {
  const query = category ? `?category=${category}` : '';
  return api.get(`/inventory${query}`);
};

export const updateInventoryPrice = async (id: string, basePrice: number): Promise<Garment> => {
  return api.patch(`/inventory/${id}/price`, { basePrice });
};
