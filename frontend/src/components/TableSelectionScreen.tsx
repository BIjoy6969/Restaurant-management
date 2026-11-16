import React, { useState } from 'react';
import { Table, Restaurant } from '../types';
import { 
  Sparkles, 
  Users, 
  MapPin, 
  Crown, 
  Coffee, 
  Trees, 
  HeartHandshake, 
  QrCode, 
  UtensilsCrossed,
  ArrowRight
} from 'lucide-react';

interface TableSelectionScreenProps {
  restaurant: Restaurant | null;
  tables: Table[];
  onSelectTable: (tableId: string) => void;
  onOpenQRScanner?: () => void;
}

export const TableSelectionScreen: React.FC<TableSelectionScreenProps> = ({
  restaurant,
  tables,
  onSelectTable,
  onOpenQRScanner,
}) => {
  const [customTable, setCustomTable] = useState('');
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  const fallbackTables: Table[] = [
    {
      id: 'T01',
      restaurantId: 'rest_breakroom_01',
      tableNumber: '01',
      area: 'Indoor Lounge',
      capacity: 2,
      status: 'AVAILABLE',
    },
    {
      id: 'T02',
      restaurantId: 'rest_breakroom_01',
      tableNumber: '02',
      area: 'Window Booth',
      capacity: 4,
      status: 'AVAILABLE',
    },
    {
      id: 'T03',
      restaurantId: 'rest_breakroom_01',
      tableNumber: '03',
      area: 'Family Dining Corner',
      capacity: 6,
      status: 'AVAILABLE',
    },
    {
      id: 'T04',
      restaurantId: 'rest_breakroom_01',
      tableNumber: '04',
      area: 'Terrace Garden',
      capacity: 4,
      status: 'AVAILABLE',
    },
    {
      id: 'VIP-01',
      restaurantId: 'rest_breakroom_01',
      tableNumber: 'VIP 1',
      area: 'Executive Private Suite',
      capacity: 8,
      status: 'AVAILABLE',
    },
  ];

  const displayTables = tables && tables.length > 0 ? tables : fallbackTables;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTable.trim()) {
      onSelectTable(customTable.trim().toUpperCase());
    }
  };

  const getAreaIcon = (area: string, id: string) => {
    if (id.toLowerCase().includes('vip')) return <Crown className="w-5 h-5 text-amber-400" />;
    if (area.toLowerCase().includes('window')) return <Coffee className="w-5 h-5 text-amber-500" />;
    if (area.toLowerCase().includes('terrace') || area.toLowerCase().includes('garden')) {
      return <Trees className="w-5 h-5 text-emerald-500" />;
    }
    if (area.toLowerCase().includes('family')) return <HeartHandshake className="w-5 h-5 text-rose-400" />;
    return <UtensilsCrossed className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-[#0F0E0C] text-stone-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambience Glowing Orbs */}
      <div className="absolute top-0 left-1/4 -mt-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stone-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Hero Brand Header */}
        <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Dine-In Experience • The Break Room Bogura</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            {restaurant?.name || 'The Break Room'}
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-amber-300/90 mb-2">
            "Take a Break, Crave More! — বগুড়া"
          </p>

          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
            স্বাগতম! আপনার ডাইনিং টেবিল সিলেক্ট করে সুস্বাদু মেনু ঘুরে দেখুন ও সরাসরি অর্ডার করুন।
          </p>
        </header>

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Select Your Dining Table (টেবিল পছন্দ করুন)</span>
            </h2>
            <span className="text-xs text-stone-400">
              Tap any table card below to open its dedicated table session & menu
            </span>
          </div>

          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Simulate QR Code Scan</span>
            </button>
          )}
        </div>

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {displayTables.map((t) => {
            const isVip = t.id.toLowerCase().includes('vip');
            const isHovered = hoveredTable === t.id;

            return (
              <div
                key={t.id}
                onMouseEnter={() => setHoveredTable(t.id)}
                onMouseLeave={() => setHoveredTable(null)}
                onClick={() => onSelectTable(t.id)}
                className={`relative group rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border overflow-hidden ${
                  isVip
                    ? 'bg-gradient-to-b from-stone-900 via-[#1C1813] to-stone-950 border-amber-500/40 hover:border-amber-400 shadow-xl shadow-amber-950/30'
                    : 'bg-stone-900/90 hover:bg-stone-850 border-stone-800 hover:border-amber-500/50 shadow-lg'
                } ${isHovered ? 'scale-[1.02] -translate-y-1' : ''}`}
              >
                {/* Glow accent */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${
                    isVip ? 'bg-amber-500/20' : 'bg-amber-600/10'
                  } ${isHovered ? 'opacity-100' : 'opacity-40'}`}
                />

                <div>
                  {/* Top Row: Table ID & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-serif font-black text-sm ${
                          isVip
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-md shadow-amber-500/30'
                            : 'bg-stone-800 text-amber-400 border border-stone-700'
                        }`}
                      >
                        {getAreaIcon(t.area, t.id)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">
                          {isVip ? 'VIP Dining' : 'Dine-In Table'}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
                          Table {t.id}
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ready
                    </span>
                  </div>

                  {/* Area & Capacity Details */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-stone-300">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-medium text-stone-200">{t.area}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Users className="w-4 h-4 text-amber-500/80 shrink-0" />
                      <span>Comfortably seats up to <strong className="text-amber-300">{t.capacity} Guests</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                    <span>অর্ডার শুরু করুন (Select)</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center group-hover:bg-amber-400 group-hover:scale-110 transition-all shadow-md">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Table ID Input */}
        <div className="max-w-md mx-auto bg-stone-900/80 border border-stone-800 rounded-3xl p-6 text-center shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            Need a Specific Table Number?
          </h4>
          <p className="text-xs text-stone-400 mb-4">
            If your table is labeled differently, type the table number here:
          </p>

          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customTable}
              onChange={(e) => setCustomTable(e.target.value)}
              placeholder="e.g. T05 or VIP-02"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-700 text-white text-xs font-mono uppercase placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!customTable.trim()}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
            >
              Enter Table
            </button>
          </form>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 py-6 border-t border-stone-900 text-center text-xs text-stone-500">
        <p>© The Break Room Bogura • Jaleswaritola • "Take a Break, Crave More!"</p>
      </footer>
    </div>
  );
};
