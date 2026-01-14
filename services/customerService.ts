import { Customer } from '../types';
import { getCustomers as apiGetCustomers, createCustomer, updateCustomer } from '../lib/api/customers';

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  return apiGetCustomers(search);
};

export const saveCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
  if (customer.id) {
    return updateCustomer(customer.id, customer);
  }
  return createCustomer(customer as Omit<Customer, 'id' | 'code'>);
};

export const generateCustomerCode = (): string => {
  return `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
};