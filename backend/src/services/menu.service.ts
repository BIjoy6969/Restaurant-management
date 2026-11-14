import { IMenuRepository } from '../repositories/interfaces.js';

export class MenuService {
  constructor(private menuRepo: IMenuRepository) {}

  async getItemById(itemId: string) {
    const item = await this.menuRepo.getItemById(itemId);
    if (!item) {
      const error: any = new Error(`Menu item '${itemId}' was not found.`);
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }
    return item;
  }

  async getAllItems() {
    return this.menuRepo.getAllItems();
  }

  async updateItem(id: string, updates: Partial<any>) {
    const updated = await this.menuRepo.updateItem(id, updates);
    if (!updated) {
      const error: any = new Error(`Item '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }
    return updated;
  }
}

