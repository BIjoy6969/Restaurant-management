import { Request, Response, NextFunction } from 'express';
import { BillRequestService } from '../services/bill-request.service.js';
import { billRequestSchema } from '../validators/order.validator.js';

export class BillRequestController {
  constructor(private billService: BillRequestService) {}

  requestBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const parsed = billRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid bill request data.',
          },
        });
      }

      const result = await this.billService.requestBill(orderId, parsed.data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  settleOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const result = await this.billService.settleOrder(orderId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getAllBills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bills = await this.billService.getAllBillRequests();
      res.status(200).json({
        success: true,
        data: {
          bills,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

