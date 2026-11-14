import React from 'react';
import { useCart } from '../context/CartContext';
import { Table, Restaurant, Order } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, MessageSquare } from 'lucide-react';

interface CartDrawerProps {
  restaurant: Restaurant;
  table: Table;
  activeOrder?: Order | null;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  restaurant,
  table,
  activeOrder,
  onProceedToCheckout,
}) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  const currency = restaurant.currency || '$';
  const taxRate = restaurant.taxRate || 0.05;
  const estimatedTax = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-600 text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold">Your Order Cart</h2>
                <p className="text-xs text-amber-200/80">Table {table.id} • {totalItems} items</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore our artisanal menu dishes and add your favorites to your table order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((cartItem) => {
                const itemTotal = (cartItem.item.price * cartItem.quantity).toFixed(2);
                return (
                  <div
                    key={cartItem.item.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                          {cartItem.item.name}
                        </h4>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {currency}{cartItem.item.price.toFixed(2)} each
                        </div>
                      </div>

                      <span className="font-serif font-bold text-sm text-stone-900">
                        {currency}{itemTotal}
                      </span>
                    </div>

                    {cartItem.specialInstructions && (
                      <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/60 rounded-md p-1.5 flex items-start gap-1.5">
                        <MessageSquare className="w-3 h-3 text-amber-700 mt-0.5 shrink-0" />
                        <span className="italic">{cartItem.specialInstructions}</span>
                      </div>
                    )}

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          className="w-6 h-6 rounded-md hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-900">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          className="w-6 h-6 rounded-md hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(cartItem.item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 text-xs transition-colors flex items-center gap-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Billing Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Additional Items Subtotal</span>
                  <span className="font-medium text-stone-900">{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-stone-900">{currency}{estimatedTax.toFixed(2)}</span>
                </div>

                {activeOrder && (
                  <div className="flex justify-between pt-1 border-t border-dashed border-stone-300 text-stone-500">
                    <span>Previous Order ({activeOrder.id})</span>
                    <span className="font-medium text-stone-800">{currency}{activeOrder.total.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>{activeOrder ? 'New Combined Total' : 'Estimated Order Total'}</span>
                  <span className="font-serif text-base text-amber-800">
                    {currency}{(activeOrder ? activeOrder.total + estimatedTotal : estimatedTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-3 py-3 border border-stone-300 hover:bg-stone-200 rounded-xl text-xs text-stone-600 font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200"
                >
                  <span>{activeOrder ? 'Review & Add to Bill' : 'Review & Submit Order'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-stone-400 text-center">
                All prices and dish availability are authoritatively verified by the kitchen server.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

