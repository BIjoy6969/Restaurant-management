import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred.';

  const responsePayload: any = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (err.details) {
    responsePayload.error.details = err.details;
  }

  // Only include stack trace if explicitly in development and error is 500
  if (config.nodeEnv === 'development' && statusCode >= 500) {
    responsePayload.error.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

