/**
 * Request Context Middleware
 *
 * Adds request ID and timing information to all incoming requests.
 * Enables request tracing across all services and logs.
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { loggers } from "../lib/logger";

const logger = loggers.server;

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Middleware that adds request context (ID and timing) to all requests
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID (or use one from headers if provided)
  req.requestId = (req.headers["x-request-id"] as string) || randomUUID();
  req.startTime = Date.now();

  // Add request ID to response headers for client-side correlation
  res.setHeader("x-request-id", req.requestId);

  // Create a scoped logger for this request
  const reqLogger = logger.withRequestId(req.requestId);

  // Log incoming request
  reqLogger.info("Incoming request", {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userAgent: req.headers["user-agent"],
    ip: req.ip || req.socket.remoteAddress,
    origin: req.headers.origin,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    reqLogger[level]("Request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

/**
 * Get the request ID from an Express request object
 */
export function getRequestId(req: Request): string {
  return req.requestId || "unknown";
}

/**
 * Get the elapsed time since request started
 */
export function getRequestDuration(req: Request): number {
  return Date.now() - (req.startTime || Date.now());
}
