# Split Architecture: Frontend (Vercel/Replit) + Backend (Railway/Render)

This document outlines the architecture for deploying Resonancial with a separated frontend and backend, enabling flexible development across multiple platforms.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │   Replit    │         │   VS Code   │         │   Vercel    │          │
│   │  (Frontend) │         │   (Local)   │         │  (Preview)  │          │
│   └──────┬──────┘         └──────┬──────┘         └──────┬──────┘          │
│          │                       │                       │                  │
│          └───────────────────────┼───────────────────────┘                  │
│                                  │                                          │
│                                  ▼                                          │
│                    ┌─────────────────────────┐                              │
│                    │   Backend API (Staging) │                              │
│                    │   api-staging.railway   │                              │
│                    └─────────────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────┐              ┌─────────────────────┐              │
│   │       Vercel        │              │      Railway        │              │
│   │     (Frontend)      │──── API ────▶│     (Backend)       │              │
│   │  resonancial.com    │    Calls     │  api.resonancial.com│              │
│   └─────────────────────┘              └──────────┬──────────┘              │
│                                                   │                         │
│                                                   ▼                         │
│                                        ┌─────────────────────┐              │
│                                        │     PostgreSQL      │              │
│                                        │     (Supabase)      │              │
│                                        └─────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

### Benefits

| Benefit | Description |
|---------|-------------|
| **Development Flexibility** | Use Replit for quick frontend iterations, VS Code for complex work |
| **Independent Deployments** | Ship frontend/backend separately without affecting each other |
| **Better Resource Allocation** | Persistent backend server vs serverless = better DB connection handling |
| **Cost Optimization** | Vercel free tier for static + Railway $5/mo for backend |
| **Scalability** | Scale backend independently based on API traffic |
| **Team Collaboration** | Frontend devs don't need backend running locally |

### Development Workflows Enabled

1. **Replit Frontend Dev** → Points to staging backend → Quick UI iterations
2. **Local Full-Stack** → Run both locally → Full debugging capability
3. **Vercel Preview** → Auto-deploy branches → PR reviews with live URLs
4. **Production** → Vercel + Railway → Stable, scalable deployment

---

## Implementation Plan

### Phase 1: Backend Preparation

#### 1.1 Create Backend Configuration

**New file: `server/config.ts`**
```typescript
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS origins allowed to call this API
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .filter(Boolean)
    .concat([
      'http://localhost:5000',
      'http://localhost:5173',
    ]),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // For persistent servers, we can use larger pool
  dbPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
};
```

#### 1.2 Add CORS Middleware

**Update: `server/index.ts`**
```typescript
import cors from 'cors';
import { config } from './config';

// Add after express initialization
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (config.corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.replit.dev')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

#### 1.3 Add Health Check Endpoint

**Update: `server/routes.ts`**
```typescript
// Health check for Railway/Render
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
```

#### 1.4 Update Database Pool Size

**Update: `server/storage.ts`**
```typescript
import { config } from './config';

