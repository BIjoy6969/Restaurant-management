import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  RefreshCw, 
  Clock, 
  Phone, 
  Flame, 
  ChefHat, 
  Check 
} from 'lucide-react';

export const CashierDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [settledNotice, setSettledNotice] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.getAllOrders();
      setOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSettle = async (orderId: string) => {
    try {
      const res = await api.settleOrder(orderId);
      setSettledNotice(`Table ${res.order.tableId} bill settled successfully. Table released!`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      setTimeout(() => setSettledNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
  const completedToday = orders.filter((o) => o.status === 'Completed');
  const totalRevenue = completedToday.reduce((sum, o) => sum + o.total, 0);

  // Helper for lifecycle stage index (0 to 4)
  const getStageIndex = (order: Order) => {
    if (order.billRequested) return 4;
    if (order.status === 'Delivered') return 3;
    if (order.status === 'Ready') return 2;
    if (order.status === 'Preparing') return 1;
    return 0; // Received
  };

  const stages = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Chef Cooking', icon: Flame },
    { label: 'Food Ready', icon: ChefHat },
    { label: 'Waiter Served', icon: Check },
    { label: 'Bill Request', icon: Receipt },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Receipt className="w-4 h-4" />
            <span>Cashier Point of Sale (POS)</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Bill Settlement & Live Order Lifecycle
          </h2>
        </div>

        {/* Today Summary */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Settled Today</span>
            <span className="text-sm font-bold text-stone-900">{completedToday.length} Orders</span>
          </div>
          <div className="border-l border-stone-200 pl-4">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Gross Revenue</span>
            <span className="text-sm font-bold text-amber-700">${totalRevenue.toFixed(2)}</span>
          </div>
          <button 
            onClick={fetchOrders} 
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {settledNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold mb-6 flex items-center gap-2 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{settledNotice}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-16 text-stone-500">Loading ledger...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Tables List with Lifecycle Pipelines */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center justify-between">
              <span>Active Table Tabs ({activeOrders.length})</span>
              <span className="text-xs text-stone-500 font-normal">Real-Time Kitchen & Waiter Stages</span>
            </h3>

            {activeOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-stone-500 text-xs">
                No active dining tabs requiring settlement right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((o) => {
                  const isBillReq = o.billRequested;
                  const isSelected = selectedOrder?.id === o.id;
                  const curStageIdx = getStageIndex(o);

                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/40 shadow-md ring-2 ring-amber-500/30'
                          : isBillReq
                          ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-amber-400 shadow-xs'
                      }`}
                    >
                      {/* Top Row: Table and Bill Total */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-stone-900">
                            Table {o.tableId}
                          </span>
                          <span className="font-mono text-xs text-stone-400">
                            {o.id}
                          </span>
                          {o.customerPhone && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" /> {o.customerPhone}
                            </span>
                          )}
                        </div>
                        <span className="font-serif font-extrabold text-xl text-amber-800">
                          ${o.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Real-Time Lifecycle Pipeline Stepper */}
                      <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2">
                          Live Order Lifecycle Stage:
                        </span>
                        <div className="grid grid-cols-5 gap-1.5 text-center">
                          {stages.map((st, sIdx) => {
                            const isPassed = sIdx < curStageIdx;
                            const isCurrent = sIdx === curStageIdx;
                            const IconComponent = st.icon;

                            return (
                              <div
                                key={sIdx}
                                className={`p-1.5 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                  isCurrent
                                    ? sIdx === 4
                                      ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                                      : 'bg-amber-600 text-white shadow-xs'
                                    : isPassed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200/60 text-stone-400'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span className="text-[9px] leading-tight line-clamp-1">{st.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items Preview & Settlement Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-stone-500">
                          <span>{o.items.reduce((s, it) => s + it.quantity, 0)} items ordered</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize font-semibold text-stone-700">
                            Payment: {o.paymentMethod || 'Credit Card'}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{o.billSlipType === 'DIGITAL' ? '📱 Digital' : '🖨️ Paper Memo'}</span>
                        </div>

                        {/* Authoritative Settlement Button for Cashier */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSettle(o.id);
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                            isBillReq
                              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isBillReq ? 'Accept Payment & Release Table' : 'Settle Table Tab'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Today's Settled Orders Summary Section */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <h4 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center justify-between">
                <span>Today's Settled Orders Ledger</span>
                <span className="text-xs font-normal text-stone-500">
                  {completedToday.length} completed sessions
                </span>
              </h4>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Table</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Receipt</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {completedToday.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-stone-400">
                          No settled orders yet today.
                        </td>
                      </tr>
                    ) : (
                      completedToday.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-bold text-stone-900">
                            Table {ord.tableId}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 capitalize font-medium text-stone-700">
                            {ord.paymentMethod || 'Card'}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500">
                            {ord.billSlipType === 'DIGITAL' ? '📱 Digital' : '🖨️ Paper'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-serif font-bold text-stone-900">
                            ${ord.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detailed Bill Slip / Preview */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-md flex flex-col justify-between h-fit sticky top-6">
            <div>
              <h4 className="font-serif text-base font-bold text-stone-900 mb-3 border-b border-stone-100 pb-2">
                {selectedOrder ? `Bill Breakdown: Table ${selectedOrder.tableId}` : 'Select a Table Tab'}
              </h4>

              {selectedOrder ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between text-stone-500 font-mono text-[11px]">
                    <span>Ticket: {selectedOrder.id}</span>
                    <span className="capitalize font-bold text-amber-700">Status: {selectedOrder.status}</span>
                  </div>

                  {selectedOrder.customerPhone && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Digital SMS Receipt: <strong>{selectedOrder.customerPhone}</strong></span>
                    </div>
                  )}

                  <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="py-2 flex justify-between">
                        <div>
                          <span className="font-semibold text-stone-800">{it.quantity}x {it.itemNameSnapshot}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {it.round && (
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-1 rounded font-bold">Round {it.round}</span>
                            )}
                            {it.station === 'WAITER_FLOOR' ? (
                              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-bold">💧 Floor Water / Drink</span>
                            ) : (
                              <span className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded font-medium">🍳 Kitchen Prep</span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-stone-900">${it.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-200 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%)</span>
                      <span className="font-semibold text-stone-900">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                      <span>Grand Total</span>
                      <span className="font-serif text-amber-800">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-stone-400 text-xs">
                  Click any table tab on the left to inspect line items, customer slip details, or process settlement.
                </div>
              )}
            </div>

            {selectedOrder && (
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSettle(selectedOrder.id)}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                  >
                    <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cash Settled</span>
                  </button>
                  <button
                    onClick={() => handleSettle(selectedOrder.id)}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card Settled</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
