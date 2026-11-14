# Data Model Specification
## QR-Based Restaurant Ordering System

### 1. Entity-Relationship Overview

```
+--------------------+            +--------------------+
|     Restaurant     | 1        * |       Table        |
|--------------------|<-----------|--------------------|
| id: string (PK)    |            | id: string (PK)    |
| name: string       |            | restaurantId: FK   |
| currency: string   |            | tableNumber: string|
| taxRate: number    |            | area: string       |
+--------------------+            | status: string     |
          | 1                     +--------------------+
          |                                 | 1
          | *                               |
+--------------------+                      | *
|    MenuCategory    |            +--------------------+
|--------------------|            |       Order        |
| id: string (PK)    |            |--------------------|
| restaurantId: FK   |            | id: string (PK)    |
| name: string       |            | tableId: FK        |
| displayOrder: int  |            | status: string     |
+--------------------+            | subtotal: number   |
          | 1                     | tax: number        |
          |                       | total: number      |
          | *                     | createdAt: Date    |
+--------------------+            +--------------------+
|      MenuItem      | 1                    | 1
|--------------------|                      |
| id: string (PK)    |                      | *
| categoryId: FK     |            +--------------------+
| name: string       |            |     OrderItem      |
| description: string|            |--------------------|
| price: number      |            | menuItemId: FK     |
| isAvailable: bool  |            | itemNameSnapshot   |
| imageUrl: string   |            | unitPriceSnapshot  |
| dietary: string[]  |            | quantity: int      |
+--------------------+            | lineTotal: number  |
                                  +--------------------+
                                            | 1
                                            |
                                            | 0..1
                                  +--------------------+
                                  |    BillRequest     |
                                  |--------------------|
                                  | id: string (PK)    |
                                  | orderId: FK        |
                                  | tableId: FK        |
                                  | totalAmount: number|
                                  | status: string     |
                                  | requestedAt: Date  |
                                  +--------------------+
```

### 2. Entity Definitions

#### Restaurant
```typescript
interface Restaurant {
  id: string;               // Unique restaurant identifier (e.g., "rest_001")
  name: string;             // Display name (e.g., "L'Aura Bistro & Bar")
  tagline: string;          // Tagline or branding descriptor
  currency: string;         // ISO or symbol (e.g., "$", "USD")
  taxRate: number;          // e.g., 0.05 (5%)
  status: 'ACTIVE' | 'INACTIVE';
}
```

#### Table
```typescript
interface Table {
  id: string;               // e.g., "T01", "T02", "VIP-01"
  restaurantId: string;
  tableNumber: string;      // Human label: "01", "02"
  area: string;             // "Indoor Main", "Patio Terrace", "VIP Lounge"
  capacity: number;         // Seating capacity
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}
```

#### MenuCategory
```typescript
interface MenuCategory {
  id: string;               // e.g., "cat_starters", "cat_mains"
  restaurantId: string;
  name: string;             // "Starters & Small Plates", "Artisanal Mains"
  displayOrder: number;     // 1, 2, 3...
}
```

#### MenuItem
```typescript
interface MenuItem {
  id: string;               // e.g., "item_truffle_fries"
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;            // Fixed decimal float (e.g. 14.50)
  imageUrl: string;         // Optimized CDN or static asset URL
  isAvailable: boolean;     // Real-time stock toggle
  dietary?: string[];       // ['Vegetarian', 'Gluten-Free', 'Chef Special', 'Spicy']
  prepTimeMinutes?: number; // e.g. 12
}
```

#### Order & OrderItem
```typescript
interface OrderItem {
  menuItemId: string;
  itemNameSnapshot: string; // Captured at order time
  unitPriceSnapshot: number;// Captured at order time
  quantity: number;         // Positive integer >= 1
  lineTotal: number;        // (unitPriceSnapshot * quantity)
  specialInstructions?: string;
  round?: number;           // 1 for first round, 2 for additional items, etc.
  destinationStation?: 'KITCHEN' | 'BAR' | 'WAITER_FLOOR'; // Intelligent routing destination
  addedAt?: string;         // ISO timestamp when round was ordered
}

interface Order {
  id: string;               // ORD-YYYYMMDD-XXXX
  restaurantId: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;         // Sum of lineTotals
  tax: number;              // Calculated tax
  total: number;            // subtotal + tax
  status: 'Received' | 'Accepted' | 'Preparing' | 'Ready' | 'Delivered' | 'Completed' | 'Cancelled';
  customerNote?: string;
  billRequested: boolean;
  createdAt: string;        // ISO 8601
  updatedAt: string;
}
```

#### BillRequest
```typescript
interface BillRequest {
  id: string;               // BILL-YYYYMMDD-XXXX
  orderId: string;
  tableId: string;
  totalAmount: number;
  paymentMethodPreference?: 'CASH' | 'CARD' | 'SPLIT';
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'SETTLED';
  requestedAt: string;      // ISO 8601
}
```

### 3. Financial Precision & Snapshot Integrity
1. **Financial Immutability**: If a chef alters the price of Truffle Fries from \$12.50 to \$16.00 later in the evening, previously placed orders retain the exact `unitPriceSnapshot` and `lineTotal` from when the order was submitted.
2. **Rounding Protocol**: All line calculations apply standard financial 2-decimal precision (`Math.round((val + Number.EPSILON) * 100) / 100`) preventing floating point drift.
3. **MongoDB Migration Mapping**: All interfaces map cleanly to MongoDB Mongoose schemas with ObjectId or string indices in Phase 2.
