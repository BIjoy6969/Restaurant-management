# Testing Strategy
## QR-Based Restaurant Ordering System

### 1. Quality Assurance Philosophy
This system handles financial transactions and food orders. Customer trust requires that:
1. **Never Trust Client Data**: Prices, totals, discounts, item descriptions, and tax rates sent in HTTP payloads must never be committed to records without server catalog validation.
2. **Resilient User Flow**: Invalid or disconnected states (e.g. invalid QR table scan, sold-out dishes, connection interruptions) must display helpful, non-crashing recovery states.
3. **Automated Verification**: Critical paths are backed by automated integration tests using Vitest and Supertest before deployment or demo execution.

---

### 2. Test Matrix

| Category | Target | Key Scenarios Tested |
| :--- | :--- | :--- |
| **System** | `GET /api/health` | Uptime calculation, version string, 200 OK status |
| **Table Validation** | `GET /api/tables/:tableId/menu` | Valid table returns catalog & branding; invalid table (e.g. `T999`) returns clean 404 error |
| **Menu Item** | `GET /api/menu/items/:itemId` | Single item retrieval; 404 for non-existent item |
| **Order Validation** | `POST /api/orders` | Empty item array fails (400); invalid item ID fails (404); quantity <= 0 fails (400) |
| **Stock Check** | `POST /api/orders` | Unavailable dish rejected with 422 error |
| **Price Tampering** | `POST /api/orders` | Tampered price in client payload is ignored; server computes exact subtotal and tax |
| **Order Retrieval** | `GET /api/orders/:orderId` | Order details retrieved with line items; 404 on unknown order ID |
| **Bill Request** | `POST /api/orders/:orderId/bill-request` | Successfully records bill request; duplicate requests for active order return 409 Conflict |
| **Frontend Unit/Build** | `tsc` + Vite Build | TypeScript strict compliance, asset bundling, tree-shaking |

---

### 3. Execution Commands
To execute the automated test suite:
```bash
# Backend Automated Tests
npm run test:backend

# Or directly in backend folder:
cd backend
npm test

# Full Monorepo Build Check
npm run build
```
