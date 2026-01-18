# Backend Logging System Implementation Plan

## Overview

This document outlines the implementation plan for a production-grade structured logging system for the Resonancial backend. The goal is to provide comprehensive observability for debugging issues with WhatsApp and Email delivery, as well as all external API interactions.

## Current State Analysis

### Existing Logging Patterns
- **Express middleware**: Custom `log()` function in `server/index.ts` with timestamp formatting
- **Service layer**: Ad-hoc `console.log/error` with manual tags (`[WhatsApp]`, `[Email]`, etc.)
- **Storage layer**: Error-only logging with `console.error`

### Critical Gaps Identified
1. No log levels (debug, info, warn, error)
2. No structured JSON output for log aggregation
3. No request correlation IDs for tracing
4. No external API request/response logging
5. No configurable verbosity via environment variables
6. Inconsistent timestamp formatting across services

---

## Technical Design

### Log Levels (Configurable via `LOG_LEVEL` env var)

| Level | Value | Use Case |
|-------|-------|----------|
| `error` | 0 | Failures, exceptions, critical issues |
| `warn` | 1 | Degraded functionality, fallbacks triggered |
| `info` | 2 | Normal operations, API calls, key events |
| `debug` | 3 | Detailed debugging, request/response bodies |
| `trace` | 4 | Verbose tracing, all function calls |

**Default**: `info` in production, `debug` in development

### Log Format

**Structured JSON** (production):
```json
{
  "timestamp": "2026-01-17T12:34:56.789Z",
  "level": "info",
  "service": "whatsapp",
  "message": "Message sent successfully",
  "requestId": "req_abc123",
  "data": {
    "phone": "+591****4813",
    "messageId": "wamid.xxx",
    "duration": 423
  }
}
```

**Pretty format** (development):
```
12:34:56 PM [INFO] [whatsapp] Message sent successfully
  requestId: req_abc123
  phone: +591****4813
  duration: 423ms
```

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | string | `info` (prod) / `debug` (dev) | Minimum log level to output |
| `LOG_FORMAT` | string | `json` (prod) / `pretty` (dev) | Output format |
| `LOG_SENSITIVE_DATA` | boolean | `false` | Log full request/response bodies (dangerous in prod) |

---

## Implementation Plan

### Phase 1: Core Logger Module

**File**: `server/lib/logger.ts`

```typescript
// Pseudocode structure
interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'pretty';
  sensitiveData: boolean;
}

interface LogContext {
  requestId?: string;
  service?: string;
  [key: string]: unknown;
}

class Logger {
  private config: LoggerConfig;
  private context: LogContext;

  constructor(service: string);

  error(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  info(message: string, data?: object): void;
  debug(message: string, data?: object): void;
  trace(message: string, data?: object): void;

  child(context: LogContext): Logger;  // Create scoped logger
  withRequestId(requestId: string): Logger;
}

export function createLogger(service: string): Logger;
export const rootLogger: Logger;
```

**Key Features**:
- Singleton configuration
- Child loggers inherit parent context
- Automatic sensitive data masking (emails, phone numbers, tokens)
- Performance: No serialization if level is filtered

### Phase 2: Request Context Middleware

**File**: `server/middleware/request-context.ts`

```typescript
// Add request ID and timing to all requests
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startTime = Date.now();

  // Log request start
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info('Request completed', {
      requestId: req.requestId,
      status: res.statusCode,
      duration,
    });
  });

  next();
});
```

### Phase 3: External API Instrumentation

#### WhatsApp Service (`server/services/whatsapp.ts`)

| Log Point | Level | Data |
|-----------|-------|------|
| API request start | `debug` | `phone` (masked), `messageLength` |
| API response success | `info` | `messageId`, `duration` |
| API response error | `error` | `statusCode`, `errorMessage`, `duration` |
| Fallback triggered | `warn` | `reason`, `fallbackChannel` |
| Mock mode activated | `debug` | `phone`, `message` (truncated) |

#### Email Service (`server/services/email.ts`)

| Log Point | Level | Data |
|-----------|-------|------|
| Email send start | `debug` | `to` (masked), `subject` |
| Email send success | `info` | `resendId`, `duration` |
| Email send error | `error` | `errorCode`, `errorMessage`, `duration` |
| Mock mode activated | `debug` | `to`, `subject` |

#### BNB API (`server/services/bnb-api.ts`)

| Log Point | Level | Data |
|-----------|-------|------|
| Auth token request | `debug` | `accountId` |
| Auth token received | `info` | `expiresIn`, `cached` |
| Auth token error | `error` | `statusCode`, `errorMessage` |
| QR generation request | `debug` | `amount`, `currency`, `orderId` |
| QR generation success | `info` | `qrId`, `expiresAt`, `duration` |
| QR generation error | `error` | `statusCode`, `errorMessage` |
| QR status check | `debug` | `qrId` |
| QR status result | `info` | `status`, `paid`, `duration` |

