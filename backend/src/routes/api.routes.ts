import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { TableController } from '../controllers/table.controller';
import { MenuController } from '../controllers/menu.controller';
import { OrderController } from '../controllers/order.controller';
import { BillRequestController } from '../controllers/bill-request.controller';
import { ReviewController } from '../controllers/review.controller';

import { InMemoryTableRepository } from '../repositories/in-memory/table.repository';
import { InMemoryRestaurantRepository } from '../repositories/in-memory/restaurant.repository';
import { InMemoryMenuRepository } from '../repositories/in-memory/menu.repository';
import { InMemoryOrderRepository } from '../repositories/in-memory/order.repository';
import { InMemoryBillRequestRepository } from '../repositories/in-memory/bill-request.repository';
import { InMemoryReviewRepository } from '../repositories/in-memory/review.repository';

import { MongoTableRepository } from '../repositories/mongodb/table.repository';
import { MongoRestaurantRepository } from '../repositories/mongodb/restaurant.repository';
import { MongoMenuRepository } from '../repositories/mongodb/menu.repository';
import { MongoOrderRepository } from '../repositories/mongodb/order.repository';
import { MongoBillRequestRepository } from '../repositories/mongodb/bill-request.repository';
import { MongoReviewRepository } from '../repositories/mongodb/review.repository';

import { TableService } from '../services/table.service';
import { MenuService } from '../services/menu.service';
import { OrderService } from '../services/order.service';
import { BillRequestService } from '../services/bill-request.service';
import { ReviewService } from '../services/review.service';

// Use MongoDB repositories when MONGODB_URI is available and not in unit testing
const isMongo = Boolean(process.env.MONGODB_URI) && process.env.NODE_ENV !== 'test';
console.log(`[API Routes] Repository persistence mode: ${isMongo ? 'MongoDB Atlas' : 'In-Memory'}`);

const tableRepo = isMongo ? new MongoTableRepository() : new InMemoryTableRepository();
const restaurantRepo = isMongo ? new MongoRestaurantRepository() : new InMemoryRestaurantRepository();
const menuRepo = isMongo ? new MongoMenuRepository() : new InMemoryMenuRepository();
const orderRepo = isMongo ? new MongoOrderRepository() : new InMemoryOrderRepository();
const billRepo = isMongo ? new MongoBillRequestRepository() : new InMemoryBillRequestRepository();
const reviewRepo = isMongo ? new MongoReviewRepository() : new InMemoryReviewRepository();

const tableService = new TableService(tableRepo, restaurantRepo, menuRepo);
const menuService = new MenuService(menuRepo);
const orderService = new OrderService(orderRepo, menuRepo, tableRepo, restaurantRepo);
const billService = new BillRequestService(billRepo, orderRepo);
const reviewService = new ReviewService(reviewRepo, orderRepo);

const tableController = new TableController(tableService);
const menuController = new MenuController(menuService);
const orderController = new OrderController(orderService);
const billController = new BillRequestController(billService);
const reviewController = new ReviewController(reviewService);

export const apiRouter = Router();

// Health
apiRouter.get('/health', healthController);

// Tables & Catalog
apiRouter.get('/tables', tableController.getAllTables);
apiRouter.get('/tables/:tableId/menu', tableController.getTableMenu);
apiRouter.get('/tables/:tableId/active-order', orderController.getActiveOrderByTable);

// Menu Items
apiRouter.get('/menu/items/:itemId', menuController.getItemById);
apiRouter.patch('/menu/items/:itemId/availability', menuController.updateItemAvailability);

// Orders & Sales Analytics
apiRouter.get('/orders/sales/daily', orderController.getDailySales);
apiRouter.get('/orders', orderController.getAllOrders);
apiRouter.post('/orders', orderController.createOrder);
apiRouter.get('/orders/:orderId', orderController.getOrderById);
apiRouter.post('/orders/:orderId/items', orderController.addItems);
apiRouter.patch('/orders/:orderId/status', orderController.updateStatus);

// Bill Requests & Settlement
apiRouter.get('/bills', billController.getAllBills);
apiRouter.post('/orders/:orderId/bill-request', billController.requestBill);
apiRouter.post('/orders/:orderId/settle', billController.settleOrder);

// Customer Reviews & Feedback
apiRouter.post('/orders/:orderId/review', reviewController.submitReview);
apiRouter.post('/reviews', reviewController.submitReview);
apiRouter.get('/orders/:orderId/review', reviewController.getReviewByOrder);
apiRouter.get('/reviews', reviewController.getAllReviews);
apiRouter.get('/reviews/stats', reviewController.getStats);
