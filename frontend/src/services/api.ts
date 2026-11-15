import { TableMenuResponse, Order, BillRequest, DailySalesSummary, BillSlipType, Review, ReviewStats } from '../types';

const normalizeApiUrl = (url?: string): string => {
  let u = (url || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
  if (!u.endsWith('/api')) {
    u = `${u}/api`;
  }
  return u;
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('Failed to parse server response.', 'PARSE_ERROR', res.status);
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json.error?.message || 'Server error occurred.';
    const errorCode = json.error?.code || 'SERVER_ERROR';
    throw new ApiError(errorMsg, errorCode, res.status);
  }

  return json.data as T;
}

export const api = {
  async getTableMenu(tableId: string): Promise<TableMenuResponse> {
    const res = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableId)}/menu`);
    return handleResponse<TableMenuResponse>(res);
  },

  async getAllTables(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/tables`);
    return handleResponse<any[]>(res);
  },

  async submitOrder(payload: {
    tableId: string;
    items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
    customerNote?: string;
    customerPhone?: string;
  }): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ order: Order }>(res);
  },

  async addItemsToOrder(
    orderId: string,
    payload: {
      items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
    }
  ): Promise<{ order: Order; message: string }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async getActiveTableOrder(tableId: string): Promise<{ order: Order | null }> {
    const res = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableId)}/active-order`);
    return handleResponse<{ order: Order | null }>(res);
  },

  async getOrder(orderId: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`);
    return handleResponse<{ order: Order }>(res);
  },

  async getAllOrders(status?: string): Promise<{ orders: Order[] }> {
    const url = status && status !== 'ALL' ? `${API_BASE_URL}/orders?status=${status}` : `${API_BASE_URL}/orders`;
    const res = await fetch(url);
    return handleResponse<{ orders: Order[] }>(res);
  },

  async getDailySalesSummary(): Promise<DailySalesSummary> {
    const res = await fetch(`${API_BASE_URL}/orders/sales/daily`);
    return handleResponse<DailySalesSummary>(res);
  },

  async updateOrderStatus(orderId: string, status: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ order: Order }>(res);
  },

  async updateItemAvailability(itemId: string, isAvailable: boolean, price?: number): Promise<{ item: any }> {
    const res = await fetch(`${API_BASE_URL}/menu/items/${encodeURIComponent(itemId)}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable, price }),
    });
    return handleResponse<{ item: any }>(res);
  },

  async getAllBills(): Promise<{ bills: BillRequest[] }> {
    const res = await fetch(`${API_BASE_URL}/bills`);
    return handleResponse<{ bills: BillRequest[] }>(res);
  },

  async requestBill(
    orderId: string,
    preference: 'CASH' | 'CARD' = 'CARD',
    autoSettle: boolean = true,
    billSlipType: BillSlipType = 'PHYSICAL',
    customerPhone?: string
  ): Promise<{ billRequest: BillRequest; order?: Order; message: string; tableCleared?: boolean }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/bill-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethodPreference: preference, autoSettle, billSlipType, customerPhone }),
    });
    return handleResponse<{ billRequest: BillRequest; order?: Order; message: string; tableCleared?: boolean }>(res);
  },

  async settleOrder(
    orderId: string
  ): Promise<{ billRequest: BillRequest; order: Order; message: string; tableCleared: boolean }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<{ billRequest: BillRequest; order: Order; message: string; tableCleared: boolean }>(res);
  },

  async submitReview(
    orderId: string,
    data: {
      tableId: string;
      restaurantId?: string;
      customerName?: string;
      customerPhone?: string;
      rating: number;
      foodRating?: number;
      serviceRating?: number;
      ambianceRating?: number;
      tags?: string[];
      comment?: string;
    }
  ): Promise<{ review: Review }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ review: Review }>(res);
  },

  async getReviewByOrder(orderId: string): Promise<{ review: Review | null }> {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/review`);
    return handleResponse<{ review: Review | null }>(res);
  },

  async getAllReviews(): Promise<{ reviews: Review[] }> {
    const res = await fetch(`${API_BASE_URL}/reviews`);
    return handleResponse<{ reviews: Review[] }>(res);
  },

  async getReviewStats(): Promise<ReviewStats> {
    const res = await fetch(`${API_BASE_URL}/reviews/stats`);
    return handleResponse<ReviewStats>(res);
  },
};
