# REST API Specification

### Base URL
`http://localhost:5000/api`

---

## 1. System Health

### `GET /health`
Verifies backend operational status, uptime, and system time.

- **Request Headers**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 142.5,
    "timestamp": "2026-11-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## 2. Table & Menu Operations

### `GET /tables/:tableId/menu`
Retrieves restaurant branding, active table metadata, food categories, and available menu items.

- **Parameters**: `tableId` (string, required - e.g., `T01`, `T02`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest_001",
      "name": "L'Aura Bistro & Bar",
      "tagline": "Modern Artisanal Dining & Craft Mixology",
      "currency": "$",
      "taxRate": 0.05
    },
    "table": {
      "id": "T01",
      "tableNumber": "01",
      "area": "Indoor Main Dining",
      "capacity": 4,
      "status": "AVAILABLE"
    },
    "categories": [
      {
        "id": "cat_starters",
        "name": "Starters & Small Plates",
        "displayOrder": 1
      }
    ],
    "items": [
      {
        "id": "item_truffle_fries",
        "categoryId": "cat_starters",
        "name": "Parmesan Truffle Fries",
        "description": "Crisp hand-cut russet potatoes tossed in black truffle oil, aged pecorino, and fresh rosemary with garlic aioli.",
        "price": 12.50,
        "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80",
        "isAvailable": true,
        "dietary": ["Vegetarian"],
        "prepTimeMinutes": 10
      }
    ]
  }
}
```
- **Error `404 Not Found`**:
```json
{
  "success": false,
  "error": {
    "code": "TABLE_NOT_FOUND",
    "message": "Table T999 is invalid or not registered in the system."
  }
}
```

---

### `GET /menu/items/:itemId`
Retrieves individual menu item details.

- **Parameters**: `itemId` (string, required)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "item_wagyu_burger",
    "categoryId": "cat_mains",
    "name": "Signature Wagyu Burger",
    "description": "Brioche bun, 7oz Wagyu beef patty, caramelized onion jam, aged Gruyere, and house secret sauce.",
    "price": 24.00,
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    "isAvailable": true,
    "dietary": ["Chef Special"],
    "prepTimeMinutes": 18
  }
}
```
- **Error `404 Not Found`**:
```json
{
  "success": false,
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Menu item not found."
  }
}
```

---

## 3. Order Operations

### `POST /orders`
Creates and submits a customer order for a verified table. **Server recalculates all pricing.**

- **Request Body**:
```json
{
  "tableId": "T01",
  "items": [
    {
      "menuItemId": "item_truffle_fries",
      "quantity": 2,
      "specialInstructions": "Extra aioli on the side"
    },
    {
      "menuItemId": "item_wagyu_burger",
      "quantity": 1
    }
  ],
  "customerNote": "Celebrating an anniversary"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ORD-20261101-7821",
      "restaurantId": "rest_001",
      "tableId": "T01",
      "items": [
        {
          "menuItemId": "item_truffle_fries",
          "itemNameSnapshot": "Parmesan Truffle Fries",
          "unitPriceSnapshot": 12.50,
          "quantity": 2,
          "lineTotal": 25.00,
          "specialInstructions": "Extra aioli on the side"
        },
        {
          "menuItemId": "item_wagyu_burger",
          "itemNameSnapshot": "Signature Wagyu Burger",
          "unitPriceSnapshot": 24.00,
          "quantity": 1,
          "lineTotal": 24.00
        }
      ],
      "subtotal": 49.00,
      "tax": 2.45,
      "total": 51.45,
      "status": "Received",
      "createdAt": "2026-11-01T12:05:00.000Z",
      "customerNote": "Celebrating an anniversary"
    }
  }
}
```
- **Error `400 Bad Request`**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cart cannot be empty or invalid item quantities."
  }
}
```
- **Error `422 Unprocessable Entity`**:
```json
{
  "success": false,
  "error": {
    "code": "ITEM_UNAVAILABLE",
    "message": "Item 'Wild Alaskan Salmon' is currently out of stock."
  }
}
```

---

### `GET /orders/:orderId`
Retrieves live order summary and current status.

- **Parameters**: `orderId` (string, required)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ORD-20261101-7821",
      "tableId": "T01",
      "items": [...],
      "subtotal": 49.00,
      "tax": 2.45,
      "total": 51.45,
      "status": "Received",
      "billRequested": false,
      "createdAt": "2026-11-01T12:05:00.000Z"
    }
  }
}
```
- **Error `404 Not Found`**:
```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order ORD-20261101-7821 was not found."
  }
}
```

---

### `POST /orders/:orderId/items`
Appends additional rounds of food or beverages to an existing table order, merging them into the active running bill.

- **Parameters**: `orderId` (string, required)
- **Request Body**:
```json
{
  "items": [
    {
      "menuItemId": "item_passionfruit_mocktail",
      "quantity": 2,
      "specialInstructions": "Less ice"
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ORD-20261101-7821",
      "tableId": "T01",
      "items": [
        {
          "menuItemId": "item_truffle_fries",
          "itemNameSnapshot": "Parmesan Truffle Fries",
          "unitPriceSnapshot": 11.50,
          "quantity": 2,
          "lineTotal": 23.00,
          "round": 1
        },
        {
          "menuItemId": "item_passionfruit_mocktail",
          "itemNameSnapshot": "Sparkling Passionfruit Spritz",
          "unitPriceSnapshot": 8.50,
          "quantity": 2,
          "lineTotal": 17.00,
          "round": 2
        }
      ],
      "subtotal": 40.00,
      "tax": 2.00,
      "total": 42.00,
      "status": "Received",
      "billRequested": false,
      "updatedAt": "2026-11-01T12:35:00.000Z"
    },
    "message": "Additional items successfully added to running bill."
  }
}
```

---

### `GET /tables/:tableId/active-order`
Fetches any currently active, un-settled running bill order for a table session.

- **Parameters**: `tableId` (string, required)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ORD-20261101-7821",
      "tableId": "T01",
      "total": 42.00,
      "status": "Received"
    }
  }
}
```

---

## 4. Bill Request Operations

### `POST /orders/:orderId/bill-request`
Alerts waitstaff that the diner at this table is requesting the physical bill settlement.

- **Parameters**: `orderId` (string, required)
- **Request Body**:
```json
{
  "paymentMethodPreference": "CARD" // Optional: "CASH", "CARD", "SPLIT"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "billRequest": {
      "id": "BILL-20261101-1049",
      "orderId": "ORD-20261101-7821",
      "tableId": "T01",
      "totalAmount": 51.45,
      "status": "REQUESTED",
      "requestedAt": "2026-11-01T12:45:00.000Z",
      "paymentMethodPreference": "CARD",
      "message": "Staff has been notified. A server will bring your bill to Table T01 shortly."
    }
  }
}
```
- **Error `409 Conflict`**:
```json
{
  "success": false,
  "error": {
    "code": "BILL_ALREADY_REQUESTED",
    "message": "A bill request has already been placed for this order. Waitstaff has been notified."
  }
}
```
