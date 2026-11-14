import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { ChefHat, Clock, CheckCircle2, Flame, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ACTIVE' | 'Preparing' | 'Ready' | 'ALL'>('ACTIVE');

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

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      const res = await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (e) {
      console.error(e);
      fetchOrders();
    }
  };

  const hasKitchenItems = (o: Order) => o.items.some((it) => it.station !== 'WAITER_FLOOR');

  const filteredOrders = orders.filter((o) => {
    // If ticket only contains water/floor items, Chef doesn't need to cook it
    if (filter === 'ACTIVE') {
      return (o.status === 'Received' || o.status === 'Preparing') && hasKitchenItems(o);
    }
    if (filter === 'Preparing') {
      return o.status === 'Preparing';
    }
    if (filter === 'Ready') {
      return o.status === 'Ready';
    }
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display System (KDS)</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Live Cooking & Expediter Queue
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['ACTIVE', 'Preparing', 'Ready', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {tab === 'ACTIVE' ? 'Active Cooking' : tab}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-16 text-stone-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="text-xs font-semibold">Loading kitchen tickets...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <ChefHat className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <h3 className="font-serif text-lg font-bold text-stone-800">No Orders in Queue</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            All tickets have been prepared and delivered! New table orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {filteredOrders.map((order) => {
            const isPreparing = order.status === 'Preparing';
            const isReady = order.status === 'Ready';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border shadow-md overflow-hidden flex flex-col justify-between transition-all ${
                  isReady
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : isPreparing
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-stone-200'
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`px-4 py-3 flex items-center justify-between text-white font-semibold text-xs ${
                    isReady ? 'bg-emerald-700' : isPreparing ? 'bg-amber-600' : 'bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Table {order.tableId}</span>
                    <span className="font-mono text-[11px] opacity-80">{order.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 font-bold uppercase text-[10px]">
                    {order.status}
                  </span>
                </div>

                {/* Ticket Content */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-100 pb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{order.items.reduce((s, it) => s + it.quantity, 0)} items</span>
                  </div>

                  {order.customerNote && (
                    <div className="p-2 bg-amber-100/60 rounded-lg text-xs text-amber-900 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{order.customerNote}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs sm:text-sm">
                        <div className="flex-1">
                          <span className="font-bold text-stone-900">
                            <span className="text-amber-700 font-extrabold mr-1.5">{it.quantity}x</span>
                            {it.itemNameSnapshot}
                          </span>
                          {it.round && it.round > 1 && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                              Round {it.round}
                            </span>
                          )}
                          {it.station === 'WAITER_FLOOR' ? (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                              Floor Item (Water/Drink)
                            </span>
                          ) : (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                              Kitchen Prep
                            </span>
                          )}
                          {it.specialInstructions && (
                            <div className="text-[11px] text-rose-700 font-medium italic">
                              ⚠️ {it.specialInstructions}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Active Cooking Indicator */}
                  {isPreparing && (
                    <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
                        <div>
                          <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wider block">
                            🔥 Cooking in Progress...
                          </span>
                          <span className="text-[10px] text-amber-800">Chef actively preparing meal</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                        Cooking
                      </span>
                    </div>
                  )}
                </div>

                {/* Chef Actions */}
                <div className="p-3 bg-stone-50 border-t border-stone-200">
                  {order.status === 'Received' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Ready')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        title="Ready immediately if no kitchen cooking is needed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready Direct</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Ready')}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/40"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🍽️ Mark Ready for Server (Dispatch Waiter)</span>
                    </button>
                  )}

                  {order.status === 'Ready' && (
                    <div className="space-y-2">
                      <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Plated & Ready! Waiter notified to deliver.</span>
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Served to Table</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
