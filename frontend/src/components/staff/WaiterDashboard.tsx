import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Table, Order } from '../../types';
import { Bell, Users, RefreshCw, CheckCircle2, FileText, Droplets, Phone, Flame, Sparkles } from 'lucide-react';

export const WaiterDashboard: React.FC<{ onSwitchToTable?: (tableId: string) => void }> = ({
  onSwitchToTable,
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, oRes] = await Promise.all([api.getAllTables(), api.getAllOrders()]);
      setTables(tRes);
      setOrders(oRes.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  const getTableActiveOrder = (tId: string) => {
    return orders.find(
      (o) =>
        o.tableId.toLowerCase() === tId.toLowerCase() &&
        o.status !== 'Completed' &&
        o.status !== 'Cancelled'
    );
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Delivered' } : o))
      );
      await api.updateOrderStatus(orderId, 'Delivered');
      fetchData();
    } catch (e) {
      console.error(e);
      fetchData();
    }
  };

  // Urgent lists for top action banners
  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const waterOrders = orders.filter(
    (o) =>
      o.status !== 'Completed' &&
      o.status !== 'Cancelled' &&
      o.items.some((it) => it.station === 'WAITER_FLOOR')
  );
  const billRequestOrders = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.billRequested
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Bell className="w-4 h-4" />
            <span>Floor & Waitstaff Terminal</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Table Status & Dining Floor Plan
          </h2>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Floor</span>
        </button>
      </div>

      {/* Urgent Food Ready Notifications */}
      {readyOrders.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-2 border-emerald-500 rounded-2xl shadow-md animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
              <span>Dishes Ready for Server Pickup ({readyOrders.length})</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Kitchen Dispatch
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {readyOrders.map((o) => (
              <div
                key={o.id}
                className="p-3 bg-white rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-stone-900 text-sm block">Table {o.tableId}</span>
                  <span className="text-[11px] text-stone-500 block">
                    {o.items.reduce((s, it) => s + it.quantity, 0)} Items Plated & Ready
                  </span>
                </div>
                <button
                  onClick={() => handleMarkDelivered(o.id)}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>🚀 GO Deliver</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Floor Service for Bottled Water & Drinks */}
      {waterOrders.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/10 border-2 border-blue-400 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
              <Droplets className="w-5 h-5 text-blue-600 animate-bounce" />
              <span>Direct Floor Service: Bottled Water & Beverage Requests</span>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Bypasses Kitchen Prep
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {waterOrders.map((o) => {
              const floorItems = o.items.filter((it) => it.station === 'WAITER_FLOOR');
              return (
                <div
                  key={o.id}
                  className="p-3 bg-white rounded-xl border border-blue-200 shadow-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-stone-900 text-xs block">Table {o.tableId}</span>
                    <span className="text-[11px] text-blue-800 font-medium">
                      {floorItems.map((it) => `${it.quantity}x ${it.itemNameSnapshot}`).join(', ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Serve Chilled
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floor Bill Requests */}
      {billRequestOrders.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-rose-950 font-bold text-sm mb-3">
            <FileText className="w-5 h-5 text-rose-600" />
            <span>Table Bill Requests ({billRequestOrders.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {billRequestOrders.map((o) => (
              <div
                key={o.id}
                className="p-3 bg-white rounded-xl border border-rose-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 text-xs block">Table {o.tableId}</span>
                  <span className="text-[11px] text-rose-700 font-semibold">
                    {o.billSlipType === 'DIGITAL'
                      ? `📱 Digital Slip (${o.customerPhone || 'SMS'})`
                      : '📄 Deliver Printed Paper Memo'}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Due ${o.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && tables.length === 0 ? (
        <div className="text-center py-16 text-stone-500">Loading tables...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tables.map((t) => {
            const activeOrder = getTableActiveOrder(t.id);
            const isBillRequested = activeOrder?.billRequested;
            const isOccupied = Boolean(activeOrder);
            const isReadyForPickup = activeOrder?.status === 'Ready';
            const hasFloorItems = activeOrder?.items.some((it) => it.station === 'WAITER_FLOOR');

            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-md ${
                  isBillRequested
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/50'
                    : isReadyForPickup
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50'
                    : isOccupied
                    ? 'bg-stone-50 border-stone-300'
                    : 'bg-white border-stone-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => onSwitchToTable && onSwitchToTable(t.id)}
                      className="font-serif text-xl font-bold text-stone-900 hover:text-amber-700 transition-colors text-left cursor-pointer"
                      title={`Open Table ${t.id} Digital Menu`}
                    >
                      Table {t.id}
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isBillRequested
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isReadyForPickup
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : isOccupied
                          ? 'bg-stone-800 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBillRequested
                        ? 'Bill Requested'
                        : isReadyForPickup
                        ? 'Food Ready'
                        : isOccupied
                        ? 'Dining'
                        : 'Available'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 mb-4 flex items-center justify-between">
                    <span>{t.area}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Seats {t.capacity}
                    </span>
                  </div>

                  {/* Active Order Details */}
                  {activeOrder ? (
                    <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-2 mb-4 text-xs">
                      <div className="flex justify-between font-semibold text-stone-700">
                        <span>Order #{activeOrder.id.slice(-4)}</span>
                        <span className="text-amber-800 font-bold">${activeOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex justify-between">
                        <span>Items: {activeOrder.items.reduce((s, it) => s + it.quantity, 0)}</span>
                        <span className="capitalize font-medium text-stone-900">
                          Status: {activeOrder.status}
                        </span>
                      </div>

                      {/* Floor Direct Service Alert */}
                      {hasFloorItems && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-center gap-1.5 font-semibold text-[11px]">
                          <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Direct Service: Serve Bottled Water / Drinks</span>
                        </div>
                      )}

                      {/* Bill Delivery Alert */}
                      {isBillRequested && (
                        <div className="p-2 bg-rose-100 border border-rose-300 rounded-lg text-rose-950 font-bold text-[11px] flex items-center gap-1.5">
                          {activeOrder.billSlipType === 'DIGITAL' ? (
                            <>
                              <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>Digital Slip ({activeOrder.customerPhone || 'SMS'})</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                              <span>Deliver Printed Paper Memo to Table</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center text-xs text-emerald-800 font-medium mb-4">
                      Ready for next seating
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {isReadyForPickup && activeOrder ? (
                    <button
                      onClick={() => handleMarkDelivered(activeOrder.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🚀 GO — Deliver Food to Table {t.id}</span>
                    </button>
                  ) : isOccupied ? (
                    <div className="text-center text-[11px] py-1 font-medium">
                      {activeOrder?.status === 'Preparing' ? (
                        <span className="text-amber-700 font-bold flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                          <span>Chef cooking in kitchen...</span>
                        </span>
                      ) : (
                        <span className="text-stone-400">Guests seated at table</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-emerald-600 py-1 font-medium">
                      Table ready for guests
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
