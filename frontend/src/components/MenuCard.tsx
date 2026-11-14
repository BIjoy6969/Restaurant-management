import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Clock, Flame, ImageOff } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  currency: string;
  onOpenDetail: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, currency, onOpenDetail }) => {
  const { getItemQuantity, addItem, updateQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const quantity = getItemQuantity(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <div
      onClick={() => onOpenDetail(item)}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
        item.isAvailable
          ? 'border-stone-200/80 hover:border-amber-400/60'
          : 'border-stone-200 opacity-70 bg-stone-50'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !item.isAvailable ? 'grayscale contrast-75' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 p-4">
            <ImageOff className="w-8 h-8 mb-1" />
            <span className="text-[11px] font-medium">{item.name}</span>
          </div>
        )}

        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Dietary & Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {!item.isAvailable && (
            <span className="px-2.5 py-1 rounded-md bg-rose-600/95 text-white font-bold text-[10px] tracking-wide uppercase shadow-sm">
              Sold Out
            </span>
          )}
          {item.dietary?.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide backdrop-blur-md shadow-sm ${
                tag === "Chef's Special" || tag === 'Best Seller'
                  ? 'bg-amber-500/90 text-stone-950 font-bold'
                  : 'bg-stone-900/80 text-white'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Prep Time / Calories info */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90 font-medium">
          {item.prepTimeMinutes && (
            <span className="flex items-center gap-1 drop-shadow">
              <Clock className="w-3 h-3 text-amber-300" />
              {item.prepTimeMinutes} mins
            </span>
          )}
          {item.calories && (
            <span className="flex items-center gap-1 drop-shadow">
              <Flame className="w-3 h-3 text-amber-300" />
              {item.calories} kcal
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1 mb-1.5">
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-xs font-semibold text-stone-400 block -mb-0.5">Price</span>
            <span className="font-serif text-base sm:text-lg font-bold text-stone-900">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>

          <div>
            {item.isAvailable ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center bg-amber-50 border border-amber-300 rounded-full p-0.5 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-7 h-7 rounded-full bg-white hover:bg-amber-100 text-stone-800 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 text-amber-900" />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-amber-950 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-7 h-7 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )
            ) : (
              <span className="text-xs font-semibold text-stone-400 italic">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
