import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config, helmetOptions } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { defaultLimiter } from './middleware/rateLimiter.js';

// Import routes (default exports)
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import contractsRoutes from './modules/contracts/contracts.routes.js';
import escrowsRoutes from './modules/escrows/escrows.routes.js';
import investmentsRoutes from './modules/investments/investments.routes.js';
import opportunitiesRoutes from './modules/opportunities/opportunities.routes.js';
import inputsRoutes from './modules/inputs/inputs.routes.js';
import settlementsRoutes from './modules/settlements/settlements.routes.js';
import collateralRoutes from './modules/collateral/collateral.routes.js';
import disputesRoutes from './modules/disputes/disputes.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import healthRoutes from './modules/health/health.routes.js';

export function createApp(): Express {
  const app: Express = express();

  // Security middleware
  app.use(helmet(helmetOptions));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression
  app.use(compression());
  
  // Request ID tracking
  app.use(requestIdMiddleware);
  
  // Logging (skip in test environment)
  if (config.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) }
    }));
  }
  
  // Rate limiting
  app.use(defaultLimiter);
  
  // Health check endpoint (no auth required)
  app.use('/api/v1/health', healthRoutes);
  
  // Public endpoints (no auth required)
  app.use('/api/v1/public', publicRoutes);
  app.use('/api/v1/opportunities', opportunitiesRoutes);
  
  // Protected routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/contracts', contractsRoutes);
  app.use('/api/v1/escrows', escrowsRoutes);
  app.use('/api/v1/investments', investmentsRoutes);
  app.use('/api/v1/inputs', inputsRoutes);
  app.use('/api/v1/settlements', settlementsRoutes);
  app.use('/api/v1/collateral', collateralRoutes);
  app.use('/api/v1/disputes', disputesRoutes);
  app.use('/api/v1/reports', reportsRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/audit', auditRoutes);
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`
      }
    });
  });
  
  // Global error handler
  app.use(errorHandler);
  
  return app;
}

export const app = createApp();