### Phase 4: Database Query Logging

**File**: `server/storage.ts`

| Log Point | Level | Data |
|-----------|-------|------|
| Connection initialized | `info` | `poolSize`, `host` (masked) |
| Connection error | `error` | `errorCode`, `errorMessage` |
| Query start | `trace` | `operation`, `table` |
| Query success | `debug` | `operation`, `table`, `duration`, `rowCount` |
| Query error | `error` | `operation`, `table`, `error` |
| Slow query (>100ms) | `warn` | `operation`, `table`, `duration`, `query` |

### Phase 5: Route-Level Logging

**File**: `server/routes.ts`

#### `/api/newsletter/subscribe`

| Log Point | Level | Data |
|-----------|-------|------|
| Request received | `info` | `email` (masked), `contactPreference` |
| Validation failed | `warn` | `validationErrors` |
| Already subscribed | `info` | `subscriberId` |
| New subscriber created | `info` | `subscriberId`, `discountCode` (masked) |
| Delivery attempt | `debug` | `channel`, `subscriberId` |
| Delivery success | `info` | `channel`, `deliveryStatus` |
| Delivery failed | `error` | `channel`, `error` |

#### `/api/discount-codes/validate`

| Log Point | Level | Data |
|-----------|-------|------|
| Validation request | `info` | `code` (masked) |
| Validation success | `info` | `valid`, `discountType` |
| Validation failed | `warn` | `reason` |

#### `/api/discount-codes/redeem`

| Log Point | Level | Data |
|-----------|-------|------|
| Redemption request | `info` | `code` (masked), `orderId` |
| Redemption success | `info` | `discountValue` |
| Redemption failed | `error` | `reason` |

---

## Data Masking Strategy

Sensitive data MUST be masked before logging:

| Data Type | Masking Rule | Example |
|-----------|--------------|---------|
| Email | First 3 chars + `***` + domain | `jos***@gmail.com` |
| Phone | Country code + `****` + last 4 | `+591****4813` |
| Discount code | First 5 chars + `***` | `DISC-***` |
| API keys | First 4 chars + `***` | `sk-l***` |
| Database URL | Protocol + `***` + host | `postgresql://***@db.supabase.co` |

---

## File Changes Summary

| File | Changes |
|------|---------|
| `server/lib/logger.ts` | **NEW** - Core logger module |
| `server/middleware/request-context.ts` | **NEW** - Request ID middleware |
| `server/config.ts` | Add `LOG_LEVEL`, `LOG_FORMAT`, `LOG_SENSITIVE_DATA` |
| `server/index.ts` | Replace `log()` with logger, add middleware |
| `server/routes.ts` | Add structured logging to all endpoints |
| `server/storage.ts` | Add database operation logging |
| `server/services/whatsapp.ts` | Replace console with logger |
| `server/services/email.ts` | Replace console with logger |
| `server/services/bnb-api.ts` | Replace console with logger |
| `server/services/discount-code.ts` | Replace console with logger |
| `.env.example` | Document new logging env vars |

---

## Testing Plan

1. **Unit Tests**: Logger module formatting, masking, level filtering
2. **Integration Tests**: Verify logs appear for each API call
3. **Manual Testing**:
   - Set `LOG_LEVEL=debug` and verify WhatsApp/Email flow logs
   - Set `LOG_LEVEL=trace` and verify query logs
   - Set `LOG_FORMAT=json` and verify structured output

---

## Rollout Strategy

1. **Development**: Deploy with `LOG_LEVEL=debug` to identify current WhatsApp/Email issues
2. **Staging**: Verify log aggregation works (if using external service)
3. **Production**: Deploy with `LOG_LEVEL=info` to avoid excessive log volume

---

## Success Metrics

- [ ] All external API calls (WhatsApp, Email, BNB) have request/response logging
- [ ] Request correlation IDs trace requests across all services
- [ ] Log level is configurable without code changes
- [ ] Sensitive data is never logged in plain text
- [ ] Current WhatsApp/Email delivery issues can be diagnosed from logs

---

## Dependencies

**No external libraries required** - Pure Node.js implementation using:
- `console` for output
- `util.inspect` for pretty formatting
- `crypto.randomUUID` for request IDs

*Alternative: If future requirements include log shipping to external services (Datadog, Logtail, etc.), consider migrating to `pino` or `winston`.*

---

## Estimated Implementation Effort

| Phase | Complexity | Files |
|-------|------------|-------|
| Phase 1: Core Logger | Medium | 1 new |
| Phase 2: Request Context | Low | 1 new |
| Phase 3: External APIs | Medium | 3 modified |
| Phase 4: Database | Low | 1 modified |
| Phase 5: Routes | Low | 1 modified |
| Config & Docs | Low | 2 modified |

---

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 (Core Logger)
3. Implement Phase 2 (Request Context)
4. Implement Phase 3 (External API logging) - **Priority for debugging current issues**
5. Implement Phases 4-5
6. Update documentation
