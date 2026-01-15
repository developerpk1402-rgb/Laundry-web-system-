
export enum UserRole {
  ADMIN = 'Admin',
  SALESPERSON = 'Salesperson',
  CASHIER = 'Cashier',
  OPERATOR = 'Operator',
  SPECIAL = 'Special'
}

export enum Permission {
  VIEW_REPORTS = 'view_reports',
  MANAGE_BRANCHES = 'manage_branches',
  MANAGE_STAFF = 'manage_staff',
  CREATE_ORDERS = 'create_orders',
  EDIT_ORDERS = 'edit_orders',
  DELETE_ORDERS = 'delete_orders',
  PROCESS_INVOICE = 'process_invoice',
  GENERATE_NCF = 'generate_ncf',
  SYSTEM_LOGS = 'system_logs'
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

export enum AuditAction {
  LOGIN = 'LOGIN',
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  INVOICE_PROCESS = 'INVOICE_PROCESS',
  NCF_BURN = 'NCF_BURN',
  STAFF_UPDATE = 'STAFF_UPDATE',
  BRANCH_SWITCH = 'BRANCH_SWITCH',
  SUPPLY_UPDATE = 'SUPPLY_UPDATE',
  DATABASE_BACKUP = 'DATABASE_BACKUP',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE'
}

export enum BackupType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  SYSTEM_CHECK = 'SYSTEM_CHECK'
}

export enum PrinterType {
  A4 = 'A4 Paper',
  THERMAL_80MM = '80mm Thermal'
}

export interface CompanyInfo {
  name: string;
  slogan: string;
  rnc: string;
  address: string;
  phone: string;
  email: string;
  itbisRate: number;
}

export interface BranchSettings {
  printerType: PrinterType;
  autoPrintReceipt: boolean;
  defaultTaxReceipt: TaxReceiptType;
}

export interface BackupLog {
  id: string;
  timestamp: number;
  type: BackupType;
  status: 'SUCCESS' | 'FAILED';
  fileSize?: number;
  storagePath?: string;
  details?: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  branchId: string;
  action: AuditAction;
  details: string;
  metadata?: any;
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
  prefix: string;
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
  notes?: string;
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
  paymentMethod?: 'Cash' | 'Card' | 'Transfer';
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  rnc: string;
}

export interface WorkSchedule {
  days: string[];
  startTime: string;
  endTime: string;
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
  permissions?: Permission[];
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

export type NotificationType = 'sale' | 'status' | 'system' | 'staff' | 'backup';

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
