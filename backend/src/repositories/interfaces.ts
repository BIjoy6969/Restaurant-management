import { Restaurant, Table, MenuCategory, MenuItem, Order, BillRequest } from '../types/index.js';

export interface ITableRepository {
  findById(id: string): Promise<Table | null>;
  findAll(): Promise<Table[]>;
}

export interface IRestaurantRepository {
  getRestaurant(): Promise<Restaurant>;
}

export interface IMenuRepository {
  getCategories(): Promise<MenuCategory[]>;
  getAllItems(): Promise<MenuItem[]>;
  getItemById(id: string): Promise<MenuItem | null>;
  getItemsByIds(ids: string[]): Promise<MenuItem[]>;
  updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null>;
}

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByTableId(tableId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  update(order: Order): Promise<Order>;
  updateStatus(orderId: string, status: Order['status']): Promise<Order | null>;
  markBillRequested(orderId: string): Promise<Order | null>;
}

export interface IBillRequestRepository {
  create(billRequest: BillRequest): Promise<BillRequest>;
  findByOrderId(orderId: string): Promise<BillRequest | null>;
  findByTableId(tableId: string): Promise<BillRequest[]>;
  findAll(): Promise<BillRequest[]>;
  updateStatus(id: string, status: BillRequest['status']): Promise<BillRequest | null>;
}

