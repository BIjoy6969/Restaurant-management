import React from 'react';
import { QrCode, ShoppingBag } from 'lucide-react';
import { Restaurant, Table } from '../types';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  restaurant: Restaurant | null;
  table: Table | null;
  onOpenTableModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ restaurant, table, onOpenTableModal }) => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#121417]/95 backdrop-blur-md border-b border-amber-900/30 text-white transition-all shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-amber-700 flex items-center justify-center text-white shadow-inner font-serif font-bold text-lg">
            L
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {restaurant?.name || "L'Aura Bistro"}
            </h1>
            <p className="text-[11px] text-amber-200/70 hidden sm:block tracking-wide">
              {restaurant?.tagline || 'Artisanal Dining Experience'}
            </p>
          </div>
        </div>

        {/* Center / Table Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {table && (
            <button
              onClick={onOpenTableModal}
              title="Click to view QR Code or switch demo table"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700/80 border border-amber-500/30 hover:border-amber-400 text-xs text-amber-200 transition-all duration-200 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Table {table.id}</span>
              <QrCode className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-medium text-xs sm:text-sm shadow-lg shadow-brand-900/30 transition-all duration-200"
            aria-label={`View shopping cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            {totalItems > 0 && (
              <>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-brand-700 rounded-full">
                  {totalItems}
                </span>
                <span className="hidden md:inline text-xs text-amber-100 font-medium border-l border-amber-500/50 pl-2">
                  ${subtotal.toFixed(2)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
