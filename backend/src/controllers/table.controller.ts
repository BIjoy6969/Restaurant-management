import { Request, Response, NextFunction } from 'express';
import { TableService } from '../services/table.service.js';

export class TableController {
  constructor(private tableService: TableService) {}

  getTableMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tableId } = req.params;
      const data = await this.tableService.getTableMenu(tableId);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getAllTables = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tables = await this.tableService.getAllTables();
      res.status(200).json({
        success: true,
        data: tables,
      });
    } catch (err) {
      next(err);
    }
  };
}

