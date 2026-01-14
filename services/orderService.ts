
import { Order, OrderStatus, TaxReceiptType } from '../types';
import { getNextNCF } from './voucherService';
import { addNotification } from './notificationService';

const STORAGE_KEY = 'laundry_orders_db';

export const getOrders = (): Order[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  const isNew = index < 0;

  if (!isNew) {
    const oldOrder = orders[index];
    if (oldOrder.status !== order.status) {
      addNotification(
        'Status Update',
        `Order ${order.code} is now ${order.status}.`,
        'status',
        order.code
      );
    }
    orders[index] = order;
  } else {
    orders.push(order);
    addNotification(
      'New Sale Detected',
      `${order.customerName} placed an order for RD$ ${order.total.toFixed(2)}.`,
      'sale',
      order.code
    );
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const deleteOrder = (id: string) => {
  const orders = getOrders().filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const generateNCF = (type: TaxReceiptType, branchId: string): string => {
  const ncf = getNextNCF(type, branchId);
  return ncf || '';
};

export const generateOrderCode = (): string => {
  return `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};
