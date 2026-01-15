/**
 * Server Build Script for Railway/Render Deployment
 *
 * Builds the Express server as a standalone bundle, excluding:
 * - Vite dev server code (only needed in development)
 * - Frontend-related dependencies
 *
 * Output: dist/server.cjs
 */

import { build as esbuild } from "esbuild";
import { readFile, rm, mkdir } from "fs/promises";
import { existsSync } from "fs";

// Server dependencies to bundle (reduces cold start time)
const bundledDeps = [
  "cors",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "memorystore",
  "passport",
  "passport-local",
  "pg",
  "zod",
  "zod-validation-error",
];

async function buildServer() {
  console.log("Building server for Railway/Render deployment...\n");

  // Ensure dist directory exists
  if (!existsSync("dist")) {
    await mkdir("dist");
  }

  // Read package.json to get all dependencies
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];

  // External = all deps NOT in bundledDeps list
  const externals = allDeps.filter((dep) => !bundledDeps.includes(dep));

  // Also externalize Vite-related imports (development only)
  const devOnlyExternals = [
    "./vite",
    "./vite.js",
    "../vite.config",
    "../vite.config.ts",
    "vite",
    "@replit/vite-plugin-cartographer",
    "@replit/vite-plugin-dev-banner",
    "@replit/vite-plugin-runtime-error-modal",
    "@vitejs/plugin-react",
    "@tailwindcss/vite",
  ];

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/server.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: [...externals, ...devOnlyExternals],
    logLevel: "info",
    // Ignore dynamic import of ./vite (development only)
    plugins: [
      {
        name: "ignore-dev-imports",
        setup(build) {
          // Mark development-only imports as external empty modules
          build.onResolve({ filter: /^\.\/vite$/ }, () => ({
            path: "./vite",
            external: true,
          }));
        },
      },
    ],
  });

  console.log("\n✅ Server built successfully: dist/server.cjs");
  console.log("   Run with: npm run start");
}

buildServer().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
