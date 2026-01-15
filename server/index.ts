import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { config, validateConfig } from "./config";

// Validate configuration at startup
validateConfig();

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
      console.warn(`CORS blocked origin: ${origin}`);
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

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static file serving or Vite dev server
  // Skip if API_ONLY mode (frontend served by Vercel)
  if (config.apiOnly) {
    log("Running in API-only mode (frontend served separately)");
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
      reusePort: true,
    },
    () => {
      log(`Server running on port ${config.port} (${config.nodeEnv})`);
    },
  );
})();
