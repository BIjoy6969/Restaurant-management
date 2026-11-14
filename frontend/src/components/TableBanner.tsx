import React from 'react';
import { Table, Restaurant } from '../types';
import { Sparkles, QrCode, MapPin, Users } from 'lucide-react';

interface TableBannerProps {
  restaurant: Restaurant;
  table: Table;
  onOpenTableModal: () => void;
}

export const TableBanner: React.FC<TableBannerProps> = ({
  restaurant,
  table,
  onOpenTableModal,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-amber-900/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Dine-In Ordering</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to {restaurant.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 font-medium text-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Table {table.id}
            </span>
            <span className="flex items-center gap-1 text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {table.area}
            </span>
            <span className="flex items-center gap-1 text-stone-400">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              Seats {table.capacity}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTableModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-stone-900 border border-amber-500/30 hover:border-amber-400 text-xs sm:text-sm font-medium text-amber-200 transition-all duration-200 shadow-md"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Table QR & Switcher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

