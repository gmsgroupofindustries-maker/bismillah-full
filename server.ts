import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { app } from './src/server/app.ts';
import { prisma } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Verify and ensure local database is seeded if needed
async function ensureDatabaseReady() {
  try {
    const productCount = await prisma.product.count();
    console.log(`📦 Database verified: ${productCount} products in catalog.`);
  } catch (dbErr) {
    console.warn('⚠️ Database empty or table uninitialized. Running initial schema push & seed...');
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      console.log('✅ Initial database seed completed successfully.');
    } catch (seedErr) {
      console.error('❌ Failed to run initial database setup:', seedErr);
    }
  }
}

// Mount Vite in dev or serve static files in production
async function startServer() {
  await ensureDatabaseReady();

  const distPath = path.resolve(__dirname, 'dist');
  const indexPath = path.resolve(distPath, 'index.html');

  if (!isProd) {
    console.log('🔧 Starting in DEVELOPMENT mode (mounting Vite middleware)...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('🚀 Starting in PRODUCTION mode...');

    // Self-healing: if dist/index.html is missing, generate the build on startup
    if (!fs.existsSync(indexPath)) {
      console.warn('⚠️ [Production Warning] dist/index.html is missing. Generating Vite build now...');
      try {
        execSync('npx vite build', { stdio: 'inherit' });
        console.log('✅ Vite production build generated successfully on startup.');
      } catch (buildErr) {
        console.error('❌ Failed to build frontend during server startup:', buildErr);
      }
    }

    // Serve static frontend assets
    app.use(express.static(distPath, { maxAge: '1d', index: false }));

    // SPA fallback: send index.html for all non-API GET routes
    app.get('*', (_req: Request, res: Response) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Bismillah Motors - Initializing</title></head>
            <body style="font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:60px 20px;">
              <h2>Bismillah Motors - Server Initializing</h2>
              <p>The production assets are generating. Please refresh in a few seconds.</p>
            </body>
          </html>
        `);
      }
    });
  }

  // Render requires listening on 0.0.0.0 and process.env.PORT
  app.listen(port, '0.0.0.0', () => {
    console.log(`🏍️ Bismillah Motors server listening on http://0.0.0.0:${port} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
