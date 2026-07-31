import { PrismaClient } from '@prisma/client';
import path from 'path';

// Standard Prisma Client singleton instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith('file:')) {
    let filePath = envUrl.slice(5);
    if (!path.isAbsolute(filePath)) {
      if (filePath.startsWith('./prisma/')) {
        filePath = filePath.replace('./prisma/', './');
      } else if (filePath.startsWith('prisma/')) {
        filePath = filePath.replace('prisma/', '');
      }
      filePath = path.resolve(process.cwd(), 'prisma', filePath.replace(/^\.\//, ''));
    }
    return `file:${filePath}`;
  }
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${dbPath}`;
}

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


