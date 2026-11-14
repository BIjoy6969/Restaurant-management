import { IMenuRepository } from '../interfaces';
import { MenuItem, MenuCategory } from '../../types';
import { MenuItemModel } from '../../models';
import { seedCategories, seedMenuItems } from '../../data/seed';

export class MongoMenuRepository implements IMenuRepository {
  async getCategories(): Promise<MenuCategory[]> {
    return seedCategories;
  }

  async getAllItems(): Promise<MenuItem[]> {
    const docs = await MenuItemModel.find().lean();
    if (!docs || docs.length === 0) {
      return seedMenuItems;
    }
    return docs.map(d => ({
      id: d.id,
      restaurantId: d.restaurantId,
      categoryId: d.categoryId,
      name: d.name,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      isAvailable: d.isAvailable,
      dietary: d.dietary,
      prepTimeMinutes: d.prepTimeMinutes,
      calories: d.calories,
      station: (d.station as any) || 'KITCHEN'
    }));
  }

  async getItemById(id: string): Promise<MenuItem | null> {
    const doc = await MenuItemModel.findOne({ id }).lean();
    if (!doc) {
      const fallback = seedMenuItems.find(i => i.id === id);
      return fallback || null;
    }
    return {
      id: doc.id,
      restaurantId: doc.restaurantId,
      categoryId: doc.categoryId,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl,
      isAvailable: doc.isAvailable,
      dietary: doc.dietary,
      prepTimeMinutes: doc.prepTimeMinutes,
      calories: doc.calories,
      station: (doc.station as any) || 'KITCHEN'
    };
  }

  async getItemsByIds(ids: string[]): Promise<MenuItem[]> {
    const docs = await MenuItemModel.find({ id: { $in: ids } }).lean();
    if (!docs || docs.length === 0) {
      return seedMenuItems.filter(i => ids.includes(i.id));
    }
    return docs.map(doc => ({
      id: doc.id,
      restaurantId: doc.restaurantId,
      categoryId: doc.categoryId,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl,
      isAvailable: doc.isAvailable,
      dietary: doc.dietary,
      prepTimeMinutes: doc.prepTimeMinutes,
      calories: doc.calories,
      station: (doc.station as any) || 'KITCHEN'
    }));
  }

  async updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const doc = await MenuItemModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      restaurantId: doc.restaurantId,
      categoryId: doc.categoryId,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl,
      isAvailable: doc.isAvailable,
      dietary: doc.dietary,
      prepTimeMinutes: doc.prepTimeMinutes,
      calories: doc.calories,
      station: (doc.station as any) || 'KITCHEN'
    };
  }
}
