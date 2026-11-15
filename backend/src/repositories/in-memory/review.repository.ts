import { IReviewRepository } from '../interfaces.js';
import { Review, ReviewStats } from '../../types/index.js';

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews: Map<string, Review> = new Map();

  constructor(initialReviews: Review[] = []) {
    initialReviews.forEach((r) => this.reviews.set(r.id, { ...r }));
  }

  async create(review: Review): Promise<Review> {
    const clone = { ...review };
    this.reviews.set(review.id, clone);
    return { ...clone };
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    for (const rev of this.reviews.values()) {
      if (rev.orderId === orderId) {
        return { ...rev };
      }
    }
    return null;
  }

  async findAll(): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => ({ ...r }));
  }

  async getStats(): Promise<ReviewStats> {
    const all = Array.from(this.reviews.values());
    const totalReviews = all.length;
    if (totalReviews === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        foodAverage: 5.0,
        serviceAverage: 5.0,
        ambianceAverage: 5.0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumTotal = 0;
    let sumFood = 0;
    let sumService = 0;
    let sumAmbiance = 0;

    for (const r of all) {
      sumTotal += r.rating;
      sumFood += r.foodRating || r.rating;
      sumService += r.serviceRating || r.rating;
      sumAmbiance += r.ambianceRating || r.rating;
      const rounded = Math.round(r.rating);
      if (dist[rounded] !== undefined) {
        dist[rounded]++;
      }
    }

    return {
      averageRating: Number((sumTotal / totalReviews).toFixed(1)),
      totalReviews,
      foodAverage: Number((sumFood / totalReviews).toFixed(1)),
      serviceAverage: Number((sumService / totalReviews).toFixed(1)),
      ambianceAverage: Number((sumAmbiance / totalReviews).toFixed(1)),
      ratingDistribution: dist
    };
  }
}
