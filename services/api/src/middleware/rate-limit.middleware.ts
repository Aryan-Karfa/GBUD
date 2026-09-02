import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';
import { formatTimestamp } from '@gbud/utils';
import { appConfig } from '../config';

/**
 * Creates a production-appropriate rate limiter with standardized GBUD 429 error formatting.
 *
 * NOTE: This is an in-process, memory-backed rate limiter suitable for single-instance deployments.
 * If horizontal scaling / multi-instance clusters are introduced in the future, this should be
 * backed by a centralized store (e.g., Redis).
 */
export function createRateLimiter(options: Partial<Options> = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skip: () => appConfig.env === 'test' && !options.max, // Skip in test unless explicit max is provided
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please try again later.',
        error: {
          code: 'TOO_MANY_REQUESTS',
          details: {
            retryAfter: res.getHeader('Retry-After') || null,
          },
        },
        timestamp: formatTimestamp(),
      });
    },
    ...options,
  });
}

/**
 * Strict rate limiter for abuse-sensitive authentication endpoints:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/refresh
 *
 * Configured to allow legitimate mobile operations while preventing credential stuffing.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes per IP
  message: 'Too many authentication attempts. Please try again later.',
});

/**
 * General rate limiter for all /api/v1/* routes to prevent traffic flooding.
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  message: 'Too many requests from this IP. Please try again later.',
});
