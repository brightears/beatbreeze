// Prisma Client Configuration
// Singleton pattern to prevent multiple instances in development

import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton
 * In development, we store the client in a global variable
 * to prevent creating new connections on hot reload
 */
export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: dev ? ['query', 'error', 'warn'] : ['error']
  });

if (dev) {
  globalThis.__prisma = prisma;
}

/**
 * Graceful shutdown
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
