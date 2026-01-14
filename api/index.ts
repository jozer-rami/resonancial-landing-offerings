import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/static";

// Create Express app instance
const app = express();

// Middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
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
      console.log(logLine);
    }
  });

  next();
});

// Initialize routes (async setup)
let appInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Register API routes
    // Note: httpServer is not needed for serverless functions, but required by registerRoutes signature
    const { createServer } = await import("http");
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);

    // Error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Note: Static files are served by Vercel automatically from dist/public
    // We don't need to serve them here in the serverless function

    appInitialized = true;
  })();

  return initPromise;
}

// Initialize app immediately
initializeApp().catch(console.error);

// Export the Express app for Vercel
export default app;
