import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { tableId, restaurantId, customerName, customerPhone, rating, foodRating, serviceRating, ambianceRating, tags, comment } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Order ID is required.' }
        });
      }

      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Rating must be a number between 1 and 5.' }
        });
      }

      const review = await this.reviewService.submitReview({
        orderId,
        tableId: tableId || req.body.table,
        restaurantId,
        customerName,
        customerPhone,
        rating,
        foodRating,
        serviceRating,
        ambianceRating,
        tags,
        comment
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
