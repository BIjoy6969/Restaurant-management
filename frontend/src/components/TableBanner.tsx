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
    <div className="relative overflow-hidden bg-gradient-to-r from-stone-950 via-[#1C1814] to-stone-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl border border-amber-500/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Artisanal Smashed Burgers & Bistro Dining</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5">
            Welcome to {restaurant.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-stone-300">
            <span className="flex items-center gap-2 font-bold text-amber-300 bg-stone-900/80 px-3 py-1 rounded-full border border-amber-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Table {table.id}
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-4 h-4 text-amber-400" />
              {table.area}
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Users className="w-4 h-4 text-amber-400" />
              Seats {table.capacity} Diners
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTableModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:from-amber-800 active:to-amber-900 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/40 border border-amber-400/40 transition-all duration-200 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Table QR & Switcher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

