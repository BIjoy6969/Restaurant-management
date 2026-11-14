import { IOrderRepository, IMenuRepository, ITableRepository, IRestaurantRepository } from '../repositories/interfaces';
import { CreateOrderInput, AddItemsToOrderInput } from '../validators/order.validator';
import { Order, OrderItem, DailySalesSummary, MenuItem } from '../types';

export class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private menuRepo: IMenuRepository,
    private tableRepo: ITableRepository,
    private restaurantRepo: IRestaurantRepository
  ) {}

  private resolveStation(catalogItem: MenuItem): 'KITCHEN' | 'BAR' | 'WAITER_FLOOR' {
    if (catalogItem.station) return catalogItem.station;
    const nameLower = catalogItem.name.toLowerCase();
    const descLower = (catalogItem.description || '').toLowerCase();
    if (nameLower.includes('water') || nameLower.includes('bottle') || descLower.includes('water') || catalogItem.categoryId === 'cat_drinks') {
      return 'WAITER_FLOOR';
    }
    return 'KITCHEN';
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private generateOrderId(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `ORD-${dateStr}-${randomHex}`;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. Verify Table
    const table = await this.tableRepo.findById(input.tableId);
    if (!table) {
      const error: any = new Error(`Table '${input.tableId}' is invalid or not registered.`);
      error.statusCode = 404;
      error.code = 'TABLE_NOT_FOUND';
      throw error;
    }

    // Auto-consolidate: If this table already has an active running session, append to it
    const existingActive = await this.getActiveOrderByTable(table.id);
    if (existingActive) {
      return this.addItemsToOrder(existingActive.id, { items: input.items });
    }

    // 2. Fetch Restaurant configuration for tax calculation
    const restaurant = await this.restaurantRepo.getRestaurant();

    // 3. Query all requested items from authoritative server catalog
    const itemIds = input.items.map((i) => i.menuItemId);
    const catalogItems = await this.menuRepo.getItemsByIds(itemIds);
    const catalogItemMap = new Map(catalogItems.map((item) => [item.id, item]));

    // 4. Validate existence & availability, calculate server-side line totals
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    const now = new Date().toISOString();

    for (const reqItem of input.items) {
      const catalogItem = catalogItemMap.get(reqItem.menuItemId);
      if (!catalogItem) {
        const error: any = new Error(`Menu item '${reqItem.menuItemId}' does not exist.`);
        error.statusCode = 404;
        error.code = 'ITEM_NOT_FOUND';
        throw error;
      }

      if (!catalogItem.isAvailable) {
        const error: any = new Error(`'${catalogItem.name}' is currently sold out and unavailable.`);
        error.statusCode = 422;
        error.code = 'ITEM_UNAVAILABLE';
        throw error;
      }

      const unitPrice = catalogItem.price;
      const lineTotal = this.roundCurrency(unitPrice * reqItem.quantity);
      subtotal = this.roundCurrency(subtotal + lineTotal);

      orderItems.push({
        menuItemId: catalogItem.id,
        itemNameSnapshot: catalogItem.name,
        unitPriceSnapshot: unitPrice,
        quantity: reqItem.quantity,
        lineTotal,
        specialInstructions: reqItem.specialInstructions?.trim() || undefined,
        round: 1,
        addedAt: now,
        station: this.resolveStation(catalogItem)
      });
    }

    const tax = this.roundCurrency(subtotal * restaurant.taxRate);
    const total = this.roundCurrency(subtotal + tax);
    const orderId = this.generateOrderId();

    const order: Order = {
      id: orderId,
      restaurantId: restaurant.id,
      tableId: table.id,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'Received',
      customerNote: input.customerNote?.trim() || undefined,
      customerPhone: input.customerPhone?.trim() || undefined,
      billRequested: false,
      createdAt: now,
      updatedAt: now,
    };

    return this.orderRepo.create(order);
  }

  async addItemsToOrder(orderId: string, input: AddItemsToOrderInput): Promise<Order> {
    const existingOrder = await this.orderRepo.findById(orderId);
    if (!existingOrder) {
      const error: any = new Error(`Order '${orderId}' not found.`);
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (existingOrder.status === 'Completed' || existingOrder.status === 'Cancelled') {
      const error: any = new Error(`Cannot add items to order '${orderId}' because its status is ${existingOrder.status}.`);
      error.statusCode = 400;
      error.code = 'ORDER_CLOSED';
      throw error;
    }

    const restaurant = await this.restaurantRepo.getRestaurant();
    const itemIds = input.items.map((i) => i.menuItemId);
    const catalogItems = await this.menuRepo.getItemsByIds(itemIds);
    const catalogItemMap = new Map(catalogItems.map((item) => [item.id, item]));

    // Determine next round number
    const currentMaxRound = existingOrder.items.reduce((max, it) => Math.max(max, it.round || 1), 1);
    const nextRound = currentMaxRound + 1;
    const now = new Date().toISOString();

    const newOrderItems: OrderItem[] = [];

    for (const reqItem of input.items) {
      const catalogItem = catalogItemMap.get(reqItem.menuItemId);
      if (!catalogItem) {
        const error: any = new Error(`Menu item '${reqItem.menuItemId}' does not exist.`);
        error.statusCode = 404;
        error.code = 'ITEM_NOT_FOUND';
        throw error;
      }

      if (!catalogItem.isAvailable) {
        const error: any = new Error(`'${catalogItem.name}' is currently sold out and unavailable.`);
        error.statusCode = 422;
        error.code = 'ITEM_UNAVAILABLE';
        throw error;
      }

      const unitPrice = catalogItem.price;
      const lineTotal = this.roundCurrency(unitPrice * reqItem.quantity);

      newOrderItems.push({
        menuItemId: catalogItem.id,
        itemNameSnapshot: catalogItem.name,
        unitPriceSnapshot: unitPrice,
        quantity: reqItem.quantity,
        lineTotal,
        specialInstructions: reqItem.specialInstructions?.trim() || undefined,
        round: nextRound,
        addedAt: now,
        station: this.resolveStation(catalogItem)
      });
    }

    // Append new items to existing items
    const combinedItems = [...existingOrder.items, ...newOrderItems];
    const newSubtotal = this.roundCurrency(
      combinedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );
    const newTax = this.roundCurrency(newSubtotal * restaurant.taxRate);
    const newTotal = this.roundCurrency(newSubtotal + newTax);

    existingOrder.items = combinedItems;
    existingOrder.subtotal = newSubtotal;
    existingOrder.tax = newTax;
    existingOrder.total = newTotal;
    existingOrder.billRequested = false;
    existingOrder.updatedAt = now;

    return this.orderRepo.update(existingOrder);
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      const error: any = new Error(`Order '${orderId}' was not found.`);
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }
    return order;
  }

  async getActiveOrderByTable(tableId: string): Promise<Order | null> {
    const orders = await this.orderRepo.findByTableId(tableId);
    const active = orders.find((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
    return active || null;
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    return this.orderRepo.findByTableId(tableId);
  }

  async getAllOrders(status?: string): Promise<Order[]> {
    const orders = await this.orderRepo.findAll();
    if (status && status !== 'ALL') {
      return orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }
    return orders;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const updated = await this.orderRepo.updateStatus(orderId, status);
    if (!updated) {
      const error: any = new Error(`Order '${orderId}' not found.`);
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }
    return updated;
  }

  async getDailySalesSummary(): Promise<DailySalesSummary> {
    const allOrders = await this.orderRepo.findAll();
    const tables = await this.tableRepo.findAll();
    const tableMap = new Map(tables.map(t => [t.id, t.tableNumber]));

    const todayDate = new Date().toISOString().slice(0, 10);
    // Filter today's orders (or all if in demo)
    const ordersToday = allOrders.filter(o => o.createdAt.startsWith(todayDate) || allOrders.length < 50);

    let totalRevenue = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;

    const formattedOrders = ordersToday.map(o => {
      const amount = o.total;
      totalRevenue = this.roundCurrency(totalRevenue + amount);

      if (o.paymentMethod === 'CASH') {
        cashRevenue = this.roundCurrency(cashRevenue + amount);
      } else {
        cardRevenue = this.roundCurrency(cardRevenue + amount);
      }

      // Format time: HH:MM AM/PM
      let timeFormatted = '';
      try {
        const d = new Date(o.createdAt);
        timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        timeFormatted = o.createdAt;
      }

      return {
        orderId: o.id,
        tableId: o.tableId,
        tableNumber: tableMap.get(o.tableId) || o.tableId,
        time: timeFormatted,
        totalAmount: amount,
        status: o.status,
        paymentMethod: o.paymentMethod || 'CARD',
        billSlipType: o.billSlipType || 'PHYSICAL',
        customerPhone: o.customerPhone,
        itemsCount: o.items.reduce((acc, it) => acc + it.quantity, 0)
      };
    });

    return {
      date: todayDate,
      totalOrders: formattedOrders.length,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      orders: formattedOrders
    };
  }
}
