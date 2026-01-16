# CLAUDE.md - Resonancial Landing Offerings

This file provides guidance for Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**Resonancial Landing Offerings** is a full-stack web application for a spiritual wellness coaching service. It features a marketing landing page showcasing frequency-based wellness services, gift card functionality, and newsletter subscriptions.

**Architecture**: Split deployment - Frontend (Vercel/Replit) + Backend (Railway/Render)

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Wouter** for routing (lightweight client-side router)
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **shadcn/ui** components (Radix UI-based)
- **React Hook Form + Zod** for form validation
- **TanStack React Query** for data fetching
- **Vite 7** for bundling

### Backend
- **Express 4** with TypeScript
- **Drizzle ORM** with PostgreSQL (Supabase)
- **Zod** for runtime validation
- **CORS** enabled for cross-origin frontend deployments

### Deployment
- **Frontend**: Vercel (static hosting) or Replit (development)
- **Backend**: Railway or Render (persistent server)
- **Database**: Supabase PostgreSQL

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Replit      │     │     Vercel      │     │   Local Dev     │
│   (Frontend)    │     │   (Frontend)    │     │   (Frontend)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │ VITE_API_URL
                                 ▼
                    ┌─────────────────────────┐
                    │   Railway (Backend)     │
                    │   /api/health           │
                    │   /api/newsletter/*     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   PostgreSQL (Supabase) │
                    └─────────────────────────┘
```

## Project Structure

```
├── client/src/           # React frontend
│   ├── pages/            # Route pages (Home, GiftCards, Redeem)
│   ├── components/       # Reusable components
│   │   └── ui/           # shadcn/ui components (56 total)
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities
│       ├── api.ts        # API client for backend communication
│       ├── queryClient.ts
│       └── utils.ts
├── server/               # Express backend
│   ├── index.ts          # Server initialization + CORS
│   ├── config.ts         # Centralized configuration
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database layer (Drizzle)
│   └── services/         # External service clients
├── shared/               # Shared code
│   └── schema.ts         # Drizzle schema + Zod validation
├── docs/                 # Documentation
│   ├── architecture/     # Architecture decisions
│   │   └── split-deployment.md
│   └── implementation-plans/
├── railway.json          # Railway deployment config
├── vercel.json           # Vercel deployment config (frontend-only)
└── .replit               # Replit config (frontend-only)
```

## Common Commands

```bash
# Frontend Development
npm run dev:client        # Vite dev server (port 5000)

# Backend Development
npm run dev:server        # Express with hot reload (tsx watch)
npm run dev               # Express without watch

# Build
npm run build             # Build everything (legacy full-stack)
npm run build:client      # Build frontend only (Vercel)
npm run build:server      # Build backend only (Railway)

# Production
npm run start             # Run full-stack build
npm run start:server      # Run backend only

# Database
npm run db:push           # Push Drizzle schema to PostgreSQL

# Type Checking
npm run check             # TypeScript type checking
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://...  # Required: PostgreSQL connection
PORT=5000                       # Server port (default: 5000)
NODE_ENV=production             # Environment mode
CORS_ORIGINS=https://...        # Comma-separated allowed origins
DB_POOL_SIZE=10                 # Connection pool size (default: 10)
```

### Frontend (client/.env.local or Vercel/Replit dashboard)
```bash
VITE_API_URL=https://api.resonancial.com  # Backend API URL
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (used by Railway) |
| POST | `/api/newsletter/subscribe` | Newsletter subscription |

## Development Workflows

### Local Full-Stack
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend (points to localhost)
VITE_API_URL=http://localhost:5000 npm run dev:client
```

### Local Frontend Only (using staging backend)
```bash
VITE_API_URL=https://resonancial-api-staging.up.railway.app npm run dev:client
```

### Replit
- Automatically runs `npm run dev:client`
- `VITE_API_URL` configured in `.replit` to point to staging backend

## Key Patterns

### Path Aliases (tsconfig.json)
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### API Client (client/src/lib/api.ts)
```typescript
import { api } from '@/lib/api';

// Usage
await api.newsletter.subscribe(email);
const health = await api.health();
```

### Server Configuration (server/config.ts)
Centralized config supporting both serverless and persistent deployments:
- CORS origins (explicit + pattern matching for *.vercel.app, *.replit.dev)
- Database pool sizing (configurable via DB_POOL_SIZE)
- Environment detection

### Routing (Client)
- `/` → Home (landing page)
- `/tarjetas-regalo` → Gift card purchase
- `/canjear` → Gift card redemption

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variable: `VITE_API_URL=https://api.resonancial.com`
3. Deploy (auto-builds with `npm run build:client`)

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables:
   - `DATABASE_URL`
   - `CORS_ORIGINS=https://resonancial.vercel.app,https://resonancial.com`
3. Deploy (auto-builds with `npm run build:server`)
4. Health check: `/api/health`

## Current Features

1. **Landing Page** - Hero, services showcase, pack bundle, almanaque ritual
2. **Newsletter** - Email subscription with database persistence
3. **Gift Cards** - UI flow only (WhatsApp-based conversions)
4. **Gift Redemption** - Simulated validation (no backend)

## Future Implementation (from docs/)

See `docs/implementation-plans/` for phased roadmap:
- **Phase 1**: Gift card backend (DB, APIs, validation)
- **Phase 2**: Payments integration (Stripe/BNB QR)
- **Phase 3**: Booking & email automation
- **Phase 4**: Analytics & admin dashboard

## Important Considerations

- WhatsApp is the primary conversion channel
- Spanish is the primary language for user-facing content
- All gift card/redemption flows are currently UI-only
- CORS is configured to allow Vercel previews (*.vercel.app) and Replit (*.replit.dev)
