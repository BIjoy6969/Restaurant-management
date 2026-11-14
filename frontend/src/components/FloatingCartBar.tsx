import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  currency: string;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ currency }) => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40 animate-slideUp">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-stone-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-amber-500/40"
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-amber-600 text-white">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-stone-900 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-stone-900">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[11px] text-amber-200 block font-medium">Order Subtotal</span>
            <span className="font-serif text-base font-bold">{currency}{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 pr-2">
          <span>Review Order</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};

