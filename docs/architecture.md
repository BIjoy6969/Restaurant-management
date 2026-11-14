# Architecture Documentation
## QR-Based Restaurant Ordering System (Customer MVP)

### 1. Architectural Philosophy
The QR-Based Restaurant Ordering System is designed as a **Modular Monolith** prioritizing maintainability, low operational complexity, and strict separation of concerns.

```
+-------------------------------------------------------------+
|                      Customer Browser                       |
|   (Mobile-First Responsive React 18 + TypeScript + Vite)    |
+-------------------------------------------------------------+
                              |
                              | HTTP / JSON (REST)
                              v
+-------------------------------------------------------------+
|                   Node.js + Express Backend                 |
|                                                             |
|   +-----------------------------------------------------+   |
|   |   HTTP Middleware Layer                             |   |
|   |   - CORS Configuration                              |   |
|   |   - JSON Body Parsing & Size Limits                 |   |
|   |   - Global Error & Exception Handling               |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                              v                              |
|   +-----------------------------------------------------+   |
|   |   Routing Layer (/api/*)                            |   |
|   |   - /health                                         |   |
|   |   - /tables/:tableId/menu                           |   |
|   |   - /menu/items/:itemId                             |   |
|   |   - /orders                                         |   |
|   |   - /orders/:orderId                                |   |
|   |   - /orders/:orderId/bill-request                   |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                              v                              |
|   +-----------------------------------------------------+   |
|   |   Controllers & Zod Schema Validation               |   |
|   |   - Sanitizes and validates request bodies/params   |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                              v                              |
|   +-----------------------------------------------------+   |
|   |   Business Service Layer                            |   |
|   |   - Server-Side Pricing & Tax Recalculation         |   |
|   |   - Item Availability Verification                  |   |
|   |   - Order Lifecycle & ID Generation                 |   |
|   |   - Duplicate Bill-Request Safeguards               |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                              v                              |
|   +-----------------------------------------------------+   |
|   |   Repository Data Access Layer (Interfaces)         |   |
|   |   - ITableRepository                                |   |
|   |   - IMenuRepository                                 |   |
|   |   - IOrderRepository                                |   |
|   |   - IBillRequestRepository                          |   |
|   +-----------------------------------------------------+   |
|             |                                   |           |
|             v                                   v           |
|   +-----------------------+           +-----------------+   |
|   | In-Memory Seed Store  |           | Future MongoDB  |   |
|   | (Phase 1 MVP Runtime) |           | (Phase 2 Ready) |   |
|   +-----------------------+           +-----------------+   |
+-------------------------------------------------------------+
```

### 2. Layered Responsibilities

1. **Presentation Layer (Frontend)**:
   - React 18, TypeScript, Tailwind CSS, Lucide icons.
   - Mobile-first adaptive layout with QR Code generator utility for demonstrations.
   - Client-side cart state management with real-time UI updates, optimistic feedback, and input validation.
   - Resilient image fallbacks for zero visual degradation.

2. **API & Controller Layer**:
   - Express REST API routes receiving JSON payloads.
   - Zod validation intercepting invalid table formats, empty carts, malformed items, and non-numeric quantities.
   - Uniform response payloads: `{ success: true, data: ... }` or `{ success: false, error: { code, message, details? } }`.

3. **Domain & Business Logic Layer**:
   - **Zero Client Trust**: All pricing, discounts, tax computations, and item verification occur exclusively on the server.
   - Snapshots item names and unit prices at order time to guarantee financial immutability regardless of future menu price modifications.
   - State transition validation (e.g., verifying table existence, checking if bill request is already pending).

4. **Repository & Data Access Layer**:
   - High-level interfaces (`ITableRepository`, `IMenuRepository`, `IOrderRepository`, `IBillRequestRepository`) decouple business services from underlying storage.
   - Phase 1 implements clean in-memory JSON seeded repositories.
   - Phase 2 will plug in MongoDB Mongoose repositories without changing a single line of business logic or API contracts.

### 3. Intelligent Order & Item Dispatch Architecture (Kitchen vs. Waiter vs. Bar)

In a high-efficiency restaurant, not all ordered items should alert kitchen chefs. For instance, when a diner orders **Bottled Water, Ice, or Extra Napkins**, routing this to the hot line kitchen causes cooking distraction and ticket clutter.

```
+-------------------------------------------------------------+
|               Customer Table Order (Initial or Round 2)     |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|             Intelligent Item Dispatch Engine                |
|      (Automated Classification & Routing Rules)             |
+-------------------------------------------------------------+
            │                         │                     │
            ▼                         ▼                     ▼
+-----------------------+ +---------------------+ +--------------------+
| Kitchen Display (KDS) | | Bar Station Display | | Waitstaff Handheld |
|-----------------------| |---------------------| |--------------------|
| - Artisan Burgers     | | - Passionfruit Soda | | - Bottled Water    |
| - Truffle Fries       | | - Botanical Tea     | | - Extra Ice Cubes  |
| - Neapolitan Pizza    | | - Craft Cocktails   | | - Cutlery / Napkins|
+-----------------------+ +---------------------+ +--------------------+
            ▲                         ▲                     ▲
            └─────────────────────────┼─────────────────────┘
                                      │
+-------------------------------------------------------------+
|             Manager & Cashier POS Central Console           |
+-------------------------------------------------------------+
```

