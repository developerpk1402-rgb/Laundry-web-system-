
import { api } from '../api-client';
import { Customer } from '@/types';

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return api.get(`/customers${query}`);
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  return api.get(`/customers/${id}`);
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'code'>): Promise<Customer> => {
  return api.post('/customers', data);
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  return api.patch(`/customers/${id}`, data);
};
