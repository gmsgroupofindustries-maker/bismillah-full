import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DATABASE_URL is a valid SQLite file: URL, especially when Firebase
// environment variables (e.g. Firebase Realtime Database https://... URL) are injected.
const rawUrl = process.env.DATABASE_URL;
if (
  !rawUrl ||
  rawUrl.startsWith('https:') ||
  rawUrl.startsWith('http:') ||
  (!rawUrl.startsWith('file:') && !rawUrl.startsWith('postgres:') && !rawUrl.startsWith('postgresql:'))
) {
  let dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  if (!fs.existsSync(dbPath)) {
    // Fallback checking relative to current directory
    const altPath = path.resolve(__dirname, '../../prisma/dev.db');
    if (fs.existsSync(altPath)) {
      dbPath = altPath;
    }
  }
  process.env.DATABASE_URL = `file:${dbPath}`;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