1. **Station Tagging**: Each menu item defines a target fulfillment station:
   - `KITCHEN`: Hot food, grill, fryer, oven, and pastry items.
   - `BAR`: Craft mocktails, sodas, wines, and chilled beverage prep.
   - `WAITER_FLOOR`: Bottled water, packaged beverages, side condiments, and service requests.
2. **Manager Dispatch Control**: Floor managers and cashiers can view real-time station routing and manually re-route tickets (e.g., dispatching a beverage to the kitchen if the bar is closed, or assigning water service directly to table waiters).
3. **Multi-Round Table Sessions & Settlement Lifecycle**:
   - An active table session retains a single running bill; additional rounds increment round numbers (`round: 1`, `round: 2`) while updating the central POS ledger.
   - **Bill Request with Slip Choice**:
     - Diners choose **Digital Pay-slip** (stores customer phone number in DB for digital dispatch) or **Physical Memo** (dispatches memo delivery alert to waiter).
   - **Payment Request & Table Release**:
     - *Phase 1 (MVP Demo Mode)*: Requesting payment records the settlement, completes the order ticket (`status: 'Completed'`), and instantly frees the table for the presenter to start a brand new seating session.
     - *Phase 3 (Enterprise Staff Portal)*: The bill request signals the Cashier POS station; once the cashier physically swipes the card or accepts cash, the cashier clicks "Confirm Payment & Release Table", which marks the order completed and opens the table for the next diners.

### 4. Five-Role Modular Platform Architecture

1. **Role 1: Dine-In Customer (Mobile-First Web App)**
   - Scan QR code at table (or select table in demo switcher).
   - Unified master catalog with diet tags, descriptions, photos, and live stock states.
   - Add to cart with custom dish preparation notes (e.g., "no mayo", "extra spicy").
   - Multi-round ordering: diners can add items in Round 1, then click "Order Additional Items" to add items in Round 2 onto the same table running bill.
   - Bill Request: Select payment preference (Cash, Credit Card, Split) and choose between:
     - **Digital Pay-slip**: Input mobile number, stored in order record for customer SMS/digital receipt.
     - **Physical Hard Copy**: Alerts waiter to print and deliver paper bill memo to Table X.

2. **Role 2: Kitchen Display System (KDS / Chef Console)**
   - Real-time ticket board filtered specifically for `KITCHEN` and `BAR` items.
   - Automatic exclusion of non-cooking items (water bottles, pre-packaged drinks, extra cutlery).
   - Interactive cooking lifecycle: `Pending` -> `Start Cooking` -> `Ready for Server`.
   - Preparation timer indicators and customer dietary notes highlighted on tickets.

3. **Role 3: Waiter & Floor Staff Terminal**
   - Dining hall table occupancy matrix (Green: Available, Amber: Dining/Occupied, Red: Bill Requested).
   - Instant direct service alerts:
     - Non-kitchen service alerts (e.g., bottled water to Table T02).
     - Food pickup alerts when kitchen marks items `Ready for Server`.
     - Physical paper bill delivery requests.
   - One-tap quick order entry on behalf of table guests.

4. **Role 4: Cashier POS Terminal**
   - Central table ledger displaying real-time running bills.
   - Settlement options: Cash payment, Credit/Debit card, Split bill.
   - Receipt generation and table release command (`Table Release`) to free table for new diners.

5. **Role 5: Manager / Admin Console & Daily Sales Analytics**
   - **Order Lifecycle Pipeline**: Live state visualizer tracking each order through every stage (Placed -> Accepted -> Kitchen/Bar -> Ready -> Delivered -> Bill Requested -> Settled).
   - **Sales Summary View**: Clean, uncluttered table listing:
     - Table Number
     - Order Time / Timestamp
     - Total Order Amount ($)
     - Order Status
   - **Drill-Down Order Details**: Clicking on any order row opens a comprehensive detail modal showing all item lines, rounds, quantities, unit prices, subtotal, tax, customer phone number, and fulfillment station routes.
   - **Daily Revenue Dashboard**: Total daily gross sales, order count, average ticket value, and payment method breakdown (Cash vs Card).
   - **Professional Printable Sales Report**: One-click printable daily report formatted for thermal receipt printers or standard A4/Letter financial summaries.
   - **Live Stock & Menu Control**: Instant toggle for item availability (`In Stock` / `Sold Out`) and live price adjustment.

### 4. Security & Resilience Decisions
- **CORS Safeguards**: Configured via environment variable (`FRONTEND_URL`) to prevent unauthorized cross-origin requests.
- **Fail-Safe Price Calculation**: The server discards any `price` or `subtotal` sent by the client and queries internal catalog prices.
- **Double-Submission Prevention**: The frontend debounces submission buttons, while backend order and bill-request services enforce idempotency checks.
- **Non-Leaking Error Handlers**: Production errors return clean client-friendly messages without exposing server stack traces or internal environment variables.
