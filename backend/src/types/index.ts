export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  currency: string;
  taxRate: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  area: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export type FulfillmentStation = 'KITCHEN' | 'BAR' | 'WAITER_FLOOR';

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  dietary?: string[];
  prepTimeMinutes?: number;
  calories?: number;
  station?: FulfillmentStation;
}

export interface OrderItem {
  menuItemId: string;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  specialInstructions?: string;
  round?: number;
  addedAt?: string;
  station?: FulfillmentStation;
}

export type OrderStatus = 'Received' | 'Accepted' | 'Preparing' | 'Ready' | 'Serving' | 'Delivered' | 'Completed' | 'Cancelled';

export type BillSlipType = 'DIGITAL' | 'PHYSICAL';

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  customerNote?: string;
  customerPhone?: string;
  billRequested: boolean;
  billSlipType?: BillSlipType;
  paymentMethod?: 'CASH' | 'CARD' | 'SPLIT';
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillRequest {
  id: string;
  orderId: string;
  tableId: string;
  totalAmount: number;
  paymentMethodPreference?: 'CASH' | 'CARD' | 'SPLIT';
  billSlipType?: BillSlipType;
  customerPhone?: string;
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'SETTLED';
  requestedAt: string;
}

export interface DailySalesSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  orders: {
    orderId: string;
    tableId: string;
    tableNumber: string;
    time: string;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod?: string;
    billSlipType?: BillSlipType;
    customerPhone?: string;
    itemsCount: number;
  }[];
}
