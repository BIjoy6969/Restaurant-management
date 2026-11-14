# QR-Based Restaurant Ordering System (Customer MVP)
> **Modern, mobile-first QR table ordering platform designed with clean domain-driven architecture, authoritative server-side pricing, and an artisanal dining user experience.**

---

## 1. Project Overview

The **QR-Based Restaurant Ordering System** empowers restaurant guests to scan a table-specific QR code, explore a rich digital menu, customize orders with kitchen notes, and submit tickets directly to the kitchen without waiting for waitstaff. Guests can track their ticket status in real-time and summon waitstaff to settle the check via the **"Request Bill"** workflow.

Designed from the ground up as a **Modular Monolith** using TypeScript, this MVP (Phase 1) features strict separation of concerns, repository interfaces prepared for MongoDB, Zod validation, zero-trust server-side pricing, and a responsive mobile-first aesthetic.

---

## 2. Key Features

- **Table QR Entry & Simulator**: Seamless entry via `/menu?table=T01`. Includes an interactive **Table Switcher & QR Code Generator** modal rendering scannable QR codes for sample tables (`T01`, `T02`, `T03`, `VIP-01`) and simulating invalid table scans (`T999`).
- **Artisanal Digital Menu**: High-definition food imagery with automatic SVG fallback placeholders, category navigation, dietary badges (*Chef's Special*, *Vegetarian*, *Spicy*, *Gluten-Free*), prep times, and calorie counts.
- **Out-of-Stock Handling**: Real-time stock availability badges with client button disabling and backend validation preventing orders on sold-out dishes.
- **Search & Dietary Filtering**: Instant text search across dish titles and descriptions, alongside quick toggle filters.
- **Dish Inspection & Customization**: Detailed modal displaying ingredients, allergens, and special instruction inputs for kitchen preferences.
- **Interactive Shopping Cart**: Quantity stepper, persistent local storage cart state, line total recalculation, and animated mobile floating cart bar.
- **Authoritative Server Pricing**: Client-submitted prices and totals are strictly ignored; the backend queries catalog prices, computes line totals, and calculates taxes authoritatively.
- **Order Lifecycle & Snapshots**: Generates standardized order tickets (`ORD-YYYYMMDD-XXXX`) and captures permanent price/name snapshots for financial immutability.
- **Multi-Round Running Bill (Table Session)**: Customers clicking *"Order Additional Items"* add subsequent rounds (`Round 2`, `Round 3`) to their existing table order. Subtotal and grand total are automatically merged into a single cumulative bill.
- **Intelligent Station Item Routing Plan**: Architecture designed for Phase 3 where hot food routes to the Kitchen (KDS), drinks route to the Bar, and items like bottled water or cutlery route directly to Floor Waitstaff without disturbing the kitchen, with manager override capability.
- **Request Bill Flow**: Diner can request their bill with payment preference (*Card*, *Cash*, *Split*); includes backend idempotency to prevent duplicate requests.
- **Comprehensive Error Boundaries**: Custom error states for invalid table codes, network interruptions, and malformed requests.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom warm slate & amber palette) + Google Fonts (*Plus Jakarta Sans*, *Playfair Display*)
- **Icons**: Lucide React
- **QR Engine**: `qrcode.react` (SVG rendering)
- **Architecture**: Modular React Context (`CartContext`), typed API services, and responsive components.

### Backend
- **Runtime**: Node.js v22+
- **Framework**: Express + TypeScript
- **Validation**: Zod schema validation
- **Architecture**: Domain-Driven Modular Monolith with Repository Pattern (Interfaces ready for MongoDB Atlas)
- **Security**: Strict CORS configuration, 1MB JSON body limits, non-leaking production error handler.

### Testing & Quality Assurance
- **Framework**: Vitest + Supertest
- **Coverage**: Health check, table validation, menu item retrieval, order validation, price tampering safeguards, order retrieval, and bill request idempotency.

---

## 4. Project Structure

```
resturent management/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # Express route handlers
│   │   ├── data/               # Seed restaurant & menu data
│   │   ├── middleware/         # Error handler & CORS
│   │   ├── repositories/       # Interfaces & In-Memory storage
│   │   ├── routes/             # REST route registry
│   │   ├── services/           # Authoritative business logic
│   │   ├── types/              # Domain interfaces
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap
│   ├── tests/
│   │   └── api.test.ts         # Automated integration tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, TableBanner, MenuCard, CartDrawer, etc.
│   │   ├── context/            # CartContext state provider
│   │   ├── services/           # Typed REST API client
│   │   ├── types/              # Frontend domain models
│   │   ├── App.tsx             # Root customer journey container
│   │   └── main.tsx            # React application entry
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── architecture.md         # Architecture blueprint & diagrams
│   ├── api-specification.md    # REST endpoints & error codes
│   ├── data-model.md           # ERD & financial precision
│   ├── development-roadmap.md  # 5-Phase enterprise roadmap
│   └── testing-strategy.md     # QA matrix & test execution
├── package.json                # Monorepo scripts
└── README.md
```

