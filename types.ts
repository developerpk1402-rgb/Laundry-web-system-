
export enum UserRole {
  ADMIN = 'Admin',
  SALESPERSON = 'Salesperson',
  CASHIER = 'Cashier',
  OPERATOR = 'Operator',
  SPECIAL = 'Special'
}

export enum OrderStatus {
  RECEIVED = 'Received',
  IN_PROCESS = 'In Process',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered'
}

export enum TaxReceiptType {
  NONE = 'No',
  TAX_CREDIT = 'Tax Credit (B01)',
  FINAL_CONSUMER = 'Final Consumer (B02)',
  GOVERNMENT = 'Government (B15)'
}

export enum ServiceType {
  WASH_IRON = 'Wash & Iron',
  IRON_ONLY = 'Iron Only',
  ALTERATIONS = 'Alterations'
}

export enum VoucherStatus {
  ACTIVE = 'Active',
  LOW = 'Low Stock',
  EXHAUSTED = 'Exhausted',
  INACTIVE = 'Inactive'
}

export interface VoucherRange {
  id: string;
  type: TaxReceiptType;
  prefix: string; // B01, B02, etc.
  start: number;
  end: number;
  current: number;
  branchId: string;
  status: VoucherStatus;
  createdAt: string;
}

export interface Garment {
  id: string;
  name: string;
  category: string;
  basePrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  rnc?: string;
  address?: string;
  code: string;
}

export interface OrderItem {
  id: string;
  garmentId: string;
  garmentName: string;
  color: string;
  service: ServiceType;
  quantity: number;
  isExpress: boolean;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  remainingBalance: number;
  datePlaced: string;
  estimatedDelivery: string;
  location?: string;
  processedBy: string;
  branch: string;
  notes?: string;
  taxReceiptType: TaxReceiptType;
  ncf?: string;
  notified: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  rnc: string;
}

export interface WorkSchedule {
  days: string[]; // ['Mon', 'Tue', ...]
  startTime: string; // '08:00'
  endTime: string; // '18:00'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  branchId: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  schedule?: WorkSchedule;
  bio?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: number;
  type: 'group' | 'direct';
  name?: string;
}

export type NotificationType = 'sale' | 'status' | 'system' | 'staff';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: NotificationType;
  orderCode?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  timestamp: number;
  likes: number;
}
