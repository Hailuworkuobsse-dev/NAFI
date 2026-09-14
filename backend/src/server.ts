import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
  logger.info(`📍 Environment: ${config.NODE_ENV}`);
  logger.info(`🔗 CORS Origin: ${config.CORS_ORIGIN}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.warn(`⚠️  ${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new requests
  server.close((err) => {
    if (err) {
      logger.error('Error during server close', { error: err });
      process.exit(1);
    }
    logger.info('✅ HTTP server closed');
  });

  // Force close after timeout
  const forceCloseTimeout = setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  // Close Prisma connections
  try {
    await prisma.$disconnect();
    logger.info('✅ Prisma connections closed');
    clearTimeout(forceCloseTimeout);
    process.exit(0);
  } catch (error) {
    logger.error('Error closing Prisma connections', { error });
    clearTimeout(forceCloseTimeout);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

export { server };
