import 'dotenv/config';
import path from 'path';

// Override inherited non-file DATABASE_URL if present
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/routes';
import { errorHandler } from './src/middlewares/errorHandler';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Visual Activity Monitor API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api', apiRouter);

  // Error Handler Middleware
  app.use(errorHandler);

  // Vite development or production static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
