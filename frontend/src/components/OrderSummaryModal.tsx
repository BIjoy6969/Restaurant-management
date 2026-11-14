import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Table, Restaurant, Order } from '../types';
import { api } from '../services/api';
import { X, Send, AlertCircle, Loader2, ShieldCheck, Utensils } from 'lucide-react';

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  table: Table;
  activeOrder?: Order | null;
  onOrderSuccess: (order: Order) => void;
}

export const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  table,
  activeOrder,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currency = restaurant.currency || '$';
  const taxRate = restaurant.taxRate || 0.05;
  const estimatedTax = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  const handleSubmitOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (activeOrder) {
        // Appending to existing running order on this table!
        const payload = {
          items: items.map((ci) => ({
            menuItemId: ci.item.id,
            quantity: ci.quantity,
            specialInstructions: ci.specialInstructions,
          })),
        };
        const response = await api.addItemsToOrder(activeOrder.id, payload);
        clearCart();
        onClose();
        onOrderSuccess(response.order);
      } else {
        // New order
        const payload = {
          tableId: table.id,
          customerNote: customerNote.trim() || undefined,
          items: items.map((ci) => ({
            menuItemId: ci.item.id,
            quantity: ci.quantity,
            specialInstructions: ci.specialInstructions,
          })),
        };

        const response = await api.submitOrder(payload);
        clearCart();
        onClose();
        onOrderSuccess(response.order);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check item availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              {activeOrder ? 'Add to Running Table Bill' : 'Review & Confirm Order'}
            </h3>
            <p className="text-xs text-stone-400">
              {activeOrder
                ? `Appending Round to Table ${table.id} (${activeOrder.id})`
                : `Order for Table ${table.id} (${table.area})`}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Submission Error:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Itemized Order List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>Selected Dishes ({items.length})</span>
            </h4>
            <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl p-3 border border-stone-200/80">
              {items.map((ci) => (
                <div key={ci.item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-stone-900">
                      <span className="text-amber-700 font-bold mr-1.5">{ci.quantity}x</span>
                      {ci.item.name}
                    </div>
                    {ci.specialInstructions && (
                      <div className="text-[11px] text-stone-500 italic mt-0.5">
                        Note: "{ci.specialInstructions}"
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                    {currency}{(ci.item.price * ci.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-1.5 text-xs text-stone-600 bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/60">
            <div className="flex justify-between">
              <span>Additional Dishes Subtotal</span>
              <span className="font-medium text-stone-900">{currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="font-medium text-stone-900">{currency}{estimatedTax.toFixed(2)}</span>
            </div>
            {activeOrder && (
              <div className="flex justify-between pt-1 border-t border-dashed border-amber-300 text-stone-600">
                <span>Previous Table Order ({activeOrder.id})</span>
                <span className="font-bold text-stone-900">{currency}{activeOrder.total.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-amber-200/80">
              <span>{activeOrder ? 'Updated Combined Grand Total' : 'Total Estimated Bill'}</span>
              <span className="font-serif text-base text-amber-800">
                {currency}{(activeOrder ? activeOrder.total + estimatedTotal : estimatedTotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Optional Table Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              General Note for Table (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="e.g. Birthday celebration, please bring dishes together..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Server Trust Security Badge */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure Dine-In Order: Catalog rates & tax are verified directly on the server.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            Back to Cart
          </button>

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending to Kitchen...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{activeOrder ? 'Confirm & Add to Running Bill' : 'Confirm & Place Order'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

