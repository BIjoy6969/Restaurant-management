import React from 'react';
import { Utensils, ChefHat, Bell, Receipt, Settings2, Sparkles } from 'lucide-react';

export type AppPortal = 'customer' | 'kitchen' | 'waiter' | 'cashier' | 'manager';

interface StaffNavbarProps {
  currentPortal: AppPortal;
  onSelectPortal: (portal: AppPortal) => void;
  tableId: string;
}

export const StaffNavbar: React.FC<StaffNavbarProps> = ({
  currentPortal,
  onSelectPortal,
  tableId,
}) => {
  const portals = [
    { id: 'customer', label: `Dine-In (Table ${tableId})`, icon: Utensils, badge: 'Guest' },
    { id: 'kitchen', label: 'Kitchen (KDS)', icon: ChefHat, badge: 'Chef' },
    { id: 'waiter', label: 'Waiter & Floor', icon: Bell, badge: 'Staff' },
    { id: 'cashier', label: 'Cashier POS', icon: Receipt, badge: 'Billing' },
    { id: 'manager', label: 'Manager / Admin', icon: Settings2, badge: 'Admin' },
  ] as const;

  return (
    <div className="bg-stone-950 border-b border-amber-900/40 text-white px-3 py-2 text-xs shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-stone-800">
          <div className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-[10px]">
            B
          </div>
          <span className="font-serif font-bold text-amber-200 hidden sm:inline">The Break Room OS</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {portals.map((p) => {
            const Icon = p.icon;
            const isActive = currentPortal === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPortal(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-stone-300 hover:text-white hover:bg-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{p.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono hidden md:inline ${
                    isActive ? 'bg-amber-800 text-amber-100' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Full Restaurant ERP</span>
        </div>
      </div>
    </div>
  );
};
