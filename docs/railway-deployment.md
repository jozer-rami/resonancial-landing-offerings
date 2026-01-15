# Railway Deployment Guide

This document describes how the backend API is deployed to Railway as part of the split deployment architecture (Frontend on Vercel, Backend on Railway).

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Vercel         │  HTTPS  │  Railway        │  SQL    │  Supabase       │
│  (Frontend)     │────────▶│  (Backend API)  │────────▶│  (PostgreSQL)   │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     React SPA                Express Server              Database
```

## Railway Configuration

### Environment Variables

Set these in the Railway dashboard under **Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `API_ONLY` | `true` | Skips static file serving (frontend served by Vercel) |
| `DATABASE_URL` | `postgresql://postgres.xxx:xxx@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify` | Supabase Pooler connection string |
| `PORT` | `8080` | Port the server listens on (auto-assigned by Railway) |
| `WASENDER_API_KEY` | `your_api_key` | WaSender API key for WhatsApp delivery |

> **Important**: Use Supabase's **Pooler URL** (not direct connection) to avoid IPv6 connectivity issues.

### Networking Configuration

In Railway dashboard under **Settings → Networking**:

- **Public Domain**: `resonancial-landing-offerings-production.up.railway.app`
- **Port**: Must match the `PORT` environment variable (8080)

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "RAILPACK"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Build Process

Railway uses Railpack which auto-detects the Node.js project and runs:

1. **Install**: `npm ci`
2. **Build**: `npm run build` → Runs `tsx script/build-server.ts`
3. **Start**: `npm run start:prod` → Runs `NODE_ENV=production node dist/server.cjs`

### Build Output

The server build script (`script/build-server.ts`) creates a bundled server at `dist/server.cjs` with:

- All server dependencies bundled (express, drizzle-orm, pg, etc.)
- Vite dev server code excluded (not needed in production)
- Minified for faster cold starts

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check (used by Railway) |
| `/api/newsletter/subscribe` | POST | Newsletter subscription with discount code delivery |
| `/api/discount-codes/validate` | POST | Validate a discount code |
| `/api/discount-codes/redeem` | POST | Redeem a discount code |

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2026-01-15T17:21:40.831Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## CORS Configuration

The server allows requests from:

- `*.vercel.app` (Vercel deployments)
- `*.railway.app` (Railway deployments)
- `*.replit.dev` / `*.replit.app` (Replit deployments)
- Explicit origins via `CORS_ORIGINS` environment variable

## Deployment Workflow

### Automatic Deployment

Railway is connected to the GitHub repository. Pushing to the configured branch triggers automatic deployment.

### Manual Deployment

```bash
# Using Railway CLI
railway redeploy --yes

# Or trigger via git push
git push origin feature/split-deployment-architecture
```

### Checking Logs

```bash
# Runtime logs
railway logs

# Build logs
railway logs -b

# Deployment logs
railway logs -d
```

## Troubleshooting

### Common Issues

#### 1. 502 "Connection Refused"

**Symptom**: Health check passes during deployment but external requests fail.

**Cause**: Port mismatch between networking config and server.

**Fix**: Ensure the port in Railway's **Networking** settings matches the `PORT` environment variable.

#### 2. IPv6 Database Connection Error

**Symptom**: `ENETUNREACH` error when connecting to Supabase.

**Cause**: Railway container tries IPv6, but Supabase direct connection resolves to IPv6.

**Fix**: Use Supabase's **Pooler URL** instead of direct connection:
```
# Direct (may have IPv6 issues)
postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Pooler (IPv4, recommended)
postgresql://postgres.xxx:xxx@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

#### 3. SSL Certificate Error

**Symptom**: `self-signed certificate in certificate chain`

**Fix**: Add `?sslmode=no-verify` to the DATABASE_URL.

#### 4. Static Files Not Found

**Symptom**: Server crashes looking for `dist/public`.

**Fix**: Set `API_ONLY=true` environment variable.

## Local Development

To run the production server locally:

```bash
# Build the server
npm run build

# Run with local .env file
npm run start
```

The local `.env` file should contain:
```
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify
API_ONLY=true
PORT=5001
```

## Related Documentation

- [Split Deployment Architecture](./architecture/split-deployment.md)
- [Vercel Deployment](./vercel-deployment.md) (if exists)
- [Railway Documentation](https://docs.railway.app/)
- [Railpack Reference](https://railpack.com/reference/cli)
