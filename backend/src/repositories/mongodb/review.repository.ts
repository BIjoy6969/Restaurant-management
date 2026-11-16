import { IReviewRepository } from '../interfaces';
import { Review, ReviewStats } from '../../types';
import { ReviewModel } from '../../models';

export class MongoReviewRepository implements IReviewRepository {
  async create(review: Review): Promise<Review> {
    await ReviewModel.findOneAndUpdate(
      { $or: [{ id: review.id }, { orderId: review.orderId }] },
      { $set: review },
      { upsert: true, new: true }
    );
    return review;
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    const doc = await ReviewModel.findOne({ orderId: new RegExp(`^${orderId}$`, 'i') }).lean();
    if (!doc) return null;
    return this.mapDoc(doc);
  }

  async findAll(): Promise<Review[]> {
    const docs = await ReviewModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.mapDoc(d));
  }

  async getStats(): Promise<ReviewStats> {
    const docs = await ReviewModel.find().lean();
    const totalReviews = docs.length;
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

    for (const r of docs) {
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

  private mapDoc(doc: any): Review {
    return {
      id: doc.id,
      orderId: doc.orderId,
      tableId: doc.tableId,
      restaurantId: doc.restaurantId,
      customerName: doc.customerName,
      customerPhone: doc.customerPhone,
      rating: doc.rating,
      foodRating: doc.foodRating,
      serviceRating: doc.serviceRating,
      ambianceRating: doc.ambianceRating,
      tags: doc.tags || [],
      comment: doc.comment,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt
    };
  }
}
