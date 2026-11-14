import { IBillRequestRepository, IOrderRepository } from '../repositories/interfaces';
import { BillRequestInput } from '../validators/order.validator';
import { BillRequest } from '../types';

export class BillRequestService {
  constructor(
    private billRepo: IBillRequestRepository,
    private orderRepo: IOrderRepository
  ) {}

  private generateBillId(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `BILL-${dateStr}-${randomHex}`;
  }

  async requestBill(orderId: string, input: BillRequestInput) {
    // 1. Fetch Order
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      const error: any = new Error(`Order '${orderId}' not found.`);
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // 2. Prevent duplicate active bill requests
    const existing = await this.billRepo.findByOrderId(orderId);
    if (existing && existing.status !== 'SETTLED' && !input.autoSettle) {
      const error: any = new Error(
        `A bill request is already active for this order. Waitstaff has already been dispatched to Table ${order.tableId}.`
      );
      error.statusCode = 409;
      error.code = 'BILL_ALREADY_REQUESTED';
      throw error;
    }

    const isSettled = Boolean(input.autoSettle);
    const paymentMethod = input.paymentMethodPreference || existing?.paymentMethodPreference || 'CARD';
    const billSlipType = input.billSlipType || existing?.billSlipType || 'PHYSICAL';
    const customerPhone = input.customerPhone || existing?.customerPhone;

    // 3. Create or update Bill Request
    let saved: BillRequest;
    if (existing) {
      await this.billRepo.updateStatus(existing.id, isSettled ? 'SETTLED' : 'REQUESTED');
      saved = {
        ...existing,
        status: isSettled ? 'SETTLED' : 'REQUESTED',
        totalAmount: order.total,
        paymentMethodPreference: paymentMethod,
        billSlipType,
        customerPhone,
      };
    } else {
      const billRequest: BillRequest = {
        id: this.generateBillId(),
        orderId: order.id,
        tableId: order.tableId,
        totalAmount: order.total,
        paymentMethodPreference: paymentMethod,
        billSlipType: billSlipType,
        customerPhone: customerPhone,
        status: isSettled ? 'SETTLED' : 'REQUESTED',
        requestedAt: new Date().toISOString(),
      };
      saved = await this.billRepo.create(billRequest);
    }

    // Update order with payment metadata
    order.billRequested = true;
    order.paymentMethod = paymentMethod;
    order.billSlipType = billSlipType;
    if (customerPhone) order.customerPhone = customerPhone;

    if (isSettled) {
      order.status = 'Completed';
      order.settledAt = new Date().toISOString();
    }
    await this.orderRepo.update(order);

    return {
      billRequest: saved,
      order,
      tableCleared: isSettled,
      message: isSettled
        ? `Payment processed (${paymentMethod}). Table ${order.tableId} is now cleared for next seating.`
        : `Staff has been notified for ${billSlipType} bill. A server will attend Table ${order.tableId} shortly.`,
    };
  }

  async settleOrder(orderId: string) {
    return this.requestBill(orderId, { autoSettle: true });
  }

  async getBillRequestByOrderId(orderId: string) {
    return this.billRepo.findByOrderId(orderId);
  }

  async getAllBillRequests() {
    return this.billRepo.findAll();
  }
}
