import { IMenuRepository } from '../interfaces.js';
import { MenuCategory, MenuItem } from '../../types/index.js';
import { seedCategories, seedMenuItems } from '../../data/seed.js';

export class InMemoryMenuRepository implements IMenuRepository {
  private categories: MenuCategory[] = [...seedCategories];
  private items: MenuItem[] = [...seedMenuItems];

  async getCategories(): Promise<MenuCategory[]> {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getAllItems(): Promise<MenuItem[]> {
    return this.items.map((i) => ({ ...i }));
  }

  async getItemById(id: string): Promise<MenuItem | null> {
    const item = this.items.find((i) => i.id === id);
    return item ? { ...item } : null;
  }

  async getItemsByIds(ids: string[]): Promise<MenuItem[]> {
    const set = new Set(ids);
    return this.items.filter((i) => set.has(i.id)).map((i) => ({ ...i }));
  }

  async updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...updates };
    return { ...this.items[idx] };
  }
}

