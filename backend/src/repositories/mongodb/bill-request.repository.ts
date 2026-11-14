import { IBillRequestRepository } from '../interfaces';
import { BillRequest } from '../../types';
import { BillRequestModel } from '../../models';

export class MongoBillRequestRepository implements IBillRequestRepository {
  async create(billRequest: BillRequest): Promise<BillRequest> {
    await BillRequestModel.create(billRequest);
    return billRequest;
  }

  async findByOrderId(orderId: string): Promise<BillRequest | null> {
    const doc = await BillRequestModel.findOne({ orderId: new RegExp(`^${orderId}$`, 'i') }).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  async findByTableId(tableId: string): Promise<BillRequest[]> {
    const docs = await BillRequestModel.find({ tableId: new RegExp(`^${tableId}$`, 'i') }).sort({ requestedAt: -1 }).lean();
    return docs.map(d => this.mapDoc(d));
  }

  async findAll(): Promise<BillRequest[]> {
    const docs = await BillRequestModel.find().sort({ requestedAt: -1 }).lean();
    return docs.map(d => this.mapDoc(d));
  }

  async updateStatus(id: string, status: BillRequest['status']): Promise<BillRequest | null> {
    const doc = await BillRequestModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    ).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  private mapDoc(doc: any): BillRequest {
    return {
      id: doc.id,
      orderId: doc.orderId,
      tableId: doc.tableId,
      totalAmount: doc.totalAmount,
      paymentMethodPreference: doc.paymentMethodPreference,
      billSlipType: doc.billSlipType,
      customerPhone: doc.customerPhone,
      status: doc.status,
      requestedAt: doc.requestedAt instanceof Date ? doc.requestedAt.toISOString() : doc.requestedAt
    };
  }
}
