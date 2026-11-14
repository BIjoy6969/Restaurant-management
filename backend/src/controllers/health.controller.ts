import { Request, Response } from 'express';

const startTime = Date.now();

export const healthController = (req: Request, res: Response) => {
  const uptimeSeconds = (Date.now() - startTime) / 1000;
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      uptimeSeconds: Math.floor(uptimeSeconds),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

