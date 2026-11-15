import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  currency: string;
  hasActiveOrder?: boolean;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ currency, hasActiveOrder = false }) => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div
      className={`fixed left-4 right-4 z-40 animate-slideUp transition-all duration-300 ${
        hasActiveOrder
          ? 'bottom-4 sm:bottom-24 sm:left-auto sm:right-6 sm:w-84'
          : 'bottom-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-84'
      }`}
    >
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-stone-900/95 hover:bg-stone-850 active:bg-stone-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-amber-500/50 backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-amber-600 text-white shadow-md">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-stone-900 text-[11px] font-black rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xs">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200/80 block">
              Cart Subtotal
            </span>
            <span className="font-serif text-base font-bold text-amber-100">
              {currency}{subtotal.toFixed(2)}
            </span>
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

