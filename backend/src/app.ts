import express, { Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { config } from './config/index.js';

export const createApp = (): Express => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.10.225:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Request body parsing with size restriction
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Mount API router
  app.use('/api', apiRouter);

  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

