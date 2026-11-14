# Development Roadmap
## QR-Based Restaurant Ordering Platform

### Overview & Long-Term Vision
The QR-Based Restaurant Ordering Platform begins with this high-polish Customer Ordering MVP (Phase 1) and scales cleanly into a full-scale hospitality ERP covering waitstaff operations, kitchen display systems (KDS), cashier settlement, inventory deductions, and executive analytics.

```
+-----------------------------------------------------------------------------------+
| Phase 1: Customer MVP (COMPLETED NOW)                                             |
| Table QR Entry -> Digital Menu -> Cart -> Server Pricing -> Order -> Request Bill |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| Phase 2: Restaurant & Persistence Foundation                                      |
| MongoDB Atlas -> Multi-location schema -> Admin Menu Editor -> Table Management   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| Phase 3: Staff Operations Dashboards                                              |
| Waiter Tablet App -> Kitchen Display System (KDS) -> Cashier POS Terminal         |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| Phase 4: Real-Time & Advanced Operations                                          |
| WebSockets (Socket.io) -> Stripe/ApplePay -> Automated Inventory -> SMS/WhatsApp  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| Phase 5: Production Hardening & Enterprise Scale                                  |
| RBAC (JWT/OIDC) -> Rate Limiting -> Prometheus/Grafana -> Multi-tenant Isolation  |
+-----------------------------------------------------------------------------------+
```

---

### Phase 1: Customer MVP (Current Deliverable)
- **Scope**:
  - Direct QR / Table link navigation (`/menu?table=T01`).
  - Interactive QR Demo code switcher dialog.
  - Category-based food browsing with dietary tagging & allergen indicators.
  - Cart drawer with quantity step controls and item notes.
  - Server-side authoritative validation and recalculation.
  - Order submission with real-time status tracker ("Received").
  - Digital "Request Bill" call-to-waiter action with duplicate protection.
  - Decoupled Repository Pattern using TypeScript interfaces.

---

### Phase 2: Persistence Foundation (Next Phase)
- **Key Objectives**:
  - Connect to MongoDB cluster using Mongoose.
  - Swap In-Memory repository implementations with `MongoTableRepository`, `MongoMenuRepository`, and `MongoOrderRepository` without modifying controllers or services.
  - Introduce migration scripts to seed baseline restaurants, tables, and seasonal menus.
  - Dynamic table management with printable QR batch exports (SVG/PDF).

---

### Phase 3: Staff Operations Dashboards
- **Modules**:
  1. **Intelligent Order & Item Dispatch Engine**:
     - Automatically routes items by category:
       - **Kitchen Station**: Hot appetizers, entrees, steaks, pizzas, and pastas.
       - **Bar Station**: Mocktails, cocktails, wines, and artisanal sodas.
       - **Waiter / Floor Station**: Bottled water, ice, extra napkins, and cutlery (avoids kitchen line clutter!).
     - **Manager / Cashier Override Console**: Allows manager or cashier to dynamically reassign any item (e.g. divert drinks to waitstaff or kitchen on demand).
  2. **Kitchen Display System (KDS)**:
     - Real-time order queue with prep timer alerts (green/amber/red).
     - "Accept Order", "Start Cooking", "Order Ready for Pickup" buttons.
  3. **Waiter & Floor Management**:
     - Visual floor plan indicating occupied tables, idle times, and pending Bill Requests.
     - Direct delivery alerts for floor items (bottled water, napkins, drinks).
     - Capability for waitstaff to add items to an existing customer table tab.
  4. **Cashier / POS Station**:
     - Multi-round aggregated bill review, tips, split bills, cash/card settlement, and receipt printing.
     - **Table Release Authorization**: Manager/Cashier formally approves settled bills to release the table for new diners (automating the MVP demo auto-settle flow).

---

### Phase 4: Advanced Real-Time Workflows
- **Features**:
  - WebSocket bidirectional streaming: Order status automatically updates on customer phone from "Received" -> "Preparing" -> "Served" without manual page refreshes.
  - Payment Gateways: Stripe Checkout, Apple Pay, Google Pay, Razorpay, or local QR payment (e.g. bKash / Pix / UPI).
  - Bill settlement webhook integration.
  - Recipe-level ingredient deduction and low-stock alerts.

---

### Phase 5: Enterprise Production Hardening
- **Features**:
  - Multi-tenant tenant ID isolation per restaurant branch.
  - Role-Based Access Control (Admin, Manager, Chef, Server, Cashier).
  - Distributed caching via Redis for hot menu items.
  - Cloudflare edge protection, WAF, and DDoS mitigation.
