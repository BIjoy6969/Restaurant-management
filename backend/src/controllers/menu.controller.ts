import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service.js';

export class MenuController {
  constructor(private menuService: MenuService) {}

  getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const item = await this.menuService.getItemById(itemId);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateItemAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const { isAvailable, price } = req.body;
      const updates: any = {};
      if (typeof isAvailable === 'boolean') updates.isAvailable = isAvailable;
      if (typeof price === 'number') updates.price = price;

      const item = await this.menuService.updateItem(itemId, updates);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };
}

