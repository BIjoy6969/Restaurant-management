import React, { useState, useEffect, useMemo } from 'react';
import { api, ApiError } from './services/api';
import { TableMenuResponse, MenuItem, Table, Order } from './types';
import { Navbar } from './components/Navbar';
import { TableBanner } from './components/TableBanner';
import { TableSwitcherModal } from './components/TableSwitcherModal';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuCard } from './components/MenuCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderSummaryModal } from './components/OrderSummaryModal';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { ActiveOrderBanner } from './components/ActiveOrderBanner';
import { ErrorState } from './components/ErrorState';
import { StaffNavbar, AppPortal } from './components/staff/StaffNavbar';
import { KitchenDashboard } from './components/staff/KitchenDashboard';
import { WaiterDashboard } from './components/staff/WaiterDashboard';
import { CashierDashboard } from './components/staff/CashierDashboard';
import { ManagerDashboard } from './components/staff/ManagerDashboard';
import { Utensils, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // Read table parameter from URL (?table=T01)
  const [tableId, setTableId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('table') || 'T01';
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [menuData, setMenuData] = useState<TableMenuResponse | null>(null);
  const [allTables, setAllTables] = useState<Table[]>([]);

  // Filtering states
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string>('ALL');

  // Modals & Active Views
  const [currentPortal, setCurrentPortal] = useState<AppPortal>('customer');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isViewingConfirmation, setIsViewingConfirmation] = useState(false);

  // Sync URL when tableId changes
  const handleSelectTable = (newTableId: string) => {
    setTableId(newTableId);
    const savedOrderId = sessionStorage.getItem(`breakroom_active_order_${newTableId}`);
    if (!savedOrderId) {
      setActiveOrder(null);
      setIsViewingConfirmation(false);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('table', newTableId);
    window.history.pushState({}, '', url.toString());
  };

  // Reset table session after payment settlement or clicking "Start New Order"
  const handleResetTableSession = () => {
    sessionStorage.removeItem(`breakroom_active_order_${tableId}`);
    setActiveOrder(null);
    setIsViewingConfirmation(false);
  };

  // Fetch Table Menu and check only this diner session's active order
  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTableMenu(tableId);
      setMenuData(data);

      // Check if THIS specific diner session already has an active running order for this table
      const savedOrderId = sessionStorage.getItem(`breakroom_active_order_${tableId}`);
      if (savedOrderId) {
        try {
          const res = await api.getOrder(savedOrderId);
          if (res.order && res.order.status !== 'Cancelled' && res.order.status !== 'Completed') {
            setActiveOrder(res.order);
          } else {
            sessionStorage.removeItem(`breakroom_active_order_${tableId}`);
            setActiveOrder(null);
          }
        } catch {
          sessionStorage.removeItem(`breakroom_active_order_${tableId}`);
          setActiveOrder(null);
        }
      } else {
        setActiveOrder(null);
      }

      // Fetch all tables for switcher modal
      try {
        const tables = await api.getAllTables();
        setAllTables(tables);
      } catch {
        // Fallback to table from menu response
        setAllTables([data.table]);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError({ message: err.message, code: err.code });
      } else {
        setError({
          message: 'Unable to connect to the restaurant ordering server. Please ensure the backend is running.',
          code: 'CONNECTION_ERROR',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [tableId]);

  // Real-time sync exclusively for THIS diner session's order
  useEffect(() => {
    let isMounted = true;
    const syncActiveOrder = async () => {
      try {
        const savedOrderId = sessionStorage.getItem(`breakroom_active_order_${tableId}`);
        if (!savedOrderId) {
          if (isMounted) setActiveOrder(null);
          return;
        }

        const res = await api.getOrder(savedOrderId);
        if (isMounted) {
          const fetchedOrder = res.order;
          if (fetchedOrder) {
            if (fetchedOrder.status === 'Cancelled') {
              sessionStorage.removeItem(`breakroom_active_order_${tableId}`);
              setActiveOrder(null);
              setIsViewingConfirmation(false);
            } else {
              setActiveOrder((prev) => {
                if (
                  prev &&
                  prev.id === fetchedOrder.id &&
                  prev.status === fetchedOrder.status &&
                  prev.updatedAt === fetchedOrder.updatedAt &&
                  prev.items.length === fetchedOrder.items.length &&
                  prev.total === fetchedOrder.total &&
                  prev.billRequested === fetchedOrder.billRequested
                ) {
                  return prev;
                }
                return fetchedOrder;
              });
            }
          } else {
            sessionStorage.removeItem(`breakroom_active_order_${tableId}`);
            setActiveOrder(null);
          }
        }
      } catch {
        // quiet
      }
    };

    const interval = setInterval(syncActiveOrder, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tableId]);

  // Listen to popstate (back/forward button in browser)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setTableId(params.get('table') || 'T01');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    if (!menuData) return [];

    return menuData.items.filter((item) => {
      // 1. Category match
      if (activeCategory !== 'ALL' && item.categoryId !== activeCategory) {
        return false;
      }

      // 2. Dietary match
      if (activeDietaryFilter !== 'ALL') {
        const hasTag = item.dietary?.some(
          (t) => t.toLowerCase() === activeDietaryFilter.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // 3. Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [menuData, activeCategory, activeDietaryFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Global Staff & Portal Switcher */}
      <StaffNavbar
        currentPortal={currentPortal}
        onSelectPortal={setCurrentPortal}
        tableId={tableId}
      />

      {currentPortal === 'kitchen' ? (
        <KitchenDashboard />
      ) : currentPortal === 'waiter' ? (
        <WaiterDashboard
          onSwitchToTable={(tId) => {
            handleSelectTable(tId);
            setCurrentPortal('customer');
          }}
        />
      ) : currentPortal === 'cashier' ? (
        <CashierDashboard />
      ) : currentPortal === 'manager' ? (
        <ManagerDashboard />
      ) : (
        <>
          {/* Top Customer Navigation */}
          <Navbar
            restaurant={menuData?.restaurant || null}
            table={menuData?.table || null}
            onOpenTableModal={() => setIsTableModalOpen(true)}
          />

          {/* Main Page Area */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 pb-24 sm:pb-12">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              Loading Dining Experience...
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Preparing artisanal menu for Table {tableId}
            </p>
          </div>
        ) : error ? (
          <ErrorState
            title="Menu Not Available"
            message={error.message}
            code={error.code}
            onRetry={loadMenu}
            onSelectTable={handleSelectTable}
          />
        ) : activeOrder && isViewingConfirmation ? (
          /* Step 6 & 7: Order Confirmation & Bill Request Screen */
          <OrderConfirmationView
            order={activeOrder}
            restaurant={menuData!.restaurant}
            onBackToMenu={() => setIsViewingConfirmation(false)}
            onOrderAdditionalItems={() => setIsViewingConfirmation(false)}
            onResetTableSession={handleResetTableSession}
          />
        ) : (
          /* Step 1 - 5: Digital Menu & Ordering Journey */
          <div>
            {/* Table Welcome Banner */}
            <TableBanner
              restaurant={menuData!.restaurant}
              table={menuData!.table}
              onOpenTableModal={() => setIsTableModalOpen(true)}
            />

            {/* Sticky Category Tabs & Search Bar */}
            <CategoryTabs
              categories={menuData!.categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeDietaryFilter}
              onFilterChange={setActiveDietaryFilter}
            />

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center my-6">
                <Utensils className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="font-serif text-base font-bold text-stone-800">No dishes found</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                  We couldn't find any dishes matching your current filter criteria. Try clearing search or selecting another category.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('ALL');
                    setActiveDietaryFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 sm:gap-6">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    currency={menuData!.restaurant.currency}
                    onOpenDetail={(i) => setSelectedDetailItem(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Persistent Floating Bill Point & All-In-One Order Summary */}
      {menuData && !isViewingConfirmation && (
        <ActiveOrderBanner
          activeOrder={activeOrder}
          restaurant={menuData.restaurant}
          table={menuData.table}
          onViewOrder={() => setIsViewingConfirmation(true)}
          onOrderSuccess={(order) => {
            sessionStorage.setItem(`breakroom_active_order_${tableId}`, order.id);
            setActiveOrder(order);
          }}
        />
      )}
        </>
      )}

      {/* Table Switcher & QR Modal */}
      <TableSwitcherModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTableId={tableId}
        onSelectTable={handleSelectTable}
        allTables={allTables}
      />

      {/* Dish Inspection Detail Modal */}
      {menuData && (
        <ItemDetailModal
          item={selectedDetailItem}
          currency={menuData.restaurant.currency}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Cart Drawer */}
      {menuData && (
        <CartDrawer
          restaurant={menuData.restaurant}
          table={menuData.table}
          activeOrder={activeOrder}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* Pre-Order Confirmation Review Modal */}
      {menuData && (
        <OrderSummaryModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          restaurant={menuData.restaurant}
          table={menuData.table}
          activeOrder={activeOrder}
          onOrderSuccess={(order) => {
            sessionStorage.setItem(`breakroom_active_order_${tableId}`, order.id);
            setActiveOrder(order);
            setIsViewingConfirmation(true);
          }}
        />
      )}
    </div>
  );
};

