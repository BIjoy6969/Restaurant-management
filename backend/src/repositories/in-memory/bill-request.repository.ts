import { IBillRequestRepository } from '../interfaces.js';
import { BillRequest } from '../../types/index.js';

export class InMemoryBillRequestRepository implements IBillRequestRepository {
  private billRequests: Map<string, BillRequest> = new Map();

  async create(billRequest: BillRequest): Promise<BillRequest> {
    const clone = { ...billRequest };
    this.billRequests.set(billRequest.id, clone);
    return { ...clone };
  }

  async findByOrderId(orderId: string): Promise<BillRequest | null> {
    for (const req of this.billRequests.values()) {
      if (req.orderId === orderId) {
        return { ...req };
      }
    }
    return null;
  }

  async findByTableId(tableId: string): Promise<BillRequest[]> {
    const list: BillRequest[] = [];
    for (const req of this.billRequests.values()) {
      if (req.tableId.toLowerCase() === tableId.toLowerCase()) {
        list.push({ ...req });
      }
    }
    return list;
  }

  async findAll(): Promise<BillRequest[]> {
    return Array.from(this.billRequests.values()).map((r) => ({ ...r }));
  }

  async updateStatus(id: string, status: BillRequest['status']): Promise<BillRequest | null> {
    const req = this.billRequests.get(id);
    if (!req) return null;
    req.status = status;
    return { ...req };
  }
}

