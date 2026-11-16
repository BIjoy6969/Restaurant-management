import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = req.params.orderId || req.body.orderId || `ord_${Date.now()}`;
      const { tableId, restaurantId, customerName, customerPhone, rating, foodRating, serviceRating, ambianceRating, tags, comment } = req.body;

      const numRating = Number(rating) || 5;
      const validRating = Math.max(1, Math.min(5, Math.round(numRating)));

      const review = await this.reviewService.submitReview({
        orderId,
        tableId: tableId || req.body.table || 'T01',
        restaurantId: restaurantId || 'rest_breakroom_01',
        customerName: typeof customerName === 'string' ? customerName.trim() : undefined,
        customerPhone: typeof customerPhone === 'string' ? customerPhone.trim() : undefined,
        rating: validRating,
        foodRating: foodRating ? Math.max(1, Math.min(5, Math.round(Number(foodRating)))) : validRating,
        serviceRating: serviceRating ? Math.max(1, Math.min(5, Math.round(Number(serviceRating)))) : validRating,
        ambianceRating: ambianceRating ? Math.max(1, Math.min(5, Math.round(Number(ambianceRating)))) : validRating,
        tags: Array.isArray(tags) ? tags : [],
        comment: typeof comment === 'string' ? comment.trim() : ''
      });

      res.status(201).json({
        success: true,
        data: { review }
      });
    } catch (err) {
      next(err);
    }
  };

  getReviewByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const review = await this.reviewService.getReviewByOrderId(orderId);
      res.status(200).json({
        success: true,
        data: { review }
      });
    } catch (err) {
      next(err);
    }
  };

  getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.reviewService.getAllReviews();
      res.status(200).json({
        success: true,
        data: { reviews }
      });
    } catch (err) {
      next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.reviewService.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  };
}
