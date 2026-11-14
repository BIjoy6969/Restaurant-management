import { IOrderRepository } from '../interfaces';
import { Order } from '../../types';
import { OrderModel } from '../../models';

export class MongoOrderRepository implements IOrderRepository {
  async create(order: Order): Promise<Order> {
    await OrderModel.create(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ id: new RegExp(`^${id}$`, 'i') }).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ tableId: new RegExp(`^${tableId}$`, 'i') }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.mapDoc(d));
  }

  async findAll(): Promise<Order[]> {
    const docs = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(d => this.mapDoc(d));
  }

  async update(order: Order): Promise<Order> {
    await OrderModel.findOneAndUpdate({ id: new RegExp(`^${order.id}$`, 'i') }, { $set: order }, { new: true });
    return order;
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const doc = await OrderModel.findOneAndUpdate(
      { id: new RegExp(`^${orderId}$`, 'i') },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  async markBillRequested(orderId: string): Promise<Order | null> {
    const doc = await OrderModel.findOneAndUpdate(
      { id: new RegExp(`^${orderId}$`, 'i') },
      { $set: { billRequested: true, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  private mapDoc(doc: any): Order {
    return {
      id: doc.id,
      restaurantId: doc.restaurantId,
      tableId: doc.tableId,
      items: doc.items || [],
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      status: doc.status,
      customerNote: doc.customerNote,
      customerPhone: doc.customerPhone,
      billRequested: doc.billRequested,
      billSlipType: doc.billSlipType,
      paymentMethod: doc.paymentMethod,
      settledAt: doc.settledAt,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    };
  }
}
