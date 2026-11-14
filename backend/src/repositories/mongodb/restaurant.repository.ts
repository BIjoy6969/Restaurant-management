import { IRestaurantRepository } from '../interfaces';
import { Restaurant } from '../../types';
import { RestaurantModel } from '../../models';
import { seedRestaurant } from '../../data/seed';

export class MongoRestaurantRepository implements IRestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    const doc = await RestaurantModel.findOne().lean();
    if (!doc) {
      return seedRestaurant;
    }
    return {
      id: doc.id,
      name: doc.name,
      tagline: doc.tagline,
      currency: doc.currency,
      taxRate: doc.taxRate,
      status: doc.status
    };
  }
}
