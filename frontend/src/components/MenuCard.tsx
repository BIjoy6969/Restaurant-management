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
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between luxury-card shadow-sm hover:shadow-xl ${
        item.isAvailable
          ? 'border-stone-200/90 hover:border-amber-400'
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
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70" />

        {/* Dietary & Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {!item.isAvailable && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-600/95 text-white font-bold text-[10px] tracking-wide uppercase shadow-md backdrop-blur-xs">
              Sold Out
            </span>
          )}
          {item.dietary?.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md shadow-sm ${
                tag === "Chef's Special" || tag === 'Best Seller'
                  ? 'bg-amber-500 text-stone-950 font-extrabold shadow-amber-500/20'
                  : 'bg-stone-950/80 text-white border border-white/20'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Prep Time / Calories info */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
          {item.prepTimeMinutes && (
            <span className="flex items-center gap-1 drop-shadow-md">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {item.prepTimeMinutes} mins
            </span>
          )}
          {item.calories && (
            <span className="flex items-center gap-1 drop-shadow-md">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {item.calories} kcal
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 mb-1.5">
            {item.name}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block -mb-0.5">Price</span>
            <span className="font-serif text-lg sm:text-xl font-extrabold text-amber-900">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>

          <div>
            {item.isAvailable ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-950 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Order</span>
                </button>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center bg-amber-50 border-2 border-amber-400 rounded-xl p-0.5 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-stone-800 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 text-amber-900" />
                  </button>
                  <span className="px-2.5 text-xs font-extrabold text-amber-950 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shadow-xs"
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
