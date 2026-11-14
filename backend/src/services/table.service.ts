import { ITableRepository, IRestaurantRepository, IMenuRepository } from '../repositories/interfaces.js';

export class TableService {
  constructor(
    private tableRepo: ITableRepository,
    private restaurantRepo: IRestaurantRepository,
    private menuRepo: IMenuRepository
  ) {}

  async getTableMenu(tableId: string) {
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      const error: any = new Error(`Table '${tableId}' is not registered or unavailable.`);
      error.statusCode = 404;
      error.code = 'TABLE_NOT_FOUND';
      throw error;
    }

    const restaurant = await this.restaurantRepo.getRestaurant();
    const categories = await this.menuRepo.getCategories();
    const items = await this.menuRepo.getAllItems();

    return {
      restaurant,
      table,
      categories,
      items,
    };
  }

  async getAllTables() {
    return this.tableRepo.findAll();
  }
}

