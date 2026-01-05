#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Building frontend..."
npx vite build --config vite.config.ts

echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"
