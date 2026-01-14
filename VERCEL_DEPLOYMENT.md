# Vercel Deployment Guide

This guide will help you deploy your Resonancial Landing Offerings application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (Vercel Postgres, Supabase, or any PostgreSQL provider)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Database

1. Set up a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))
2. Note your database connection string (will be used as `DATABASE_URL`)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will automatically detect the project settings from `vercel.json`
4. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production` (optional, already set in vercel.json)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Set environment variables:
   ```bash
   vercel env add DATABASE_URL
   # Paste your database connection string when prompted
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
     - Format: `postgresql://user:password@host:port/database`
   - `NODE_ENV`: `production` (optional)

## Step 4: Run Database Migrations

After deployment, you'll need to run database migrations:

1. Install dependencies locally:
   ```bash
   npm install
   ```

2. Set your `DATABASE_URL` environment variable locally:
   ```bash
   export DATABASE_URL="your-database-connection-string"
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

Alternatively, you can run migrations from Vercel's deployment logs or use a migration service.

## Project Structure for Vercel

- **Static Files**: Built to `dist/public` and served automatically by Vercel
- **API Routes**: Handled by `api/index.ts` as a serverless function
- **Build Command**: `npm run build` (defined in vercel.json)
- **Output Directory**: `dist/public` (defined in vercel.json)

## How It Works

1. **Build Process**: 
   - Runs `npm run build` which builds both client (Vite) and server (esbuild)
   - Client build goes to `dist/public`
   - Server build goes to `dist/index.cjs` (not used in Vercel deployment)

2. **Request Routing**:
   - API requests (`/api/*`) → Routed to `api/index.ts` serverless function
   - All other requests → Served from `dist/public` static files
   - SPA fallback → `index.html` for client-side routing

3. **Serverless Function**:
   - `api/index.ts` exports the Express app
   - Handles all API routes defined in `server/routes.ts`
   - Runs in Vercel's serverless environment

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure `DATABASE_URL` is set (even if migrations haven't run yet)
- Check build logs in Vercel dashboard

### API Routes Not Working

- Verify `api/index.ts` exists and exports the Express app
- Check that routes are properly registered in `server/routes.ts`
- Review function logs in Vercel dashboard

### Static Files Not Loading

- Ensure build completes successfully
- Verify `dist/public` directory exists after build
- Check that `outputDirectory` in `vercel.json` matches your build output

### Database Connection Issues

- Verify `DATABASE_URL` environment variable is set correctly
- Check database allows connections from Vercel's IP ranges
- Ensure database is accessible (not behind a firewall)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)