---

## 5. Prerequisites

- **Node.js**: `v18.x` or `v20.x` or `v22.x` (tested on Node `v22.18.0`)
- **npm**: `v9.x` or `v10.x` (tested on npm `10.9.3`)
- Modern web browser (Chrome, Safari, Edge, Firefox) or mobile device.

---

## 6. Installation & Setup

1. **Clone or Navigate to the Workspace**:
   ```bash
   cd "e:\CV\job project\resturent management"
   ```

2. **Install All Dependencies**:
   ```bash
   npm run install:all
   ```
   *(Or individually inside `backend` and `frontend` using `npm install`)*

3. **Verify Environment Files**:
   Default `.env` files are pre-configured:
   - `backend/.env`: `PORT=5000`, `FRONTEND_URL=http://localhost:5173`, `TAX_RATE=0.05`
   - `frontend/.env`: `VITE_API_URL=http://localhost:5000/api`

---

## 7. Running the Application

### Option A: Run Both Services from Monorepo Root

In your terminal, open two windows or tabs:
```bash
# Terminal 1: Start Backend (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 5173)
npm run dev:frontend
```

### Option B: Run Individually
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 8. Verified Local Demo URLs & Table Routes

Once started, access the live customer application:

| Table ID | Table Name | Area | Direct Demo URL |
| :--- | :--- | :--- | :--- |
| **T01** | Table 01 | Indoor Main Dining | `http://localhost:5173/?table=T01` |
| **T02** | Table 02 | Window Garden Booth | `http://localhost:5173/?table=T02` |
| **T03** | Table 03 | Open Air Terrace | `http://localhost:5173/?table=T03` |
| **VIP-01**| VIP 1 | Executive Private Suite | `http://localhost:5173/?table=VIP-01` |
| **Invalid**| Invalid Table | Simulates QR Error | `http://localhost:5173/?table=T999` |

### Backend API Endpoints:
- Health Check: `http://localhost:5000/api/health`
- Table Menu: `http://localhost:5000/api/tables/T01/menu`

---

## 9. Client Demonstration Script (Walkthrough)

Follow this step-by-step sequence to demonstrate the platform to a client:

### Step 1: Table QR Entry & Atmosphere
1. Open `http://localhost:5173/?table=T01` in your browser.
2. Note the ambient branding of **L'Aura Bistro & Bar**, with Table **T01** clearly indicated in the navbar badge and welcome hero.
3. Click the **"Table QR & Switcher"** button in the top banner:
   - Point out the dynamic QR code generated for this exact table.
   - Show how easy it is to copy the URL or switch between tables (`T01`, `T02`, `VIP-01`).
   - Click **"Quick test invalid table (T999)"** to demonstrate the graceful error screen and click **"Switch to Demo Table T01"** to restore.

### Step 2: Menu Browsing & Dietary Filter
1. Scroll through the categories: *Starters*, *Chef's Signature Mains*, *Artisanal Pizza*, *Craft Beverages*, *Decadent Desserts*.
2. Click the quick filters:
   - Click **"Chef's Special"** to filter high-margin signature dishes.
   - Click **"Vegetarian"** to see plant-based options.
   - Type `"truffle"` in the search bar to demonstrate instant live search.

### Step 3: Dish Inspection & Out-of-Stock Protection
1. Click on **"Parmesan Truffle Fries"** to open the inspection modal.
   - Review calories, preparation time, and allergens.
   - Enter special instructions: `"Extra garlic aioli on the side"`.
   - Select quantity `2` and click **"Add to Order"**.
2. Scroll to **"Wild Alaskan Salmon Tartare"**:
   - Point out the red **"Sold Out"** badge and disabled button.
   - Explain how the backend protects against ordering sold-out dishes.

### Step 4: Cart Management & Floating Mobile Bar
1. Add a **"Signature Wagyu Steak Burger"** and a **"Neapolitan Margherita D.O.P."**.
2. Click the cart button in the top navigation (or floating mobile bar).
3. In the slide-over drawer:
   - Demonstrate quantity increment and decrement (`+` / `-`).
   - Notice the live subtotal and 5% local tax computation.
   - Click **"Review & Submit Order"**.

