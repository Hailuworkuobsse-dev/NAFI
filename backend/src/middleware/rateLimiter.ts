import rateLimit from "express-rate-limit";
import { getEnv } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";

const env = getEnv();

/**
 * Default rate limiter for general API routes
 */
export const defaultLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const path = req.path ?? "";
    return (
      path === "/api/v1/auth/refresh" ||
      path === "/api/v1/auth/login" ||
      path === "/api/v1/auth/register"
    );
  },
  message: ApiError.tooManyRequests(
    "Too many requests, please try again later",
  ),
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      "Rate limit exceeded",
    );

    res.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later",
      },
    });
  },
});

/**
 * Strict rate limiter for auth routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // allow refresh rehydration and normal auth flows without false positives
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiError.tooManyRequests("Too many authentication attempts"),
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
      },
      "Auth rate limit exceeded",
    );

    res.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many authentication attempts, please try again later",
      },
    });
  },
});

/**
 * Rate limiter for sensitive operations (password reset, etc.)
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiError.tooManyRequests("Too many attempts"),
});

/**
 * Create a custom rate limiter
 */
export function createLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs || env.RATE_LIMIT_WINDOW_MS,
    max: options.max || env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: ApiError.tooManyRequests(options.message),
  });
}
