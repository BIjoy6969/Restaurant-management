import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'restaurant_demo_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore local storage quota errors
    }
  }, [items]);

  const addItem = (item: MenuItem, quantity: number = 1, instructions?: string) => {
    if (!item.isAvailable || quantity < 1) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.item.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, 50),
          specialInstructions: instructions !== undefined ? instructions : next[existingIndex].specialInstructions,
        };
        return next;
      }
      return [...prev, { item, quantity, specialInstructions: instructions }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: Math.min(quantity, 50) } : ci))
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateInstructions = (itemId: string, instructions: string) => {
    setItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, specialInstructions: instructions } : ci))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const found = items.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.item.price * item.quantity, 0) * 100
  ) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        updateInstructions,
        clearCart,
        getItemQuantity,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

