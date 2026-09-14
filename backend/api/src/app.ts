import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { corsOptions } from '@/config/cors';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { generalLimiter } from '@/middleware/rateLimiter';
import { requestId } from '@/middleware/requestId';
import { tenantScope } from '@/middleware/tenantScope';
import { auditRouter } from '@/modules/audit/audit.routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { collateralRouter } from '@/modules/collateral/collateral.routes';
import { contractsRouter } from '@/modules/contracts/contracts.routes';
import { disputesRouter } from '@/modules/disputes/disputes.routes';
import { escrowsRouter } from '@/modules/escrows/escrows.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { inputsRouter } from '@/modules/inputs/inputs.routes';
import { investmentsRouter } from '@/modules/investments/investments.routes';
import { notificationsRouter } from '@/modules/notifications/notifications.routes';
import { opportunitiesRouter } from '@/modules/opportunities/opportunities.routes';
import { publicRouter } from '@/modules/public/public.routes';
import { reportsRouter } from '@/modules/reports/reports.routes';
import { settlementsRouter } from '@/modules/settlements/settlements.routes';
import { usersRouter } from '@/modules/users/users.routes';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res) => (res.statusCode >= 500 ? 'error' : 'info'),
      genReqId: (_req, res) => res.locals.requestId,
    }),
  );
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(generalLimiter);
  app.use(tenantScope);

  // Health routes (no /api/v1 prefix aliasing for uptime probes)
  app.use('/health', healthRouter);

  // API v1
  const api = express.Router();
  api.use('/health', healthRouter);
  api.use('/auth', authRouter);
  api.use('/public', publicRouter);
  api.use('/opportunities', opportunitiesRouter);
  api.use('/contracts', contractsRouter);
  api.use('/escrows', escrowsRouter);
  api.use('/investments', investmentsRouter);
  api.use('/inputs', inputsRouter);
  api.use('/settlements', settlementsRouter);
  api.use('/collateral', collateralRouter);
  api.use('/disputes', disputesRouter);
  api.use('/reports', reportsRouter);
  api.use('/users', usersRouter);
  api.use('/notifications', notificationsRouter);
  api.use('/audit', auditRouter);

  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
