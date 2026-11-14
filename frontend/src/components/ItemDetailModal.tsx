import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Clock, Flame, ImageOff, ShoppingBag, Check } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, currency, onClose }) => {
  const { addItem, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [imageError, setImageError] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setInstructions('');
      setImageError(false);
      setAddedNotice(false);
    }
  }, [item]);

  if (!item) return null;

  const currentCartQty = getItemQuantity(item.id);

  const handleAddToCart = () => {
    addItem(item, quantity, instructions.trim() || undefined);
    setAddedNotice(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative aspect-[16/9] w-full bg-stone-100 shrink-0 overflow-hidden">
          {!imageError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
              <ImageOff className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="flex flex-wrap gap-1.5">
              {item.dietary?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-stone-950 shadow-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-white/90 drop-shadow">
              {item.prepTimeMinutes && (
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  {item.prepTimeMinutes} mins
                </span>
              )}
              {item.calories && (
                <span className="flex items-center gap-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  {item.calories} kcal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{item.name}</h2>
              <span className="font-serif text-xl sm:text-2xl font-bold text-amber-700 whitespace-nowrap">
                {currency}{item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
          </div>

          {currentCartQty > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>You currently have <strong>{currentCartQty}</strong> of this dish in your cart.</span>
            </div>
          )}

          {/* Special Instructions Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Kitchen Special Instructions
            </label>
            <textarea
              rows={2}
              maxLength={200}
              placeholder="e.g. Dressing on the side, allergies, extra crispy..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-stone-400 resize-none"
            />
            <span className="text-[10px] text-stone-400 text-right block mt-0.5">
              {instructions.length}/200 characters
            </span>
          </div>

          {/* Out of Stock Notice */}
          {!item.isAvailable && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
              This item is currently sold out and unavailable to order.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {item.isAvailable && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4 shrink-0">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white border border-stone-300 rounded-full p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 ${
                addedNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order • {currency}{(item.price * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

