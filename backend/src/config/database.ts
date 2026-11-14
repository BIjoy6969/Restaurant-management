import mongoose from 'mongoose';
import { RestaurantModel, TableModel, MenuItemModel } from '../models/index.js';
import { seedRestaurant, seedTables, seedMenuItems } from '../data/seed.js';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[Database] MONGODB_URI not configured. Operating without database.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[Database] Connected successfully to MongoDB Atlas.');

    // Always ensure The Break Room branding, tables, and menu items are up to date
    await RestaurantModel.deleteMany({});
    await RestaurantModel.create(seedRestaurant);

    await TableModel.deleteMany({});
    await TableModel.insertMany(seedTables);

    await MenuItemModel.deleteMany({});
    await MenuItemModel.insertMany(seedMenuItems);

    console.log('[Database] The Break Room catalog and tables ready in MongoDB Atlas.');
  } catch (error) {
    console.error('[Database] Failed to connect or seed MongoDB:', error);
  }
}
