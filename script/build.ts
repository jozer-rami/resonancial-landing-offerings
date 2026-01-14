import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, rename } from "fs/promises";
import { existsSync } from "fs";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("building API function for Vercel...");
  // Bundle the API function to include all server dependencies
  // Node.js built-ins should be external
  const nodeBuiltins = [
    "fs", "path", "url", "http", "https", "stream", "util", "events", 
    "buffer", "crypto", "os", "net", "tls", "dns", "zlib", "querystring"
  ];
  
  // Remove the old bundled file if it exists
  try {
    await rm("api/index.js", { force: true });
  } catch {}
  
  // Always create the bundled JS file
  await esbuild({
    entryPoints: ["api/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "api/index.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false, // Don't minify for easier debugging
    external: [...externals, ...nodeBuiltins],
    logLevel: "info",
    banner: {
      js: "// @ts-nocheck\n// This file is auto-generated. Do not edit directly.",
    },
  });
  
  // On Vercel: Keep both files - Vercel will prefer the JS file if both exist
  // The JS file is bundled with all dependencies, so it will work
  console.log("API function bundled successfully - Vercel will use api/index.js");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
