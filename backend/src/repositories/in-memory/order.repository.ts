import { IOrderRepository } from '../interfaces.js';
import { Order, OrderStatus } from '../../types/index.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async create(order: Order): Promise<Order> {
    const clone = JSON.parse(JSON.stringify(order));
    this.orders.set(order.id, clone);
    return JSON.parse(JSON.stringify(clone));
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? JSON.parse(JSON.stringify(order)) : null;
  }

  async update(order: Order): Promise<Order> {
    const clone = JSON.parse(JSON.stringify(order));
    clone.updatedAt = new Date().toISOString();
    this.orders.set(order.id, clone);
    return JSON.parse(JSON.stringify(clone));
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const list: Order[] = [];
    for (const order of this.orders.values()) {
      if (order.tableId.toLowerCase() === tableId.toLowerCase()) {
        list.push(JSON.parse(JSON.stringify(order)));
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .map((o) => JSON.parse(JSON.stringify(o)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(order));
  }

  async markBillRequested(orderId: string): Promise<Order | null> {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.billRequested = true;
    order.updatedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(order));
  }
}

