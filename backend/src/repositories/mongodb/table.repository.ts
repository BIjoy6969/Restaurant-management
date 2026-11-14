import { ITableRepository } from '../interfaces';
import { Table } from '../../types';
import { TableModel } from '../../models';
import { seedTables } from '../../data/seed';

export class MongoTableRepository implements ITableRepository {
  async findById(id: string): Promise<Table | null> {
    const doc = await TableModel.findOne({ id: new RegExp(`^${id}$`, 'i') }).lean();
    if (!doc) {
      // Fallback to seed in case not seeded yet
      return seedTables.find(t => t.id.toLowerCase() === id.toLowerCase()) || null;
    }
    return {
      id: doc.id,
      restaurantId: doc.restaurantId,
      tableNumber: doc.tableNumber,
      area: doc.area,
      capacity: doc.capacity,
      status: doc.status
    };
  }

  async findAll(): Promise<Table[]> {
    const docs = await TableModel.find().sort({ tableNumber: 1 }).lean();
    if (!docs || docs.length === 0) {
      return seedTables;
    }
    return docs.map(doc => ({
      id: doc.id,
      restaurantId: doc.restaurantId,
      tableNumber: doc.tableNumber,
      area: doc.area,
      capacity: doc.capacity,
      status: doc.status
    }));
  }
}
