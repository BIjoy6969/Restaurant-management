import { IRestaurantRepository } from '../interfaces.js';
import { Restaurant } from '../../types/index.js';
import { seedRestaurant } from '../../data/seed.js';

export class InMemoryRestaurantRepository implements IRestaurantRepository {
  private restaurant: Restaurant = { ...seedRestaurant };

  async getRestaurant(): Promise<Restaurant> {
    return { ...this.restaurant };
  }
}

