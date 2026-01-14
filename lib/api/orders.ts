
import { api } from '../api-client';
import { Order, OrderStatus } from '@/types';

/**
 * Note: These calls now interface with a NestJS backend 
 * that utilizes the Prisma models defined in schema.prisma.
 */

export interface OrderFilters {
  status?: OrderStatus;
  branchId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const getOrders = async (filters: OrderFilters = {}): Promise<Order[]> => {
  const query = new URLSearchParams(filters as any).toString();
  return api.get(`/orders?${query}`);
};

export const getOrderById = async (id: string): Promise<Order> => {
  // Backend logic (conceptual): 
  // return prisma.order.findUnique({ where: { id }, include: { items: true, customer: true } });
  return api.get(`/orders/${id}`);
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  // Backend logic (conceptual):
  // return prisma.order.create({ data: { ...orderData, items: { create: items } } });
  return api.post('/orders', orderData);
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  return api.patch(`/orders/${id}/status`, { status });
};

export const getStats = async (): Promise<{
  received: number;
  processing: number;
  completed: number;
  delivered: number;
  revenue: number;
}> => {
  // Backend logic using Prisma Aggregations:
  // const counts = await prisma.order.groupBy({ by: ['status'], _count: true });
  // const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
  return api.get('/orders/analytics/summary');
};
