import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { config, validateConfig } from "./config";
import { initializeDatabase } from "./storage";
import { loggers } from "./lib/logger";
import { requestContextMiddleware } from "./middleware/request-context";

const logger = loggers.server;

// Handle uncaught errors to prevent silent crashes
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: String(promise),
  });
});

// Validate configuration at startup
validateConfig();

logger.info("Server starting", {
  environment: config.nodeEnv,
  logLevel: config.logging.level,
  logFormat: config.logging.format,
});

const app = express();
const httpServer = createServer(app);

// CORS Configuration - Allow cross-origin requests from frontend deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow explicitly configured origins
      if (config.cors.origins.includes(origin)) {
        return callback(null, true);
      }

      // Allow dev origins in development mode
      if (config.isDevelopment && config.cors.devOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow deployment platform patterns (*.vercel.app, *.replit.dev, etc.)
      const isAllowedPattern = config.cors.allowedPatterns.some((pattern) =>
        pattern.test(origin)
      );
      if (isAllowedPattern) {
        return callback(null, true);
      }

      // Reject other origins
      logger.warn("CORS blocked origin", { origin });
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Add request context (ID and timing) to all requests
app.use(requestContextMiddleware);

(async () => {
  // Initialize database connection at startup (before accepting requests)
  // This prevents race conditions from lazy initialization during concurrent requests
  await initializeDatabase();

  await registerRoutes(httpServer, app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    const reqLogger = logger.withRequestId(req.requestId);
    reqLogger.error("Request error", {
      status,
      message,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });

    res.status(status).json({ message });
  });

  // Setup static file serving or Vite dev server
  // Skip if API_ONLY mode (frontend served by Vercel)
  if (config.apiOnly) {
    logger.info("Running in API-only mode (frontend served separately)");
  } else if (config.isProduction) {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server on configured port
  httpServer.listen(
    {
      port: config.port,
      host: "0.0.0.0",
    },
    () => {
      logger.info("Server started", {
        port: config.port,
        environment: config.nodeEnv,
        apiOnly: config.apiOnly,
      });
    },
  );
})();