// In getDb() function, update pool config:
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolSize, // Now configurable, default 10 for persistent server
});
```

---

### Phase 2: Frontend Configuration

#### 2.1 Environment Variables

**New file: `client/.env.example`**
```bash
# API URL - points to backend server
# Development: http://localhost:5000
# Staging: https://resonancial-api-staging.up.railway.app
# Production: https://api.resonancial.com
VITE_API_URL=http://localhost:5000
```

**Update: `.gitignore`**
```
# Environment files
.env
.env.local
.env.*.local
client/.env
```

#### 2.2 Create API Client

**New file: `client/src/lib/api.ts`**
```typescript
const API_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Typed API methods
export const api = {
  newsletter: {
    subscribe: (email: string) =>
      apiClient<{ message: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  health: () => apiClient<{ status: string }>('/api/health'),
};
```

#### 2.3 Update Newsletter Component

**Update: `client/src/components/Newsletter.tsx`**
```typescript
import { api } from '@/lib/api';

// Replace fetch call with:
const response = await api.newsletter.subscribe(email);
```

---

### Phase 3: Railway Deployment (Backend)

#### 3.1 Create Railway Configuration

**New file: `railway.json`**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:server",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

#### 3.2 Add Server-Only Start Script

**Update: `package.json`**
```json
{
  "scripts": {
    "dev:client": "vite dev --port 5000",
    "dev:server": "NODE_ENV=development tsx watch server/index.ts",
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server.cjs --format=cjs --packages=external",
    "start": "NODE_ENV=production node dist/index.cjs",
    "start:server": "NODE_ENV=production node dist/server.cjs",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

#### 3.3 Railway Environment Variables

Set these in Railway dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Supabase connection string |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | (auto-set by Railway) | Server port |
| `CORS_ORIGINS` | `https://resonancial.vercel.app,https://resonancial.com` | Allowed origins |
| `DB_POOL_SIZE` | `10` | Database pool size |

#### 3.4 Railway Deployment Steps

1. **Create Railway Account**: https://railway.app
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose `resonancial-landing-offerings`
4. **Configure Service**:
   - Root Directory: `/` (default)
   - Build Command: `npm run build:server`
   - Start Command: `npm run start:server`
5. **Add Environment Variables**: (from table above)
6. **Generate Domain**: Settings → Networking → Generate Domain
7. **Custom Domain** (optional): Add `api.resonancial.com`

---

### Phase 4: Vercel Configuration (Frontend-Only)

#### 4.1 Update Vercel Configuration

**Update: `vercel.json`**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:client",
  "outputDirectory": "dist/public",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 4.2 Add Client-Only Build Script

**Update: `package.json`**
```json
{
  "scripts": {
    "build:client": "vite build"
  }
}
```

#### 4.3 Vercel Environment Variables

Set in Vercel dashboard (Settings → Environment Variables):

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_API_URL` | Production | `https://api.resonancial.com` |
| `VITE_API_URL` | Preview | `https://resonancial-api-staging.up.railway.app` |
| `VITE_API_URL` | Development | `http://localhost:5000` |

---

### Phase 5: Replit Configuration

#### 5.1 Update Replit Configuration

**Update: `.replit`**
```toml
run = "npm run dev:client"
entrypoint = "client/src/main.tsx"

[env]
VITE_API_URL = "https://resonancial-api-staging.up.railway.app"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run dev:client"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

#### 5.2 Replit Development Workflow

1. **Open in Replit**: Import from GitHub or open existing Repl
2. **Environment**: Automatically uses staging backend via `VITE_API_URL`
3. **Run**: Click "Run" → Vite dev server starts on port 5000
4. **Edit**: Make frontend changes, see live updates
5. **No Backend Needed**: All API calls go to Railway staging

---

### Phase 6: Local Development Setup

#### 6.1 Full-Stack Local Development

**Option A: Both services locally**
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
VITE_API_URL=http://localhost:5000 npm run dev:client
```

**Option B: Frontend local + Staging backend**
```bash
# Just frontend, pointing to staging
VITE_API_URL=https://resonancial-api-staging.up.railway.app npm run dev:client
```

#### 6.2 Environment File for Local Dev

**New file: `client/.env.local`** (git-ignored)
```bash
VITE_API_URL=http://localhost:5000
```

---

## Environment Matrix

| Environment | Frontend | Backend | Database | Use Case |
|-------------|----------|---------|----------|----------|
| **Local Full** | localhost:5173 | localhost:5000 | Supabase (dev) | Full debugging |
| **Local FE** | localhost:5173 | Railway staging | Supabase (staging) | Frontend-only dev |
| **Replit** | Replit URL | Railway staging | Supabase (staging) | Quick UI iterations |
| **Vercel Preview** | *.vercel.app | Railway staging | Supabase (staging) | PR reviews |
| **Production** | resonancial.com | api.resonancial.com | Supabase (prod) | Live site |

---

## Migration Checklist

### Backend (Railway)

- [ ] Install cors package: `npm install cors && npm install -D @types/cors`
- [ ] Create `server/config.ts`
- [ ] Update `server/index.ts` with CORS middleware
- [ ] Add health check endpoint to `server/routes.ts`
- [ ] Update `server/storage.ts` pool configuration
- [ ] Add `build:server` and `start:server` scripts
- [ ] Create `railway.json`
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Verify health endpoint: `curl https://your-app.up.railway.app/api/health`

### Frontend (Vercel)

- [ ] Create `client/src/lib/api.ts`
- [ ] Create `client/.env.example`
- [ ] Update Newsletter component to use api client
- [ ] Add `build:client` script
- [ ] Update `vercel.json` for frontend-only
- [ ] Configure Vercel environment variables
- [ ] Remove `api/` directory (no longer needed for Vercel)
- [ ] Deploy and verify

### Replit

- [ ] Update `.replit` with staging API URL
- [ ] Test frontend development workflow
- [ ] Verify API calls work from Replit to Railway

### Cleanup

- [ ] Remove `api/index.ts` (Vercel serverless entry point)
- [ ] Update `script/build.ts` to remove API bundling
- [ ] Update `CLAUDE.md` with new architecture
- [ ] Update `VERCEL_DEPLOYMENT.md` or archive it

---

## Troubleshooting

### CORS Errors

**Symptom**: `Access-Control-Allow-Origin` errors in browser console

**Solution**:
1. Check `CORS_ORIGINS` in Railway includes your frontend URL
2. Verify the origin ends with `.vercel.app` or `.replit.dev` (auto-allowed)
3. Check browser Network tab for actual origin being sent

### API Connection Failed

**Symptom**: `Failed to fetch` or network errors

**Solution**:
1. Verify `VITE_API_URL` is set correctly for your environment
2. Check Railway service is running: `curl $API_URL/api/health`
3. Ensure HTTPS is used in production (Railway auto-provides)

### Database Connection Issues

**Symptom**: `Connection refused` or pool errors

**Solution**:
1. Verify `DATABASE_URL` is set in Railway
2. Check Supabase allows connections from Railway IPs
3. For persistent servers, `DB_POOL_SIZE=10` is appropriate

### Replit Can't Connect to API

**Symptom**: API calls fail from Replit

**Solution**:
1. Check `.replit` has correct `VITE_API_URL`
2. Verify Railway staging is running
3. Replit may need explicit HTTPS (no self-signed certs)

---

## Cost Estimation

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel** | Hobby | $0 (free tier) |
| **Railway** | Starter | ~$5-10 (usage-based) |
| **Supabase** | Free | $0 (500MB DB) |
| **Domain** | Annual | ~$12/year |
| **Total** | | **~$5-10/month** |

---

## Next Steps After Migration

1. **Set up staging environment** on Railway for testing
2. **Configure CI/CD** for automatic deployments
3. **Add monitoring** (Railway provides basic metrics)
4. **Set up error tracking** (Sentry or similar)
5. **Configure custom domains** for production
