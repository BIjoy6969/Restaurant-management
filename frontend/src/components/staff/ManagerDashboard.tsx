import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MenuItem, DailySalesSummary, Order } from '../../types';
import { 
  Settings2, 
  Check, 
  X, 
  RefreshCw, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Printer, 
  Clock, 
  Phone, 
  FileText, 
  Eye
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SALES' | 'MENU'>('SALES');
  const [salesSummary, setSalesSummary] = useState<DailySalesSummary | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, menuRes] = await Promise.all([
        api.getDailySalesSummary(),
        api.getTableMenu('T01')
      ]);
      setSalesSummary(salesRes);
      setItems(menuRes.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      try {
        const salesRes = await api.getDailySalesSummary();
        setSalesSummary(salesRes);
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStock = async (item: MenuItem) => {
    try {
      const newAvailability = !item.isAvailable;
      await api.updateItemAvailability(item.id, newAvailability);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newAvailability } : i))
      );
      setSavedNotice(`'${item.name}' marked ${newAvailability ? 'In Stock' : 'Sold Out'}`);
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePrice = async (itemId: string, currentPrice: number) => {
    const promptVal = window.prompt('Enter new price ($):', currentPrice.toFixed(2));
    if (!promptVal) return;
    const num = parseFloat(promptVal);
    if (isNaN(num) || num <= 0) return;

    try {
      await api.updateItemAvailability(itemId, true, num);
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, price: num } : i)));
      setSavedNotice('Price updated successfully.');
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const res = await api.getOrder(orderId);
      setSelectedOrder(res.order);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintDailyReport = () => {
    window.print();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Settings2 className="w-4 h-4" />
            <span>General Manager & Backoffice Console</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {activeTab === 'SALES' ? 'Daily Sales Analytics & Order Ledger' : 'Menu Catalog & Real-Time Stock Controls'}
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SALES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SALES'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Daily Sales & Orders
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MENU'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Menu Stock Controls
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold mb-6 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedNotice}</span>
        </div>
      )}

      {loading && !salesSummary ? (
        <div className="text-center py-16 text-stone-500">Loading manager analytics...</div>
      ) : activeTab === 'SALES' ? (
        /* ================= DAILY SALES TAB ================= */
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales Today</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                ৳{salesSummary?.totalRevenue.toFixed(2) || '0.00'}
              </div>
              <span className="text-[11px] text-amber-700/80 font-medium mt-1 block">
                {salesSummary?.totalOrders || 0} customer orders served
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-stone-400" />
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                {salesSummary?.totalOrders || 0}
              </div>
              <span className="text-[11px] text-stone-400 font-medium mt-1 block">
                Avg: ৳{(salesSummary && salesSummary.totalOrders > 0 ? salesSummary.totalRevenue / salesSummary.totalOrders : 0).toFixed(2)} / table
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Card / Digital</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                ৳{salesSummary?.cardRevenue.toFixed(2) || '0.00'}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                Electronic settlement
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Cash Collected</span>
                <Banknote className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                ৳{salesSummary?.cashRevenue.toFixed(2) || '0.00'}
              </div>
              <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                Register cash drawer
              </span>
            </div>
          </div>

          {/* Action Bar: Print & Filters */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Today's Table Order Ledger
              </h3>
              <p className="text-xs text-stone-500">
                Click any order row to inspect full item lines, timestamps, and customer receipt details.
              </p>
            </div>

            <button
              onClick={handlePrintDailyReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Daily Sales Report</span>
            </button>
          </div>

          {/* Order Ledger Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Order Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Payment</th>
                  <th className="py-3 px-4 hidden md:table-cell">Slip Format</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {!salesSummary?.orders || salesSummary.orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                      No customer orders recorded yet today.
                    </td>
                  </tr>
                ) : (
                  salesSummary.orders.map((ord) => (
                    <tr
                      key={ord.orderId}
                      onClick={() => handleViewOrderDetails(ord.orderId)}
                      className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        Table {ord.tableNumber || ord.tableId}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{ord.time}</span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-extrabold text-stone-900">
                        ৳{ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Ready'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'Preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 hidden sm:table-cell">
                        <span className="font-semibold text-xs capitalize">{ord.paymentMethod || 'Card'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 hidden md:table-cell">
                        {ord.billSlipType === 'DIGITAL' ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <Phone className="w-3 h-3" /> Digital Slip
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-stone-600 text-xs">
                            <FileText className="w-3 h-3" /> Paper Memo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrderDetails(ord.orderId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= MENU & STOCK TAB ================= */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-500">
            <span>Dish Name & Category</span>
            <span>Price & Real-time Stock Toggle</span>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-stone-400 capitalize">
                      <span>{item.categoryId.replace('cat_', '')}</span>
                      <span className="text-amber-700 font-semibold">
                        • Station: {item.station || 'KITCHEN'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Price */}
                  <button
                    onClick={() => handleUpdatePrice(item.id, item.price)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg border border-stone-300 hover:border-amber-500 text-xs font-bold text-stone-800"
                    title="Click to edit price"
                  >
                    <span className="font-bold text-amber-600">৳</span>
                    <span>৳{item.price.toFixed(2)}</span>
                  </button>

                  {/* Stock Toggle */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {item.isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                  Table {selectedOrder.tableId} • Order Details
                </span>
                <h3 className="font-mono text-sm font-bold text-stone-900">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Order Meta Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-stone-900">{selectedOrder.status}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Placed At</span>
                  <span className="font-semibold text-stone-900">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="font-bold text-stone-900 capitalize">{selectedOrder.paymentMethod || 'Credit Card'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Bill Slip Format</span>
                  <span className="font-semibold text-stone-900">
                    {selectedOrder.billSlipType === 'DIGITAL' ? '📱 Digital Slip' : '🖨️ Paper Memo'}
                  </span>
                </div>
              </div>

              {selectedOrder.customerPhone && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Customer Phone for Digital Receipt: <strong>{selectedOrder.customerPhone}</strong></span>
                </div>
              )}

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Ordered Food Items
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            <span className="text-amber-700 font-extrabold mr-1">{it.quantity}x</span>
                            {it.itemNameSnapshot}
                          </span>
                          {it.round && it.round > 1 && (
                            <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-bold">
                              Round {it.round}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.2 text-[10px] rounded font-semibold ${
                            it.station === 'WAITER_FLOOR' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {it.station || 'KITCHEN'}
                          </span>
                        </div>
                        {it.specialInstructions && (
                          <div className="text-[11px] text-stone-500 italic mt-0.5">
                            Note: {it.specialInstructions}
                          </div>
                        )}
                      </div>
                      <span className="font-serif font-bold text-stone-900">
                        ৳{it.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* Financials */}
                  <div className="p-3 bg-stone-50 text-xs space-y-1">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span>৳{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Tax (5%)</span>
                      <span>৳{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-serif font-extrabold text-stone-900 text-sm pt-1 border-t border-stone-200">
                      <span>Total</span>
                      <span>৳{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-3xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all"
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
