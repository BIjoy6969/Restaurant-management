import React from 'react';
import { QrCode } from 'lucide-react';
import { Restaurant, Table } from '../types';

interface NavbarProps {
  restaurant: Restaurant | null;
  table: Table | null;
  onOpenTableModal: () => void;
  onChangeTable?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ restaurant, table, onOpenTableModal, onChangeTable }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121417]/95 backdrop-blur-md border-b border-amber-900/30 text-white transition-all shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-inner font-serif font-bold text-lg">
            B
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {restaurant?.name || 'The Break Room'}
            </h1>
            <p className="text-[11px] text-amber-200/70 hidden sm:block tracking-wide">
              {restaurant?.tagline || 'Artisanal Smashed Burgers & Sips • Bogura'}
            </p>
          </div>
        </div>

        {/* Center / Table Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {table && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onOpenTableModal}
                title="Click to view QR Code or switch demo table"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700/80 border border-amber-500/30 hover:border-amber-400 text-xs text-amber-200 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">Table {table.id}</span>
                <QrCode className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>

              {onChangeTable && (
                <button
                  onClick={onChangeTable}
                  title="Return to Table Selection Screen"
                  className="px-2.5 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-[11px] font-semibold text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  টেবিল পরিবর্তন
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
