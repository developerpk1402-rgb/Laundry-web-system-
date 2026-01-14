
import { Customer } from '../types';
import { MOCK_CUSTOMERS } from '../constants';

const STORAGE_KEY = 'laundry_customers_db';

export const getCustomers = (): Customer[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  
  // Initialize with mock data if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS));
  return MOCK_CUSTOMERS as Customer[];
};

export const saveCustomer = (customer: Customer) => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

export const generateCustomerCode = (): string => {
  return `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
};
