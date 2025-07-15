#!/bin/bash

# Build frontend
vite build

# Build backend
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy assets
mkdir -p dist/public/attached_assets
cp -r attached_assets/* dist/public/attached_assets/ 2>/dev/null || true

echo "Build completed for Vercel deployment"