/**
 * Structured Logging Module
 *
 * Production-grade logging with:
 * - Configurable log levels (error, warn, info, debug, trace)
 * - Structured JSON output for production
 * - Pretty formatted output for development
 * - Automatic sensitive data masking
 * - Request correlation IDs
 */

import { config } from "../config";

// Log levels in order of severity (lower = more severe)
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export interface LogContext {
  requestId?: string;
  service?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

// Patterns for sensitive data masking
const MASKING_PATTERNS: Array<{ pattern: RegExp; mask: (match: string, ...groups: string[]) => string }> = [
  // Email: show first 3 chars + *** + domain
  {
    pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    mask: (email: string) => {
      const [local, domain] = email.split("@");
      const maskedLocal = local.length > 3 ? local.slice(0, 3) + "***" : "***";
      return `${maskedLocal}@${domain}`;
    },
  },
  // Phone: show country code + **** + last 4 digits
  {
    pattern: /\+?(\d{1,3})[-.\s]?(\d{6,12})/g,
    mask: (phone: string) => {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 8) return "****";
      const countryCode = digits.slice(0, digits.length - 8);
      const lastFour = digits.slice(-4);
      return `+${countryCode || ""}****${lastFour}`;
    },
  },
  // API keys: show first 4 chars + ***
  {
    pattern: /(sk-|pk-|key-|api[_-]?key[=:]\s*["']?)([a-zA-Z0-9]{4})[a-zA-Z0-9-_]+/gi,
    mask: (_match: string, prefix: string, start: string) => `${prefix}${start}***`,
  },
  // Database URLs: mask credentials
  {
    pattern: /(postgresql|postgres|mysql|mongodb):\/\/([^:]+):([^@]+)@/gi,
    mask: (_match: string, protocol: string) => `${protocol}://***:***@`,
  },
  // Bearer tokens
  {
    pattern: /(Bearer\s+)([a-zA-Z0-9-_.]+)/gi,
    mask: (_match: string, prefix: string) => `${prefix}***`,
  },
];

/**
 * Mask sensitive data in a string
 */
function maskSensitiveString(str: string): string {
  let result = str;
  for (const { pattern, mask } of MASKING_PATTERNS) {
    result = result.replace(pattern, mask);
  }
  return result;
}

/**
 * Recursively mask sensitive data in an object
 */
function maskSensitiveData(data: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) return "[MAX_DEPTH]";

  if (typeof data === "string") {
    return maskSensitiveString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, depth + 1));
  }

  if (data !== null && typeof data === "object") {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Fully mask known sensitive field names
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("apikey") ||
        lowerKey.includes("api_key") ||
        lowerKey.includes("authorization")
      ) {
        masked[key] = "***";
      } else {
        masked[key] = maskSensitiveData(value, depth + 1);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry, format: "json" | "pretty"): string {
  if (format === "json") {
    return JSON.stringify(entry);
  }

  // Pretty format for development
  const timestamp = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const levelColors: Record<LogLevel, string> = {
    error: "\x1b[31m", // Red
    warn: "\x1b[33m", // Yellow
    info: "\x1b[36m", // Cyan
    debug: "\x1b[35m", // Magenta
    trace: "\x1b[90m", // Gray
  };
  const reset = "\x1b[0m";
  const color = levelColors[entry.level];

  let output = `${timestamp} ${color}[${entry.level.toUpperCase()}]${reset} [${entry.service}] ${entry.message}`;

  if (entry.requestId) {
    output += ` ${"\x1b[90m"}(${entry.requestId})${reset}`;
  }

  if (entry.data && Object.keys(entry.data).length > 0) {
    const dataStr = JSON.stringify(entry.data, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : `  ${line}`))
      .join("\n");
    output += `\n  ${"\x1b[90m"}${dataStr}${reset}`;
  }

  if (entry.error) {
    output += `\n  ${"\x1b[31m"}Error: ${entry.error.message}${reset}`;
    if (entry.error.stack) {
      output += `\n  ${"\x1b[90m"}${entry.error.stack}${reset}`;
    }
  }

  return output;
}

/**
 * Logger class with configurable levels and formatting
 */
export class Logger {
  private service: string;
  private context: LogContext;

  constructor(service: string, context: LogContext = {}) {
    this.service = service;
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger(this.service, { ...this.context, ...context });
  }

  /**
   * Create a logger scoped to a request ID
   */
  withRequestId(requestId: string): Logger {
    return this.child({ requestId });
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = config.logging?.level || "info";
    return LOG_LEVELS[level] <= LOG_LEVELS[configuredLevel];
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const format = config.logging?.format || "pretty";
    const shouldMask = !config.logging?.sensitiveData;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      requestId: this.context.requestId as string | undefined,
    };

    if (data) {
      entry.data = shouldMask ? (maskSensitiveData(data) as Record<string, unknown>) : data;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: level === "error" || level === "debug" ? error.stack : undefined,
        code: (error as NodeJS.ErrnoException).code,
      };
    }

    const output = formatLogEntry(entry, format);

    // Use appropriate console method
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, data?: Record<string, unknown> | Error): void {
    if (data instanceof Error) {
      this.log("error", message, undefined, data);
    } else {
      this.log("error", message, data);
    }
  }

  /**
   * Log an error with both data and error object
   */
  errorWithData(message: string, data: Record<string, unknown>, error: Error): void {
    this.log("error", message, data, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Log a trace message
   */
  trace(message: string, data?: Record<string, unknown>): void {
    this.log("trace", message, data);
  }

  /**
   * Log the start of an API request to an external service
   */
  apiRequest(service: string, method: string, url: string, data?: Record<string, unknown>): void {
    this.debug(`${service} API request: ${method} ${url}`, data);
  }

  /**
   * Log the response from an external API
   */
  apiResponse(
    service: string,
    statusCode: number,
    duration: number,
    data?: Record<string, unknown>
  ): void {
    const level = statusCode >= 400 ? "error" : "info";
    this.log(level, `${service} API response: ${statusCode}`, {
      ...data,
      duration: `${duration}ms`,
    });
  }

  /**
   * Log a database operation
   */
  dbOperation(
    operation: string,
    table: string,
    duration?: number,
    data?: Record<string, unknown>
  ): void {
    const logData: Record<string, unknown> = { operation, table, ...data };
    if (duration !== undefined) {
      logData.duration = `${duration}ms`;
      if (duration > 100) {
        this.warn(`Slow database query: ${operation} on ${table}`, logData);
        return;
      }
    }
    this.debug(`Database: ${operation} on ${table}`, logData);
  }
}

/**
 * Create a logger for a specific service/module
 */
export function createLogger(service: string): Logger {
  return new Logger(service);
}

// Pre-configured loggers for common services
export const loggers = {
  server: createLogger("server"),
  routes: createLogger("routes"),
  storage: createLogger("storage"),
  whatsapp: createLogger("whatsapp"),
  email: createLogger("email"),
  bnb: createLogger("bnb"),
  discountCode: createLogger("discount-code"),
};

// Default export for convenience
export default loggers;