### Step 5: Authoritative Order Placement (Zero Client Trust)
1. In the confirmation dialog, enter a general note: `"Celebrating an anniversary, window seating appreciated."`
2. Click **"Confirm & Place Order"**:
   - The button enters a loading state to debounce multiple clicks.
   - The server verifies item availability, discards any client prices, recalculates the subtotal and tax, and assigns ticket number `ORD-YYYYMMDD-XXXX`.

### Step 6: Confirmation & Ticket Tracking
1. The **Order Confirmed** screen appears with an emerald checkmark.
2. Review the generated Order ID, table association, timestamp, and itemized snapshot breakdown.
3. Note the status badge: **"Received"** (with explanation that chef acceptance begins in Phase 3).

### Step 7: Request Bill Settlement & Table Release
1. On the confirmation screen, scroll down to **"Ready to Settle? Request Your Bill"**.
2. Select payment method: **"Credit Card"**.
3. Click **"Request Payment & Settle Table T01"**.
4. Observe the green settlement banner: *"Payment Confirmed & Table T01 Cleared!"*
   - The ticket is marked `Completed` on the server, and Table T01 is officially released.
5. Click **"Start New Order on Table T01 (Table Cleared)"**:
   - The session is reset, cart is empty, and Table T01 is 100% fresh for the next customer or demo walkthrough!
   *(Note: In Phase 3, this final table clearing is approved by the Manager/Cashier POS screen).*

---

## 10. Scanning from a Physical Smartphone (LAN Setup)

To demonstrate the QR scan using a real phone camera during a live presentation:

1. Connect your computer and mobile phone to the **same Wi-Fi network**.
2. Check your computer's local IP address (`ipconfig` on Windows, e.g., `192.168.10.225`).
3. Open `http://192.168.10.225:5173/?table=T01` on your laptop browser.
4. Click **"Table QR & Switcher"**. The QR code dynamically encodes this LAN URL.
5. Aim your phone camera at the screen: it opens the responsive dining experience directly on your mobile device!

---

## 11. Automated Testing & Verification

Run the comprehensive integration test suite:

```bash
# Run backend tests
npm run test:backend
```

### Verified Test Results:
- `✓ tests/api.test.ts (15 tests)` — **15 passed, 0 failed**
  - System health check endpoint
  - Table menu retrieval with valid table ID (`T01`)
  - Error handling for invalid table ID (`T999`)
  - Menu item detail retrieval & 404 handler
  - Order validation: rejects empty cart
  - Order validation: rejects non-positive quantities
  - Order validation: rejects non-existent item IDs
  - Stock validation: rejects sold-out dishes (`item_salmon_tartare`)
  - Security validation: discards tampered client prices, recalculates server totals
  - Order retrieval: fetches created order record
  - Bill request: successfully creates bill request
  - Bill request idempotency: rejects duplicate request for active order (`409 Conflict`)
  - Bill request error handling: rejects non-existent order ID

### Full Production Build:
```bash
# Build backend and frontend
npm run build
```
- Backend TypeScript compilation: **Passed (`tsc` clean)**
- Frontend Vite production bundling: **Passed (`vite build` in 10s, 0 errors)**

---

## 12. Known Limitations & Phase 2+ Scope

1. **In-Memory Demo Persistence**: Orders and bill requests reside in the backend application memory for the MVP. Restarting the server resets the orders back to the clean seed state. (Phase 2 introduces persistent MongoDB Atlas).
2. **Payment Processing**: Bill request notifies staff to bring the physical check; online credit card payment gateways (Stripe, Apple Pay) are slated for Phase 4.
3. **Staff Floor Apps**: Kitchen Display Systems (KDS) and Waiter Handheld Tablets are planned for Phase 3.

---

## 13. Future Roadmap

See [`docs/development-roadmap.md`](./docs/development-roadmap.md) for complete details:
- **Phase 1**: Customer Ordering MVP (*Completed*)
- **Phase 2**: MongoDB Persistence & Restaurant Admin Configuration
- **Phase 3**: Staff Workflows (Kitchen Display System, Waiter Tablets, Cashier POS)
- **Phase 4**: Real-Time WebSockets & Payment Gateway Integration
- **Phase 5**: Enterprise Multi-Tenant Scaling, Role-Based Access Control & Auditing

