import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app.js';

describe('Restaurant QR Ordering API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('1. Health Check', () => {
    it('GET /api/health should return 200 OK and system metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(typeof res.body.data.uptimeSeconds).toBe('number');
      expect(typeof res.body.data.version).toBe('string');
    });
  });

  describe('2. Table & Menu Endpoints', () => {
    it('GET /api/tables/:tableId/menu with valid table (T01) should return catalog & table info', async () => {
      const res = await request(app).get('/api/tables/T01/menu');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurant.name).toBe("L'Aura Bistro & Bar");
      expect(res.body.data.table.id).toBe('T01');
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('GET /api/tables/:tableId/menu with invalid table (T999) should return 404 TABLE_NOT_FOUND', async () => {
      const res = await request(app).get('/api/tables/T999/menu');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TABLE_NOT_FOUND');
    });

    it('GET /api/menu/items/:itemId should return item details', async () => {
      const res = await request(app).get('/api/menu/items/item_truffle_fries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Parmesan Truffle Fries');
      expect(res.body.data.price).toBe(11.5);
    });

    it('GET /api/menu/items/:itemId with invalid item should return 404 ITEM_NOT_FOUND', async () => {
      const res = await request(app).get('/api/menu/items/non_existent_item');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ITEM_NOT_FOUND');
    });
  });

  describe('3. Order Validation & Server-Side Pricing', () => {
    it('POST /api/orders should reject empty items array with 400 VALIDATION_ERROR', async () => {
      const res = await request(app).post('/api/orders').send({
        tableId: 'T01',
        items: [],
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/orders should reject invalid quantities (<= 0) with 400', async () => {
      const res = await request(app).post('/api/orders').send({
        tableId: 'T01',
        items: [
          {
            menuItemId: 'item_truffle_fries',
            quantity: 0,
          },
        ],
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/orders should reject non-existent menu items with 404 ITEM_NOT_FOUND', async () => {
      const res = await request(app).post('/api/orders').send({
        tableId: 'T01',
        items: [
          {
            menuItemId: 'ghost_dish_xyz',
            quantity: 1,
          },
        ],
      });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ITEM_NOT_FOUND');
    });

    it('POST /api/orders should reject sold-out / unavailable item with 422 ITEM_UNAVAILABLE', async () => {
      const res = await request(app).post('/api/orders').send({
        tableId: 'T01',
        items: [
          {
            menuItemId: 'item_salmon_tartare', // Marked isAvailable: false in seed
            quantity: 1,
          },
        ],
      });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ITEM_UNAVAILABLE');
    });

    it('POST /api/orders must ignore client-tampered prices and calculate authoritative totals', async () => {
      // Truffle fries is 11.50, Wagyu burger is 23.50.
      // 2 * 11.50 = 23.00, 1 * 23.50 = 23.50 -> Subtotal = 46.50
      // 5% tax = 46.50 * 0.05 = 2.325 -> 2.33
      // Total = 48.83
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableId: 'T01',
          // Malicious client tries to send fake price $1.00
          items: [
            {
              menuItemId: 'item_truffle_fries',
              quantity: 2,
              price: 1.0, // Client attempt to tamper
              lineTotal: 2.0,
            },
            {
              menuItemId: 'item_wagyu_burger',
              quantity: 1,
              price: 0.5, // Client attempt to tamper
              lineTotal: 0.5,
            },
          ],
          subtotal: 2.5,
          total: 2.62,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const order = res.body.data.order;
      expect(order.id).toMatch(/^ORD-\d{8}-\d{4}$/);
      expect(order.tableId).toBe('T01');
      expect(order.items[0].unitPriceSnapshot).toBe(11.5);
      expect(order.items[0].lineTotal).toBe(23.0);
      expect(order.items[1].unitPriceSnapshot).toBe(23.5);
      expect(order.items[1].lineTotal).toBe(23.5);
      expect(order.subtotal).toBe(46.5);
      expect(order.tax).toBe(2.33);
      expect(order.total).toBe(48.83);
      expect(order.status).toBe('Received');
    });
  });

  describe('4. Order Details & Bill Request Lifecycle', () => {
    let createdOrderId: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/orders').send({
        tableId: 'T02',
        items: [{ menuItemId: 'item_burrata', quantity: 2 }],
      });
      createdOrderId = res.body.data.order.id;
    });

    it('GET /api/orders/:orderId should retrieve submitted order details', async () => {
      const res = await request(app).get(`/api/orders/${createdOrderId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.id).toBe(createdOrderId);
      expect(res.body.data.order.tableId).toBe('T02');
      expect(res.body.data.order.billRequested).toBe(false);
    });

    it('GET /api/orders/:orderId with non-existent ID should return 404', async () => {
      const res = await request(app).get('/api/orders/ORD-NONEXISTENT');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    });

    it('POST /api/orders/:orderId/bill-request should successfully record bill request', async () => {
      const res = await request(app)
        .post(`/api/orders/${createdOrderId}/bill-request`)
        .send({ paymentMethodPreference: 'CARD' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.billRequest.orderId).toBe(createdOrderId);
      expect(res.body.data.billRequest.tableId).toBe('T02');
      expect(res.body.data.billRequest.status).toBe('REQUESTED');
      expect(res.body.data.billRequest.paymentMethodPreference).toBe('CARD');

      // Check order now reflects billRequested: true
      const orderCheck = await request(app).get(`/api/orders/${createdOrderId}`);
      expect(orderCheck.body.data.order.billRequested).toBe(true);
    });

    it('POST /api/orders/:orderId/bill-request second time should reject duplicate with 409 Conflict', async () => {
      const res = await request(app)
        .post(`/api/orders/${createdOrderId}/bill-request`)
        .send({ paymentMethodPreference: 'CASH' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BILL_ALREADY_REQUESTED');
    });

    it('POST /api/orders/:orderId/bill-request on invalid order should return 404', async () => {
      const res = await request(app).post('/api/orders/ORD-FAKE-ID/bill-request').send({});
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('5. Table Session: Add Additional Items to Running Bill', () => {
    let sessionOrderId: string;

    beforeAll(async () => {
      // Create initial order: 1x Truffle Fries ($11.50)
      const res = await request(app).post('/api/orders').send({
        tableId: 'T03',
        items: [{ menuItemId: 'item_truffle_fries', quantity: 1 }],
      });
      sessionOrderId = res.body.data.order.id;
    });

    it('GET /api/tables/:tableId/active-order should retrieve the running order', async () => {
      const res = await request(app).get('/api/tables/T03/active-order');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.id).toBe(sessionOrderId);
      expect(res.body.data.order.items.length).toBe(1);
    });

    it('POST /api/orders/:orderId/items should append new items to existing running bill', async () => {
      // Add Round 2: 1x Wagyu Burger ($23.50)
      // New subtotal: 11.50 + 23.50 = 35.00
      // 5% tax = 1.75
      // Total = 36.75
      const res = await request(app)
        .post(`/api/orders/${sessionOrderId}/items`)
        .send({
          items: [{ menuItemId: 'item_wagyu_burger', quantity: 1, specialInstructions: 'Medium rare' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updated = res.body.data.order;
      expect(updated.items.length).toBe(2);
      expect(updated.items[0].round).toBe(1);
      expect(updated.items[1].round).toBe(2);
      expect(updated.items[1].specialInstructions).toBe('Medium rare');
      expect(updated.subtotal).toBe(35.0);
      expect(updated.tax).toBe(1.75);
      expect(updated.total).toBe(36.75);
    });

    it('POST /api/orders/:orderId/settle should complete order and free table for new seating', async () => {
      const res = await request(app).post(`/api/orders/${sessionOrderId}/settle`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tableCleared).toBe(true);
      expect(res.body.data.order.status).toBe('Completed');

      // Now check active table order: should be null (table cleared!)
      const tableCheck = await request(app).get('/api/tables/T03/active-order');
      expect(tableCheck.status).toBe(200);
      expect(tableCheck.body.data.order).toBeNull();
    });
  });

  describe('6. Five-Role Architecture & Manager Daily Sales QA Tests', () => {
    let testOrderId: string;

    it('POST /api/orders should assign station tagging to items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableId: 'T01',
          items: [
            { menuItemId: 'item_truffle_fries', quantity: 1 }
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testOrderId = res.body.data.order.id;
      expect(res.body.data.order.items[0].station).toBe('KITCHEN');
    });

    it('POST /api/orders/:orderId/bill-request with DIGITAL slip should capture customerPhone', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/bill-request`)
        .send({
          paymentMethodPreference: 'CARD',
          billSlipType: 'DIGITAL',
          customerPhone: '+8801700000000',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.billRequest.billSlipType).toBe('DIGITAL');
      expect(res.body.data.billRequest.customerPhone).toBe('+8801700000000');
      expect(res.body.data.order.customerPhone).toBe('+8801700000000');
      expect(res.body.data.order.billSlipType).toBe('DIGITAL');
    });

    it('GET /api/orders/sales/daily should return manager revenue summary and table order list', async () => {
      const res = await request(app).get('/api/orders/sales/daily');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalOrders');
      expect(res.body.data).toHaveProperty('totalRevenue');
      expect(res.body.data).toHaveProperty('cashRevenue');
      expect(res.body.data).toHaveProperty('cardRevenue');
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);

      // Verify clean presentation for manager overview (table, time, amount, status)
      const orderEntry = res.body.data.orders[0];
      expect(orderEntry).toHaveProperty('orderId');
      expect(orderEntry).toHaveProperty('tableNumber');
      expect(orderEntry).toHaveProperty('time');
      expect(orderEntry).toHaveProperty('totalAmount');
      expect(orderEntry).toHaveProperty('status');
    });
  });
});

