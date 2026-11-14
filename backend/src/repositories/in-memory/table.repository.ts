import { ITableRepository } from '../interfaces.js';
import { Table } from '../../types/index.js';
import { seedTables } from '../../data/seed.js';

export class InMemoryTableRepository implements ITableRepository {
  private tables: Table[] = [...seedTables];

  async findById(id: string): Promise<Table | null> {
    const table = this.tables.find((t) => t.id.toLowerCase() === id.toLowerCase());
    return table ? { ...table } : null;
  }

  async findAll(): Promise<Table[]> {
    return this.tables.map((t) => ({ ...t }));
  }
}

