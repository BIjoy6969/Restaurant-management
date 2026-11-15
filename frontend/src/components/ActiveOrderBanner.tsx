import React, { useState } from 'react';
import { Order, Restaurant } from '../types';
import { 
  Receipt, 
  ArrowRight, 
  Flame, 
  ChefHat, 
  CheckCircle2, 
  MessageSquare, 
  X 
} from 'lucide-react';

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
  // Default resting state is collapsed into a small circular chat/bill icon
  const [isExpanded, setIsExpanded] = useState(false);
  const currency = restaurant.currency || '৳';
  const itemCount = activeOrder.items.reduce((sum, it) => sum + it.quantity, 0);

  const getStatusInfo = () => {
    switch (activeOrder.status) {
      case 'Preparing':
        return {
          label: 'Chef Cooking',
          shortLabel: 'Cooking',
          badgeColor: 'bg-amber-500 text-stone-950',
          icon: Flame,
        };
      case 'Ready':
        return {
          label: 'Food Ready',
          shortLabel: 'Ready',
          badgeColor: 'bg-emerald-500 text-stone-950',
          icon: ChefHat,
        };
      case 'Delivered':
        return {
          label: 'Food Served',
          shortLabel: 'Served',
          badgeColor: 'bg-blue-500 text-white',
          icon: CheckCircle2,
        };
      default:
        return {
          label: 'Order Placed',
          shortLabel: 'Placed',
          badgeColor: 'bg-stone-800 text-amber-300',
          icon: Receipt,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300">
      {!isExpanded ? (
        /* ================= 1. RESTING STATE: CIRCULAR CHAT / BILL FLOATING ICON ================= */
        <div className="relative group">
          {/* Top Floating Mini Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-0.5">
            <div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg border border-amber-300 flex items-center gap-1 whitespace-nowrap">
              <span>Bill</span>
              <span className="font-bold text-[9px] text-stone-900">
                {currency}{Math.round(activeOrder.total)}
              </span>
            </div>
          </div>

          {/* Circular Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-850 text-white shadow-2xl border-2 border-amber-500/80 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer"
            title="বিল ও অর্ডার স্ট্যাটাস দেখতে ক্লিক করুন"
            aria-label="View Active Order & Bill"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-amber-500/20 animate-pulse blur-sm -z-10" />

            {/* Central Icon */}
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-950 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-950 rounded-full" />
            </div>

            {/* Micro Status Label */}
            <span className="text-[9px] font-bold text-amber-300/90 mt-0.5 tracking-tight">
              {statusInfo.shortLabel}
            </span>
          </button>
        </div>
      ) : (
        /* ================= 2. EXPANDED STATE: RICH ORDER & BILL BUTTON BAR ================= */
        <div className="flex items-center gap-2 animate-scaleUp">
          {/* Main Action Pill */}
          <div
            onClick={onViewOrder}
            className="group relative flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-850 text-white rounded-full shadow-2xl border-2 border-amber-500/80 hover:border-amber-400 cursor-pointer transition-all duration-200"
            title="পূর্ণাঙ্গ বিল ও স্ট্যাটাস দেখতে ক্লিক করুন"
          >
            {/* Animated Status Icon */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
                <StatusIcon className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-stone-950 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-stone-950 rounded-full" />
            </div>

            {/* Quick Info text */}
            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Table {activeOrder.tableId} • {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-extrabold text-white">
                  Bill: {currency}{activeOrder.total.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                  ({itemCount} items)
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md group-hover:translate-x-0.5 transition-transform ml-1">
              <Receipt className="w-3.5 h-3.5" />
              <span>বিল দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Close / Minimize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-10 h-10 rounded-full bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 flex items-center justify-center shadow-lg transition-colors cursor-pointer shrink-0"
            title="আইকনে মিনিমাইজ করুন"
            aria-label="Minimize to icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
