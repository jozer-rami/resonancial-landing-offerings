/**
 * Server Configuration Module
 *
 * Centralizes all environment-based configuration for the backend server.
 * Supports both serverless (Vercel) and persistent (Railway/Render) deployments.
 */

function parseArrayFromEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // CORS - Origins allowed to call this API
  cors: {
    origins: parseArrayFromEnv(process.env.CORS_ORIGINS),
    // Always allow these in development
    devOrigins: [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
    ] as string[],
    // Dynamic pattern matching for deployment platforms
    allowedPatterns: [
      /\.vercel\.app$/,
      /\.replit\.dev$/,
      /\.replit\.app$/,
      /\.railway\.app$/,
    ],
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    // For persistent servers (Railway/Render), use larger pool
    // For serverless (Vercel), keep at 1
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  },

  // API Configuration
  api: {
    // Base path for all API routes
    basePath: '/api',
  },

  // Deployment mode
  // Set API_ONLY=true when running backend separately (Railway/Render)
  // Frontend is served by Vercel in this case
  apiOnly: process.env.API_ONLY === 'true',
} as const;

/**
 * Validate required configuration at startup
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.database.url) {
    errors.push('DATABASE_URL environment variable is required');
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach((err) => console.error(`  - ${err}`));

    if (config.isProduction) {
      throw new Error('Invalid configuration in production');
    } else {
      console.warn('Continuing in development mode with invalid config...');
    }
  }
}

export type Config = typeof config;
