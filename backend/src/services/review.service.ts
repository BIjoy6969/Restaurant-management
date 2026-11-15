import { IReviewRepository, IOrderRepository } from '../repositories/interfaces.js';
import { Review, ReviewStats } from '../types/index.js';

export class ReviewService {
  constructor(
    private reviewRepo: IReviewRepository,
    private orderRepo: IOrderRepository
  ) {}

  async submitReview(data: {
    orderId: string;
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
  }): Promise<Review> {
    const existing = await this.reviewRepo.findByOrderId(data.orderId);
    if (existing) {
      // Return existing review if already submitted
      return existing;
    }

    const order = await this.orderRepo.findById(data.orderId);

    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: data.orderId,
      tableId: data.tableId || (order ? order.tableId : 'T01'),
      restaurantId: data.restaurantId || (order ? order.restaurantId : 'rest_breakroom_01'),
      customerName: data.customerName?.trim() || 'Guest Diner',
      customerPhone: data.customerPhone?.trim() || (order ? order.customerPhone : undefined),
      rating: Math.max(1, Math.min(5, Math.round(data.rating))),
      foodRating: Math.max(1, Math.min(5, Math.round(data.foodRating || data.rating))),
      serviceRating: Math.max(1, Math.min(5, Math.round(data.serviceRating || data.rating))),
      ambianceRating: Math.max(1, Math.min(5, Math.round(data.ambianceRating || data.rating))),
      tags: Array.isArray(data.tags) ? data.tags : [],
      comment: data.comment?.trim() || '',
      createdAt: new Date().toISOString()
    };

    return this.reviewRepo.create(review);
  }

  async getReviewByOrderId(orderId: string): Promise<Review | null> {
    return this.reviewRepo.findByOrderId(orderId);
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviewRepo.findAll();
  }

  async getStats(): Promise<ReviewStats> {
    return this.reviewRepo.getStats();
  }
}
