import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

async function bootstrap() {
  // Connect to MongoDB Atlas
  await connectDatabase();

  const app = createApp();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(` Restaurant QR Ordering Backend running `);
    console.log(` Port: ${config.port}                     `);
    console.log(` Mode: ${config.nodeEnv}                  `);
    console.log(` Health: http://localhost:${config.port}/api/health `);
    console.log(`=========================================`);
  });
}

bootstrap().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
