import React, { useState } from 'react';
import { Order, Restaurant, Table } from '../types';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { 
  Receipt, 
  ArrowRight, 
  Flame, 
  ChefHat, 
  CheckCircle2, 
  Send,
  Loader2,
  Trash2,
  Plus,
  Minus,
  Utensils,
  X 
} from 'lucide-react';

interface ActiveOrderBannerProps {
  activeOrder: Order | null;
  restaurant: Restaurant;
  table: Table;
  onViewOrder: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const ActiveOrderBanner: React.FC<ActiveOrderBannerProps> = ({
  activeOrder,
  restaurant,
  table,
  onViewOrder,
  onOrderSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const currency = restaurant.currency || '৳';
  const taxRate = restaurant.taxRate || 0.05;

  // Real-time bill calculations
  const cartTax = Math.round(subtotal * taxRate * 100) / 100;
  const cartTotal = Math.round((subtotal + cartTax) * 100) / 100;

  const currentOrderTotal = activeOrder ? activeOrder.total : 0;
  const totalCombinedBill = activeOrder 
    ? (totalItems > 0 ? currentOrderTotal + cartTotal : currentOrderTotal)
    : cartTotal;

  // Direct 1-Click Order Submission to Kitchen
  const handleConfirmOrder = async () => {
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeOrder) {
        // Append additional round to existing order
        const payload = {
          items: items.map((ci) => ({
            menuItemId: ci.item.id,
            quantity: ci.quantity,
            specialInstructions: ci.specialInstructions,
          })),
        };
        const res = await api.addItemsToOrder(activeOrder.id, payload);
        clearCart();
        setIsOpen(false);
        onOrderSuccess(res.order);
      } else {
        // Place brand new order
        const payload = {
          tableId: table.id,
          items: items.map((ci) => ({
            menuItemId: ci.item.id,
            quantity: ci.quantity,
            specialInstructions: ci.specialInstructions,
          })),
        };
        const res = await api.submitOrder(payload);
        clearCart();
        setIsOpen(false);
        onOrderSuccess(res.order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status mapping
  const getStatusInfo = () => {
    if (activeOrder) {
      switch (activeOrder.status) {
        case 'Preparing':
          return {
            label: 'Chef Cooking',
            shortLabel: 'Cooking',
            pillTitle: 'রান্না চলছে',
            icon: Flame,
            dotColor: 'bg-amber-400',
            isGlowing: true,
          };
        case 'Ready':
          return {
            label: 'Food Ready',
            shortLabel: 'Ready',
            pillTitle: 'খাবার প্রস্তুত',
            icon: ChefHat,
            dotColor: 'bg-emerald-400',
            isGlowing: true,
          };
        case 'Delivered':
          return {
            label: 'Food Served',
            shortLabel: 'Served',
            pillTitle: 'খাবার সার্ভড',
            icon: CheckCircle2,
            dotColor: 'bg-blue-400',
            isGlowing: false,
          };
        case 'Completed':
          return {
            label: 'Settled',
            shortLabel: 'Paid',
            pillTitle: 'বিল পরিশোধিত',
            icon: Receipt,
            dotColor: 'bg-emerald-400',
            isGlowing: false,
          };
        default:
          return {
            label: 'Order Placed',
            shortLabel: 'Placed',
            pillTitle: 'অর্ডার নেওয়া হয়েছে',
            icon: Receipt,
            dotColor: 'bg-emerald-400',
            isGlowing: true,
          };
      }
    }

    if (totalItems > 0) {
      return {
        label: `${totalItems}টি আইটেম সিলেক্টেড`,
        shortLabel: `${totalItems} Items`,
        pillTitle: `${totalItems}টি খাবার যোগ হয়েছে`,
        icon: Receipt,
        dotColor: 'bg-amber-400',
        isGlowing: true,
      };
    }

    return {
      label: 'Fresh Session',
      shortLabel: `Table ${table.id}`,
      pillTitle: 'ফ্রেশ ডাইনিং সেশন',
      icon: Receipt,
      dotColor: 'bg-stone-500',
      isGlowing: false,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ================= 1. ALWAYS VISIBLE CIRCULAR FLOATING BILL POINT ================= */}
      <div className="relative group">
        {/* Top Floating Live Bill Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-1">
          <div className={`px-2.5 py-0.5 font-black text-[11px] uppercase tracking-wider rounded-full shadow-2xl border flex items-center gap-1.5 whitespace-nowrap ${
            totalCombinedBill > 0
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 border-amber-200 ring-2 ring-amber-400/30'
              : 'bg-stone-900 text-stone-200 border-stone-700'
          }`}>
            <span className="font-extrabold">Bill</span>
            <span className="font-serif font-black text-stone-950">
              {currency}{Math.round(totalCombinedBill)}
            </span>
          </div>
        </div>

        {/* Circular Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-850 text-white shadow-2xl border-2 border-amber-500/80 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer"
          title="অর্ডার ও বিল সামারি দেখতে ক্লিক করুন"
          aria-label="Floating Bill Point"
        >
          {/* Ambient Glow */}
          {statusInfo.isGlowing && (
            <span className="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-pulse blur-sm -z-10" />
          )}

          {/* Icon with pulsing dot */}
          <div className="relative flex items-center justify-center">
            <StatusIcon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            {statusInfo.isGlowing && (
              <>
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${statusInfo.dotColor} border-2 border-stone-950 rounded-full animate-ping`} />
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${statusInfo.dotColor} border-2 border-stone-950 rounded-full`} />
              </>
            )}
          </div>

          {/* Micro Status Label */}
          <span className="text-[9px] font-bold text-amber-300/90 mt-0.5 tracking-tight">
            {statusInfo.shortLabel}
          </span>
        </button>
      </div>

      {/* ================= 2. DIRECT ORDER SUMMARY & ADJUSTMENT POPUP ================= */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:absolute sm:bottom-20 sm:right-0 z-50 flex items-end sm:items-auto justify-center bg-black/60 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-96 bg-stone-950 text-white border-2 border-amber-500/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-slideUp"
          >
            {/* Popup Header */}
            <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <span>Table {table.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {statusInfo.pillTitle}
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    বিল ও অর্ডার সামারি
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popup Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* If Active Order already running in kitchen */}
              {activeOrder && (
                <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      চলতি অর্ডার ({activeOrder.id})
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      activeOrder.status === 'Preparing' 
                        ? 'bg-amber-500 text-stone-950' 
                        : activeOrder.status === 'Ready'
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-300">কিচেনে রানিং বিল:</span>
                    <span className="font-serif font-extrabold text-amber-300 text-sm">
                      {currency}{activeOrder.total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onViewOrder();
                    }}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                  >
                    <span>পূর্ণাঙ্গ ভাউচার ও ট্র্যাকিং দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Items Selected in Cart for New / Additional Round */}
              {items.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {activeOrder ? 'নতুন রাউন্ডে যোগ করা খাবার' : 'অর্ডারের জন্য নির্বাচিত খাবার'} ({totalItems}টি)
                    </span>
                    <button
                      onClick={() => clearCart()}
                      className="text-[10px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      সব ক্লিয়ার
                    </button>
                  </div>

                  <div className="divide-y divide-stone-850 border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/60">
                    {items.map((cartItem) => (
                      <div key={cartItem.item.id} className="p-3 flex items-center justify-between gap-2 text-xs">
                        <div className="flex-1 pr-2">
                          <h5 className="font-bold text-stone-200 text-xs leading-snug">
                            {cartItem.item.name}
                          </h5>
                          <span className="text-[10px] text-amber-300/80">
                            {currency}{cartItem.item.price.toFixed(2)} each
                          </span>
                        </div>

                        {/* Quantity Stepper (+ and - directly in the summary) */}
                        <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="w-6 h-6 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="কম করুন"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-amber-300">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="w-6 h-6 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="বৃদ্ধি করুন"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(cartItem.item.id)}
                            className="w-6 h-6 text-stone-500 hover:text-rose-400 rounded-lg flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                            aria-label="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-3 p-3 bg-stone-900/50 rounded-xl border border-stone-850 space-y-1.5 text-xs text-stone-400">
                    <div className="flex justify-between">
                      <span>সাবটোটাল</span>
                      <span className="text-stone-200 font-medium">{currency}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ভ্যাট ({(taxRate * 100).toFixed(0)}%)</span>
                      <span className="text-stone-200 font-medium">{currency}{cartTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-stone-800">
                      <span>নতুন অর্ডারের বিল</span>
                      <span className="font-serif text-base text-amber-400">{currency}{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : !activeOrder ? (
                <div className="py-8 text-center text-stone-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-850 flex items-center justify-center mx-auto text-stone-500">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif text-sm font-bold text-stone-200">কোনো খাবার নির্বাচিত হয়নি</h5>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    মেনু থেকে যেকোনো খাবারের <strong>"Add to Order"</strong> বাটনে চাপলেই এখানে স্বয়ংক্রিয়ভাবে যোগ হবে।
                  </p>
                </div>
              ) : null}

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Popup Footer Action: 1-Click Kitchen Order Placement */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold pb-1">
                <span className="text-stone-300">সর্বমোট বিল (Total Bill):</span>
                <span className="font-serif text-lg font-black text-amber-400">
                  {currency}{totalCombinedBill.toFixed(2)}
                </span>
              </div>

              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 active:scale-98 text-stone-950 font-black text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting 
                      ? 'কিচেনে পাঠানো হচ্ছে...' 
                      : activeOrder 
                      ? `কনফার্ম ও কিচেনে পাঠান (Round 2 • ${currency}${cartTotal.toFixed(2)})` 
                      : `কনফার্ম অর্ডার (কিচেনে পাঠান • ${currency}${cartTotal.toFixed(2)})`}
                  </span>
                </button>
              ) : activeOrder ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onViewOrder();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>বিল ও পেমেন্ট রসিদ দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  মেনুতে ফিরে যান
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
