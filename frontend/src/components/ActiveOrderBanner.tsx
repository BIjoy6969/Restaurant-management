import React from 'react';
import { Order, Restaurant } from '../types';
import { Receipt, ArrowRight, Flame, ChefHat, CheckCircle2 } from 'lucide-react';

interface ActiveOrderBannerProps {
  activeOrder: Order;
  restaurant: Restaurant;
  onViewOrder: () => void;
}

export const ActiveOrderBanner: React.FC<ActiveOrderBannerProps> = ({
  activeOrder,
  restaurant,
  onViewOrder,
}) => {
  const currency = restaurant.currency || '$';
  const itemCount = activeOrder.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-lg border border-amber-500/40 animate-slideDown">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-inner shrink-0">
            {activeOrder.status === 'Preparing' ? (
              <Flame className="w-5 h-5 text-amber-200 animate-bounce" />
            ) : activeOrder.status === 'Ready' ? (
              <ChefHat className="w-5 h-5 text-emerald-200 animate-pulse" />
            ) : (
              <Receipt className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full text-amber-200">
                Active Table Tab
              </span>
              <span className="text-xs font-mono font-bold text-amber-100">
                {activeOrder.id}
              </span>
              {activeOrder.status === 'Preparing' && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs animate-pulse">
                  <Flame className="w-3 h-3 animate-bounce" /> Chef Cooking
                </span>
              )}
              {activeOrder.status === 'Ready' && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> Food Ready
                </span>
              )}
              {activeOrder.status === 'Delivered' && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-400 text-stone-950 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> Served
                </span>
              )}
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold mt-0.5">
              Adding to Table {activeOrder.tableId} Running Bill
            </h3>
            <p className="text-xs text-amber-100/90">
              {itemCount} items already ordered • Current Subtotal: {currency}{activeOrder.total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onViewOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-stone-900 hover:bg-amber-50 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <span>View Current Bill & Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
