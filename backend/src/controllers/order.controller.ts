import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema, addItemsToOrderSchema } from '../validators/order.validator';

export class OrderController {
  constructor(private orderService: OrderService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid order data.',
            details: parsed.error.issues,
          },
        });
      }

      const order = await this.orderService.createOrder(parsed.data);
      res.status(201).json({
        success: true,
        data: {
          order,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  addItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const parsed = addItemsToOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid items data.',
            details: parsed.error.issues,
          },
        });
      }

      const order = await this.orderService.addItemsToOrder(orderId, parsed.data);
      res.status(200).json({
        success: true,
        data: {
          order,
          message: 'Additional items successfully added to running bill.',
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const order = await this.orderService.getOrderById(orderId);
      res.status(200).json({
        success: true,
        data: {
          order,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getActiveOrderByTable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tableId } = req.params;
      const order = await this.orderService.getActiveOrderByTable(tableId);
      res.status(200).json({
        success: true,
        data: {
          order,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const orders = await this.orderService.getAllOrders(status as string);
      res.status(200).json({
        success: true,
        data: {
          orders,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getDailySales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.orderService.getDailySalesSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const order = await this.orderService.updateOrderStatus(orderId, status);
      res.status(200).json({
        success: true,
        data: {
          order,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
