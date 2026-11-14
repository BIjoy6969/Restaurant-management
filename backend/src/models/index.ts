import mongoose, { Schema, Document } from 'mongoose';
import { Restaurant, Table, MenuCategory, MenuItem, Order, BillRequest, OrderItem } from '../types';

// Restaurant Schema
const RestaurantSchema = new Schema<Restaurant & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  currency: { type: String, default: '$' },
  taxRate: { type: Number, default: 0.05 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

// Table Schema
const TableSchema = new Schema<Table & Document>({
  id: { type: String, required: true, unique: true },
  restaurantId: { type: String, required: true },
  tableNumber: { type: String, required: true },
  area: { type: String, default: 'Main Dining' },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'], default: 'AVAILABLE' }
}, { timestamps: true });

// MenuItem Schema
const MenuItemSchema = new Schema<MenuItem & Document>({
  id: { type: String, required: true, unique: true },
  restaurantId: { type: String, required: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  dietary: [{ type: String }],
  prepTimeMinutes: { type: Number, default: 15 },
  calories: { type: Number },
  station: { type: String, enum: ['KITCHEN', 'BAR', 'WAITER_FLOOR'], default: 'KITCHEN' }
}, { timestamps: true });

// Order Item Subschema
const OrderItemSchema = new Schema<OrderItem>({
  menuItemId: { type: String, required: true },
  itemNameSnapshot: { type: String, required: true },
  unitPriceSnapshot: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true },
  specialInstructions: { type: String },
  round: { type: Number, default: 1 },
  addedAt: { type: String },
  station: { type: String, enum: ['KITCHEN', 'BAR', 'WAITER_FLOOR'], default: 'KITCHEN' }
}, { _id: false });

// Order Schema
const OrderSchema = new Schema<Order & Document>({
  id: { type: String, required: true, unique: true },
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Received', 'Accepted', 'Preparing', 'Ready', 'Serving', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Received' 
  },
  customerNote: { type: String },
  customerPhone: { type: String },
  billRequested: { type: Boolean, default: false },
  billSlipType: { type: String, enum: ['DIGITAL', 'PHYSICAL'] },
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'SPLIT'] },
  settledAt: { type: String }
}, { timestamps: true });

// BillRequest Schema
const BillRequestSchema = new Schema<BillRequest & Document>({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  tableId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethodPreference: { type: String, enum: ['CASH', 'CARD', 'SPLIT'] },
  billSlipType: { type: String, enum: ['DIGITAL', 'PHYSICAL'], default: 'PHYSICAL' },
  customerPhone: { type: String },
  status: { type: String, enum: ['REQUESTED', 'ACKNOWLEDGED', 'SETTLED'], default: 'REQUESTED' },
  requestedAt: { type: String, required: true }
}, { timestamps: true });

export const RestaurantModel = mongoose.model<Restaurant & Document>('Restaurant', RestaurantSchema);
export const TableModel = mongoose.model<Table & Document>('Table', TableSchema);
export const MenuItemModel = mongoose.model<MenuItem & Document>('MenuItem', MenuItemSchema);
export const OrderModel = mongoose.model<Order & Document>('Order', OrderSchema);
export const BillRequestModel = mongoose.model<BillRequest & Document>('BillRequest', BillRequestSchema);
