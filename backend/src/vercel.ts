import { createApp } from './app.js';
import { connectDatabase } from './database/connection.js';

const app = createApp();
let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database connection error:', err);
    }
  }
  return app(req, res);
}
