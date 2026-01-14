
import { Garment, UserRole, Branch } from './types';

export const CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Suits', 'Household', 'Special'];

export const GARMENTS: Garment[] = [
  { id: '1', name: 'T-Shirt', category: 'Shirts', basePrice: 50 },
  { id: '2', name: 'Dress Shirt', category: 'Shirts', basePrice: 100 },
  { id: '3', name: 'Jeans', category: 'Pants', basePrice: 120 },
  { id: '4', name: 'Trousers', category: 'Pants', basePrice: 150 },
  { id: '5', name: 'Silk Dress', category: 'Dresses', basePrice: 350 },
  { id: '6', name: '3-Piece Suit', category: 'Suits', basePrice: 800 },
  { id: '7', name: 'Bed Sheets', category: 'Household', basePrice: 200 },
  { id: '8', name: 'Curtains', category: 'Household', basePrice: 400 },
];

export const BRANCHES: Branch[] = [
  { id: 'b1', name: 'Main Downtown', address: 'Av. Winston Churchill 12, DN', rnc: '101002003' },
  { id: 'b2', name: 'East Side Plaza', address: 'Calle 5 #44, Santo Domingo Este', rnc: '101005006' }
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Juan Pérez', phone: '809-555-0101', code: 'CUST-001', rnc: '131-00200-1' },
  { id: 'c2', name: 'María Rodríguez', phone: '829-444-0202', code: 'CUST-002' },
  { id: 'c3', name: 'Tech Solutions SRL', phone: '809-222-3333', code: 'CUST-003', rnc: '130-99887-2' },
];

export const TAX_RATE = 0.18; // Dominican Republic ITBIS
export const EXPRESS_SURCHARGE = 0.25; // 25% extra for express

export const COLORS = ['White', 'Black', 'Navy', 'Grey', 'Beige', 'Red', 'Blue', 'Patterned', 'Other'];
