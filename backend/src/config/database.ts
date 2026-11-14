import mongoose from 'mongoose';
import { RestaurantModel, TableModel, MenuItemModel } from '../models';
import { seedRestaurant, seedTables, seedCategories, seedMenuItems } from '../data/seed';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[Database] MONGODB_URI not configured. Operating without database.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[Database] Connected successfully to MongoDB Atlas.');

    // Auto-seed initial catalog and tables if database is fresh
    const tableCount = await TableModel.countDocuments();
    if (tableCount === 0) {
      console.log('[Database] Seeding initial tables into MongoDB Atlas...');
      await TableModel.insertMany(seedTables);
    }

    const menuCount = await MenuItemModel.countDocuments();
    if (menuCount === 0) {
      console.log('[Database] Seeding initial menu items into MongoDB Atlas...');
      // Ensure station tagging is applied
      const itemsToSeed = seedMenuItems.map(item => {
        let station: 'KITCHEN' | 'BAR' | 'WAITER_FLOOR' = 'KITCHEN';
        if (item.categoryId === 'cat_drinks') {
          if (item.name.toLowerCase().includes('water') || item.name.toLowerCase().includes('bottle')) {
            station = 'WAITER_FLOOR';
          } else {
            station = 'BAR';
          }
        }
        return { ...item, station };
      });

      // Add Bottled Water & Sparkling Soda if not present
      itemsToSeed.push({
        id: 'item_spring_water',
        restaurantId: 'rest_laura_01',
        categoryId: 'cat_drinks',
        name: 'Acqua Panna Still Mineral Water (750ml)',
        description: 'Tuscan natural spring water, served chilled with lemon wedge option. Delivered directly by floor staff.',
        price: 5.00,
        imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ce4c8ff56?w=800&auto=format&fit=crop&q=80',
        isAvailable: true,
        dietary: ['Floor Direct', 'Chilled'],
        prepTimeMinutes: 1,
        station: 'WAITER_FLOOR'
      });

      await MenuItemModel.insertMany(itemsToSeed);
    }

    const restCount = await RestaurantModel.countDocuments();
    if (restCount === 0) {
      await RestaurantModel.create(seedRestaurant);
    }

    console.log('[Database] Database tables and catalog ready.');
  } catch (error) {
    console.error('[Database] Failed to connect or seed MongoDB:', error);
  }
}
